import { Router } from 'express';
import { PitchController, createPitchValidation, verifyPitchValidation, updatePitchValidation } from '../controllers/pitch.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/pitches', PitchController.getPitches);
router.get('/pitches/:id', PitchController.getPitchById);
router.post('/pitches', createPitchValidation, PitchController.createPitch);
router.post('/pitches/:id/verify', verifyPitchValidation, PitchController.verifyPitch);
router.post('/pitches/:id/boost', requireAuth, PitchController.boostPitch);
router.post('/pitches/:id/verify-boost', requireAuth, verifyPitchValidation, PitchController.verifyBoost);
router.post('/pitches/:id/invest', PitchController.investPitch);
router.post('/pitches/:id/verify-investment', PitchController.verifyInvestment);
router.post('/pitches/:id/sync', PitchController.syncPitch);
router.patch('/pitches/:id', requireAuth, updatePitchValidation, PitchController.updatePitch);
router.delete('/pitches/:id', requireAuth, PitchController.deletePitch);
router.get('/users/:address', PitchController.getUserProfile);
router.get('/users/:address/notifications', PitchController.getNotifications);
router.patch('/pitches/:pitchId/notifications/:notificationId/read', PitchController.markNotificationRead);

export default router;
