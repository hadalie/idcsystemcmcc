import { Request, Response } from 'express'
import { ServerModel } from '@/models/server'
import { success, error, notFound } from '@/utils/response'
import { AuthRequest } from '@/middleware/auth'

export const getServers = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 10
    const keyword = req.query.keyword as string
    const status = req.query.status as string
    const groupId = req.query.groupId ? parseInt(req.query.groupId as string) : undefined
    
    const { servers, total } = await ServerModel.findAll(page, pageSize, {
      keyword,
      status,
      groupId
    })
    
    success(res, { list: servers, total, page, pageSize })
  } catch (err) {
    error(res, '获取服务器列表失败')
  }
}

export const getServer = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const server = await ServerModel.findById(id)
    
    if (!server) {
      return notFound(res, '服务器不存在')
    }
    
    success(res, server)
  } catch (err) {
    error(res, '获取服务器信息失败')
  }
}

export const createServer = async (req: AuthRequest, res: Response) => {
  try {
    const serverData = req.body
    const id = await ServerModel.create(serverData)
    
    success(res, { id }, '服务器创建成功')
  } catch (err) {
    error(res, '创建服务器失败')
  }
}

export const updateServer = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const serverData = req.body
    
    await ServerModel.update(id, serverData)
    const server = await ServerModel.findById(id)
    
    success(res, server, '服务器更新成功')
  } catch (err) {
    error(res, '更新服务器失败')
  }
}

export const deleteServer = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    await ServerModel.delete(id)
    
    success(res, null, '服务器删除成功')
  } catch (err) {
    error(res, '删除服务器失败')
  }
}

export const batchDeleteServers = async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body
    
    for (const id of ids) {
      await ServerModel.delete(id)
    }
    
    success(res, null, '批量删除成功')
  } catch (err) {
    error(res, '批量删除失败')
  }
}

export const getServerStats = async (req: AuthRequest, res: Response) => {
  try {
    const stats = await ServerModel.getStats()
    success(res, stats)
  } catch (err) {
    error(res, '获取统计失败')
  }
}

export const getServerGroups = async (req: AuthRequest, res: Response) => {
  try {
    const groups = await ServerModel.findAllGroups()
    success(res, groups)
  } catch (err) {
    error(res, '获取分组失败')
  }
}

export const createServerGroup = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body
    const id = await ServerModel.createGroup(name, description)
    
    success(res, { id }, '分组创建成功')
  } catch (err) {
    error(res, '创建分组失败')
  }
}

export const deleteServerGroup = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    await ServerModel.deleteGroup(id)
    
    success(res, null, '分组删除成功')
  } catch (err) {
    error(res, '删除分组失败')
  }
}
