
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Pitch from '../models/Pitch';
import logger from '../middleware/logger';
import crypto from 'crypto';

dotenv.config();

const MONGODB_URI = 'mongodb+srv://admin:Vjq8SCmBe9dE69Px@cluster0.gnzitzu.mongodb.net/pitchpay-v1?retryWrites=true&w=majority&appName=pitch-pay-db';
const SEED_ADDRESS = 'ST2FY75TNSXVGTTB80BJMNHR9KYQPVWHAT4H4MYET';

const seedPitches = [
    {
        title: 'ArbiShield: AI-Powered Fraud Detection for Stacks',
        description: 'ArbiShield uses advanced machine learning models to monitor on-chain transactions in real-time, identifying suspicious patterns and preventing sandwich attacks or rug pulls before they happen. Our mission is to make the Stacks ecosystem the safest for DeFi users.',
        website: 'https://arbishield.io',
        category: 'Infrastructure',
        founder: SEED_ADDRESS,
        currency: 'sBTC',
        status: 'VERIFIED',
        isBoosted: true,
        logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=ArbiShield',
        deckUrl: 'https://pitchpay.io/decks/ArbiShield.pdf'
    },
    {
        title: 'EcoMint: Sustainable NFT Carbon Offsets',
        description: 'EcoMint gamifies carbon offsetting by allowing users to mint dynamic NFTs that represent verified carbon credits. As you offset more, your NFT evolves, unlocking exclusive eco-conscious rewards and community governance. Built for a greener future on Bitcoin.',
        website: 'https://ecomint.network',
        category: 'Social',
        founder: SEED_ADDRESS,
        currency: 'STX',
        status: 'VERIFIED',
        isBoosted: false,
        logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=EcoMint',
        deckUrl: 'https://pitchpay.io/decks/EcoMint.pdf'
    },
    {
        title: 'StackSwap: Hybrid Decentralized Exchange',
        description: 'StackSwap is pioneering a new era of liquidity with a hybrid AMM model specifically optimized for Bitcoin-native assets. Featuring zero-slippage routes for sBTC and lightning-fast execution via the Stacks L2, we are the gateway to institutional DeFi.',
        website: 'https://stackswap.fi',
        category: 'DeFi',
        founder: SEED_ADDRESS,
        currency: 'sBTC',
        status: 'VERIFIED',
        isBoosted: true,
        logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=StackSwap',
        deckUrl: 'https://pitchpay.io/decks/StackSwap.pdf'
    }
];

async function runSeed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);

        console.log(`Seeding pitches for address: ${SEED_ADDRESS}`);

        for (const pitchData of seedPitches) {
            // Generate a unique pitchIdHash
            const hash = crypto.createHash('sha256').update(pitchData.title + Date.now()).digest('hex');

            const pitch = new Pitch({
                ...pitchData,
                pitchIdHash: hash,
                status: 'VERIFIED'
            });

            await pitch.save();
            console.log(`✅ Seeded: ${pitch.title}`);
        }

        console.log('Pitch seeding complete! 🥂');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

runSeed();
