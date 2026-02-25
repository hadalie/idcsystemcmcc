import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { public: true, title: '登录' }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '仪表板', icon: 'DashboardOutlined' }
      },
      {
        path: '/servers',
        name: 'Servers',
        component: () => import('@/views/servers/index.vue'),
        meta: { title: '服务器管理', icon: 'CloudServerOutlined', permission: 'server:read' }
      },
      {
        path: '/servers/:id',
        name: 'ServerDetail',
        component: () => import('@/views/servers/detail.vue'),
        meta: { title: '服务器详情', hidden: true, permission: 'server:read' }
      },
      {
        path: '/monitors',
        name: 'Monitors',
        component: () => import('@/views/monitors/index.vue'),
        meta: { title: '监控中心', icon: 'LineChartOutlined', permission: 'monitor:read' }
      },
      {
        path: '/monitors/:id',
        name: 'MonitorDetail',
        component: () => import('@/views/monitors/detail.vue'),
        meta: { title: '监控详情', hidden: true, permission: 'monitor:read' }
      },
      {
        path: '/alerts',
        name: 'Alerts',
        component: () => import('@/views/alerts/index.vue'),
        meta: { title: '告警管理', icon: 'AlertOutlined', permission: 'alert:read' }
      },
      {
        path: '/alerts/rules',
        name: 'AlertRules',
        component: () => import('@/views/alerts/rules.vue'),
        meta: { title: '告警规则', hidden: true, permission: 'alert:read' }
      },
      {
        path: '/tickets',
        name: 'Tickets',
        component: () => import('@/views/tickets/index.vue'),
        meta: { title: '工单系统', icon: 'FileTextOutlined', permission: 'ticket:read' }
      },
      {
        path: '/tickets/:id',
        name: 'TicketDetail',
        component: () => import('@/views/tickets/detail.vue'),
        meta: { title: '工单详情', hidden: true, permission: 'ticket:read' }
      },
      {
        path: '/assets',
        name: 'Assets',
        component: () => import('@/views/assets/index.vue'),
        meta: { title: '资产管理', icon: 'DatabaseOutlined', permission: 'asset:read' }
      },
      {
        path: '/assets/racks',
        name: 'Racks',
        component: () => import('@/views/assets/racks.vue'),
        meta: { title: '机柜管理', hidden: true, permission: 'asset:read' }
      },
      {
        path: '/assets/ips',
        name: 'IPs',
        component: () => import('@/views/assets/ips.vue'),
        meta: { title: 'IP管理', hidden: true, permission: 'asset:read' }
      },
      {
        path: '/users',
        name: 'Users',
        component: () => import('@/views/users/index.vue'),
        meta: { title: '用户管理', icon: 'TeamOutlined', permission: 'user:read' }
      },
      {
        path: '/settings',
        name: 'Settings',
        component: () => import('@/views/settings/index.vue'),
        meta: { title: '系统设置', icon: 'SettingOutlined', permission: 'setting:read' }
      }
    ]
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/error/403.vue'),
    meta: { title: '403', public: true }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '404', public: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const appStore = useAppStore()

  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - IDC机房管理系统` : 'IDC机房管理系统'

  // 公开页面直接访问
  if (to.meta.public) {
    next()
    return
  }

  // 未登录跳转到登录页
  if (!userStore.isLoggedIn) {
    next('/login')
    return
  }

  // 检查权限
  if (to.meta.permission && !userStore.hasPermission(to.meta.permission as string, '*')) {
    next('/403')
    return
  }

  // 更新面包屑
  const breadcrumbs = []
  const matched = to.matched.filter((item) => item.meta?.title && !item.meta.hidden)
  for (const route of matched) {
    breadcrumbs.push({
      title: route.meta.title as string,
      path: route.path !== to.path ? route.path : undefined
    })
  }
  appStore.setBreadcrumbs(breadcrumbs)

  next()
})

export default router
