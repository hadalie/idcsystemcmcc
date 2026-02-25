import { Router } from 'express'
import * as dashboardController from '@/controllers/dashboard'
import { authMiddleware } from '@/middleware/auth'

const router = Router()

// 获取仪表板统计
router.get('/stats', authMiddleware, dashboardController.getDashboardStats)

// 获取服务器状态分布
router.get('/server-status', authMiddleware, dashboardController.getServerStatusDistribution)

// 获取资源使用趋势
router.get('/resource-trend', authMiddleware, dashboardController.getResourceTrend)

// 获取网络流量趋势
router.get('/network-trend', authMiddleware, dashboardController.getNetworkTrend)

// 获取最近告警
router.get('/recent-alerts', authMiddleware, dashboardController.getRecentAlerts)

// 获取Top资源使用
router.get('/top-resource-usage', authMiddleware, dashboardController.getTopResourceUsage)

// 获取告警趋势
router.get('/alert-trend', authMiddleware, dashboardController.getAlertTrend)

export default router
