<font size=7 color=red><b>该项目从代码到readme都是AI写的，提示词放在最下面吧，水平原因还没部署，谁部署成功了告诉我一声！</b></font>


# IDC机房管理系统

一个基于 Vue 3 + TypeScript + Node.js + Express + MySQL + Redis 的全栈IDC机房管理系统。

## 功能特性

- **用户管理与认证**：支持 JWT 认证、角色权限控制 (RBAC)
- **服务器管理**：服务器列表、分组管理、状态监控
- **资源监控**：CPU、内存、磁盘、网络流量实时监控
- **告警管理**：告警规则配置、告警历史、告警通知
- **资产管理**：机柜、IP、带宽等资产的管理
- **工单系统**：工单创建、分配、跟踪、评价

## 技术栈

### 前端
- Vue 3 + TypeScript
- Ant Design Vue 4.x
- Pinia 状态管理
- Vue Router 4
- Axios HTTP 请求
- ECharts 数据可视化

### 后端
- Node.js + TypeScript
- Express.js
- MySQL 8.0
- Redis
- JWT 认证
- WebSocket 实时推送

## 快速开始

### 方式一：使用 Docker Compose（推荐）

1. 克隆项目
```bash
git clone <repository-url>
cd idc-system
```

2. 启动服务
```bash
docker-compose up -d
```

3. 访问系统
- 前端: http://localhost
- 后端API: http://localhost:5000
- 默认账号: admin / admin123

### 方式二：手动安装

#### 后端部署

1. 安装依赖
```bash
cd backend
npm install
```

2. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件配置数据库连接
```

3. 初始化数据库
```bash
# 在MySQL中执行 database/init.sql
```

4. 启动服务
```bash
npm run dev  # 开发模式
npm run build && npm start  # 生产模式
```

#### 前端部署

1. 安装依赖
```bash
cd frontend
npm install
```

2. 配置环境变量
```bash
# 创建 .env 文件
VITE_API_BASE_URL=http://localhost:5000/api
```

3. 启动服务
```bash
npm run dev  # 开发模式
npm run build  # 构建生产版本
```

## 项目结构

```
idc-system/
├── backend/              # 后端项目
│   ├── src/
│   │   ├── config/       # 配置文件
│   │   ├── controllers/  # 控制器
│   │   ├── middleware/   # 中间件
│   │   ├── models/       # 数据模型
│   │   ├── routes/       # 路由
│   │   ├── utils/        # 工具函数
│   │   └── index.ts      # 入口文件
│   ├── Dockerfile
│   └── package.json
├── frontend/             # 前端项目
│   ├── src/
│   │   ├── components/   # 组件
│   │   ├── views/        # 页面
│   │   ├── services/     # API服务
│   │   ├── stores/       # Pinia状态
│   │   ├── router/       # 路由
│   │   ├── utils/        # 工具函数
│   │   ├── types/        # 类型定义
│   │   └── main.ts       # 入口文件
│   ├── Dockerfile
│   └── package.json
├── database/
│   └── init.sql          # 数据库初始化脚本
├── docker-compose.yml    # Docker编排文件
└── README.md
```

## API 文档

### 认证相关
- `POST /api/auth/login` - 登录
- `POST /api/auth/logout` - 登出
- `POST /api/auth/refresh` - 刷新Token
- `POST /api/auth/register` - 注册
- `GET /api/auth/me` - 获取当前用户信息

### 服务器管理
- `GET /api/servers` - 获取服务器列表
- `POST /api/servers` - 创建服务器
- `GET /api/servers/:id` - 获取服务器详情
- `PUT /api/servers/:id` - 更新服务器
- `DELETE /api/servers/:id` - 删除服务器

### 监控数据
- `GET /api/monitors/:serverId` - 获取监控数据
- `GET /api/monitors/:serverId/latest` - 获取最新监控数据
- `WS /api/ws` - WebSocket 实时推送

### 告警管理
- `GET /api/alerts/rules` - 获取告警规则
- `POST /api/alerts/rules` - 创建告警规则
- `GET /api/alerts/history` - 获取告警历史
- `PATCH /api/alerts/history/:id/resolve` - 处理告警

## 默认账号

- **管理员**: admin / admin123
- **运维人员**: operator / operator123
- **普通用户**: user / user123

## 开发计划

- [x] 用户认证系统
- [x] 服务器管理
- [x] 实时监控
- [x] 告警系统
- [ ] 工单系统完善
- [ ] 资产管理完善
- [ ] 邮件通知
- [ ] 短信通知

## 许可证

MIT License



提示词：
```
@idc_system_login @ip_resource_management @port_&cable_connectivity_view_1 @port&cable_connectivity_view_2 @rack&_u-slot_allocation @resource_overview_dashboard_1 @resource_overview_dashboard_2 仓库https://github.com/hadalie/idcsystemcmcc我要开发一个IDC机房管理系统。系统需要以下功能模块：

【核心模块】

用户管理与认证

登录/注册/密码重置 角色管理（管理员、运维、用户） 权限控制（RBAC） 服务器管理

服务器列表展示 服务器配置管理 服务器分组管理 设备信息查询 资源监控

CPU/内存/磁盘使用率实时监控 网络流量监控 温度/功耗监控 历史数据图表展示 告警管理

告警规则配置 告警历史查询 告警通知（邮件/短信） 告警恢复处理 资产管理

机柜管理 带宽管理 IP管理 硬件资产统计 工单系统

工单创建/分配/处理 工单流程跟踪 工单评价 【技术要求】

前端：Vue 3 + TypeScript + Ant Design Vue 后端：Node.js (Express.js) + TypeScript 数据库：MySQL 8.0 + Redis 部署：Docker + Docker-compose API：RESTful API + WebSocket实时推送 【UI参考】 我已有HTML原型，需要转换为完整的可交互系统。基于以下系统架构，实现IDC机房管理系统的前端部分：

【项目结构】 frontend/ ├── src/ │ ├── components/ # 可复用组件 │ ├── views/ # 页面组件 │ ├── stores/ # Pinia状态管理 │ ├── services/ # API服务 │ ├── types/ # TypeScript类型 │ ├── utils/ # 工具函数 │ ├── router/ # 路由配置 │ ├── App.vue │ └── main.ts ├── vite.config.ts └── package.json

【核心功能实现】

登录页面

用户名/密码登录 JWT Token管理 自动登出 仪表板 (Dashboard)

服务器总数/在线/离线统计 资源使用率概览 告警统计 最近告警列表 服务器管理页面

服务器列表（表格） 搜索/筛选/排序 编辑/删除/添加服务器 详情查看 ���控页面

实时监控数据图表 历史数据查询 导出功能 告警管理页面

告警规则CRUD 告警历史查询 告警处理 【使用的UI库】

Ant Design Vue - UI组件 ECharts - 数据可视化 axios - HTTP请求 WS - WebSocket连接 【路由设计】 /login # 登录 /dashboard # 仪表板 /servers # 服务器管理 /monitors # 监控 /alerts # 告警 /assets # 资产管理 /tickets # 工单系统 /settings # 系统设置。。。。。基于Node.js + Express + TypeScript，实现IDC机房管理系统的后端部分：

【项目结构】 backend/ ├── src/ │ ├── controllers/ # 控制器 │ ├── services/ # 业务逻辑 │ ├── models/ # 数据模型 │ ├── routes/ # 路由 │ ├── middleware/ # 中间件 │ ├── config/ # 配置文件 │ ├── utils/ # 工具函数 │ ├── types/ # TypeScript类型 │ └── index.ts ├── docker-compose.yml ├── Dockerfile ├── package.json └── tsconfig.json

【数据库设计】 MySQL表设计：

users # 用户表 roles # 角色表 permissions # 权限表 servers # 服务器表 server_groups # 服务器分组表 monitor_data # 监控数据表 alerts # 告警规则表 alert_history # 告警历史表 tickets # 工单表 assets # 资产表 Redis键设计：

session:* # 会话数据 token:* # Token黑名单 monitor:* # 实时监控数据 cache:* # 缓存数据 【API接口设计】

认证相关： POST /api/auth/login # 登录 POST /api/auth/logout # 登出 POST /api/auth/refresh # 刷新Token POST /api/auth/register # 注册

服务器管理： GET /api/servers # 获取服务器列表 POST /api/servers # 创建服务器 GET /api/servers/:id # 获取服务器详情 PUT /api/servers/:id # 更新服务器 DELETE /api/servers/:id # 删除服务器

监控数据： GET /api/monitors/:serverId # ���取监控数据 WS /api/ws/monitors # WebSocket实时推送

告警管理： GET /api/alerts # 获取告警列表 POST /api/alerts # 创建告警规则 PUT /api/alerts/:id # 更新告警规则 DELETE /api/alerts/:id # 删除告警规则

【中间件需求】

身份验证中间件 权限检查中间件 错误处理中间件 日志中间件 CORS中间件 速率限制中间件 【认证方案】

JWT Token 刷新Token机制 Token过期时间：30分钟 刷新Token过期时间：7天。。。。。为IDC机房管理系统创建完整的MySQL数据库设计和初始化脚本： 【用户相关表】 CREATE TABLE users ( id INT PRIMARY KEY AUTO_INCREMENT, username VARCHAR(50) UNIQUE NOT NULL, email VARCHAR(100) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, role_id INT, status ENUM('active', 'inactive', 'locked'), last_login TIMESTAMP, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, FOREIGN KEY (role_id) REFERENCES roles(id) );

CREATE TABLE roles ( id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(50) UNIQUE NOT NULL, description TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP );

CREATE TABLE permissions ( id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(100) UNIQUE NOT NULL, description TEXT, resource VARCHAR(50), action VARCHAR(50) );

CREATE TABLE role_permissions ( role_id INT, permission_id INT, PRIMARY KEY (role_id, permission_id), FOREIGN KEY (role_id) REFERENCES roles(id), FOREIGN KEY (permission_id) REFERENCES permissions(id) );

【服务器相关表】 CREATE TABLE servers ( id INT PRIMARY KEY AUTO_INCREMENT, hostname VARCHAR(100) UNIQUE NOT NULL, ip_address VARCHAR(15) NOT NULL, group_id INT, status ENUM('online', 'offline', 'maintenance'), os VARCHAR(50), cpu_cores INT, memory_gb INT, disk_gb INT, location VARCHAR(100), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, FOREIGN KEY (group_id) REFERENCES server_groups(id) );

CREATE TABLE server_groups ( id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(50) UNIQUE NOT NULL, description TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP );

【监控数据表】 CREATE TABLE monitor_data ( id INT PRIMARY KEY AUTO_INCREMENT, server_id INT NOT NULL, cpu_usage DECIMAL(5,2), memory_usage DECIMAL(5,2), disk_usage DECIMAL(5,2), network_in BIGINT, network_out BIGINT, temperature INT, power_usage INT, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (server_id) REFERENCES servers(id), INDEX idx_server_time (server_id, timestamp) );

【告警相关表】 CREATE TABLE alert_rules ( id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(100) NOT NULL, metric VARCHAR(50), threshold DECIMAL(10,2), operator ENUM('>', '<', '>=', '<=', '=='), duration INT, enabled BOOLEAN DEFAULT TRUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP );

CREATE TABLE alert_history ( id INT PRIMARY KEY AUTO_INCREMENT, rule_id INT, server_id INT, alert_level ENUM('info', 'warning', 'critical'), message TEXT, status ENUM('triggered', 'resolved'), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, resolved_at TIMESTAMP, FOREIGN KEY (rule_id) REFERENCES alert_rules(id), FOREIGN KEY (server_id) REFERENCES servers(id) );我需要基于以下要求创建一个完整的IDC机房管理系统：

【项目概述】 系统名称：IDC机房管理系统 项目类型：全栈Web应用 当前状态：有HTML原型，需要转换为完整系统

【技术栈】 前端：Vue 3 + TypeScript + Ant Design Vue + ECharts 后端：Node.js + Express.js + TypeScript 数据库：MySQL 8.0 + Redis 部署：Docker + Docker-compose

【核心功能】

用户认证系统（JWT） 服务器管理（增删改查） 实时监控（CPU、内存、磁盘、网络） 告警管理（规则配置、历史记录） 资产管理（机柜、带宽、IP） 工单系统（创建、分配、跟踪） 【项目结构】idc-system/ ├── frontend/ │ ├── src/ │ │ ├── components/ │ │ ├── views/ │ │ ├── services/ │ │ ├── stores/ │ │ ├── router/ │ │ ├── types/ │ │ ├── utils/ │ │ ├── App.vue │ │ └── main.ts │ ├── vite.config.ts │ ├── package.json │ └── Dockerfile ├── backend/ │ ├── src/ │ │ ├── controllers/ │ │ ├── services/ │ │ ├── models/ │ │ ├── routes/ │ │ ├── middleware/ │ │ ├── config/ │ │ └── index.ts │ ├── Dockerfile │ └── package.json ├── docker-compose.yml └── init.sql 【数据库初始化】 需要创建所有必要的表，包括：

users, roles, permissions（用户管理） servers, server_groups（服务器管理） monitor_data（监控数据） alert_rules, alert_history（告警系统） tickets（工单） assets（资产） 【请完成以下任务】

生成前端项目的完整代码（组件、页面、服务） 生成后端项目的完整代码（路由、控制器、服务） 生成数据库初始化脚本 生成Docker配置文件 生成详细的部署步骤说明 生成测试数据脚本
```


