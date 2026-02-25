import { Request, Response } from 'express'
import { ServerModel } from '@/models/server'
import { AlertModel } from '@/models/alert'
import { MonitorModel } from '@/models/monitor'
import { success, error } from '@/utils/response'
import { AuthRequest } from '@/middleware/auth'

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const [serverStats, alertStats] = await Promise.all([
      ServerModel.getStats(),
      AlertModel.getStats()
    ])
    
    success(res, {
      servers: serverStats,
      alerts: alertStats,
      tickets: {
        total: 0,
        open: 0,
        urgent: 0
      },
      assets: {
        racks: 0,
        ips: 0,
        bandwidth: 0
      }
    })
  } catch (err) {
    error(res, '获取统计数据失败')
  }
}

export const getServerStatusDistribution = async (req: AuthRequest, res: Response) => {
  try {
    const stats = await ServerModel.getStats()
    success(res, {
      online: stats.online,
      offline: stats.offline,
      maintenance: stats.maintenance
    })
  } catch (err) {
    error(res, '获取服务器状态分布失败')
  }
}

export const getResourceTrend = async (req: AuthRequest, res: Response) => {
  try {
    const range = (req.query.range as '1h' | '24h' | '7d' | '30d') || '24h'
    const trend = await MonitorModel.getTrend(range)
    success(res, trend)
  } catch (err) {
    error(res, '获取资源趋势失败')
  }
}

export const getNetworkTrend = async (req: AuthRequest, res: Response) => {
  try {
    // TODO: 实现网络流量趋势
    success(res, {
      timestamps: [],
      in: [],
      out: []
    })
  } catch (err) {
    error(res, '获取网络趋势失败')
  }
}

export const getRecentAlerts = async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5
    const { history } = await AlertModel.findAllHistory(1, limit)
    success(res, history)
  } catch (err) {
    error(res, '获取最近告警失败')
  }
}

export const getTopResourceUsage = async (req: AuthRequest, res: Response) => {
  try {
    const metric = req.query.metric as string
    const limit = parseInt(req.query.limit as string) || 5
    
    // 获取服务器列表并模拟使用率
    const { servers } = await ServerModel.findAll(1, limit)
    const serversWithUsage = servers.map(server => ({
      ...server,
      usage: Math.floor(Math.random() * 60) + 30
    })).sort((a, b) => b.usage - a.usage)
    
    success(res, serversWithUsage)
  } catch (err) {
    error(res, '获取Top资源使用失败')
  }
}

export const getAlertTrend = async (req: AuthRequest, res: Response) => {
  try {
    const range = (req.query.range as '24h' | '7d' | '30d') || '24h'
    const trend = await AlertModel.getTrend(range)
    success(res, trend)
  } catch (err) {
    error(res, '获取告警趋势失败')
  }
}
