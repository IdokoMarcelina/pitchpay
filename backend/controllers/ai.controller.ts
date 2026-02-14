import { Request, Response } from 'express';
import Agent from '../models/Agent';
import Recommendation from '../models/Recommendation';
import logger from '../middleware/logger';

export class AIController {
    static async getAgent(req: Request, res: Response) {
        try {
            const address = req.params.address as string;
            if (!address) return res.status(400).json({ error: 'Address required' });

            const agent = await Agent.findOne({ userAddress: address.toLowerCase() });
            res.json(agent || { isActive: false, strategy: '' });
        } catch (error) {
            logger.error('Error fetching agent', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async updateAgent(req: Request, res: Response) {
        try {
            const address = req.params.address as string;
            if (!address) return res.status(400).json({ error: 'Address required' });

            const { strategy, isActive } = req.body;

            const agent = await Agent.findOneAndUpdate(
                { userAddress: address.toLowerCase() },
                { strategy, isActive, updatedAt: new Date() },
                { upsert: true, new: true }
            );

            res.json(agent);
        } catch (error) {
            logger.error('Error updating agent', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async getRecommendations(req: Request, res: Response) {
        try {
            const address = req.params.address as string;
            const recommendations = await Recommendation.find({ userAddress: address.toLowerCase() })
                .populate('pitchId')
                .sort({ createdAt: -1 });

            res.json(recommendations);
        } catch (error) {
            logger.error('Error fetching recommendations', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async updateRecommendationStatus(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const { status } = req.body;

            const recommendation = await Recommendation.findByIdAndUpdate(
                id,
                { status },
                { new: true }
            );

            res.json(recommendation);
        } catch (error) {
            logger.error('Error updating recommendation', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
