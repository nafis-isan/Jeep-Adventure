import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  const score = await prisma.score.findUnique({ where: { id: params.id } });
  if (!score) return NextResponse.json({ success: false, message: 'Score not found' }, { status: 404 });

  return NextResponse.json({ success: true, data: score });
}
