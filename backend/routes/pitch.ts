import { Router } from 'express';
import { PitchController, createPitchValidation, verifyPitchValidation } from '../controllers/pitch.controller';

const router = Router();

router.get('/pitches', PitchController.getPitches);
router.get('/pitches/:id', PitchController.getPitchById);
router.post('/pitches', createPitchValidation, PitchController.createPitch);
router.post('/pitches/:id/verify', verifyPitchValidation, PitchController.verifyPitch);
router.post('/pitches/:id/boost', PitchController.boostPitch);
router.post('/pitches/:id/verify-boost', verifyPitchValidation, PitchController.verifyBoost);
router.post('/pitches/:id/sync', PitchController.syncPitch);

export default router;
