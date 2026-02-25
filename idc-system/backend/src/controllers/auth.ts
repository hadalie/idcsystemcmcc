import { Request, Response } from 'express'
import { UserModel } from '@/models/user'
import { generateTokens, verifyRefreshToken } from '@/utils/jwt'
import { hashPassword, comparePassword } from '@/utils/bcrypt'
import { success, error, unauthorized, badRequest } from '@/utils/response'
import { AuthRequest } from '@/middleware/auth'
import redis from '@/config/redis'

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body
    
    const user = await UserModel.findByUsername(username)
    if (!user) {
      return unauthorized(res, '用户名或密码错误')
    }
    
    if (user.status !== 'active') {
      return unauthorized(res, '账号已被禁用或锁定')
    }
    
    const isPasswordValid = await comparePassword(password, user.password_hash)
    if (!isPasswordValid) {
      return unauthorized(res, '用户名或密码错误')
    }
    
    // 更新最后登录时间
    await UserModel.updateLastLogin(user.id)
    
    // 生成token
    const tokens = generateTokens({
      userId: user.id,
      username: user.username,
      role: user.role?.name || 'user'
    })
    
    // 删除敏感信息
    const { password_hash, ...userWithoutPassword } = user
    
    success(res, {
      user: userWithoutPassword,
      tokens
    }, '登录成功')
  } catch (err) {
    error(res, '登录失败')
  }
}

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      // 将token加入黑名单
      await redis.setex(`blacklist:${token}`, 1800, '1')
    }
    success(res, null, '登出成功')
  } catch (err) {
    error(res, '登出失败')
  }
}

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body
    
    if (!refreshToken) {
      return unauthorized(res, 'Refresh token not provided')
    }
    
    const decoded = verifyRefreshToken(refreshToken)
    const user = await UserModel.findById(decoded.userId)
    
    if (!user) {
      return unauthorized(res, 'User not found')
    }
    
    const tokens = generateTokens({
      userId: user.id,
      username: user.username,
      role: user.role?.name || 'user'
    })
    
    success(res, { tokens }, 'Token refreshed')
  } catch (err) {
    unauthorized(res, 'Invalid refresh token')
  }
}

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body
    
    // 检查用户名是否已存在
    const existingUser = await UserModel.findByUsername(username)
    if (existingUser) {
      return badRequest(res, '用户名已存在')
    }
    
    // 加密密码
    const passwordHash = await hashPassword(password)
    
    // 创建用户
    const userId = await UserModel.create({
      username,
      email,
      password_hash: passwordHash,
      role_id: 2, // 默认普通用户
      status: 'active'
    })
    
    success(res, { id: userId }, '注册成功')
  } catch (err) {
    error(res, '注册失败')
  }
}

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const user = await UserModel.findById(userId)
    
    if (!user) {
      return unauthorized(res, 'User not found')
    }
    
    const { password_hash, ...userWithoutPassword } = user
    success(res, userWithoutPassword)
  } catch (err) {
    error(res, '获取用户信息失败')
  }
}

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const { email } = req.body
    
    await UserModel.update(userId, { email })
    const user = await UserModel.findById(userId)
    
    const { password_hash, ...userWithoutPassword } = user!
    success(res, userWithoutPassword, '更新成功')
  } catch (err) {
    error(res, '更新失败')
  }
}

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const { oldPassword, newPassword } = req.body
    
    const user = await UserModel.findById(userId)
    if (!user) {
      return unauthorized(res, 'User not found')
    }
    
    const isPasswordValid = await comparePassword(oldPassword, user.password_hash)
    if (!isPasswordValid) {
      return badRequest(res, '当前密码错误')
    }
    
    const newPasswordHash = await hashPassword(newPassword)
    await UserModel.update(userId, { password_hash: newPasswordHash })
    
    success(res, null, '密码修改成功')
  } catch (err) {
    error(res, '密码修改失败')
  }
}

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body
    // TODO: 实现密码重置逻辑，发送邮件
    success(res, null, '密码重置链接已发送')
  } catch (err) {
    error(res, '密码重置失败')
  }
}
