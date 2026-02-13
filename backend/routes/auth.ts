import { Router } from 'express';
import { StacksService } from '../services/stacks.service';

const router = Router();

router.post('/auth/nonce', async (req, res) => {
    try {
        const { address } = req.body;

        if (!address) {
            return res.status(400).json({ error: 'Wallet address required' });
        }

        const nonce = StacksService.generateAuthNonce(address);
        
        res.json({
            nonce,
            message: `Sign this message to authenticate with PitchPay\n\nNonce: ${nonce}\n\nThis request will expire in 5 minutes.`,
        });
    } catch (error) {
        console.error('Error generating nonce:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/auth/verify', async (req, res) => {
    try {
        const { address, signature } = req.body;

        if (!address || !signature) {
            return res.status(400).json({ error: 'Address and signature required' });
        }

        res.json({
            authenticated: true,
            address,
            message: 'Wallet verified',
        });
    } catch (error) {
        console.error('Error verifying auth:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
