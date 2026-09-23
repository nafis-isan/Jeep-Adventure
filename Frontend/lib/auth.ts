import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret';

export type SessionUser = {
  id: string;
  name: string;
  email: string;
};

export function createSession(user: SessionUser) {
  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, {
    expiresIn: '7d',
  });

  cookies().set('jeep_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearSession() {
  cookies().set('jeep_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export async function getSession() {
  const cookieStore = cookies();
  const token = cookieStore.get('jeep_session')?.value;

  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string; email: string; name: string };
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, name: true, email: true },
    });

    if (!user) return null;
    return user;
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const user = await getSession();
  if (!user) throw new Error('Unauthorized');
  return user;
}
