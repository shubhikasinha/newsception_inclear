import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class CustomError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Log error
  logger.error('Error:', {
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // MongoDB duplicate key error
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    err.message = 'Duplicate field value entered';
    err.statusCode = 400;
  }

  // MongoDB validation error
  if (err.name === 'ValidationError') {
    err.message = Object.values((err as any).errors)
      .map((e: any) => e.message)
      .join(', ');
    err.statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    err.message = 'Invalid token';
    err.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    err.message = 'Token expired';
    err.statusCode = 401;
  }

  // Send response
  res.status(err.statusCode).json({
    success: false,
    error: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
