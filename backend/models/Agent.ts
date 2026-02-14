import mongoose, { Schema, Document } from 'mongoose';

export interface IAgent extends Document {
    userAddress: string;
    strategy: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const AgentSchema: Schema = new Schema({
    userAddress: { type: String, required: true, unique: true, lowercase: true },
    strategy: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

export default mongoose.model<IAgent>('Agent', AgentSchema);
