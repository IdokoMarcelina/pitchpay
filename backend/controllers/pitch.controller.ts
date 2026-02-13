import { Request, Response } from 'express';
import Pitch from '../models/Pitch';
import { X402Service } from '../services/x402.service';
import { validateRequest } from '../middleware/error.middleware';
import { createPitchSchema, verifyPitchSchema, updatePitchSchema } from '../validators/pitch.validator';

export class PitchController {
    static async createPitch(req: Request, res: Response) {
        try {
            const { title, description, website, founder, category, logoUrl, deckUrl } = req.body;

            return await X402Service.handlePitchPaymentRequired(req, res, {
                title,
                description,
                website,
                founder,
                category,
                logoUrl,
                deckUrl,
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
            
            const search = req.query.search as string;
            const category = req.query.category as string;
            const sort = req.query.sort as string || 'recent';

            const query: any = { status: { $in: ['PAID', 'VERIFIED'] } };
            
            if (search) {
                query.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ];
            }
            
            if (category && category !== 'All') {
                query.category = category;
            }

            let sortOption: any = { isBoosted: -1, createdAt: -1 };
            if (sort === 'trending') {
                sortOption = { 'investments.amount': -1, isBoosted: -1 };
            } else if (sort === 'oldest') {
                sortOption = { createdAt: 1 };
            }

            const [pitches, total] = await Promise.all([
                Pitch.find(query)
                    .sort(sortOption)
                    .skip(skip)
                    .limit(limit),
                Pitch.countDocuments(query)
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

    static async investPitch(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const { amount } = req.body;

            const pitch = await Pitch.findById(id);

            if (!pitch) {
                return res.status(404).json({ error: 'Pitch not found' });
            }

            if (!pitch.pitchIdHash) {
                return res.status(400).json({ error: 'Pitch not verified on chain' });
            }

            const amountMicroSTX = amount ? amount * 1000000 : null;
            const paymentDetails = await X402Service.getInvestmentPaymentDetails(pitch.pitchIdHash, amountMicroSTX);
            return res.status(402).json(paymentDetails);
        } catch (error) {
            console.error('Error in investPitch:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async verifyInvestment(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const { txid, investor, amount } = req.body;

            if (!txid) {
                return res.status(400).json({ error: 'Missing TXID' });
            }

            const verified = await X402Service.verifyInvestmentPayment(id, txid, investor, amount);

            if (verified) {
                res.json({ message: 'Investment verified' });
            } else {
                res.status(400).json({
                    error: 'Investment verification failed or pending',
                });
            }
        } catch (error) {
            console.error('Error in verifyInvestment:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async getUserProfile(req: Request, res: Response) {
        try {
            const address = req.params.address as string;

            if (!address) {
                return res.status(400).json({ error: 'Address required' });
            }

            const lowerAddress = address.toLowerCase();

            const pitches = await Pitch.find({ 
                founder: lowerAddress,
                status: { $in: ['PAID', 'VERIFIED'] }
            });

            const investedPitches = await Pitch.find({
                'investments.investor': lowerAddress,
                status: { $in: ['PAID', 'VERIFIED'] }
            });

            const totalInvested = investedPitches.reduce((sum, pitch) => {
                const userInvestments = pitch.investments?.filter(i => i.investor.toLowerCase() === lowerAddress) || [];
                return sum + userInvestments.reduce((s, i) => s + i.amount, 0);
            }, 0);

            const totalRaised = pitches.reduce((sum, pitch) => {
                return sum + (pitch.investments?.reduce((s, i) => s + i.amount, 0) || 0);
            }, 0);

            const notifications = pitches.flatMap(p => 
                (p.notifications || []).map(n => ({
                    ...n,
                    pitchTitle: p.title
                }))
            ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            res.json({
                address: lowerAddress,
                pitches,
                investedPitches,
                stats: {
                    pitchesCreated: pitches.length,
                    pitchesInvested: investedPitches.length,
                    totalInvested,
                    totalRaised,
                },
                notifications
            });
        } catch (error) {
            console.error('Error in getUserProfile:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async getNotifications(req: Request, res: Response) {
        try {
            const address = req.params.address as string;

            if (!address) {
                return res.status(400).json({ error: 'Address required' });
            }

            const lowerAddress = address.toLowerCase();

            const pitches = await Pitch.find({ founder: lowerAddress });
            
            const notifications = pitches.flatMap(p => 
                (p.notifications || []).map(n => ({
                    ...n.toObject(),
                    pitchTitle: p.title
                }))
            ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            res.json({ notifications });
        } catch (error) {
            console.error('Error in getNotifications:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async markNotificationRead(req: Request, res: Response) {
        try {
            const { pitchId, notificationId } = req.params;
            const address = req.body.address as string;

            if (!address) {
                return res.status(400).json({ error: 'Address required' });
            }

            const pitch = await Pitch.findOne({ _id: pitchId, founder: address.toLowerCase() });
            
            if (!pitch) {
                return res.status(404).json({ error: 'Pitch not found' });
            }

            const notification = pitch.notifications?.find(n => n._id.toString() === notificationId);
            
            if (notification) {
                notification.read = true;
                await pitch.save();
            }

            res.json({ success: true });
        } catch (error) {
            console.error('Error in markNotificationRead:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

export const createPitchValidation = validateRequest(createPitchSchema);
export const verifyPitchValidation = validateRequest(verifyPitchSchema);
export const updatePitchValidation = validateRequest(updatePitchSchema);