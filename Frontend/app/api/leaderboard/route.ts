import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  const teams = await prisma.team.findMany({
    include: {
      Score: true,
    },
  });

  const leaderboard = teams
    .map((team) => ({
      teamId: team.id,
      teamName: team.name,
      initials: team.initials,
      totalPoints: team.Score.reduce((sum, score) => sum + score.points, 0),
      completedGames: team.Score.filter((score) => score.completed).length,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints);

  return NextResponse.json({ success: true, data: leaderboard });
}
