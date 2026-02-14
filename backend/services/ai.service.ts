import Agent from '../models/Agent';
import Recommendation from '../models/Recommendation';
import { IPitch } from '../models/Pitch';
import logger from '../middleware/logger';

export class AIService {
    /**
     * Triggers AI analysis for a newly verified pitch across all active agents.
     */
    static async processNewPitch(pitch: IPitch) {
        logger.info('Starting AI analysis for new pitch', { pitchId: pitch._id, title: pitch.title });

        try {
            const activeAgents = await Agent.find({ isActive: true });

            for (const agent of activeAgents) {
                await this.analyzeAndRecommend(pitch, agent.userAddress, agent.strategy);
            }
        } catch (error) {
            logger.error('Error in processNewPitch AI flow', error);
        }
    }

    /**
     * Analyzes a pitch against a specific strategy and creates a recommendation if it's a good match.
     */
    static async analyzeAndRecommend(pitch: IPitch, userAddress: string, strategy: string) {
        try {
            // Simulated AI Analysis
            // In a real implementation, we would call OpenAI here.
            const result = await this.simulateAIAnalysis(pitch, strategy);

            if (result.score >= 70) {
                await Recommendation.findOneAndUpdate(
                    { userAddress, pitchId: pitch._id },
                    {
                        reasoning: result.reasoning,
                        score: result.score,
                        status: 'PENDING'
                    },
                    { upsert: true, new: true }
                );
                logger.info('New AI recommendation created', { userAddress, pitchId: pitch._id, score: result.score });
            }
        } catch (error) {
            logger.error('Error analyzing pitch for agent', { userAddress, pitchId: pitch._id, error });
        }
    }

    /**
     * Simulated AI analysis logic.
     * Searches for keywords in the pitch description based on the strategy.
     */
    private static async simulateAIAnalysis(pitch: IPitch, strategy: string): Promise<{ score: number, reasoning: string }> {
        const lowerDesc = pitch.description.toLowerCase();
        const lowerTitle = pitch.title.toLowerCase();
        const lowerStrategy = strategy.toLowerCase();
        const lowerCategory = pitch.category.toLowerCase();

        // Very basic keyword matching as a fallback
        const keywords = lowerStrategy.split(' ').filter(word => word.length > 3);
        let matches = 0;

        for (const word of keywords) {
            if (lowerDesc.includes(word) || lowerTitle.includes(word) || lowerCategory.includes(word)) {
                matches++;
            }
        }

        // Base score
        let score = 50 + (matches * 10);
        if (score > 95) score = 95;

        // Add some "AI" randomness to make it feel alive
        score += Math.floor(Math.random() * 5);

        let reasoning = '';
        if (score >= 80) {
            reasoning = `Highly Recommended: This project strongly aligns with your interest in "${strategy}". The ${pitch.category} category and description suggests it fits your portfolio goals.`;
        } else if (score >= 70) {
            reasoning = `Good Match: There is a notable overlap between this project and your strategy focusing on "${strategy}". Significant potential for synergy.`;
        } else {
            reasoning = `Partial Match: The project has some elements related to "${strategy}", but may not meet all your specific criteria.`;
        }

        return { score, reasoning };
    }
}
