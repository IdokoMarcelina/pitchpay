import mongoose, { Schema, Document } from 'mongoose';

export interface IInvestment {
    investor: string;
    amount: number;
    txid: string;
    createdAt: Date;
}

export interface IPitch extends Document {
    pitchIdHash: string;
    title: string;
    description: string;
    website: string;
    founder: string;
    isBoosted: boolean;
    txid?: string;
    status: 'PENDING' | 'PAID' | 'VERIFIED';
    investments: IInvestment[];
    createdAt: Date;
}

const InvestmentSchema: Schema = new Schema({
    investor: { type: String, required: true },
    amount: { type: Number, required: true },
    txid: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const PitchSchema: Schema = new Schema({
    pitchIdHash: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    website: { type: String, required: true },
    founder: { type: String, required: true },
    isBoosted: { type: Boolean, default: false },
    txid: { type: String },
    status: { type: String, enum: ['PENDING', 'PAID', 'VERIFIED'], default: 'PENDING' },
    investments: [InvestmentSchema],
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IPitch>('Pitch', PitchSchema);
