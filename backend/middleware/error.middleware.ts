import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad Request') {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class PaymentRequiredError extends AppError {
  constructor(message: string = 'Payment Required') {
    super(message, 402);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      statusCode: err.statusCode,
    });
  }

  console.error('Unexpected error:', err);
  
  const isDev = process.env.NODE_ENV !== 'production';
  const message = isDev ? err.message : 'Something went wrong. Please try again.';
  
  return res.status(500).json({
    error: message,
    statusCode: 500,
  });
};

export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body, { issues: true });
    if (!result.success) {
      const errors = result.error?.issues?.map((e: any) => ({
        field: e.path.join('.'),
        message: e.message,
      })) || [];
      
      const errorMessage = errors.length > 0 
        ? errors.map(e => `${e.field}: ${e.message}`).join('; ')
        : 'Invalid request data';
      
      return res.status(400).json({
        error: errorMessage,
        details: errors,
      });
    }
    req.body = result.data;
    next();
  };
};
