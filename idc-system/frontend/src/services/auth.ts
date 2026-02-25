import request from '@/utils/request'
import type { LoginCredentials, LoginResponse, User } from '@/types'

// 登录
export const login = (credentials: LoginCredentials): Promise<LoginResponse> => {
  return request.post('/auth/login', credentials)
}

// 登出
export const logout = (): Promise<void> => {
  return request.post('/auth/logout')
}

// 刷新token
export const refreshToken = (refreshToken: string): Promise<LoginResponse> => {
  return request.post('/auth/refresh', { refreshToken })
}

// 注册
export const register = (data: {
  username: string
  password: string
  email: string
}): Promise<void> => {
  return request.post('/auth/register', data)
}

// 获取当前用户信息
export const getCurrentUser = (): Promise<User> => {
  return request.get('/auth/me')
}

// 更新用户信息
export const updateProfile = (data: Partial<User>): Promise<User> => {
  return request.put('/auth/profile', data)
}

// 修改密码
export const changePassword = (data: {
  oldPassword: string
  newPassword: string
}): Promise<void> => {
  return request.put('/auth/password', data)
}

// 重置密码
export const resetPassword = (email: string): Promise<void> => {
  return request.post('/auth/reset-password', { email })
}
