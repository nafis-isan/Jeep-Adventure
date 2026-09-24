import { Router } from 'express';
import { TeamStatus, UserRole } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
const teamStatusSchema = z.enum(['pending', 'approved', 'rejected']).transform((status) => status.toUpperCase());
const teamSchema = z.object({
    name: z.string().min(2),
    initials: z.string().min(2).max(5),
    motto: z.string().min(2),
    status: teamStatusSchema.optional(),
});
const statusSchema = z.object({ status: teamStatusSchema });
router.get('/', requireAuth, async (req, res) => {
    const teams = await prisma.team.findMany({ orderBy: { createdAt: 'asc' } });
    return res.json({ success: true, data: teams });
});
router.post('/', requireAuth, async (req, res) => {
    const parsed = teamSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message || 'Invalid team payload' });
    }
    const { status: requestedStatus, ...teamData } = parsed.data;
    const status = req.user?.role === UserRole.FACILITATOR
        ? requestedStatus || TeamStatus.APPROVED
        : TeamStatus.PENDING;
    const team = await prisma.team.create({ data: { ...teamData, status } });
    return res.status(201).json({ success: true, data: team });
});
router.patch('/:id', requireAuth, async (req, res) => {
    if (req.user?.role !== UserRole.FACILITATOR) {
        return res.status(403).json({ success: false, message: 'Only facilitators can update team status' });
    }
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ success: false, message: 'Invalid team status' });
    }
    try {
        const teamId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const team = await prisma.team.update({
            where: { id: teamId },
            data: { status: parsed.data.status },
        });
        return res.json({ success: true, data: team });
    }
    catch {
        return res.status(404).json({ success: false, message: 'Team not found' });
    }
});
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const teamId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        await prisma.team.delete({ where: { id: teamId } });
        return res.json({ success: true });
    }
    catch {
        return res.status(404).json({ success: false, message: 'Team not found' });
    }
});
export default router;
