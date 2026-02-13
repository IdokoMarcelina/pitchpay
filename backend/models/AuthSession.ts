import mongoose, { Schema, Document } from 'mongoose';

export interface IAuthSession extends Document {
    address: string;
    nonce: string;
    expiresAt: Date;
    createdAt: Date;
}

const AuthSessionSchema: Schema = new Schema({
    address: { type: String, required: true, index: true },
    nonce: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: true },
    createdAt: { type: Date, default: Date.now }
});

AuthSessionSchema.index({ address: 1, nonce: 1 });

export default mongoose.model<IAuthSession>('AuthSession', AuthSessionSchema);
