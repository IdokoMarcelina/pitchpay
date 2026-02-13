import { Router } from 'express';
import { StacksService } from '../services/stacks.service';

const router = Router();

router.post('/nonce', async (req, res) => {
    try {
        const { address } = req.body;

        if (!address) {
            return res.status(400).json({ error: 'Wallet address required' });
        }

        const nonce = await StacksService.generateAuthNonce(address);
        
        res.json({
            nonce,
            message: `Sign this message to authenticate with PitchPay\n\nNonce: ${nonce}\n\nThis request will expire in 5 minutes.`,
        });
    } catch (error) {
        console.error('Error generating nonce:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/verify', async (req, res) => {
    try {
        const { address, signature, nonce } = req.body;

        if (!address || !signature || !nonce) {
            return res.status(400).json({ error: 'Address, signature, and nonce required' });
        }

        const isValid = await StacksService.verifyAuthNonce(nonce, address);

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid or expired nonce' });
        }

        res.json({
            authenticated: true,
            address: address.toLowerCase(),
            message: 'Wallet verified',
        });
    } catch (error) {
        console.error('Error verifying auth:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
