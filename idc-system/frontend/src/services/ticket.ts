import request from '@/utils/request'
import type { Ticket, TicketComment, PaginationResult, PaginationParams } from '@/types'

// 工单管理
export const getTickets = (
  params?: PaginationParams & {
    status?: string
    priority?: string
    type?: string
    keyword?: string
  }
): Promise<PaginationResult<Ticket>> => {
  return request.get('/tickets', { params })
}

export const getTicket = (id: number): Promise<Ticket> => {
  return request.get(`/tickets/${id}`)
}

export const createTicket = (data: Partial<Ticket>): Promise<Ticket> => {
  return request.post('/tickets', data)
}

export const updateTicket = (id: number, data: Partial<Ticket>): Promise<Ticket> => {
  return request.put(`/tickets/${id}`, data)
}

export const deleteTicket = (id: number): Promise<void> => {
  return request.delete(`/tickets/${id}`)
}

// 工单状态变更
export const assignTicket = (id: number, assigneeId: number): Promise<Ticket> => {
  return request.patch(`/tickets/${id}/assign`, { assigneeId })
}

export const startTicket = (id: number): Promise<Ticket> => {
  return request.patch(`/tickets/${id}/start`)
}

export const resolveTicket = (id: number, resolution?: string): Promise<Ticket> => {
  return request.patch(`/tickets/${id}/resolve`, { resolution })
}

export const closeTicket = (id: number): Promise<Ticket> => {
  return request.patch(`/tickets/${id}/close`)
}

// 工单评论
export const getTicketComments = (ticketId: number): Promise<TicketComment[]> => {
  return request.get(`/tickets/${ticketId}/comments`)
}

export const addTicketComment = (ticketId: number, content: string): Promise<TicketComment> => {
  return request.post(`/tickets/${ticketId}/comments`, { content })
}

// 工单统计
export const getTicketStats = (): Promise<{ total: number; open: number; urgent: number }> => {
  return request.get('/tickets/stats')
}
