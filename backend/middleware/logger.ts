import express, { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';

export interface Logger {
    info: (message: string, meta?: Record<string, unknown>) => void;
    warn: (message: string, meta?: Record<string, unknown>) => void;
    error: (message: string, meta?: Record<string, unknown>) => void;
    debug: (message: string, meta?: Record<string, unknown>) => void;
}

const getTimestamp = () => new Date().toISOString();

const logger: Logger = {
    info: (message: string, meta = {}) => {
        console.log(JSON.stringify({
            timestamp: getTimestamp(),
            level: 'info',
            message,
            ...meta,
        }));
    },
    warn: (message: string, meta = {}) => {
        console.warn(JSON.stringify({
            timestamp: getTimestamp(),
            level: 'warn',
            message,
            ...meta,
        }));
    },
    error: (message: string, meta = {}) => {
        console.error(JSON.stringify({
            timestamp: getTimestamp(),
            level: 'error',
            message,
            ...meta,
        }));
    },
    debug: (message: string, meta = {}) => {
        if (process.env.NODE_ENV === 'development') {
            console.debug(JSON.stringify({
                timestamp: getTimestamp(),
                level: 'debug',
                message,
                ...meta,
            }));
        }
    },
};

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const requestId = randomBytes(8).toString('hex');
    (req as any).requestId = requestId;
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info('HTTP request', {
            requestId,
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent'),
        });
    });

    next();
};

export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error('Request error', {
        requestId: (req as any).requestId,
        method: req.method,
        path: req.path,
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
    next(err);
};

export default logger;
