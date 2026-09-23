import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
export function createSessionToken(user) {
    return jwt.sign({ id: user.id, email: user.email, name: user.name }, env.jwtSecret, {
        expiresIn: '7d',
    });
}
export function verifySessionToken(token) {
    return jwt.verify(token, env.jwtSecret);
}
