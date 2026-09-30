import { Router } from 'express';
import { z } from 'zod';
import { UserRole } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { AuthRequest, requireAuth } from '../middleware/auth.js';

const router = Router();

const routeSchema = z.object({
  position: z.number().int().nonnegative(),
  name: z.string().min(2),
  gameType: z.string().min(2),
  description: z.string().min(2),
  location: z.string().min(2),
  duration: z.number().int().nonnegative(),
  difficulty: z.string().min(2),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

const routeUpdateSchema = z.object({
  name: z.string().trim().min(2).optional(),
  gameType: z.string().trim().min(2).optional(),
  description: z.string().trim().min(2).optional(),
  instruction: z.string().trim().min(2).optional(),
  location: z.string().trim().min(2).optional(),
  duration: z.number().int().positive().optional(),
  maxPoints: z.number().int().nonnegative().optional(),
  difficulty: z.string().trim().min(2).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
}).refine((data) => Object.keys(data).length > 0, 'At least one route field is required');

router.get('/', requireAuth, async (req, res) => {
  const items = await prisma.route.findMany({ orderBy: { position: 'asc' } });
  return res.json({ success: true, data: items });
});

router.post('/', requireAuth, async (req, res) => {
  const parsed = routeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message || 'Invalid route payload' });
  }

  const item = await prisma.route.create({ data: parsed.data });
  return res.status(201).json({ success: true, data: item });
});

router.patch('/:id', requireAuth, async (req, res) => {
  if ((req as AuthRequest).user?.role !== UserRole.FACILITATOR) {
    return res.status(403).json({ success: false, message: 'Only facilitators can edit routes' });
  }

  const routeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = routeUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message || 'Invalid route payload' });
  }

  const existing = await prisma.route.findUnique({ where: { id: routeId } });
  if (!existing) return res.status(404).json({ success: false, message: 'Route not found' });

  const item = await prisma.route.update({ where: { id: routeId }, data: parsed.data });
  return res.json({ success: true, data: item });
});

router.delete('/:id', requireAuth, async (req, res) => {
  if ((req as AuthRequest).user?.role !== UserRole.FACILITATOR) {
    return res.status(403).json({ success: false, message: 'Only facilitators can delete routes' });
  }

  const routeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const existing = await prisma.route.findUnique({ where: { id: routeId }, select: { id: true } });
  if (!existing) return res.status(404).json({ success: false, message: 'Route not found' });

  await prisma.route.delete({ where: { id: routeId } });
  return res.json({ success: true });
});

export default router;
