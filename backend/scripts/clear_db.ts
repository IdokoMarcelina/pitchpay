import mongoose from 'mongoose';
import Pitch from '../models/Pitch';
import AuthSession from '../models/AuthSession';
import dotenv from 'dotenv';
import path from 'path';

// Load env from backend dir
dotenv.config({ path: path.join(__dirname, '../.env') });

async function clearDb() {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pitchpay';
    console.log(`Connecting to ${mongoUri}...`);

    await mongoose.connect(mongoUri);

    console.log('Clearing Pitches...');
    await Pitch.deleteMany({});

    console.log('Clearing AuthSessions...');
    await AuthSession.deleteMany({});

    console.log('Database cleared successfully!');
    process.exit(0);
}

clearDb().catch(err => {
    console.error('Error clearing database:', err);
    process.exit(1);
});
