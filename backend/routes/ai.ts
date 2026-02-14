import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';

const router = Router();

router.get('/agent/:address', AIController.getAgent);
router.post('/agent/:address', AIController.updateAgent);
router.get('/recommendations/:address', AIController.getRecommendations);
router.patch('/recommendations/:id', AIController.updateRecommendationStatus);

export default router;
