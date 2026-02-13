import mongoose, { Schema, Document } from 'mongoose';

export interface IPitch extends Document {
    pitchIdHash: string;
    title: string;
    description: string;
    website: string;
    founder: string; // Wallet address
    isBoosted: boolean;
    txid?: string;
    status: 'PENDING' | 'PAID' | 'VERIFIED';
    createdAt: Date;
}

const PitchSchema: Schema = new Schema({
    pitchIdHash: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    website: { type: String, required: true },
    founder: { type: String, required: true },
    isBoosted: { type: Boolean, default: false },
    txid: { type: String },
    status: { type: String, enum: ['PENDING', 'PAID', 'VERIFIED'], default: 'PENDING' },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IPitch>('Pitch', PitchSchema);
