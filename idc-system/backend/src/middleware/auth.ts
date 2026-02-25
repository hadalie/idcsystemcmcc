import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '@/utils/jwt'
import { unauthorized } from '@/utils/response'

export interface AuthRequest extends Request {
  user?: {
    userId: number
    username: string
    role: string
  }
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return unauthorized(res, 'Token not provided')
  }
  
  const token = authHeader.substring(7)
  
  try {
    const decoded = verifyToken(token)
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role
    }
    next()
  } catch (error) {
    return unauthorized(res, 'Invalid token')
  }
}

export const optionalAuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next()
  }
  
  const token = authHeader.substring(7)
  
  try {
    const decoded = verifyToken(token)
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role
    }
  } catch {
    // Ignore invalid token for optional auth
  }
  
  next()
}
