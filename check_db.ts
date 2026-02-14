import mongoose from 'mongoose';
import Pitch from './backend/models/Pitch';

async function checkPitch() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pitchpay');
    const pitch = await Pitch.findById('699039cf2355e30fffbbb02c');
    console.log('Pitch found:', pitch);
    process.exit(0);
}

checkPitch().catch(err => {
    console.error(err);
    process.exit(1);
});
