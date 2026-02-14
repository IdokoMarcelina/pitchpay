import mongoose from 'mongoose';
import Pitch from './models/Pitch';

async function checkPitches() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pitchpay');
    const pitches = await Pitch.find({});
    console.log(JSON.stringify(pitches, null, 2));
    process.exit(0);
}

checkPitches().catch(err => {
    console.error(err);
    process.exit(1);
});
