import { Request, Response, NextFunction } from 'express';

declare global {
    namespace Express {
        interface Request {
            walletAddress?: string;
        }
    }
}

export interface AuthRequest extends Request {
    walletAddress?: string;
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization required' });
    }

    const address = authHeader.replace('Bearer ', '').trim();

    if (!address || address.length < 20) {
        return res.status(401).json({ error: 'Invalid wallet address' });
    }

    req.walletAddress = address.toLowerCase();
    next();
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const address = authHeader.replace('Bearer ', '').trim();
        if (address && address.length >= 20) {
            req.walletAddress = address.toLowerCase();
        }
    }

    next();
};
