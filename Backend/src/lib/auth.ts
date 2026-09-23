import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export type SessionUser = {
  id: string;
  email: string;
  name: string;
};

export function createSessionToken(user: SessionUser) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, env.jwtSecret, {
    expiresIn: '7d',
  });
}

export function verifySessionToken(token: string) {
  return jwt.verify(token, env.jwtSecret) as SessionUser;
}
