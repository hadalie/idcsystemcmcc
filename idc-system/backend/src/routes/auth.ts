import { Router } from 'express'
import { body } from 'express-validator'
import * as authController from '@/controllers/auth'
import { validate } from '@/middleware/validate'
import { authMiddleware } from '@/middleware/auth'

const router = Router()

// 登录
router.post('/login',
  body('username').isLength({ min: 3, max: 20 }).withMessage('用户名长度为3-20个字符'),
  body('password').isLength({ min: 6, max: 20 }).withMessage('密码长度为6-20个字符'),
  validate,
  authController.login
)

// 登出
router.post('/logout', authMiddleware, authController.logout)

// 刷新Token
router.post('/refresh', authController.refreshToken)

// 注册
router.post('/register',
  body('username').isLength({ min: 3, max: 20 }).withMessage('用户名长度为3-20个字符'),
  body('email').isEmail().withMessage('请输入有效的邮箱地址'),
  body('password').isLength({ min: 6, max: 20 }).withMessage('密码长度为6-20个字符'),
  validate,
  authController.register
)

// 获取当前用户信息
router.get('/me', authMiddleware, authController.getCurrentUser)

// 更新用户信息
router.put('/profile', authMiddleware, authController.updateProfile)

// 修改密码
router.put('/password',
  authMiddleware,
  body('oldPassword').notEmpty().withMessage('请输入当前密码'),
  body('newPassword').isLength({ min: 6, max: 20 }).withMessage('新密码长度为6-20个字符'),
  validate,
  authController.changePassword
)

// 重置密码
router.post('/reset-password', authController.resetPassword)

export default router
