import request from '@/utils/request'
import type { Asset, Rack, IPResource, PaginationResult, PaginationParams } from '@/types'

// 资产管理
export const getAssets = (
  params?: PaginationParams & { type?: string; status?: string; keyword?: string }
): Promise<PaginationResult<Asset>> => {
  return request.get('/assets', { params })
}

export const getAsset = (id: number): Promise<Asset> => {
  return request.get(`/assets/${id}`)
}

export const createAsset = (data: Partial<Asset>): Promise<Asset> => {
  return request.post('/assets', data)
}

export const updateAsset = (id: number, data: Partial<Asset>): Promise<Asset> => {
  return request.put(`/assets/${id}`, data)
}

export const deleteAsset = (id: number): Promise<void> => {
  return request.delete(`/assets/${id}`)
}

// 机柜管理
export const getRacks = (): Promise<Rack[]> => {
  return request.get('/assets/racks')
}

export const getRack = (id: number): Promise<Rack> => {
  return request.get(`/assets/racks/${id}`)
}

// IP资源管理
export const getIPs = (
  params?: PaginationParams & { status?: string; subnet?: string }
): Promise<PaginationResult<IPResource>> => {
  return request.get('/assets/ips', { params })
}

export const getAvailableIPs = (): Promise<IPResource[]> => {
  return request.get('/assets/ips/available')
}

export const allocateIP = (serverId: number, ipId: number): Promise<void> => {
  return request.post('/assets/ips/allocate', { serverId, ipId })
}

export const releaseIP = (ipId: number): Promise<void> => {
  return request.post('/assets/ips/release', { ipId })
}

// 带宽管理
export const getBandwidthList = (): Promise<Asset[]> => {
  return request.get('/assets/bandwidth')
}

// 资产统计
export const getAssetStats = (): Promise<{
  racks: number
  ips: number
  bandwidth: number
  hardware: number
}> => {
  return request.get('/assets/stats')
}
