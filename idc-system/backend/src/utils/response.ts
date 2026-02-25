import { Response } from 'express'
import { ApiResponse } from '@/types'

export const success = <T>(res: Response, data: T, message = 'Success') => {
  const response: ApiResponse<T> = {
    code: 200,
    message,
    data
  }
  res.json(response)
}

export const error = (res: Response, message = 'Error', code = 500, statusCode = 500) => {
  const response: ApiResponse = {
    code,
    message,
    data: null
  }
  res.status(statusCode).json(response)
}

export const badRequest = (res: Response, message = 'Bad Request') => {
  error(res, message, 400, 400)
}

export const unauthorized = (res: Response, message = 'Unauthorized') => {
  error(res, message, 401, 401)
}

export const forbidden = (res: Response, message = 'Forbidden') => {
  error(res, message, 403, 403)
}

export const notFound = (res: Response, message = 'Not Found') => {
  error(res, message, 404, 404)
}

export const pagination = <T>(res: Response, list: T[], total: number, page: number, pageSize: number) => {
  success(res, {
    list,
    total,
    page,
    pageSize
  })
}
