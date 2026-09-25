import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const scoreSchema = z.object({
  teamId: z.string().min(1),
  routeId: z.string().min(1),
  points: z.number().int().nonnegative(),
  completed: z.boolean().optional(),
  note: z.string().optional(),
  photoData: z.string().optional(),
});

router.get('/', requireAuth, async (req, res) => {
  const routeId = typeof req.query.routeId === 'string' ? req.query.routeId : undefined;
  const score = await prisma.score.findMany({
    where: routeId ? { routeId } : undefined,
    include: { team: true, route: true },
    orderBy: { createdAt: 'desc' },
  });
  return res.json({ success: true, data: score });
});

router.post('/', requireAuth, async (req, res) => {
  const parsed = scoreSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message || 'Invalid score payload' });
  }
  if (parsed.data.completed !== true) {
    return res.status(400).json({ success: false, message: 'Score hanya dapat disimpan setelah game selesai.' });
  }

  const existingCheckIn = await prisma.checkIn.findUnique({
    where: { teamId_routeId: { teamId: parsed.data.teamId, routeId: parsed.data.routeId } },
  });
  if (!existingCheckIn) {
    return res.status(409).json({ success: false, message: 'Team harus check-in terlebih dahulu sebelum mengisi skor.' });
  }

  const existingScore = await prisma.score.findFirst({
    where: { teamId: parsed.data.teamId, routeId: parsed.data.routeId },
  });
  if (existingScore) {
    return res.status(409).json({ success: false, message: 'Score untuk team ini sudah tersimpan.' });
  }

  const score = await prisma.score.create({
    data: {
      ...parsed.data,
      completed: parsed.data.completed ?? true,
    },
    include: { team: true, route: true },
  });

  return res.status(201).json({ success: true, data: score });
});

export default router;
