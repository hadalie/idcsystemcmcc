-- IDC机房管理系统测试数据脚本
-- 执行此脚本插入更多测试数据

USE idc_system;

-- 插入更多用户
INSERT INTO users (username, email, password_hash, role_id, status, created_at) VALUES
('operator1', 'operator1@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqLmO8XNIVM5iOJ3qa6z9dPL4c0Ay', 2, 'active', NOW()),
('operator2', 'operator2@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqLmO8XNIVM5iOJ3qa6z9dPL4c0Ay', 2, 'active', DATE_SUB(NOW(), INTERVAL 1 DAY)),
('user1', 'user1@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqLmO8XNIVM5iOJ3qa6z9dPL4c0Ay', 3, 'active', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('user2', 'user2@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqLmO8XNIVM5iOJ3qa6z9dPL4c0Ay', 3, 'inactive', DATE_SUB(NOW(), INTERVAL 3 DAY))
ON DUPLICATE KEY UPDATE email = VALUES(email);

-- 插入更多服务器
INSERT INTO servers (hostname, ip_address, group_id, status, os, cpu_cores, memory_gb, disk_gb, location, description, created_at, updated_at) VALUES
('web-server-01', '192.168.1.101', 2, 'online', 'CentOS 7.9', 8, 16, 500, 'A区-01机柜', 'Web服务器-01', NOW(), NOW()),
('web-server-02', '192.168.1.102', 2, 'online', 'CentOS 7.9', 8, 16, 500, 'A区-02机柜', 'Web服务器-02', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
('db-server-01', '192.168.1.111', 2, 'online', 'CentOS 7.9', 16, 64, 2000, 'A区-03机柜', '数据库主服务器', DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
('db-server-02', '192.168.1.112', 2, 'maintenance', 'CentOS 7.9', 16, 64, 2000, 'A区-04机柜', '数据库备服务器', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 1 HOUR)),
('cache-server-01', '192.168.1.121', 2, 'online', 'Ubuntu 20.04', 8, 32, 500, 'A区-05机柜', 'Redis缓存服务器', DATE_SUB(NOW(), INTERVAL 3 DAY), NOW()),
('test-server-01', '192.168.2.101', 3, 'offline', 'Ubuntu 20.04', 4, 8, 200, 'B区-01机柜', '测试服务器-01', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 2 HOUR)),
('test-server-02', '192.168.2.102', 3, 'online', 'Ubuntu 20.04', 4, 8, 200, 'B区-02机柜', '测试服务器-02', DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),
('dev-server-01', '192.168.2.201', 3, 'online', 'CentOS 8.3', 4, 16, 500, 'B区-03机柜', '开发服务器', DATE_SUB(NOW(), INTERVAL 7 DAY), NOW())
ON DUPLICATE KEY UPDATE hostname = VALUES(hostname);

-- 插入监控数据（模拟过去24小时的数据）
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS InsertMonitorData()
BEGIN
  DECLARE i INT DEFAULT 0;
  DECLARE server_id INT;
  
  -- 为每台服务器插入监控数据
  SET server_id = 1;
  WHILE server_id <= 8 DO
    SET i = 0;
    WHILE i < 144 DO  -- 每10分钟一条，共24小时
      INSERT INTO monitor_data (server_id, cpu_usage, memory_usage, disk_usage, network_in, network_out, temperature, timestamp)
      VALUES (
        server_id,
        ROUND(RAND() * 80 + 10, 2),  -- CPU 10-90%
        ROUND(RAND() * 70 + 20, 2),  -- 内存 20-90%
        ROUND(RAND() * 50 + 30, 2),  -- 磁盘 30-80%
        FLOOR(RAND() * 1000000),     -- 网络流入
        FLOOR(RAND() * 1000000),     -- 网络流出
        FLOOR(RAND() * 40 + 40),     -- 温度 40-80度
        DATE_SUB(NOW(), INTERVAL i * 10 MINUTE)
      );
      SET i = i + 1;
    END WHILE;
    SET server_id = server_id + 1;
  END WHILE;
END$$
DELIMITER ;

-- 调用存储过程插入监控数据
CALL InsertMonitorData();

-- 删除存储过程
DROP PROCEDURE IF EXISTS InsertMonitorData;

-- 插入告警历史
INSERT INTO alert_history (rule_id, server_id, alert_level, message, status, created_at, resolved_at) VALUES
(1, 3, 'warning', 'CPU使用率超过80%，当前值：85%', 'resolved', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(2, 3, 'critical', '内存使用率超过85%，当前值：92%', 'resolved', DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(1, 5, 'warning', 'CPU使用率超过80%，当前值：82%', 'resolved', DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(4, 3, 'critical', '服务器温度过高，当前温度：85°C', 'triggered', DATE_SUB(NOW(), INTERVAL 30 MINUTE), NULL),
(1, 2, 'warning', 'CPU使用率超过80%，当前值：88%', 'triggered', DATE_SUB(NOW(), INTERVAL 15 MINUTE), NULL),
(2, 5, 'info', '内存使用率超过85%，当前值：87%', 'triggered', DATE_SUB(NOW(), INTERVAL 10 MINUTE), NULL)
ON DUPLICATE KEY UPDATE message = VALUES(message);

-- 插入工单
INSERT INTO tickets (title, description, type, priority, status, requester_id, assignee_id, created_at, updated_at) VALUES
('服务器宕机 - web-server-01', 'web-server-01 无法访问，需要紧急处理', 'incident', 'urgent', 'resolved', 4, 2, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
('申请开通测试环境', '需要为新项目开通测试环境服务器', 'request', 'medium', 'in_progress', 5, 2, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
('数据库备份失败', '数据库自动备份任务执行失败', 'incident', 'high', 'open', 2, NULL, DATE_SUB(NOW(), INTERVAL 4 HOUR), DATE_SUB(NOW(), INTERVAL 4 HOUR)),
('服务器定期维护', '对生产环境服务器进行定期维护', 'maintenance', 'low', 'assigned', 2, 3, DATE_SUB(NOW(), INTERVAL 12 HOUR), DATE_SUB(NOW(), INTERVAL 6 HOUR)),
('网络延迟高', '从外网访问服务器响应慢', 'incident', 'high', 'open', 4, NULL, DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR))
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- 插入工单评论
INSERT INTO ticket_comments (ticket_id, author_id, content, created_at) VALUES
(1, 2, '已收到告警，正在处理', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 2, '服务器已重启，服务恢复正常', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 2, '已查看日志，发现磁盘空间不足导致备份失败', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(3, 3, '正在清理旧备份文件', DATE_SUB(NOW(), INTERVAL 2 HOUR));

-- 插入资产数据
INSERT INTO assets (name, type, status, value, location, server_id, description, created_at) VALUES
('A区-01机柜', 'rack', 'in_use', '42U', 'A区-01', NULL, '标准42U机柜', DATE_SUB(NOW(), INTERVAL 30 DAY)),
('A区-02机柜', 'rack', 'in_use', '42U', 'A区-02', NULL, '标准42U机柜', DATE_SUB(NOW(), INTERVAL 30 DAY)),
('A区-03机柜', 'rack', 'in_use', '42U', 'A区-03', NULL, '标准42U机柜', DATE_SUB(NOW(), INTERVAL 30 DAY)),
('A区-04机柜', 'rack', 'available', '42U', 'A区-04', NULL, '标准42U机柜', DATE_SUB(NOW(), INTERVAL 30 DAY)),
('B区-01机柜', 'rack', 'in_use', '22U', 'B区-01', NULL, '小型机柜', DATE_SUB(NOW(), INTERVAL 30 DAY)),
('192.168.1.101', 'ip', 'in_use', '192.168.1.101', '内网', 1, 'Web服务器IP', DATE_SUB(NOW(), INTERVAL 30 DAY)),
('192.168.1.102', 'ip', 'in_use', '192.168.1.102', '内网', 2, 'Web服务器IP', DATE_SUB(NOW(), INTERVAL 30 DAY)),
('192.168.1.111', 'ip', 'in_use', '192.168.1.111', '内网', 3, '数据库服务器IP', DATE_SUB(NOW(), INTERVAL 30 DAY)),
('192.168.2.0/24', 'ip', 'in_use', '254', '测试网段', NULL, '测试环境IP段', DATE_SUB(NOW(), INTERVAL 30 DAY)),
('1000Mbps带宽', 'bandwidth', 'in_use', '1000Mbps', '机房', NULL, '主干网带宽', DATE_SUB(NOW(), INTERVAL 30 DAY)),
('Dell R740', 'hardware', 'in_use', '2*Xeon Gold 6248R, 256GB RAM', 'A区-01', 3, '数据库服务器', DATE_SUB(NOW(), INTERVAL 30 DAY)),
('HPE DL380', 'hardware', 'in_use', '2*Xeon Silver 4214R, 128GB RAM', 'A区-02', 1, 'Web服务器', DATE_SUB(NOW(), INTERVAL 30 DAY))
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 更新统计信息
-- 这里可以添加更多需要的统计更新语句
