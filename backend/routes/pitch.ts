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
router.post('/pitches/:id/sync', PitchController.syncPitch);
router.patch('/pitches/:id', requireAuth, updatePitchValidation, PitchController.updatePitch);
router.delete('/pitches/:id', requireAuth, PitchController.deletePitch);

export default router;
