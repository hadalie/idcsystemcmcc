import { ref } from 'vue'
import type { WebSocketMessage } from '@/types'

class WebSocketService {
  private ws: WebSocket | null = null
  private url: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private listeners: Map<string, Set<(data: any) => void>> = new Map()
  public isConnected = ref(false)

  constructor(url: string) {
    this.url = url
  }

  // 连接WebSocket
  connect(token?: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) return

    const wsUrl = token ? `${this.url}?token=${token}` : this.url
    this.ws = new WebSocket(wsUrl)

    this.ws.onopen = () => {
      console.log('WebSocket connected')
      this.isConnected.value = true
      this.reconnectAttempts = 0
      this.emit('connected', null)
    }

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data)
        this.handleMessage(message)
      } catch (error) {
        console.error('WebSocket message parse error:', error)
      }
    }

    this.ws.onclose = () => {
      console.log('WebSocket disconnected')
      this.isConnected.value = false
      this.emit('disconnected', null)
      this.attemptReconnect(token)
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      this.emit('error', error)
    }
  }

  // 断开连接
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.ws?.close()
    this.ws = null
    this.isConnected.value = false
  }

  // 尝试重连
  private attemptReconnect(token?: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

    this.reconnectTimer = setTimeout(() => {
      this.connect(token)
    }, this.reconnectDelay)
  }

  // 发送消息
  send(type: string, data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }))
    } else {
      console.warn('WebSocket is not connected')
    }
  }

  // 订阅消息
  subscribe(event: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)

    // 返回取消订阅函数
    return () => {
      this.listeners.get(event)?.delete(callback)
    }
  }

  // 处理消息
  private handleMessage(message: WebSocketMessage): void {
    const { type, data } = message
    this.emit(type, data)
  }

  // 触发事件
  private emit(event: string, data: any): void {
    this.listeners.get(event)?.forEach((callback) => {
      try {
        callback(data)
      } catch (error) {
        console.error(`Error in ${event} listener:`, error)
      }
    })
  }

  // 订阅监控数据
  subscribeMonitor(callback: (data: any) => void): () => void {
    return this.subscribe('monitor', callback)
  }

  // 订阅告警
  subscribeAlerts(callback: (data: any) => void): () => void {
    return this.subscribe('alert', callback)
  }

  // 订阅通知
  subscribeNotifications(callback: (data: any) => void): () => void {
    return this.subscribe('notification', callback)
  }
}

// 创建单例
export const wsService = new WebSocketService(
  import.meta.env.VITE_WS_URL || 'ws://localhost:5000/api/ws'
)

export default wsService
