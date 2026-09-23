import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const scoreSchema = z.object({
  teamId: z.string().min(1),
  routeId: z.string().min(1),
  points: z.number().nonnegative(),
  completed: z.boolean(),
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  const scores = await prisma.score.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ success: true, data: scores });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = scoreSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.issues[0]?.message || 'Invalid score data' }, { status: 400 });
    }

    const { teamId, routeId, points, completed } = parsed.data;

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    const route = await prisma.route.findUnique({ where: { id: routeId } });
    if (!team || !route) {
      return NextResponse.json({ success: false, message: 'Team or route not found' }, { status: 404 });
    }

    const score = await prisma.score.create({
      data: {
        teamId,
        routeId,
        points,
        completed,
      },
    });

    return NextResponse.json({ success: true, data: score }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
