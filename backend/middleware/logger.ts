import express, { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';

export interface Logger {
    info: (message: string, meta?: Record<string, unknown>) => void;
    warn: (message: string, meta?: Record<string, unknown>) => void;
    error: (message: string, meta?: Record<string, unknown>) => void;
    debug: (message: string, meta?: Record<string, unknown>) => void;
}

const getTimestamp = () => new Date().toISOString();

import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');
let fileLoggingEnabled = true;

try {
    if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR, { recursive: true });
    }
} catch (err) {
    console.warn('File logging disabled: Could not create logs directory', err);
    fileLoggingEnabled = false;
}

const LOG_FILE = path.join(LOG_DIR, 'debug.log');

const writeToFile = (level: string, message: string, meta: any) => {
    if (!fileLoggingEnabled) return;

    try {
        const logEntry = JSON.stringify({
            timestamp: getTimestamp(),
            level,
            message,
            ...meta,
        }) + '\n';
        fs.appendFileSync(LOG_FILE, logEntry);
    } catch (err) {
        // Fallback: stop trying to write to file if it fails once
        fileLoggingEnabled = false;
        console.error('File logging failed, disabling:', err);
    }
};

const logger: Logger = {
    info: (message: string, meta = {}) => {
        const logData = {
            timestamp: getTimestamp(),
            level: 'info',
            message,
            ...meta,
        };
        console.log(JSON.stringify(logData));
        writeToFile('info', message, meta);
    },
    warn: (message: string, meta = {}) => {
        const logData = {
            timestamp: getTimestamp(),
            level: 'warn',
            message,
            ...meta,
        };
        console.warn(JSON.stringify(logData));
        writeToFile('warn', message, meta);
    },
    error: (message: string, meta = {}) => {
        const logData = {
            timestamp: getTimestamp(),
            level: 'error',
            message,
            ...meta,
        };
        console.error(JSON.stringify(logData));
        writeToFile('error', message, meta);
    },
    debug: (message: string, meta = {}) => {
        if (process.env.NODE_ENV === 'development') {
            const logData = {
                timestamp: getTimestamp(),
                level: 'debug',
                message,
                ...meta,
            };
            console.debug(JSON.stringify(logData));
            writeToFile('debug', message, meta);
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
