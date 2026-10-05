import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}
const isProduction = process.env.NODE_ENV === 'production';
const jwtSecret = process.env.JWT_SECRET;
const databaseUrl = process.env.DATABASE_URL;
const frontendUrl = process.env.FRONTEND_URL;
if (isProduction) {
    const missing = [];
    if (!databaseUrl)
        missing.push('DATABASE_URL');
    if (!jwtSecret || jwtSecret.length < 32)
        missing.push('JWT_SECRET (at least 32 characters)');
    if (!frontendUrl)
        missing.push('FRONTEND_URL');
    if (missing.length > 0) {
        throw new Error(`Invalid production environment: ${missing.join(', ')}`);
    }
    if (!frontendUrl.startsWith('https://')) {
        throw new Error('FRONTEND_URL must use HTTPS in production');
    }
}
export const env = {
    port: Number(process.env.PORT || 4000),
    jwtSecret: jwtSecret || 'jeep-adventure-super-secret-key-change-me',
    frontendUrl: frontendUrl || 'http://localhost:3000',
    databaseUrl: databaseUrl || 'postgresql://postgres:postgres@localhost:5432/jeep_adventure',
};
