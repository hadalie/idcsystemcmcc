import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import {
  DashboardOutlined,
  CloudServerOutlined,
  LineChartOutlined,
  AlertOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  TeamOutlined,
  SettingOutlined
} from '@ant-design/icons-vue'
import type { Component } from 'vue'

interface MenuItem {
  key: string
  title: string
  icon?: Component
  permission?: string
  children?: MenuItem[]
}

export function useMenu() {
  const userStore = useUserStore()

  const allMenus: MenuItem[] = [
    {
      key: '/dashboard',
      title: '仪表板',
      icon: DashboardOutlined
    },
    {
      key: '/servers',
      title: '服务器管理',
      icon: CloudServerOutlined,
      permission: 'server:read'
    },
    {
      key: '/monitors',
      title: '监控中心',
      icon: LineChartOutlined,
      permission: 'monitor:read'
    },
    {
      key: '/alerts',
      title: '告警管理',
      icon: AlertOutlined,
      permission: 'alert:read',
      children: [
        { key: '/alerts', title: '告警历史' },
        { key: '/alerts/rules', title: '告警规则' }
      ]
    },
    {
      key: '/tickets',
      title: '工单系统',
      icon: FileTextOutlined,
      permission: 'ticket:read'
    },
    {
      key: '/assets',
      title: '资产管理',
      icon: DatabaseOutlined,
      permission: 'asset:read',
      children: [
        { key: '/assets', title: '资产概览' },
        { key: '/assets/racks', title: '机柜管理' },
        { key: '/assets/ips', title: 'IP管理' }
      ]
    },
    {
      key: '/users',
      title: '用户管理',
      icon: TeamOutlined,
      permission: 'user:read'
    },
    {
      key: '/settings',
      title: '系统设置',
      icon: SettingOutlined,
      permission: 'setting:read'
    }
  ]

  // 过滤有权限的菜单
  const menuItems = computed(() => {
    const filterMenu = (menus: MenuItem[]): MenuItem[] => {
      return menus
        .filter((menu) => {
          if (!menu.permission) return true
          return userStore.hasPermission(menu.permission, '*')
        })
        .map((menu) => {
          if (menu.children) {
            return {
              ...menu,
              children: filterMenu(menu.children)
            }
          }
          return menu
        })
        .filter((menu) => {
          // 如果子菜单为空，移除该菜单
          if (menu.children && menu.children.length === 0) {
            return false
          }
          return true
        })
    }

    return filterMenu(allMenus)
  })

  return {
    menuItems
  }
}
