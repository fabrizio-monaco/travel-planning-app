import { NextFunction, Request, Response } from 'express';
import { TokenExpiredError } from 'jsonwebtoken';
import { ZodError } from 'zod';

export function globalErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      errors: err.errors,
    });
    return;
  }

  if (err instanceof TokenExpiredError) {
    res.status(401).json({
      errors: ['Token expired'],
    });
    return;
  }

  console.error('Unhandled error:', err);

  // Default error response
  res.status(500).json({
    errors: ['Internal Server Error'],
  });
}
