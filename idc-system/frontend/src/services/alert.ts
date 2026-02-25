import request from '@/utils/request'
import type {
  AlertRule,
  AlertHistory,
  AlertStats,
  PaginationResult,
  PaginationParams
} from '@/types'

// 告警规则管理
export const getAlertRules = (params?: PaginationParams & { keyword?: string }): Promise<PaginationResult<AlertRule>> => {
  return request.get('/alerts/rules', { params })
}

export const getAlertRule = (id: number): Promise<AlertRule> => {
  return request.get(`/alerts/rules/${id}`)
}

export const createAlertRule = (data: Partial<AlertRule>): Promise<AlertRule> => {
  return request.post('/alerts/rules', data)
}

export const updateAlertRule = (id: number, data: Partial<AlertRule>): Promise<AlertRule> => {
  return request.put(`/alerts/rules/${id}`, data)
}

export const deleteAlertRule = (id: number): Promise<void> => {
  return request.delete(`/alerts/rules/${id}`)
}

export const toggleAlertRule = (id: number, enabled: boolean): Promise<AlertRule> => {
  return request.patch(`/alerts/rules/${id}/toggle`, { enabled })
}

// 告警历史
export const getAlertHistory = (
  params?: PaginationParams & { 
    level?: string
    status?: string
    serverId?: number
    startTime?: string
    endTime?: string 
  }
): Promise<PaginationResult<AlertHistory>> => {
  return request.get('/alerts/history', { params })
}

export const resolveAlert = (id: number): Promise<AlertHistory> => {
  return request.patch(`/alerts/history/${id}/resolve`)
}

export const batchResolveAlerts = (ids: number[]): Promise<void> => {
  return request.post('/alerts/history/batch-resolve', { ids })
}

// 告警统计
export const getAlertStats = (): Promise<AlertStats> => {
  return request.get('/alerts/stats')
}

// 获取最近的告警
export const getRecentAlerts = (limit = 10): Promise<AlertHistory[]> => {
  return request.get('/alerts/recent', { params: { limit } })
}
