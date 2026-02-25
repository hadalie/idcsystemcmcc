// 通用类型定义
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
  role: Role
  status: 'active' | 'inactive' | 'locked'
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: number
  name: string
  description?: string
  permissions: Permission[]
}

export interface Permission {
  id: number
  name: string
  resource: string
  action: string
  description?: string
}

// 服务器相关类型
export interface Server {
  id: number
  hostname: string
  ipAddress: string
  group?: ServerGroup
  status: 'online' | 'offline' | 'maintenance'
  os?: string
  cpuCores?: number
  memoryGb?: number
  diskGb?: number
  location?: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface ServerGroup {
  id: number
  name: string
  description?: string
  serverCount?: number
}

export interface ServerStats {
  total: number
  online: number
  offline: number
  maintenance: number
}

// 监控数据类型
export interface MonitorData {
  id: number
  serverId: number
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  networkIn: number
  networkOut: number
  temperature?: number
  powerUsage?: number
  timestamp: string
}

export interface MonitorStats {
  avgCpuUsage: number
  avgMemoryUsage: number
  avgDiskUsage: number
  totalNetworkIn: number
  totalNetworkOut: number
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
  createdAt: string
}

export interface AlertHistory {
  id: number
  rule?: AlertRule
  server?: Server
  alertLevel: 'info' | 'warning' | 'critical'
  message: string
  status: 'triggered' | 'resolved'
  createdAt: string
  resolvedAt?: string
}

export interface AlertStats {
  total: number
  info: number
  warning: number
  critical: number
  unresolved: number
}

// 工单相关类型
export interface Ticket {
  id: number
  title: string
  description: string
  type: 'incident' | 'request' | 'maintenance'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed'
  requester: User
  assignee?: User
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  comments?: TicketComment[]
}

export interface TicketComment {
  id: number
  content: string
  author: User
  createdAt: string
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
  assignedTo?: Server
  createdAt: string
  updatedAt: string
}

export interface Rack extends Asset {
  type: 'rack'
  unitCapacity: number
  usedUnits: number
  powerCapacity: number
}

export interface IPResource extends Asset {
  type: 'ip'
  ipAddress: string
  subnet: string
  gateway?: string
}

// Dashboard类型
export interface DashboardStats {
  servers: ServerStats
  alerts: AlertStats
  tickets: {
    total: number
    open: number
    urgent: number
  }
  assets: {
    racks: number
    ips: number
    bandwidth: number
  }
}

// WebSocket消息类型
export interface WebSocketMessage {
  type: 'monitor' | 'alert' | 'notification'
  data: any
  timestamp: string
}

// 登录相关类型
export interface LoginCredentials {
  username: string
  password: string
  remember?: boolean
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface LoginResponse {
  user: User
  tokens: AuthTokens
}
