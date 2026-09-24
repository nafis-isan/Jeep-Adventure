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

  type LeaderboardEntry = {
    teamId: string;
    name: string;
    initials: string;
    totalPoints: number;
    completedGames: number;
  };

  const leaderboard: LeaderboardEntry[] = teams
    .map((team: typeof teams[number]) => ({
      teamId: team.id,
      name: team.name,
      initials: team.initials,
      totalPoints: team.Score.reduce((sum: number, score: typeof team.Score[number]) => sum + score.points, 0),
      completedGames: team.Score.filter((score: typeof team.Score[number]) => score.completed).length,
    }))
    .sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.totalPoints - a.totalPoints);

  return res.json({ success: true, data: leaderboard });
});

export default router;
