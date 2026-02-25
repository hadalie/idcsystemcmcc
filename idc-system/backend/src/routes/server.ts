import { Router } from 'express'
import { body, param } from 'express-validator'
import * as serverController from '@/controllers/server'
import { authMiddleware } from '@/middleware/auth'
import { validate } from '@/middleware/validate'

const router = Router()

// 获取服务器列表
router.get('/', authMiddleware, serverController.getServers)

// 获取服务器统计
router.get('/stats', authMiddleware, serverController.getServerStats)

// 获取服务器分组列表
router.get('/groups', authMiddleware, serverController.getServerGroups)

// 创建服务器分组
router.post('/groups',
  authMiddleware,
  body('name').notEmpty().withMessage('请输入分组名称'),
  validate,
  serverController.createServerGroup
)

// 删除服务器分组
router.delete('/groups/:id', authMiddleware, serverController.deleteServerGroup)

// 获取单个服务器
router.get('/:id', authMiddleware, serverController.getServer)

// 创建服务器
router.post('/',
  authMiddleware,
  body('hostname').notEmpty().withMessage('请输入主机名'),
  body('ipAddress').notEmpty().withMessage('请输入IP地址'),
  validate,
  serverController.createServer
)

// 更新服务器
router.put('/:id',
  authMiddleware,
  param('id').isInt().withMessage('Invalid server ID'),
  validate,
  serverController.updateServer
)

// 删除服务器
router.delete('/:id', authMiddleware, serverController.deleteServer)

// 批量删除服务器
router.post('/batch-delete', authMiddleware, serverController.batchDeleteServers)

export default router
