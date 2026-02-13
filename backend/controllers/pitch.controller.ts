import { Request, Response } from 'express';
import Pitch from '../models/Pitch';
import { X402Service } from '../services/x402.service';
import { validateRequest } from '../middleware/error.middleware';
import { createPitchSchema, verifyPitchSchema, updatePitchSchema } from '../validators/pitch.validator';

export class PitchController {
    static async createPitch(req: Request, res: Response) {
        try {
            const { title, description, website, founder } = req.body;

            return await X402Service.handlePitchPaymentRequired(req, res, {
                title,
                description,
                website,
                founder,
            });
        } catch (error) {
            console.error('Error in createPitch:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async verifyPitch(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const { txid } = req.body;

            const verifiedPitch = await X402Service.verifyPayment(id, txid);

            if (verifiedPitch) {
                res.json({ message: 'Payment verified', pitch: verifiedPitch });
            } else {
                res.status(400).json({
                    error: 'Payment verification failed or pending',
                });
            }
        } catch (error) {
            console.error('Error in verifyPitch:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async getPitches(req: Request, res: Response) {
        try {
            const page = Math.max(1, parseInt(req.query.page as string) || 1);
            const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
            const skip = (page - 1) * limit;

            const [pitches, total] = await Promise.all([
                Pitch.find({ status: { $in: ['PAID', 'VERIFIED'] } })
                    .sort({ isBoosted: -1, createdAt: -1 })
                    .skip(skip)
                    .limit(limit),
                Pitch.countDocuments({ status: { $in: ['PAID', 'VERIFIED'] } })
            ]);

            res.json({
                data: pitches,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            });
        } catch (error) {
            console.error('Error in getPitches:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async getPitchById(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const pitch = await Pitch.findById(id);

            if (!pitch) {
                return res.status(404).json({ error: 'Pitch not found' });
            }

            res.json(pitch);
        } catch (error) {
            console.error('Error in getPitchById:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async updatePitch(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const walletAddress = req.walletAddress;
            const { title, description, website } = req.body;

            const pitch = await Pitch.findById(id);

            if (!pitch) {
                return res.status(404).json({ error: 'Pitch not found' });
            }

            if (pitch.founder.toLowerCase() !== walletAddress?.toLowerCase()) {
                return res.status(403).json({ error: 'Not authorized to update this pitch' });
            }

            if (title) pitch.title = title;
            if (description) pitch.description = description;
            if (website) pitch.website = website;

            await pitch.save();

            res.json({ message: 'Pitch updated', pitch });
        } catch (error) {
            console.error('Error in updatePitch:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async deletePitch(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const walletAddress = req.walletAddress;

            const pitch = await Pitch.findById(id);

            if (!pitch) {
                return res.status(404).json({ error: 'Pitch not found' });
            }

            if (pitch.founder.toLowerCase() !== walletAddress?.toLowerCase()) {
                return res.status(403).json({ error: 'Not authorized to delete this pitch' });
            }

            await Pitch.deleteOne({ _id: id });

            res.json({ message: 'Pitch deleted' });
        } catch (error) {
            console.error('Error in deletePitch:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async boostPitch(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const pitch = await Pitch.findById(id);

            if (!pitch) {
                return res.status(404).json({ error: 'Pitch not found' });
            }

            if (pitch.isBoosted) {
                return res.status(400).json({ error: 'Pitch already boosted' });
            }

            const paymentDetails = await X402Service.getBoostPaymentDetails(pitch.pitchIdHash);
            return res.status(402).json(paymentDetails);
        } catch (error) {
            console.error('Error in boostPitch:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async verifyBoost(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const { txid } = req.body;

            if (!txid) {
                return res.status(400).json({ error: 'Missing TXID' });
            }

            const verifiedPitch = await X402Service.verifyBoostPayment(id, txid);

            if (verifiedPitch) {
                res.json({ message: 'Boost verified', pitch: verifiedPitch });
            } else {
                res.status(400).json({
                    error: 'Boost verification failed or pending',
                });
            }
        } catch (error) {
            console.error('Error in verifyBoost:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async syncPitch(req: Request, res: Response) {
        try {
            const id = req.params.id as string;

            const result = await X402Service.syncWithOnChain(id);

            if (!result) {
                return res.status(404).json({ error: 'Pitch not found' });
            }

            if (!result.synced) {
                res.status(400).json({ error: 'Sync failed', reason: result.reason });
            } else {
                res.json({ message: 'Synced with on-chain data', onChainData: result.onChainData });
            }
        } catch (error) {
            console.error('Error in syncPitch:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

export const createPitchValidation = validateRequest(createPitchSchema);
export const verifyPitchValidation = validateRequest(verifyPitchSchema);
export const updatePitchValidation = validateRequest(updatePitchSchema);