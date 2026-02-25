// 通用响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginationResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 用户相关类型
export interface User {
  id: number
  username: string
  email: string
  password_hash: string
  role_id: number
  status: 'active' | 'inactive' | 'locked'
  last_login?: Date
  created_at: Date
  updated_at: Date
}

export interface Role {
  id: number
  name: string
  description?: string
  created_at: Date
}

export interface Permission {
  id: number
  name: string
  resource: string
  action: string
  description?: string
}

export interface UserWithRole extends User {
  role?: Role
  permissions?: Permission[]
}

// 服务器相关类型
export interface Server {
  id: number
  hostname: string
  ip_address: string
  group_id?: number
  status: 'online' | 'offline' | 'maintenance'
  os?: string
  cpu_cores?: number
  memory_gb?: number
  disk_gb?: number
  location?: string
  description?: string
  created_at: Date
  updated_at: Date
}

export interface ServerGroup {
  id: number
  name: string
  description?: string
  created_at: Date
}

// 监控数据类型
export interface MonitorData {
  id: number
  server_id: number
  cpu_usage: number
  memory_usage: number
  disk_usage: number
  network_in: number
  network_out: number
  temperature?: number
  power_usage?: number
  timestamp: Date
}

// 告警相关类型
export interface AlertRule {
  id: number
  name: string
  metric: string
  threshold: number
  operator: '>' | '<' | '>=' | '<=' | '=='
  duration: number
  enabled: boolean
  created_at: Date
}

export interface AlertHistory {
  id: number
  rule_id?: number
  server_id?: number
  alert_level: 'info' | 'warning' | 'critical'
  message: string
  status: 'triggered' | 'resolved'
  created_at: Date
  resolved_at?: Date
}

// 工单相关类型
export interface Ticket {
  id: number
  title: string
  description: string
  type: 'incident' | 'request' | 'maintenance'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed'
  requester_id: number
  assignee_id?: number
  created_at: Date
  updated_at: Date
  resolved_at?: Date
}

// 资产相关类型
export interface Asset {
  id: number
  name: string
  type: 'rack' | 'bandwidth' | 'ip' | 'hardware'
  status: 'available' | 'in_use' | 'reserved' | 'retired'
  value?: string
  description?: string
  location?: string
  server_id?: number
  created_at: Date
  updated_at: Date
}

// 认证相关类型
export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface JWTPayload {
  userId: number
  username: string
  role: string
  iat: number
  exp: number
}

// WebSocket消息类型
export interface WebSocketMessage {
  type: 'monitor' | 'alert' | 'notification'
  data: any
  timestamp: string
}
