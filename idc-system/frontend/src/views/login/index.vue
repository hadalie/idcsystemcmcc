<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <CloudServerOutlined class="logo-icon" />
        <h1 class="title">IDC机房管理系统</h1>
        <p class="subtitle">IDC Data Center Management System</p>
      </div>

      <a-card class="login-card" :bordered="false">
        <a-tabs v-model:activeKey="activeTab" centered>
          <a-tab-pane key="login" tab="账号登录">
            <a-form
              :model="loginForm"
              :rules="loginRules"
              @finish="handleLogin"
              class="login-form"
            >
              <a-form-item name="username">
                <a-input
                  v-model:value="loginForm.username"
                  size="large"
                  placeholder="用户名"
                >
                  <template #prefix>
                    <UserOutlined />
                  </template>
                </a-input>
              </a-form-item>

              <a-form-item name="password">
                <a-input-password
                  v-model:value="loginForm.password"
                  size="large"
                  placeholder="密码"
                >
                  <template #prefix>
                    <LockOutlined />
                  </template>
                </a-input-password>
              </a-form-item>

              <a-form-item>
                <div class="login-options">
                  <a-checkbox v-model:checked="loginForm.remember">
                    记住我
                  </a-checkbox>
                  <a-button type="link" @click="showForgotModal = true">
                    忘记密码？
                  </a-button>
                </div>
              </a-form-item>

              <a-form-item>
                <a-button
                  type="primary"
                  html-type="submit"
                  size="large"
                  block
                  :loading="loading"
                >
                  登录
                </a-button>
              </a-form-item>
            </a-form>
          </a-tab-pane>

          <a-tab-pane key="register" tab="账号注册">
            <a-form
              :model="registerForm"
              :rules="registerRules"
              @finish="handleRegister"
              class="login-form"
            >
              <a-form-item name="username">
                <a-input
                  v-model:value="registerForm.username"
                  size="large"
                  placeholder="用户名"
                >
                  <template #prefix>
                    <UserOutlined />
                  </template>
                </a-input>
              </a-form-item>

              <a-form-item name="email">
                <a-input
                  v-model:value="registerForm.email"
                  size="large"
                  placeholder="邮箱"
                >
                  <template #prefix>
                    <MailOutlined />
                  </template>
                </a-input>
              </a-form-item>

              <a-form-item name="password">
                <a-input-password
                  v-model:value="registerForm.password"
                  size="large"
                  placeholder="密码"
                >
                  <template #prefix>
                    <LockOutlined />
                  </template>
                </a-input-password>
              </a-form-item>

              <a-form-item name="confirmPassword">
                <a-input-password
                  v-model:value="registerForm.confirmPassword"
                  size="large"
                  placeholder="确认密码"
                >
                  <template #prefix>
                    <LockOutlined />
                  </template>
                </a-input-password>
              </a-form-item>

              <a-form-item>
                <a-button
                  type="primary"
                  html-type="submit"
                  size="large"
                  block
                  :loading="loading"
                >
                  注册
                </a-button>
              </a-form-item>
            </a-form>
          </a-tab-pane>
        </a-tabs>
      </a-card>

      <div class="login-footer">
        <p>© {{ new Date().getFullYear() }} IDC机房管理系统. All rights reserved.</p>
      </div>
    </div>

    <!-- 忘记密码弹窗 -->
    <a-modal
      v-model:open="showForgotModal"
      title="重置密码"
      @ok="handleForgotPassword"
      :confirmLoading="forgotLoading"
    >
      <p>请输入您的邮箱，我们将发送密码重置链接给您。</p>
      <a-input
        v-model:value="forgotEmail"
        placeholder="邮箱地址"
        size="large"
      >
        <template #prefix>
          <MailOutlined />
        </template>
      </a-input>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  CloudServerOutlined,
  UserOutlined,
  LockOutlined,
  MailOutlined
} from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import { register, resetPassword } from '@/services/auth'
import type { Rule } from 'ant-design-vue/es/form'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('login')
const loading = ref(false)

// 登录表单
const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

const loginRules: Record<string, Rule[]> = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
  ]
}

// 注册表单
const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = async (_rule: Rule, value: string) => {
  if (value !== registerForm.password) {
    return Promise.reject('两次输入的密码不一致')
  }
  return Promise.resolve()
}

const registerRules: Record<string, Rule[]> = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 忘记密码
const showForgotModal = ref(false)
const forgotEmail = ref('')
const forgotLoading = ref(false)

// 登录处理
const handleLogin = async () => {
  loading.value = true
  try {
    await userStore.login({
      username: loginForm.username,
      password: loginForm.password,
      remember: loginForm.remember
    })
    message.success('登录成功')
    router.push('/dashboard')
  } catch (error: any) {
    message.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}

// 注册处理
const handleRegister = async () => {
  loading.value = true
  try {
    await register({
      username: registerForm.username,
      email: registerForm.email,
      password: registerForm.password
    })
    message.success('注册成功，请登录')
    activeTab.value = 'login'
    // 清空注册表单
    registerForm.username = ''
    registerForm.email = ''
    registerForm.password = ''
    registerForm.confirmPassword = ''
  } catch (error: any) {
    message.error(error.message || '注册失败')
  } finally {
    loading.value = false
  }
}

// 忘记密码处理
const handleForgotPassword = async () => {
  if (!forgotEmail.value) {
    message.warning('请输入邮箱地址')
    return
  }
  forgotLoading.value = true
  try {
    await resetPassword(forgotEmail.value)
    message.success('密码重置链接已发送到您的邮箱')
    showForgotModal.value = false
    forgotEmail.value = ''
  } catch (error: any) {
    message.error(error.message || '发送失败')
  } finally {
    forgotLoading.value = false
  }
}
</script>

<style scoped lang="less">
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
}

.login-container {
  width: 100%;
  max-width: 420px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
  color: #fff;

  .logo-icon {
    font-size: 64px;
    margin-bottom: 16px;
  }

  .title {
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 8px;
  }

  .subtitle {
    font-size: 14px;
    opacity: 0.8;
  }
}

.login-card {
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);

  :deep(.ant-tabs-nav) {
    margin-bottom: 24px;
  }
}

.login-form {
  .login-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.login-footer {
  margin-top: 24px;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
}
</style>
