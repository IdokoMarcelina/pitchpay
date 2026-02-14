import mongoose, { Schema, Document } from 'mongoose';

export interface IRecommendation extends Document {
    userAddress: string;
    pitchId: mongoose.Types.ObjectId;
    reasoning: string;
    score: number;
    status: 'PENDING' | 'DISMISSED' | 'INVESTED';
    createdAt: Date;
}

const RecommendationSchema: Schema = new Schema({
    userAddress: { type: String, required: true, index: true, lowercase: true },
    pitchId: { type: Schema.Types.ObjectId, ref: 'Pitch', required: true },
    reasoning: { type: String, required: true },
    score: { type: Number, required: true },
    status: {
        type: String,
        enum: ['PENDING', 'DISMISSED', 'INVESTED'],
        default: 'PENDING'
    },
    createdAt: { type: Date, default: Date.now }
});

// Ensure a user only gets one recommendation per pitch
RecommendationSchema.index({ userAddress: 1, pitchId: 1 }, { unique: true });

export default mongoose.model<IRecommendation>('Recommendation', RecommendationSchema);
