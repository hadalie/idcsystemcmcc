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
