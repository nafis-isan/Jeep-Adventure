import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const routeSchema = z.object({
  position: z.number().int().nonnegative(),
  name: z.string().min(2),
  gameType: z.string().min(2),
  description: z.string().min(2),
  location: z.string().min(2),
  duration: z.number().int().nonnegative(),
  difficulty: z.string().min(2),
});

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

export default router;
