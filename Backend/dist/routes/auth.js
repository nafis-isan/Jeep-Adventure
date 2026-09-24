import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { createSessionToken } from '../lib/auth.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
const registerSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.nativeEnum(UserRole).default(UserRole.CUSTOMER),
});
const loginSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});
router.post('/register', async (req, res) => {
    try {
        const parsed = registerSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message || 'Invalid input' });
        }
        const { name, email, password, role } = parsed.data;
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(409).json({ success: false, message: 'User already exists' });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, passwordHash, role },
            select: { id: true, name: true, email: true, role: true },
        });
        const token = createSessionToken(user);
        res.cookie('jeep_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res.status(201).json({ success: true, user });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message || 'Invalid input' });
        }
        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Email or password is incorrect' });
        }
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            return res.status(401).json({ success: false, message: 'Email or password is incorrect' });
        }
        const sessionUser = { id: user.id, name: user.name, email: user.email, role: user.role };
        const token = createSessionToken(sessionUser);
        res.cookie('jeep_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res.json({ success: true, user: sessionUser });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
router.get('/me', requireAuth, async (req, res) => {
    return res.json({ authenticated: true, user: req.user });
});
router.post('/logout', (req, res) => {
    res.clearCookie('jeep_session', { path: '/' });
    return res.json({ success: true, message: 'Logged out' });
});
export default router;
