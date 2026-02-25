import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'

import { config } from '@/config'
import { errorHandler, notFoundHandler } from '@/middleware/error'

// 导入路由
import authRoutes from '@/routes/auth'
import serverRoutes from '@/routes/server'
import monitorRoutes from '@/routes/monitor'
import alertRoutes from '@/routes/alert'
import dashboardRoutes from '@/routes/dashboard'

const app = express()
const httpServer = createServer(app)

// WebSocket服务器
const wss = new WebSocketServer({ server: httpServer, path: '/api/ws' })

wss.on('connection', (ws) => {
  console.log('WebSocket client connected')
  
  ws.on('message', (message) => {
    console.log('Received:', message.toString())
  })
  
  ws.on('close', () => {
    console.log('WebSocket client disconnected')
  })
  
  // 发送欢迎消息
  ws.send(JSON.stringify({
    type: 'connected',
    data: { message: 'WebSocket connected' },
    timestamp: new Date().toISOString()
  }))
})

// 广播监控数据给所有客户端
export const broadcastMonitorData = (data: any) => {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(JSON.stringify({
        type: 'monitor',
        data,
        timestamp: new Date().toISOString()
      }))
    }
  })
}

// 安全中间件
app.use(helmet())

// CORS
app.use(cors(config.cors))

// 日志
app.use(morgan('dev'))

// 限流
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: { code: 429, message: '请求过于频繁，请稍后再试', data: null }
})
app.use('/api/', limiter)

// 解析JSON
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API路由
app.use('/api/auth', authRoutes)
app.use('/api/servers', serverRoutes)
app.use('/api/monitors', monitorRoutes)
app.use('/api/alerts', alertRoutes)
app.use('/api/dashboard', dashboardRoutes)

// 错误处理
app.use(notFoundHandler)
app.use(errorHandler)

// 启动服务器
const PORT = config.port
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  console.log(`Environment: ${config.nodeEnv}`)
})

// 模拟监控数据推送
setInterval(() => {
  broadcastMonitorData({
    serverId: Math.floor(Math.random() * 10) + 1,
    metrics: {
      cpuUsage: Math.random() * 100,
      memoryUsage: Math.random() * 100,
      diskUsage: Math.random() * 100,
      networkIn: Math.floor(Math.random() * 1000000),
      networkOut: Math.floor(Math.random() * 1000000)
    },
    timestamp: new Date().toISOString()
  })
}, 5000)

export default app
