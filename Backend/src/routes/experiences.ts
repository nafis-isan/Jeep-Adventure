import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AuthRequest, requireAuth } from '../middleware/auth.js';
import { experienceRateLimit } from '../middleware/rateLimit.js';

const router = Router();

const experienceSchema = z.object({
  teamId: z.string().uuid(),
  routeId: z.string().uuid(),
  story: z.string().trim().min(1).max(280),
  rating: z.number().int().min(1).max(5),
  mediaData: z.string().max(7_000_000).optional(),
  mediaType: z.enum(['image/jpeg', 'image/png', 'image/webp']).optional(),
});

router.get('/', requireAuth, async (_req, res) => {
  const experiences = await prisma.experience.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      team: { select: { id: true, name: true, initials: true } },
      route: { select: { id: true, name: true, gameType: true } },
      user: { select: { id: true, name: true } },
    },
  });

  return res.json({ success: true, data: experiences });
});

router.post('/', experienceRateLimit, requireAuth, async (req: AuthRequest, res) => {
  const parsed = experienceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message || 'Invalid experience payload' });
  }

  const [team, route] = await Promise.all([
    prisma.team.findUnique({ where: { id: parsed.data.teamId }, select: { id: true } }),
    prisma.route.findUnique({ where: { id: parsed.data.routeId }, select: { id: true } }),
  ]);
  if (!team || !route) {
    return res.status(404).json({ success: false, message: 'Tim atau rute tidak ditemukan.' });
  }

  const experience = await prisma.experience.create({
    data: { ...parsed.data, userId: req.user!.id },
    include: {
      team: { select: { id: true, name: true, initials: true } },
      route: { select: { id: true, name: true, gameType: true } },
      user: { select: { id: true, name: true } },
    },
  });

  return res.status(201).json({ success: true, data: experience });
});

export default router;
