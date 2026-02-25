// 日期格式化
export const formatDate = (date: string | Date | number, format = 'YYYY-MM-DD HH:mm:ss'): string => {
  if (!date) return '-'
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

// 相对时间
export const formatRelativeTime = (date: string | Date | number): string => {
  if (!date) return '-'
  
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 30) return `${days}天前`
  
  return formatDate(date, 'YYYY-MM-DD')
}

// 字节格式化
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// 网络流量格式化（bits per second）
export const formatBitrate = (bits: number, decimals = 2): string => {
  if (bits === 0) return '0 bps'
  
  const k = 1000
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps']
  
  const i = Math.floor(Math.log(bits) / Math.log(k))
  
  return parseFloat((bits / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// 百分比格式化
export const formatPercent = (value: number, decimals = 2): string => {
  if (value === null || value === undefined) return '-'
  return value.toFixed(decimals) + '%'
}

// 数字格式化（千分位）
export const formatNumber = (num: number): string => {
  if (num === null || num === undefined) return '-'
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 状态标签颜色
export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    online: 'success',
    active: 'success',
    resolved: 'success',
    available: 'success',
    offline: 'error',
    inactive: 'error',
    triggered: 'error',
    maintenance: 'warning',
    warning: 'warning',
    pending: 'warning',
    locked: 'default',
    retired: 'default'
  }
  return colorMap[status] || 'default'
}

// 状态文本
export const getStatusText = (status: string): string => {
  const textMap: Record<string, string> = {
    online: '在线',
    offline: '离线',
    maintenance: '维护中',
    active: '启用',
    inactive: '禁用',
    locked: '锁定',
    triggered: '已触发',
    resolved: '已解决',
    available: '可用',
    in_use: '使用中',
    reserved: '预留',
    retired: '退役',
    open: '待处理',
    assigned: '已分配',
    in_progress: '处理中',
    closed: '已关闭'
  }
  return textMap[status] || status
}

// 告警级别颜色
export const getAlertLevelColor = (level: string): string => {
  const colorMap: Record<string, string> = {
    info: 'blue',
    warning: 'orange',
    critical: 'red'
  }
  return colorMap[level] || 'default'
}

// 告警级别文本
export const getAlertLevelText = (level: string): string => {
  const textMap: Record<string, string> = {
    info: '信息',
    warning: '警告',
    critical: '严重'
  }
  return textMap[level] || level
}

// 工单优先级颜色
export const getPriorityColor = (priority: string): string => {
  const colorMap: Record<string, string> = {
    low: 'blue',
    medium: 'green',
    high: 'orange',
    urgent: 'red'
  }
  return colorMap[priority] || 'default'
}

// 工单优先级文本
export const getPriorityText = (priority: string): string => {
  const textMap: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急'
  }
  return textMap[priority] || priority
}

// 裁剪文本
export const truncate = (str: string, length = 100, suffix = '...'): string => {
  if (!str) return ''
  return str.length > length ? str.substring(0, length) + suffix : str
}

// 生成UUID
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// 防抖函数
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// 节流函数
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
