import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';

export type AuthRequest = Request & {
  user?: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
};

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.jeep_session;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as { id: string; email: string; name: string; role: UserRole };
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
}
