import pool from '@/config/database'
import { MonitorData } from '@/types'

export class MonitorModel {
  static async findByServerId(serverId: number, page = 1, pageSize = 100, startTime?: string, endTime?: string): Promise<{ data: MonitorData[], total: number }> {
    let whereClause = 'WHERE server_id = ?'
    const params: any[] = [serverId]
    
    if (startTime) {
      whereClause += ' AND timestamp >= ?'
      params.push(startTime)
    }
    
    if (endTime) {
      whereClause += ' AND timestamp <= ?'
      params.push(endTime)
    }
    
    const [countRows]: any = await pool.execute(
      `SELECT COUNT(*) as total FROM monitor_data ${whereClause}`,
      params
    )
    
    const offset = (page - 1) * pageSize
    const [rows]: any = await pool.execute(
      `SELECT * FROM monitor_data
       ${whereClause}
       ORDER BY timestamp DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    )
    
    return {
      data: rows.map(this.mapMonitorData),
      total: countRows[0].total
    }
  }
  
  static async findLatestByServerId(serverId: number): Promise<MonitorData | null> {
    const [rows]: any = await pool.execute(
      `SELECT * FROM monitor_data
       WHERE server_id = ?
       ORDER BY timestamp DESC
       LIMIT 1`,
      [serverId]
    )
    
    if (rows.length === 0) return null
    return this.mapMonitorData(rows[0])
  }
  
  static async findLatestByServerIds(serverIds: number[]): Promise<MonitorData[]> {
    if (serverIds.length === 0) return []
    
    const placeholders = serverIds.map(() => '?').join(',')
    const [rows]: any = await pool.execute(
      `SELECT md.* FROM monitor_data md
       INNER JOIN (
         SELECT server_id, MAX(timestamp) as max_time
         FROM monitor_data
         WHERE server_id IN (${placeholders})
         GROUP BY server_id
       ) latest ON md.server_id = latest.server_id AND md.timestamp = latest.max_time`,
      serverIds
    )
    
    return rows.map(this.mapMonitorData)
  }
  
  static async create(data: Partial<MonitorData>): Promise<number> {
    const [result]: any = await pool.execute(
      `INSERT INTO monitor_data (server_id, cpu_usage, memory_usage, disk_usage, network_in, network_out, temperature, power_usage)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.server_id,
        data.cpu_usage,
        data.memory_usage,
        data.disk_usage,
        data.network_in,
        data.network_out,
        data.temperature,
        data.power_usage
      ]
    )
    
    return result.insertId
  }
  
  static async getStats(serverId?: number): Promise<{ avgCpuUsage: number; avgMemoryUsage: number; avgDiskUsage: number; totalNetworkIn: number; totalNetworkOut: number }> {
    let whereClause = 'WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)'
    const params: any[] = []
    
    if (serverId) {
      whereClause += ' AND server_id = ?'
      params.push(serverId)
    }
    
    const [rows]: any = await pool.execute(
      `SELECT 
        AVG(cpu_usage) as avg_cpu,
        AVG(memory_usage) as avg_memory,
        AVG(disk_usage) as avg_disk,
        SUM(network_in) as total_network_in,
        SUM(network_out) as total_network_out
       FROM monitor_data
       ${whereClause}`,
      params
    )
    
    return {
      avgCpuUsage: rows[0].avg_cpu || 0,
      avgMemoryUsage: rows[0].avg_memory || 0,
      avgDiskUsage: rows[0].avg_disk || 0,
      totalNetworkIn: rows[0].total_network_in || 0,
      totalNetworkOut: rows[0].total_network_out || 0
    }
  }
  
  static async getTrend(range: '1h' | '24h' | '7d' | '30d'): Promise<{ timestamps: string[]; cpu: number[]; memory: number[]; disk: number[] }> {
    const intervals: Record<string, { interval: string; points: number }> = {
      '1h': { interval: 'MINUTE', points: 60 },
      '24h': { interval: 'HOUR', points: 24 },
      '7d': { interval: 'HOUR', points: 168 },
      '30d': { interval: 'DAY', points: 30 }
    }
    
    const { interval } = intervals[range]
    
    const [rows]: any = await pool.execute(
      `SELECT 
        DATE_FORMAT(timestamp, '%Y-%m-%d %H:%i') as time_label,
        AVG(cpu_usage) as avg_cpu,
        AVG(memory_usage) as avg_memory,
        AVG(disk_usage) as avg_disk
       FROM monitor_data
       WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 1 ${interval})
       GROUP BY time_label
       ORDER BY time_label`,
    )
    
    return {
      timestamps: rows.map((r: any) => r.time_label),
      cpu: rows.map((r: any) => parseFloat(r.avg_cpu.toFixed(2))),
      memory: rows.map((r: any) => parseFloat(r.avg_memory.toFixed(2))),
      disk: rows.map((r: any) => parseFloat(r.avg_disk.toFixed(2)))
    }
  }
  
  private static mapMonitorData(row: any): MonitorData {
    return {
      id: row.id,
      server_id: row.server_id,
      cpu_usage: row.cpu_usage,
      memory_usage: row.memory_usage,
      disk_usage: row.disk_usage,
      network_in: row.network_in,
      network_out: row.network_out,
      temperature: row.temperature,
      power_usage: row.power_usage,
      timestamp: row.timestamp
    }
  }
}
