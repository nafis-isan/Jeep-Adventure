import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import teamRoutes from './routes/teams.js';
import routeRoutes from './routes/routes.js';
import scoreRoutes from './routes/scores.js';
import leaderboardRoutes from './routes/leaderboard.js';
import { env } from './config/env.js';
const app = express();
const allowedOrigins = [
    env.frontendUrl,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
].filter(Boolean);
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'jeep-adventure-backend' });
});
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.listen(env.port, () => {
    console.log(`Backend running on http://localhost:${env.port}`);
});
