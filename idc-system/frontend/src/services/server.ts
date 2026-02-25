import request from '@/utils/request'
import type {
  Server,
  ServerGroup,
  ServerStats,
  PaginationResult,
  PaginationParams
} from '@/types'

// 服务器管理
export const getServers = (params?: PaginationParams & { keyword?: string; status?: string; groupId?: number }): Promise<PaginationResult<Server>> => {
  return request.get('/servers', { params })
}

export const getServer = (id: number): Promise<Server> => {
  return request.get(`/servers/${id}`)
}

export const createServer = (data: Partial<Server>): Promise<Server> => {
  return request.post('/servers', data)
}

export const updateServer = (id: number, data: Partial<Server>): Promise<Server> => {
  return request.put(`/servers/${id}`, data)
}

export const deleteServer = (id: number): Promise<void> => {
  return request.delete(`/servers/${id}`)
}

export const batchDeleteServers = (ids: number[]): Promise<void> => {
  return request.post('/servers/batch-delete', { ids })
}

export const getServerStats = (): Promise<ServerStats> => {
  return request.get('/servers/stats')
}

// 服务器分组管理
export const getServerGroups = (): Promise<ServerGroup[]> => {
  return request.get('/server-groups')
}

export const getServerGroup = (id: number): Promise<ServerGroup> => {
  return request.get(`/server-groups/${id}`)
}

export const createServerGroup = (data: Partial<ServerGroup>): Promise<ServerGroup> => {
  return request.post('/server-groups', data)
}

export const updateServerGroup = (id: number, data: Partial<ServerGroup>): Promise<ServerGroup> => {
  return request.put(`/server-groups/${id}`, data)
}

export const deleteServerGroup = (id: number): Promise<void> => {
  return request.delete(`/server-groups/${id}`)
}
