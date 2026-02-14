
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from '../middleware/logger';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:Vjq8SCmBe9dE69Px@cluster0.gnzitzu.mongodb.net/pitchpay-v1?retryWrites=true&w=majority&appName=pitch-pay-db';

async function resetDatabase() {
    try {
        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(MONGODB_URI);

        const dbName = mongoose.connection.name;
        console.log(`Connected to database: ${dbName}`);

        console.warn(`WARNING: Dropping database ${dbName}...`);
        await mongoose.connection.dropDatabase();

        console.log('Database dropped successfully! 🧨');
        process.exit(0);
    } catch (error) {
        console.error('Failed to reset database:', error);
        process.exit(1);
    }
}

resetDatabase();
