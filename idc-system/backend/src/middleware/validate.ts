import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import { badRequest } from '@/utils/response'

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    const messages = errors.array().map(err => err.msg).join(', ')
    return badRequest(res, messages)
  }
  
  next()
}
