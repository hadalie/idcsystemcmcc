import request from '@/utils/request'
import type { MonitorData, MonitorStats, PaginationResult, PaginationParams } from '@/types'

// 获取服务器监控数据
export const getMonitorData = (
  serverId: number,
  params?: PaginationParams & { startTime?: string; endTime?: string }
): Promise<PaginationResult<MonitorData>> => {
  return request.get(`/monitors/${serverId}`, { params })
}

// 获取实时监控数据（最新一条）
export const getLatestMonitorData = (serverId: number): Promise<MonitorData> => {
  return request.get(`/monitors/${serverId}/latest`)
}

// 获取监控统计
export const getMonitorStats = (serverId?: number): Promise<MonitorStats> => {
  return request.get('/monitors/stats', { params: { serverId } })
}

// 获取多个服务器的最新监控数据
export const getBatchLatestData = (serverIds: number[]): Promise<MonitorData[]> => {
  return request.post('/monitors/batch-latest', { serverIds })
}

// 导出监控数据
export const exportMonitorData = (
  serverId: number,
  params: { startTime: string; endTime: string; format?: 'csv' | 'excel' }
): Promise<Blob> => {
  return request.get(`/monitors/${serverId}/export`, {
    params,
    responseType: 'blob'
  })
}
