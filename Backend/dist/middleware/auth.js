import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
export async function requireAuth(req, res, next) {
    const token = req.cookies?.jeep_session;
    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    try {
        const payload = jwt.verify(token, env.jwtSecret);
        const user = await prisma.user.findUnique({
            where: { id: payload.id },
            select: { id: true, name: true, email: true },
        });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        req.user = user;
        next();
    }
    catch {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
}
