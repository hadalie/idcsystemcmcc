import { Request, Response } from 'express'
import { AlertModel } from '@/models/alert'
import { success, error, notFound } from '@/utils/response'
import { AuthRequest } from '@/middleware/auth'

export const getAlertRules = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 10
    
    const { rules, total } = await AlertModel.findAllRules(page, pageSize)
    success(res, { list: rules, total, page, pageSize })
  } catch (err) {
    error(res, '获取告警规则失败')
  }
}

export const getAlertRule = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const rule = await AlertModel.findRuleById(id)
    
    if (!rule) {
      return notFound(res, '规则不存在')
    }
    
    success(res, rule)
  } catch (err) {
    error(res, '获取告警规则失败')
  }
}

export const createAlertRule = async (req: AuthRequest, res: Response) => {
  try {
    const ruleData = req.body
    const id = await AlertModel.createRule(ruleData)
    
    success(res, { id }, '告警规则创建成功')
  } catch (err) {
    error(res, '创建告警规则失败')
  }
}

export const updateAlertRule = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const ruleData = req.body
    
    await AlertModel.updateRule(id, ruleData)
    const rule = await AlertModel.findRuleById(id)
    
    success(res, rule, '告警规则更新成功')
  } catch (err) {
    error(res, '更新告警规则失败')
  }
}

export const deleteAlertRule = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    await AlertModel.deleteRule(id)
    
    success(res, null, '告警规则删除成功')
  } catch (err) {
    error(res, '删除告警规则失败')
  }
}

export const toggleAlertRule = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const { enabled } = req.body
    
    await AlertModel.updateRule(id, { enabled })
    const rule = await AlertModel.findRuleById(id)
    
    success(res, rule, '状态更新成功')
  } catch (err) {
    error(res, '状态更新失败')
  }
}

export const getAlertHistory = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 10
    const level = req.query.level as string
    const status = req.query.status as string
    const serverId = req.query.serverId ? parseInt(req.query.serverId as string) : undefined
    const startTime = req.query.startTime as string
    const endTime = req.query.endTime as string
    
    const { history, total } = await AlertModel.findAllHistory(page, pageSize, {
      level,
      status,
      serverId,
      startTime,
      endTime
    })
    
    success(res, { list: history, total, page, pageSize })
  } catch (err) {
    error(res, '获取告警历史失败')
  }
}

export const resolveAlert = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    await AlertModel.resolveHistory(id)
    
    success(res, null, '告警已处理')
  } catch (err) {
    error(res, '处理告警失败')
  }
}

export const batchResolveAlerts = async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body
    
    for (const id of ids) {
      await AlertModel.resolveHistory(id)
    }
    
    success(res, null, '批量处理成功')
  } catch (err) {
    error(res, '批量处理失败')
  }
}

export const getAlertStats = async (req: AuthRequest, res: Response) => {
  try {
    const stats = await AlertModel.getStats()
    success(res, stats)
  } catch (err) {
    error(res, '获取告警统计失败')
  }
}

export const getRecentAlerts = async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10
    const { history } = await AlertModel.findAllHistory(1, limit, { status: 'triggered' })
    success(res, history)
  } catch (err) {
    error(res, '获取最近告警失败')
  }
}
