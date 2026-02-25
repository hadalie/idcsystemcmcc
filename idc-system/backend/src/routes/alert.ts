import { Router } from 'express'
import { body, param } from 'express-validator'
import * as alertController from '@/controllers/alert'
import { authMiddleware } from '@/middleware/auth'
import { validate } from '@/middleware/validate'

const router = Router()

// 告警规则相关
router.get('/rules', authMiddleware, alertController.getAlertRules)
router.get('/rules/:id', authMiddleware, alertController.getAlertRule)
router.post('/rules',
  authMiddleware,
  body('name').notEmpty().withMessage('请输入规则名称'),
  body('metric').notEmpty().withMessage('请选择监控指标'),
  body('threshold').isNumeric().withMessage('请输入有效阈值'),
  validate,
  alertController.createAlertRule
)
router.put('/rules/:id', authMiddleware, alertController.updateAlertRule)
router.delete('/rules/:id', authMiddleware, alertController.deleteAlertRule)
router.patch('/rules/:id/toggle', authMiddleware, alertController.toggleAlertRule)

// 告警历史相关
router.get('/history', authMiddleware, alertController.getAlertHistory)
router.patch('/history/:id/resolve', authMiddleware, alertController.resolveAlert)
router.post('/history/batch-resolve', authMiddleware, alertController.batchResolveAlerts)

// 告警统计
router.get('/stats', authMiddleware, alertController.getAlertStats)

// 最近告警
router.get('/recent', authMiddleware, alertController.getRecentAlerts)

export default router
