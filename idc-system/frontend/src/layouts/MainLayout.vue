<template>
  <a-layout class="main-layout">
    <!-- 侧边栏 -->
    <a-layout-sider
      v-model:collapsed="appStore.collapsed"
      :trigger="null"
      collapsible
      :width="200"
      class="sidebar"
    >
      <div class="logo">
        <CloudServerOutlined class="logo-icon" />
        <span v-if="!appStore.collapsed" class="logo-text">IDC管理系统</span>
      </div>
      <a-menu
        :selectedKeys="selectedKeys"
        :openKeys="openKeys"
        mode="inline"
        theme="dark"
        @click="handleMenuClick"
        @openChange="handleOpenChange"
      >
        <template v-for="item in menuItems" :key="item.key">
          <a-sub-menu v-if="item.children" :key="item.key">
            <template #icon>
              <component :is="item.icon" />
            </template>
            <template #title>{{ item.title }}</template>
            <a-menu-item v-for="child in item.children" :key="child.key">
              {{ child.title }}
            </a-menu-item>
          </a-sub-menu>
          <a-menu-item v-else :key="item.key">
            <template #icon>
              <component :is="item.icon" />
            </template>
            {{ item.title }}
          </a-menu-item>
        </template>
      </a-menu>
    </a-layout-sider>

    <!-- 主内容区 -->
    <a-layout>
      <!-- 头部 -->
      <a-layout-header class="header">
        <div class="header-left">
          <MenuUnfoldOutlined
            v-if="appStore.collapsed"
            class="trigger"
            @click="appStore.toggleCollapsed"
          />
          <MenuFoldOutlined v-else class="trigger" @click="appStore.toggleCollapsed" />
          <a-breadcrumb class="breadcrumb">
            <a-breadcrumb-item v-for="(item, index) in appStore.breadcrumbs" :key="index">
              <router-link v-if="item.path" :to="item.path">{{ item.title }}</router-link>
              <span v-else>{{ item.title }}</span>
            </a-breadcrumb-item>
          </a-breadcrumb>
        </div>
        <div class="header-right">
          <!-- 网络状态 -->
          <a-tooltip :title="appStore.online ? '网络正常' : '网络断开'">
            <WifiOutlined v-if="appStore.online" class="status-icon online" />
            <DisconnectOutlined v-else class="status-icon offline" />
          </a-tooltip>

          <!-- 告警通知 -->
          <a-dropdown :trigger="['click']">
            <a-badge :count="unreadAlertCount" :offset="[-5, 5]">
              <BellOutlined class="header-icon" />
            </a-badge>
            <template #overlay>
              <a-menu class="notification-menu">
                <div class="notification-header">
                  <span>告警通知</span>
                  <a-button type="link" size="small" @click="viewAllAlerts">
                    查看全部
                  </a-button>
                </div>
                <a-menu-divider />
                <template v-if="recentAlerts.length > 0">
                  <a-menu-item v-for="alert in recentAlerts" :key="alert.id">
                    <div class="notification-item" @click="handleAlertClick(alert)">
                      <a-tag :color="getAlertLevelColor(alert.alertLevel)">
                        {{ getAlertLevelText(alert.alertLevel) }}
                      </a-tag>
                      <span class="notification-text">{{ alert.message }}</span>
                      <span class="notification-time">{{ formatRelativeTime(alert.createdAt) }}</span>
                    </div>
                  </a-menu-item>
                </template>
                <a-menu-item v-else>
                  <div class="notification-empty">暂无告警</div>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>

          <!-- 用户信息 -->
          <a-dropdown>
            <div class="user-info">
              <a-avatar :size="32" :style="{ backgroundColor: '#1890ff' }">
                {{ userStore.user?.username?.charAt(0).toUpperCase() }}
              </a-avatar>
              <span v-if="!appStore.collapsed" class="username">
                {{ userStore.user?.username }}
              </span>
              <DownOutlined />
            </div>
            <template #overlay>
              <a-menu>
                <a-menu-item key="profile" @click="showProfileModal = true">
                  <UserOutlined />
                  个人中心
                </a-menu-item>
                <a-menu-item key="settings" @click="$router.push('/settings')">
                  <SettingOutlined />
                  系统设置
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout" @click="handleLogout">
                  <LogoutOutlined />
                  退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <!-- 内容区 -->
      <a-layout-content class="content">
        <div class="content-wrapper">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </a-layout-content>

      <!-- 页脚 -->
      <a-layout-footer class="footer">
        IDC机房管理系统 © {{ new Date().getFullYear() }} All Rights Reserved
      </a-layout-footer>
    </a-layout>

    <!-- 个人中心弹窗 -->
    <a-modal
      v-model:open="showProfileModal"
      title="个人中心"
      :footer="null"
      width="500px"
    >
      <a-form :model="profileForm" layout="vertical">
        <a-form-item label="用户名">
          <a-input v-model:value="profileForm.username" disabled />
        </a-form-item>
        <a-form-item label="邮箱">
          <a-input v-model:value="profileForm.email" />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleUpdateProfile">保存</a-button>
            <a-button @click="showChangePasswordModal = true">修改密码</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 修改密码弹窗 -->
    <a-modal
      v-model:open="showChangePasswordModal"
      title="修改密码"
      @ok="handleChangePassword"
      @cancel="resetPasswordForm"
    >
      <a-form :model="passwordForm" layout="vertical">
        <a-form-item label="当前密码" required>
          <a-input-password v-model:value="passwordForm.oldPassword" />
        </a-form-item>
        <a-form-item label="新密码" required>
          <a-input-password v-model:value="passwordForm.newPassword" />
        </a-form-item>
        <a-form-item label="确认密码" required>
          <a-input-password v-model:value="passwordForm.confirmPassword" />
        </a-form-item>
      </a-form>
    </a-modal>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  CloudServerOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DashboardOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  DownOutlined,
  WifiOutlined,
  DisconnectOutlined,
  CloudServerOutlined as ServerOutlined,
  LineChartOutlined,
  AlertOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  TeamOutlined
} from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { useMenu } from './useMenu'
import { getRecentAlerts, resolveAlert } from '@/services/alert'
import { updateProfile, changePassword } from '@/services/auth'
import type { AlertHistory } from '@/types'
import { getAlertLevelColor, getAlertLevelText, formatRelativeTime } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()
const { menuItems } = useMenu()

// 菜单状态
const selectedKeys = computed(() => [route.path])
const openKeys = ref<string[]>([])

const handleMenuClick = ({ key }: { key: string }) => {
  router.push(key)
}

const handleOpenChange = (keys: string[]) => {
  openKeys.value = keys
}

// 告警通知
const recentAlerts = ref<AlertHistory[]>([])
const unreadAlertCount = computed(() => recentAlerts.value.filter(a => a.status === 'triggered').length)

const loadRecentAlerts = async () => {
  try {
    recentAlerts.value = await getRecentAlerts(5)
  } catch (error) {
    console.error('Failed to load alerts:', error)
  }
}

const handleAlertClick = async (alert: AlertHistory) => {
  if (alert.status === 'triggered') {
    Modal.confirm({
      title: '确认处理',
      content: '是否标记该告警为已处理？',
      onOk: async () => {
        await resolveAlert(alert.id)
        message.success('告警已处理')
        loadRecentAlerts()
      }
    })
  }
}

const viewAllAlerts = () => {
  router.push('/alerts')
}

// 用户信息编辑
const showProfileModal = ref(false)
const showChangePasswordModal = ref(false)
const profileForm = ref({
  username: userStore.user?.username || '',
  email: userStore.user?.email || ''
})

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const handleUpdateProfile = async () => {
  try {
    await updateProfile({ email: profileForm.value.email })
    message.success('个人信息已更新')
    showProfileModal.value = false
  } catch (error) {
    message.error('更新失败')
  }
}

const handleChangePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    message.error('两次输入的密码不一致')
    return
  }
  try {
    await changePassword({
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword
    })
    message.success('密码修改成功')
    showChangePasswordModal.value = false
    resetPasswordForm()
  } catch (error) {
    message.error('密码修改失败')
  }
}

const resetPasswordForm = () => {
  passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
}

// 登出
const handleLogout = () => {
  Modal.confirm({
    title: '确认退出',
    content: '确定要退出登录吗？',
    onOk: async () => {
      await userStore.logout()
      router.push('/login')
      message.success('已退出登录')
    }
  })
}

// 监听用户变化
watch(() => userStore.user, (user) => {
  if (user) {
    profileForm.value = {
      username: user.username,
      email: user.email
    }
  }
}, { immediate: true })

onMounted(() => {
  loadRecentAlerts()
  // 定时刷新告警
  setInterval(loadRecentAlerts, 60000)
})
</script>

<style scoped lang="less">
.main-layout {
  min-height: 100vh;
}

.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;

  .logo {
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 18px;
    font-weight: bold;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    .logo-icon {
      font-size: 28px;
      margin-right: 8px;
    }

    .logo-text {
      white-space: nowrap;
    }
  }
}

.header {
  position: sticky;
  top: 0;
  z-index: 99;
  background: #fff;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);

  .header-left {
    display: flex;
    align-items: center;

    .trigger {
      font-size: 18px;
      cursor: pointer;
      transition: color 0.3s;

      &:hover {
        color: #1890ff;
      }
    }

    .breadcrumb {
      margin-left: 24px;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;

    .status-icon {
      font-size: 18px;

      &.online {
        color: #52c41a;
      }

      &.offline {
        color: #ff4d4f;
      }
    }

    .header-icon {
      font-size: 18px;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      transition: background 0.3s;

      &:hover {
        background: rgba(0, 0, 0, 0.05);
      }
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      transition: background 0.3s;

      &:hover {
        background: rgba(0, 0, 0, 0.05);
      }

      .username {
        max-width: 100px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}

.content {
  margin: 24px;
  min-height: calc(100vh - 64px - 70px - 48px);

  .content-wrapper {
    background: #fff;
    padding: 24px;
    border-radius: 4px;
    min-height: 100%;
  }
}

.footer {
  text-align: center;
  padding: 16px;
  color: rgba(0, 0, 0, 0.45);
}

.notification-menu {
  width: 320px;

  .notification-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    font-weight: bold;
  }

  .notification-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 0;

    .notification-text {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .notification-time {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.45);
    }
  }

  .notification-empty {
    text-align: center;
    padding: 24px;
    color: rgba(0, 0, 0, 0.45);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
