import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/auth';

export async function POST() {
  try {
    clearSession();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, message: 'Logout failed' }, { status: 500 });
  }
}
