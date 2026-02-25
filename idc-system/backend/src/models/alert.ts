import pool from '@/config/database'
import { AlertRule, AlertHistory } from '@/types'

export class AlertModel {
  static async findAllRules(page = 1, pageSize = 10): Promise<{ rules: AlertRule[], total: number }> {
    const [countRows]: any = await pool.execute(
      'SELECT COUNT(*) as total FROM alert_rules'
    )
    
    const offset = (page - 1) * pageSize
    const [rows]: any = await pool.execute(
      `SELECT * FROM alert_rules
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [pageSize, offset]
    )
    
    return {
      rules: rows.map(this.mapAlertRule),
      total: countRows[0].total
    }
  }
  
  static async findRuleById(id: number): Promise<AlertRule | null> {
    const [rows]: any = await pool.execute(
      'SELECT * FROM alert_rules WHERE id = ?',
      [id]
    )
    
    if (rows.length === 0) return null
    return this.mapAlertRule(rows[0])
  }
  
  static async createRule(ruleData: Partial<AlertRule>): Promise<number> {
    const [result]: any = await pool.execute(
      `INSERT INTO alert_rules (name, metric, threshold, operator, duration, enabled)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        ruleData.name,
        ruleData.metric,
        ruleData.threshold,
        ruleData.operator,
        ruleData.duration,
        ruleData.enabled !== false
      ]
    )
    
    return result.insertId
  }
  
  static async updateRule(id: number, ruleData: Partial<AlertRule>): Promise<void> {
    const fields: string[] = []
    const values: any[] = []
    
    if (ruleData.name) {
      fields.push('name = ?')
      values.push(ruleData.name)
    }
    if (ruleData.metric) {
      fields.push('metric = ?')
      values.push(ruleData.metric)
    }
    if (ruleData.threshold !== undefined) {
      fields.push('threshold = ?')
      values.push(ruleData.threshold)
    }
    if (ruleData.operator) {
      fields.push('operator = ?')
      values.push(ruleData.operator)
    }
    if (ruleData.duration !== undefined) {
      fields.push('duration = ?')
      values.push(ruleData.duration)
    }
    if (ruleData.enabled !== undefined) {
      fields.push('enabled = ?')
      values.push(ruleData.enabled)
    }
    
    if (fields.length === 0) return
    
    values.push(id)
    
    await pool.execute(
      `UPDATE alert_rules SET ${fields.join(', ')} WHERE id = ?`,
      values
    )
  }
  
  static async deleteRule(id: number): Promise<void> {
    await pool.execute('DELETE FROM alert_rules WHERE id = ?', [id])
  }
  
  static async findAllHistory(page = 1, pageSize = 10, filters?: { level?: string; status?: string; serverId?: number; startTime?: string; endTime?: string }): Promise<{ history: AlertHistory[], total: number }> {
    let whereClause = 'WHERE 1=1'
    const params: any[] = []
    
    if (filters?.level) {
      whereClause += ' AND ah.alert_level = ?'
      params.push(filters.level)
    }
    
    if (filters?.status) {
      whereClause += ' AND ah.status = ?'
      params.push(filters.status)
    }
    
    if (filters?.serverId) {
      whereClause += ' AND ah.server_id = ?'
      params.push(filters.serverId)
    }
    
    if (filters?.startTime) {
      whereClause += ' AND ah.created_at >= ?'
      params.push(filters.startTime)
    }
    
    if (filters?.endTime) {
      whereClause += ' AND ah.created_at <= ?'
      params.push(filters.endTime)
    }
    
    const [countRows]: any = await pool.execute(
      `SELECT COUNT(*) as total FROM alert_history ah ${whereClause}`,
      params
    )
    
    const offset = (page - 1) * pageSize
    const [rows]: any = await pool.execute(
      `SELECT ah.*, ar.name as rule_name, ar.metric, s.hostname
       FROM alert_history ah
       LEFT JOIN alert_rules ar ON ah.rule_id = ar.id
       LEFT JOIN servers s ON ah.server_id = s.id
       ${whereClause}
       ORDER BY ah.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    )
    
    return {
      history: rows.map(this.mapAlertHistory),
      total: countRows[0].total
    }
  }
  
  static async resolveHistory(id: number): Promise<void> {
    await pool.execute(
      'UPDATE alert_history SET status = ?, resolved_at = NOW() WHERE id = ?',
      ['resolved', id]
    )
  }
  
  static async getStats(): Promise<{ total: number; info: number; warning: number; critical: number; unresolved: number }> {
    const [rows]: any = await pool.execute(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN alert_level = 'info' THEN 1 ELSE 0 END) as info,
        SUM(CASE WHEN alert_level = 'warning' THEN 1 ELSE 0 END) as warning,
        SUM(CASE WHEN alert_level = 'critical' THEN 1 ELSE 0 END) as critical,
        SUM(CASE WHEN status = 'triggered' THEN 1 ELSE 0 END) as unresolved
       FROM alert_history
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`
    )
    
    return rows[0]
  }
  
  static async getTrend(range: '24h' | '7d' | '30d'): Promise<{ timestamps: string[]; info: number[]; warning: number[]; critical: number[] }> {
    const intervals: Record<string, string> = {
      '24h': 'HOUR',
      '7d': 'HOUR',
      '30d': 'DAY'
    }
    
    const interval = intervals[range]
    
    const [rows]: any = await pool.execute(
      `SELECT 
        DATE_FORMAT(created_at, '%Y-%m-%d %H:00') as time_label,
        SUM(CASE WHEN alert_level = 'info' THEN 1 ELSE 0 END) as info_count,
        SUM(CASE WHEN alert_level = 'warning' THEN 1 ELSE 0 END) as warning_count,
        SUM(CASE WHEN alert_level = 'critical' THEN 1 ELSE 0 END) as critical_count
       FROM alert_history
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 ${interval})
       GROUP BY time_label
       ORDER BY time_label`,
    )
    
    return {
      timestamps: rows.map((r: any) => r.time_label),
      info: rows.map((r: any) => r.info_count || 0),
      warning: rows.map((r: any) => r.warning_count || 0),
      critical: rows.map((r: any) => r.critical_count || 0)
    }
  }
  
  private static mapAlertRule(row: any): AlertRule {
    return {
      id: row.id,
      name: row.name,
      metric: row.metric,
      threshold: row.threshold,
      operator: row.operator,
      duration: row.duration,
      enabled: row.enabled,
      created_at: row.created_at
    }
  }
  
  private static mapAlertHistory(row: any): AlertHistory {
    return {
      id: row.id,
      rule_id: row.rule_id,
      server_id: row.server_id,
      alert_level: row.alert_level,
      message: row.message,
      status: row.status,
      created_at: row.created_at,
      resolved_at: row.resolved_at,
      rule: row.rule_id ? {
        id: row.rule_id,
        name: row.rule_name,
        metric: row.metric,
        threshold: 0,
        operator: '>',
        duration: 0,
        enabled: true,
        created_at: row.created_at
      } : undefined,
      server: row.server_id ? {
        id: row.server_id,
        hostname: row.hostname,
        ip_address: '',
        status: 'online',
        created_at: new Date(),
        updated_at: new Date()
      } : undefined
    }
  }
}
