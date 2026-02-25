import { Request, Response } from 'express'
import { MonitorModel } from '@/models/monitor'
import { success, error, notFound } from '@/utils/response'
import { AuthRequest } from '@/middleware/auth'

export const getMonitorData = async (req: AuthRequest, res: Response) => {
  try {
    const serverId = parseInt(req.params.serverId)
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 100
    const startTime = req.query.startTime as string
    const endTime = req.query.endTime as string
    
    const { data, total } = await MonitorModel.findByServerId(serverId, page, pageSize, startTime, endTime)
    
    success(res, { list: data, total, page, pageSize })
  } catch (err) {
    error(res, '获取监控数据失败')
  }
}

export const getLatestMonitorData = async (req: AuthRequest, res: Response) => {
  try {
    const serverId = parseInt(req.params.serverId)
    const data = await MonitorModel.findLatestByServerId(serverId)
    
    if (!data) {
      return notFound(res, '暂无监控数据')
    }
    
    success(res, data)
  } catch (err) {
    error(res, '获取最新监控数据失败')
  }
}

export const getBatchLatestData = async (req: AuthRequest, res: Response) => {
  try {
    const { serverIds } = req.body
    const data = await MonitorModel.findLatestByServerIds(serverIds)
    
    success(res, data)
  } catch (err) {
    error(res, '获取批量监控数据失败')
  }
}

export const getMonitorStats = async (req: AuthRequest, res: Response) => {
  try {
    const serverId = req.query.serverId ? parseInt(req.query.serverId as string) : undefined
    const stats = await MonitorModel.getStats(serverId)
    
    success(res, stats)
  } catch (err) {
    error(res, '获取监控统计失败')
  }
}

export const exportMonitorData = async (req: AuthRequest, res: Response) => {
  try {
    // TODO: 实现数据导出逻辑
    success(res, null, '导出功能开发中')
  } catch (err) {
    error(res, '导出失败')
  }
}
