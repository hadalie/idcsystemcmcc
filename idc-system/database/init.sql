-- IDC机房管理系统数据库初始化脚本
-- 数据库: idc_system
-- 字符集: utf8mb4

-- 创建数据库
CREATE DATABASE IF NOT EXISTS idc_system
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE idc_system;

-- =============================================
-- 用户管理相关表
-- =============================================

-- 角色表
CREATE TABLE IF NOT EXISTS roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL COMMENT '角色标识',
  description VARCHAR(255) COMMENT '角色描述',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

-- 权限表
CREATE TABLE IF NOT EXISTS permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL COMMENT '权限名称',
  resource VARCHAR(50) NOT NULL COMMENT '资源类型',
  action VARCHAR(50) NOT NULL COMMENT '操作类型',
  description VARCHAR(255) COMMENT '权限描述',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='权限表';

-- 角色权限关联表
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色权限关联表';

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
  email VARCHAR(100) UNIQUE NOT NULL COMMENT '邮箱',
  password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
  role_id INT COMMENT '角色ID',
  status ENUM('active', 'inactive', 'locked') DEFAULT 'active' COMMENT '状态',
  last_login TIMESTAMP NULL COMMENT '最后登录时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- =============================================
-- 服务器管理相关表
-- =============================================

-- 服务器分组表
CREATE TABLE IF NOT EXISTS server_groups (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL COMMENT '分组名称',
  description TEXT COMMENT '分组描述',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='服务器分组表';

-- 服务器表
CREATE TABLE IF NOT EXISTS servers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  hostname VARCHAR(100) UNIQUE NOT NULL COMMENT '主机名',
  ip_address VARCHAR(15) NOT NULL COMMENT 'IP地址',
  group_id INT COMMENT '分组ID',
  status ENUM('online', 'offline', 'maintenance') DEFAULT 'offline' COMMENT '状态',
  os VARCHAR(50) COMMENT '操作系统',
  cpu_cores INT COMMENT 'CPU核心数',
  memory_gb INT COMMENT '内存(GB)',
  disk_gb INT COMMENT '磁盘(GB)',
  location VARCHAR(100) COMMENT '机柜位置',
  description TEXT COMMENT '描述',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES server_groups(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_group (group_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='服务器表';

-- =============================================
-- 监控数据表
-- =============================================

CREATE TABLE IF NOT EXISTS monitor_data (
  id INT PRIMARY KEY AUTO_INCREMENT,
  server_id INT NOT NULL COMMENT '服务器ID',
  cpu_usage DECIMAL(5,2) DEFAULT 0 COMMENT 'CPU使用率',
  memory_usage DECIMAL(5,2) DEFAULT 0 COMMENT '内存使用率',
  disk_usage DECIMAL(5,2) DEFAULT 0 COMMENT '磁盘使用率',
  network_in BIGINT DEFAULT 0 COMMENT '网络流入(字节)',
  network_out BIGINT DEFAULT 0 COMMENT '网络流出(字节)',
  temperature INT COMMENT '温度(摄氏度)',
  power_usage INT COMMENT '功耗(瓦)',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE,
  INDEX idx_server_time (server_id, timestamp),
  INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='监控数据表';

-- =============================================
-- 告警相关表
-- =============================================

-- 告警规则表
CREATE TABLE IF NOT EXISTS alert_rules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL COMMENT '规则名称',
  metric VARCHAR(50) NOT NULL COMMENT '监控指标',
  threshold DECIMAL(10,2) NOT NULL COMMENT '阈值',
  operator ENUM('>', '<', '>=', '<=', '==') DEFAULT '>' COMMENT '运算符',
  duration INT DEFAULT 5 COMMENT '持续时间(分钟)',
  enabled BOOLEAN DEFAULT TRUE COMMENT '是否启用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='告警规则表';

-- 告警历史表
CREATE TABLE IF NOT EXISTS alert_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  rule_id INT COMMENT '规则ID',
  server_id INT COMMENT '服务器ID',
  alert_level ENUM('info', 'warning', 'critical') DEFAULT 'info' COMMENT '告警级别',
  message TEXT NOT NULL COMMENT '告警内容',
  status ENUM('triggered', 'resolved') DEFAULT 'triggered' COMMENT '状态',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL COMMENT '解决时间',
  FOREIGN KEY (rule_id) REFERENCES alert_rules(id) ON DELETE SET NULL,
  FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_level (alert_level),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='告警历史表';

-- =============================================
-- 工单系统相关表
-- =============================================

CREATE TABLE IF NOT EXISTS tickets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL COMMENT '工单标题',
  description TEXT NOT NULL COMMENT '工单描述',
  type ENUM('incident', 'request', 'maintenance') DEFAULT 'incident' COMMENT '工单类型',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium' COMMENT '优先级',
  status ENUM('open', 'assigned', 'in_progress', 'resolved', 'closed') DEFAULT 'open' COMMENT '状态',
  requester_id INT NOT NULL COMMENT '创建人ID',
  assignee_id INT COMMENT '处理人ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL COMMENT '解决时间',
  FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  INDEX idx_requester (requester_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工单表';

-- 工单评论表
CREATE TABLE IF NOT EXISTS ticket_comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ticket_id INT NOT NULL COMMENT '工单ID',
  author_id INT NOT NULL COMMENT '作者ID',
  content TEXT NOT NULL COMMENT '评论内容',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工单评论表';

-- =============================================
-- 资产管理相关表
-- =============================================

CREATE TABLE IF NOT EXISTS assets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL COMMENT '资产名称',
  type ENUM('rack', 'bandwidth', 'ip', 'hardware') NOT NULL COMMENT '资产类型',
  status ENUM('available', 'in_use', 'reserved', 'retired') DEFAULT 'available' COMMENT '状态',
  value VARCHAR(255) COMMENT '值/规格',
  location VARCHAR(100) COMMENT '位置',
  description TEXT COMMENT '描述',
  server_id INT COMMENT '关联服务器ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE SET NULL,
  INDEX idx_type (type),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='资产表';

-- =============================================
-- 初始化数据
-- =============================================

-- 插入默认角色
INSERT INTO roles (id, name, description) VALUES
(1, 'admin', '系统管理员'),
(2, 'operator', '运维人员'),
(3, 'user', '普通用户')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- 插入默认权限
INSERT INTO permissions (id, name, resource, action, description) VALUES
(1, 'user:read', 'user', 'read', '查看用户'),
(2, 'user:write', 'user', 'write', '管理用户'),
(3, 'server:read', 'server', 'read', '查看服务器'),
(4, 'server:write', 'server', 'write', '管理服务器'),
(5, 'monitor:read', 'monitor', 'read', '查看监控'),
(6, 'alert:read', 'alert', 'read', '查看告警'),
(7, 'alert:write', 'alert', 'write', '管理告警'),
(8, 'ticket:read', 'ticket', 'read', '查看工单'),
(9, 'ticket:write', 'ticket', 'write', '管理工单'),
(10, 'asset:read', 'asset', 'read', '查看资产'),
(11, 'asset:write', 'asset', 'write', '管理资产'),
(12, 'setting:read', 'setting', 'read', '查看设置'),
(13, 'setting:write', 'setting', 'write', '管理设置')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- 分配权限给角色
INSERT INTO role_permissions (role_id, permission_id) VALUES
-- admin 拥有所有权限
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10), (1, 11), (1, 12), (1, 13),
-- operator 拥有运维相关权限
(2, 3), (2, 4), (2, 5), (2, 6), (2, 7), (2, 8), (2, 9), (2, 10), (2, 11),
-- user 只有查看权限
(3, 3), (3, 5), (3, 6), (3, 8), (3, 10)
ON DUPLICATE KEY UPDATE role_id = role_id;

-- 插入默认管理员账号 (密码: admin123)
INSERT INTO users (id, username, email, password_hash, role_id, status) VALUES
(1, 'admin', 'admin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqLmO8XNIVM5iOJ3qa6z9dPL4c0Ay', 1, 'active')
ON DUPLICATE KEY UPDATE email = VALUES(email);

-- 插入服务器分组
INSERT INTO server_groups (id, name, description) VALUES
(1, '默认分组', '默认服务器分组'),
(2, '生产环境', '生产环境服务器'),
(3, '测试环境', '测试环境服务器')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- 插入默认告警规则
INSERT INTO alert_rules (id, name, metric, threshold, operator, duration, enabled) VALUES
(1, 'CPU使用率高', 'cpu_usage', 80, '>', 5, TRUE),
(2, '内存使用率高', 'memory_usage', 85, '>', 5, TRUE),
(3, '磁盘使用率高', 'disk_usage', 90, '>', 5, TRUE),
(4, '温度过高', 'temperature', 80, '>', 3, TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 插入示例服务器
INSERT INTO servers (id, hostname, ip_address, group_id, status, os, cpu_cores, memory_gb, disk_gb, location, description) VALUES
(1, 'server-01', '192.168.1.101', 2, 'online', 'CentOS 7.9', 8, 16, 500, 'A区-01机柜', 'Web服务器'),
(2, 'server-02', '192.168.1.102', 2, 'online', 'CentOS 7.9', 16, 32, 1000, 'A区-02机柜', '数据库服务器'),
(3, 'server-03', '192.168.1.103', 3, 'offline', 'Ubuntu 20.04', 4, 8, 200, 'B区-01机柜', '测试服务器')
ON DUPLICATE KEY UPDATE hostname = VALUES(hostname);

-- 插入示例资产
INSERT INTO assets (id, name, type, status, value, location, description) VALUES
(1, 'A区-01机柜', 'rack', 'in_use', '42U', 'A区', '标准42U机柜'),
(2, '192.168.1.0/24', 'ip', 'in_use', '254', '内网', '内网IP段'),
(3, '1000Mbps带宽', 'bandwidth', 'in_use', '1000Mbps', '机房', '主干网带宽')
ON DUPLICATE KEY UPDATE name = VALUES(name);
