import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  const routes = await prisma.route.findMany({ orderBy: { position: 'asc' } });
  return NextResponse.json({ success: true, data: routes });
}
