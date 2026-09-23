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
});
router.get('/', requireAuth, async (req, res) => {
    const score = await prisma.score.findMany({
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
