import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/ApiResponse';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong';
  const errors = err.errors || null;

  return ApiResponse.error(res, message, statusCode, errors);
};
