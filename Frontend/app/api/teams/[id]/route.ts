import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const teamSchema = z.object({
  name: z.string().min(1).optional(),
  initials: z.string().min(2).max(3).optional(),
  motto: z.string().min(1).optional(),
});

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  const team = await prisma.team.findUnique({ where: { id: params.id } });
  if (!team) return NextResponse.json({ success: false, message: 'Team not found' }, { status: 404 });

  return NextResponse.json({ success: true, data: team });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = teamSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.issues[0]?.message || 'Invalid team data' }, { status: 400 });
    }

    const team = await prisma.team.update({ where: { id: params.id }, data: parsed.data });
    return NextResponse.json({ success: true, data: team });
  } catch {
    return NextResponse.json({ success: false, message: 'Team not found' }, { status: 404 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    await prisma.team.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, message: 'Team not found' }, { status: 404 });
  }
}
