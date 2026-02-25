# IDC机房管理系统部署指南

## 系统要求

### 硬件要求
- **CPU**: 2核及以上
- **内存**: 4GB及以上
- **磁盘**: 20GB及以上
- **网络**: 百兆及以上带宽

### 软件要求
- Docker Engine 20.10+
- Docker Compose 2.0+
- (可选) Node.js 18+ 和 MySQL 8.0+ (手动部署)

## 部署方式

### 方式一：Docker Compose 一键部署（推荐）

#### 1. 环境准备

确保已安装 Docker 和 Docker Compose：

```bash
# 检查 Docker 版本
docker --version
docker-compose --version
```

#### 2. 下载项目

```bash
# 克隆项目
git clone <repository-url>
cd idc-system

# 或者手动下载并解压
```

#### 3. 配置环境变量（可选）

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，修改以下配置：
# - JWT_SECRET: 生产环境必须修改为强密码
# - DB_PASSWORD: 数据库密码
# - REDIS_PASSWORD: Redis密码（如启用）
```

#### 4. 启动服务

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 只查看后端日志
docker-compose logs -f backend
```

#### 5. 初始化数据

```bash
# 执行测试数据脚本
docker-compose exec mysql mysql -u root -proot123456 idc_system -e "source /docker-entrypoint-initdb.d/seed.sql"
```

#### 6. 访问系统

- **前端界面**: http://localhost
- **后端API**: http://localhost:5000
- **API文档**: http://localhost:5000/health (健康检查)

默认账号：
- 管理员: `admin` / `admin123`
- 运维人员: `operator1` / `operator1`
- 普通用户: `user1` / `user1`

### 方式二：手动部署

#### 1. 安装 MySQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server-8.0

# CentOS/RHEL
sudo yum install mysql-server

# 启动 MySQL
sudo systemctl start mysql
sudo systemctl enable mysql
```

创建数据库和用户：

```bash
sudo mysql -u root

CREATE DATABASE idc_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'idc'@'localhost' IDENTIFIED BY 'idc123456';
GRANT ALL PRIVILEGES ON idc_system.* TO 'idc'@'localhost';
FLUSH PRIVILEGES;

source /path/to/idc-system/database/init.sql
source /path/to/idc-system/database/seed.sql
EXIT;
```

#### 2. 安装 Redis

```bash
# Ubuntu/Debian
sudo apt install redis-server

# CentOS/RHEL
sudo yum install redis

# 启动 Redis
sudo systemctl start redis
sudo systemctl enable redis
```

#### 3. 部署后端

```bash
cd idc-system/backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env，配置数据库连接

# 编译 TypeScript
npm run build

# 启动服务
npm start

# 或者使用 PM2 管理
npm install -g pm2
pm2 start dist/index.js --name idc-backend
pm2 save
pm2 startup
```

#### 4. 部署前端

```bash
cd idc-system/frontend

# 安装依赖
npm install

# 配置环境变量
# 创建 .env.production 文件
VITE_API_BASE_URL=http://your-backend-url:5000/api

# 构建
npm run build

# 部署到 Nginx
# 将 dist 目录复制到 Nginx 的 web 根目录
sudo cp -r dist/* /var/www/html/

# 或者使用 Nginx 配置代理
```

Nginx 配置示例：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /api/ws {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## 维护操作

### 备份数据库

```bash
# Docker 方式
docker-compose exec mysql mysqldump -u root -proot123456 idc_system > backup_$(date +%Y%m%d_%H%M%S).sql

# 手动方式
mysqldump -u idc -p idc_system > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 恢复数据库

```bash
# Docker 方式
docker-compose exec -T mysql mysql -u root -proot123456 idc_system < backup_file.sql

# 手动方式
mysql -u idc -p idc_system < backup_file.sql
```

### 更新部署

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose down
docker-compose up -d --build

# 执行数据库迁移（如有）
docker-compose exec mysql mysql -u root -proot123456 idc_system < database/migrations.sql
```

### 查看日志

```bash
# 所有服务日志
docker-compose logs -f

# 特定服务
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
docker-compose logs -f redis
```

### 停止服务

```bash
# 停止所有服务
docker-compose down

# 停止并删除数据卷（谨慎使用）
docker-compose down -v
```

## 安全配置

### 1. 修改默认密码

部署完成后，请立即修改默认账号密码：

1. 登录系统（admin/admin123）
2. 进入"用户管理"页面
3. 修改 admin 用户密码
4. 建议创建新的管理员账号后禁用默认账号

### 2. 配置 HTTPS

生产环境必须使用 HTTPS：

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # ... 其他配置
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### 3. 配置防火墙

```bash
# 仅开放必要端口
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

## 故障排查

### 服务无法启动

1. 检查端口占用
```bash
sudo lsof -i :5000
sudo lsof -i :3306
sudo lsof -i :6379
sudo lsof -i :80
```

2. 检查日志
```bash
docker-compose logs backend
docker-compose logs mysql
```

### 数据库连接失败

1. 检查 MySQL 是否运行
```bash
docker-compose ps mysql
sudo systemctl status mysql  # 手动部署
```

2. 检查连接配置
```bash
# 测试连接
docker-compose exec mysql mysql -u idc -pidc123456 -e "SELECT 1"
```

### 前端无法访问后端

1. 检查后端服务状态
```bash
curl http://localhost:5000/health
```

2. 检查 CORS 配置
3. 检查防火墙设置

## 性能优化

### MySQL 优化

编辑 `my.cnf`：

```ini
[mysqld]
innodb_buffer_pool_size = 1G
max_connections = 200
query_cache_size = 64M
slow_query_log = 1
```

### Redis 优化

编辑 `redis.conf`：

```
maxmemory 256mb
maxmemory-policy allkeys-lru
```

### Node.js 优化

使用 PM2 集群模式：

```bash
pm2 start dist/index.js -i max --name idc-backend
```

## 监控与告警

### 系统监控

建议安装以下监控工具：
- **服务器监控**: Prometheus + Grafana
- **应用监控**: PM2 监控面板
- **日志收集**: ELK Stack 或 Loki

### 配置告警

在系统中配置告警规则：
1. 进入"告警管理" -> "告警规则"
2. 添加 CPU、内存、磁盘等监控规则
3. 配置告警通知（邮件、短信）

## 技术支持

遇到问题请查看：
- [GitHub Issues](https://github.com/your-repo/issues)
- 项目文档
- 系统日志
