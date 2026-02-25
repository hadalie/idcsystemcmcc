import pool from '@/config/database'
import { User, UserWithRole, Role, Permission } from '@/types'

export class UserModel {
  static async findAll(page = 1, pageSize = 10, keyword?: string): Promise<{ users: UserWithRole[], total: number }> {
    let whereClause = 'WHERE 1=1'
    const params: any[] = []
    
    if (keyword) {
      whereClause += ' AND (u.username LIKE ? OR u.email LIKE ?)'
      params.push(`%${keyword}%`, `%${keyword}%`)
    }
    
    const [countRows]: any = await pool.execute(
      `SELECT COUNT(*) as total FROM users u ${whereClause}`,
      params
    )
    
    const offset = (page - 1) * pageSize
    const [rows]: any = await pool.execute(
      `SELECT u.*, r.id as role_id, r.name as role_name, r.description as role_description
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       ${whereClause}
       ORDER BY u.id DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    )
    
    const users = rows.map((row: any) => this.mapUserWithRole(row))
    
    return { users, total: countRows[0].total }
  }
  
  static async findById(id: number): Promise<UserWithRole | null> {
    const [rows]: any = await pool.execute(
      `SELECT u.*, r.id as role_id, r.name as role_name, r.description as role_description
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [id]
    )
    
    if (rows.length === 0) return null
    
    const user = this.mapUserWithRole(rows[0])
    user.permissions = await this.getUserPermissions(id)
    
    return user
  }
  
  static async findByUsername(username: string): Promise<UserWithRole | null> {
    const [rows]: any = await pool.execute(
      `SELECT u.*, r.id as role_id, r.name as role_name, r.description as role_description
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.username = ?`,
      [username]
    )
    
    if (rows.length === 0) return null
    return this.mapUserWithRole(rows[0])
  }
  
  static async create(userData: Partial<User>): Promise<number> {
    const [result]: any = await pool.execute(
      `INSERT INTO users (username, email, password_hash, role_id, status)
       VALUES (?, ?, ?, ?, ?)`,
      [userData.username, userData.email, userData.password_hash, userData.role_id || 2, userData.status || 'active']
    )
    
    return result.insertId
  }
  
  static async update(id: number, userData: Partial<User>): Promise<void> {
    const fields: string[] = []
    const values: any[] = []
    
    if (userData.email) {
      fields.push('email = ?')
      values.push(userData.email)
    }
    if (userData.role_id) {
      fields.push('role_id = ?')
      values.push(userData.role_id)
    }
    if (userData.status) {
      fields.push('status = ?')
      values.push(userData.status)
    }
    if (userData.password_hash) {
      fields.push('password_hash = ?')
      values.push(userData.password_hash)
    }
    
    if (fields.length === 0) return
    
    values.push(id)
    
    await pool.execute(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    )
  }
  
  static async delete(id: number): Promise<void> {
    await pool.execute('DELETE FROM users WHERE id = ?', [id])
  }
  
  static async updateLastLogin(id: number): Promise<void> {
    await pool.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [id]
    )
  }
  
  static async getUserPermissions(userId: number): Promise<Permission[]> {
    const [rows]: any = await pool.execute(
      `SELECT p.* FROM permissions p
       INNER JOIN role_permissions rp ON p.id = rp.permission_id
       INNER JOIN users u ON rp.role_id = u.role_id
       WHERE u.id = ?`,
      [userId]
    )
    
    return rows
  }
  
  private static mapUserWithRole(row: any): UserWithRole {
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      password_hash: row.password_hash,
      role_id: row.role_id,
      status: row.status,
      last_login: row.last_login,
      created_at: row.created_at,
      updated_at: row.updated_at,
      role: row.role_id ? {
        id: row.role_id,
        name: row.role_name,
        description: row.role_description,
        created_at: row.role_created_at
      } : undefined
    }
  }
}
