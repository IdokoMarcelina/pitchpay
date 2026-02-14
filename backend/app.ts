import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import pitchRoutes from './routes/pitch';
import authRoutes from './routes/auth';
import aiRoutes from './routes/ai';
import { errorHandler } from './middleware/error.middleware';
import logger, { requestLogger, errorLogger } from './middleware/logger';
import AuthSession from './models/AuthSession';

dotenv.config();

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pitchpay';

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

const corsOptions = {
    origin: process.env.CORS_ORIGIN?.split(',').map(o => o.trim().replace(/\/$/, '')) || ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

app.use(requestLogger);

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later' },
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many auth attempts, please try again later' },
});

app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

app.use('/api', pitchRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);

app.get('/health', (req, res) => res.send('PitchPay API is running'));

app.use(errorLogger);
app.use(errorHandler);

const CLEANUP_INTERVAL = 15 * 60 * 1000;

async function cleanupExpiredNonces() {
    try {
        const result = await AuthSession.deleteMany({ expiresAt: { $lte: new Date() } });
        if (result.deletedCount > 0) {
            logger.info('Cleaned up expired nonces', { count: result.deletedCount });
        }
    } catch (error) {
        logger.error('Error cleaning up expired nonces', { error: String(error) });
    }
}

setInterval(cleanupExpiredNonces, CLEANUP_INTERVAL);
cleanupExpiredNonces();

mongoose.connect(MONGODB_URI)
    .then(() => {
        logger.info('Connected to MongoDB');
        app.listen(PORT, () => {
            logger.info('Server started', { port: PORT });
        });
    })
    .catch(err => {
        logger.error('MongoDB connection error', { error: String(err) });
        process.exit(1);
    });

export default app;
