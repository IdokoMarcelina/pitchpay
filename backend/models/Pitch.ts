import mongoose, { Schema, Document } from 'mongoose';

export const PITCH_CATEGORIES = ['DeFi', 'NFT', 'Gaming', 'Social', 'Infrastructure', 'Tools', 'Other'] as const;
export type PitchCategory = typeof PITCH_CATEGORIES[number];

export interface IInvestment {
    investor: string;
    amount: number;
    txid: string;
    createdAt: Date;
}

export interface INotification {
    _id?: string;
    type: 'investment' | 'boost' | 'publish';
    from: string;
    pitchId: string;
    pitchTitle: string;
    amount?: number;
    txid: string;
    read: boolean;
    createdAt: Date;
}

export interface IPitch extends Document {
    pitchIdHash: string;
    title: string;
    description: string;
    website: string;
    founder: string;
    currency: 'STX' | 'sBTC';
    category: PitchCategory;
    logoUrl?: string;
    deckUrl?: string;
    isBoosted: boolean;
    txid?: string;
    status: 'PENDING' | 'PAID' | 'VERIFIED';
    investments: IInvestment[];
    notifications: INotification[];
    createdAt: Date;
}

const InvestmentSchema: Schema = new Schema({
    investor: { type: String, required: true, lowercase: true },
    amount: { type: Number, required: true },
    txid: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const NotificationSchema: Schema = new Schema({
    type: { type: String, enum: ['investment', 'boost', 'publish'], required: true },
    from: { type: String, required: true, lowercase: true },
    pitchId: { type: String, required: true },
    pitchTitle: { type: String, required: true },
    amount: { type: Number },
    txid: { type: String, required: true },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const PitchSchema: Schema = new Schema({
    pitchIdHash: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    website: { type: String, required: true },
    founder: { type: String, required: true, lowercase: true },
    currency: { type: String, enum: ['STX', 'sBTC'], default: 'STX' },
    category: { type: String, enum: PITCH_CATEGORIES, default: 'Other' },
    logoUrl: { type: String },
    deckUrl: { type: String },
    isBoosted: { type: Boolean, default: false },
    txid: { type: String },
    status: { type: String, enum: ['PENDING', 'PAID', 'VERIFIED'], default: 'PENDING' },
    investments: [InvestmentSchema],
    notifications: [NotificationSchema],
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IPitch>('Pitch', PitchSchema);
