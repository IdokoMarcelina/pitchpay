import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import pitchRoutes from './routes/pitch';
import authRoutes from './routes/auth';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pitchpay';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later' },
});

app.use(cors());
app.use(express.json());
app.use('/api', limiter);

app.use('/api', pitchRoutes);
app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => res.send('PitchPay API is running'));

app.use(errorHandler);

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.error('MongoDB connection error:', err));

export default app;
