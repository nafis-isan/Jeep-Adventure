import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
router.get('/', requireAuth, async (req, res) => {
    const teams = await prisma.team.findMany({
        include: {
            Score: true,
        },
    });
    const leaderboard = teams
        .map((team) => ({
        teamId: team.id,
        name: team.name,
        initials: team.initials,
        totalPoints: team.Score.reduce((sum, score) => sum + score.points, 0),
        completedGames: team.Score.filter((score) => score.completed).length,
    }))
        .sort((a, b) => b.totalPoints - a.totalPoints);
    return res.json({ success: true, data: leaderboard });
});
export default router;
