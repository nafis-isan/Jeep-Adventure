import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
const teamSchema = z.object({
    name: z.string().min(2),
    initials: z.string().min(2).max(5),
    motto: z.string().min(2),
});
router.get('/', requireAuth, async (req, res) => {
    const teams = await prisma.team.findMany({ orderBy: { createdAt: 'asc' } });
    return res.json({ success: true, data: teams });
});
router.post('/', requireAuth, async (req, res) => {
    const parsed = teamSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message || 'Invalid team payload' });
    }
    const team = await prisma.team.create({ data: parsed.data });
    return res.status(201).json({ success: true, data: team });
});
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        await prisma.team.delete({ where: { id: req.params.id } });
        return res.json({ success: true });
    }
    catch {
        return res.status(404).json({ success: false, message: 'Team not found' });
    }
});
export default router;
