import request from '@/utils/request'
import type { DashboardStats, Server, AlertHistory, MonitorData } from '@/types'

// 获取仪表板统计数据
export const getDashboardStats = (): Promise<DashboardStats> => {
  return request.get('/dashboard/stats')
}

// 获取服务器状态分布
export const getServerStatusDistribution = (): Promise<{
  online: number
  offline: number
  maintenance: number
}> => {
  return request.get('/dashboard/server-status')
}

// 获取资源使用趋势
export const getResourceTrend = (
  range: '1h' | '24h' | '7d' | '30d'
): Promise<{
  timestamps: string[]
  cpu: number[]
  memory: number[]
  disk: number[]
}> => {
  return request.get('/dashboard/resource-trend', { params: { range } })
}

// 获取网络流量趋势
export const getNetworkTrend = (
  range: '1h' | '24h' | '7d' | '30d'
): Promise<{
  timestamps: string[]
  in: number[]
  out: number[]
}> => {
  return request.get('/dashboard/network-trend', { params: { range } })
}

// 获取最近告警
export const getRecentAlerts = (limit = 5): Promise<AlertHistory[]> => {
  return request.get('/dashboard/recent-alerts', { params: { limit } })
}

// 获取Top资源使用服务器
export const getTopResourceUsage = (
  metric: 'cpu' | 'memory' | 'disk',
  limit = 5
): Promise<Server[]> => {
  return request.get('/dashboard/top-resource-usage', { params: { metric, limit } })
}

// 获取告警趋势
export const getAlertTrend = (
  range: '24h' | '7d' | '30d'
): Promise<{
  timestamps: string[]
  info: number[]
  warning: number[]
  critical: number[]
}> => {
  return request.get('/dashboard/alert-trend', { params: { range } })
}
