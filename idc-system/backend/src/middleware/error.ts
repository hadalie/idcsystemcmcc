import { Request, Response, NextFunction } from 'express'
import { error } from '@/utils/response'

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err)
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return error(res, err.message, 400, 400)
  }
  
  if (err.name === 'UnauthorizedError') {
    return error(res, 'Unauthorized', 401, 401)
  }
  
  if (err.name === 'ForbiddenError') {
    return error(res, 'Forbidden', 403, 403)
  }
  
  // Default server error
  error(res, 'Internal Server Error', 500, 500)
}

export const notFoundHandler = (req: Request, res: Response) => {
  error(res, 'Resource not found', 404, 404)
}
