import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'
import router from '@/router'

// 创建axios实例
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求队列（用于取消重复请求）
const pendingMap = new Map<string, AbortController>()

// 获取请求标识
const getPendingKey = (config: InternalAxiosRequestConfig): string => {
  return `${config.method}&${config.url}&${JSON.stringify(config.params)}&${JSON.stringify(config.data)}`
}

// 添加请求到队列
const addPending = (config: InternalAxiosRequestConfig): void => {
  const key = getPendingKey(config)
  const controller = new AbortController()
  config.signal = controller.signal
  pendingMap.set(key, controller)
}

// 移除请求从队列
const removePending = (config: InternalAxiosRequestConfig): void => {
  const key = getPendingKey(config)
  if (pendingMap.has(key)) {
    const controller = pendingMap.get(key)
    controller?.abort()
    pendingMap.delete(key)
  }
}

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 移除重复请求
    removePending(config)
    addPending(config)

    // 添加token
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    // 移除请求
    removePending(response.config)

    const { code, message: msg, data } = response.data

    // 成功响应
    if (code === 200) {
      return data
    }

    // 特殊状态码处理
    if (code === 401) {
      const userStore = useUserStore()
      userStore.logout()
      router.push('/login')
      message.error('登录已过期，请重新登录')
      return Promise.reject(new Error('Unauthorized'))
    }

    // 其他错误
    message.error(msg || '请求失败')
    return Promise.reject(new Error(msg))
  },
  (error: AxiosError) => {
    // 移除请求
    if (error.config) {
      removePending(error.config)
    }

    // 处理取消的请求
    if (error.name === 'CanceledError') {
      return Promise.reject(error)
    }

    // 处理网络错误
    if (!error.response) {
      message.error('网络错误，请检查网络连接')
      return Promise.reject(new Error('Network Error'))
    }

    const { status, data } = error.response as AxiosResponse

    switch (status) {
      case 400:
        message.error(data?.message || '请求参数错误')
        break
      case 401:
        {
          const userStore = useUserStore()
          userStore.logout()
          router.push('/login')
          message.error('登录已过期，请重新登录')
        }
        break
      case 403:
        message.error('没有权限访问该资源')
        break
      case 404:
        message.error('请求的资源不存在')
        break
      case 500:
        message.error('服务器内部错误')
        break
      default:
        message.error(data?.message || `请求失败: ${status}`)
    }

    return Promise.reject(error)
  }
)

// 取消所有请求
export const cancelAllRequests = (): void => {
  pendingMap.forEach((controller) => {
    controller.abort()
  })
  pendingMap.clear()
}

export default request
