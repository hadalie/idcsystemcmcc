import { Router } from 'express'
import { param, query } from 'express-validator'
import * as monitorController from '@/controllers/monitor'
import { authMiddleware } from '@/middleware/auth'
import { validate } from '@/middleware/validate'

const router = Router()

// 获取服务器监控数据
router.get('/:serverId',
  authMiddleware,
  param('serverId').isInt().withMessage('Invalid server ID'),
  validate,
  monitorController.getMonitorData
)

// 获取最新监控数据
router.get('/:serverId/latest',
  authMiddleware,
  param('serverId').isInt().withMessage('Invalid server ID'),
  validate,
  monitorController.getLatestMonitorData
)

// 批量获取最新监控数据
router.post('/batch-latest', authMiddleware, monitorController.getBatchLatestData)

// 获取监控统计
router.get('/stats', authMiddleware, monitorController.getMonitorStats)

// 导出监控数据
router.get('/:serverId/export',
  authMiddleware,
  param('serverId').isInt().withMessage('Invalid server ID'),
  validate,
  monitorController.exportMonitorData
)

export default router
