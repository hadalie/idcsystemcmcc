import pool from '@/config/database'
import { Server, ServerGroup } from '@/types'

export class ServerModel {
  static async findAll(page = 1, pageSize = 10, filters?: { keyword?: string; status?: string; groupId?: number }): Promise<{ servers: Server[], total: number }> {
    let whereClause = 'WHERE 1=1'
    const params: any[] = []
    
    if (filters?.keyword) {
      whereClause += ' AND (s.hostname LIKE ? OR s.ip_address LIKE ?)'
      params.push(`%${filters.keyword}%`, `%${filters.keyword}%`)
    }
    
    if (filters?.status) {
      whereClause += ' AND s.status = ?'
      params.push(filters.status)
    }
    
    if (filters?.groupId) {
      whereClause += ' AND s.group_id = ?'
      params.push(filters.groupId)
    }
    
    const [countRows]: any = await pool.execute(
      `SELECT COUNT(*) as total FROM servers s ${whereClause}`,
      params
    )
    
    const offset = (page - 1) * pageSize
    const [rows]: any = await pool.execute(
      `SELECT s.*, sg.name as group_name, sg.description as group_description
       FROM servers s
       LEFT JOIN server_groups sg ON s.group_id = sg.id
       ${whereClause}
       ORDER BY s.id DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    )
    
    const servers = rows.map((row: any) => this.mapServer(row))
    
    return { servers, total: countRows[0].total }
  }
  
  static async findById(id: number): Promise<Server | null> {
    const [rows]: any = await pool.execute(
      `SELECT s.*, sg.name as group_name, sg.description as group_description
       FROM servers s
       LEFT JOIN server_groups sg ON s.group_id = sg.id
       WHERE s.id = ?`,
      [id]
    )
    
    if (rows.length === 0) return null
    return this.mapServer(rows[0])
  }
  
  static async create(serverData: Partial<Server>): Promise<number> {
    const [result]: any = await pool.execute(
      `INSERT INTO servers (hostname, ip_address, group_id, status, os, cpu_cores, memory_gb, disk_gb, location, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        serverData.hostname,
        serverData.ip_address,
        serverData.group_id,
        serverData.status || 'offline',
        serverData.os,
        serverData.cpu_cores,
        serverData.memory_gb,
        serverData.disk_gb,
        serverData.location,
        serverData.description
      ]
    )
    
    return result.insertId
  }
  
  static async update(id: number, serverData: Partial<Server>): Promise<void> {
    const fields: string[] = []
    const values: any[] = []
    
    const fieldMap: Record<string, any> = {
      hostname: serverData.hostname,
      ip_address: serverData.ip_address,
      group_id: serverData.group_id,
      status: serverData.status,
      os: serverData.os,
      cpu_cores: serverData.cpu_cores,
      memory_gb: serverData.memory_gb,
      disk_gb: serverData.disk_gb,
      location: serverData.location,
      description: serverData.description
    }
    
    for (const [key, value] of Object.entries(fieldMap)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`)
        values.push(value)
      }
    }
    
    if (fields.length === 0) return
    
    values.push(id)
    
    await pool.execute(
      `UPDATE servers SET ${fields.join(', ')} WHERE id = ?`,
      values
    )
  }
  
  static async delete(id: number): Promise<void> {
    await pool.execute('DELETE FROM servers WHERE id = ?', [id])
  }
  
  static async getStats(): Promise<{ total: number; online: number; offline: number; maintenance: number }> {
    const [rows]: any = await pool.execute(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'online' THEN 1 ELSE 0 END) as online,
        SUM(CASE WHEN status = 'offline' THEN 1 ELSE 0 END) as offline,
        SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance
       FROM servers`
    )
    
    return rows[0]
  }
  
  static async findAllGroups(): Promise<ServerGroup[]> {
    const [rows]: any = await pool.execute(
      `SELECT sg.*, COUNT(s.id) as server_count
       FROM server_groups sg
       LEFT JOIN servers s ON sg.id = s.group_id
       GROUP BY sg.id`
    )
    
    return rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      serverCount: row.server_count,
      created_at: row.created_at
    }))
  }
  
  static async createGroup(name: string, description?: string): Promise<number> {
    const [result]: any = await pool.execute(
      'INSERT INTO server_groups (name, description) VALUES (?, ?)',
      [name, description]
    )
    
    return result.insertId
  }
  
  static async deleteGroup(id: number): Promise<void> {
    await pool.execute('DELETE FROM server_groups WHERE id = ?', [id])
  }
  
  private static mapServer(row: any): Server {
    return {
      id: row.id,
      hostname: row.hostname,
      ip_address: row.ip_address,
      group_id: row.group_id,
      status: row.status,
      os: row.os,
      cpu_cores: row.cpu_cores,
      memory_gb: row.memory_gb,
      disk_gb: row.disk_gb,
      location: row.location,
      description: row.description,
      created_at: row.created_at,
      updated_at: row.updated_at,
      group: row.group_id ? {
        id: row.group_id,
        name: row.group_name,
        description: row.group_description
      } : undefined
    }
  }
}
