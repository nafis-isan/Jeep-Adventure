import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  const route = await prisma.route.findUnique({ where: { id: params.id } });
  if (!route) return NextResponse.json({ success: false, message: 'Route not found' }, { status: 404 });

  return NextResponse.json({ success: true, data: route });
}
