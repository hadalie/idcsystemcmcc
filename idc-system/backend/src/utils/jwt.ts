import jwt from 'jsonwebtoken'
import { config } from '@/config'
import { JWTPayload, AuthTokens } from '@/types'

export const generateTokens = (payload: Omit<JWTPayload, 'iat' | 'exp'>): AuthTokens => {
  const accessToken = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  })
  
  const refreshToken = jwt.sign(
    { userId: payload.userId },
    config.jwt.secret,
    { expiresIn: config.jwt.refreshExpiresIn }
  )
  
  return {
    accessToken,
    refreshToken,
    expiresIn: 30 * 60 // 30 minutes
  }
}

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, config.jwt.secret) as JWTPayload
}

export const verifyRefreshToken = (token: string): { userId: number } => {
  return jwt.verify(token, config.jwt.secret) as { userId: number }
}
