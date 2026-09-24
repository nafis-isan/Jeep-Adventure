import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const routeId = typeof req.query.routeId === 'string' ? req.query.routeId : undefined;
  const items = await prisma.checkIn.findMany({
    where: routeId ? { routeId } : undefined,
    include: { team: true },
    orderBy: { createdAt: 'asc' },
  });
  return res.json({ success: true, data: items });
});

router.post('/', requireAuth, async (req, res) => {
  const { teamId, routeId } = req.body as { teamId?: string; routeId?: string };
  if (!teamId || !routeId) return res.status(400).json({ success: false, message: 'Team and route are required' });

  const item = await prisma.checkIn.upsert({
    where: { teamId_routeId: { teamId, routeId } },
    update: {},
    create: { teamId, routeId },
    include: { team: true },
  });
  return res.status(201).json({ success: true, data: item });
});

router.delete('/', requireAuth, async (req, res) => {
  const teamId = typeof req.query.teamId === 'string' ? req.query.teamId : '';
  const routeId = typeof req.query.routeId === 'string' ? req.query.routeId : '';
  if (!teamId || !routeId) return res.status(400).json({ success: false, message: 'Team and route are required' });
  await prisma.checkIn.delete({ where: { teamId_routeId: { teamId, routeId } } }).catch(() => undefined);
  return res.json({ success: true });
});

export default router;