import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, AuthTokens, LoginCredentials, LoginResponse } from '@/types'
import * as authApi from '@/services/auth'

export const useUserStore = defineStore(
  'user',
  () => {
    // State
    const user = ref<User | null>(null)
    const token = ref<string>('')
    const refreshToken = ref<string>('')
    const tokenExpiresAt = ref<number>(0)

    // Getters
    const isLoggedIn = computed(() => !!token.value && !!user.value)
    const isAdmin = computed(() => user.value?.role?.name === 'admin')
    const hasPermission = computed(() => (resource: string, action: string) => {
      if (!user.value?.role?.permissions) return false
      return user.value.role.permissions.some(
        (p) => p.resource === resource && (p.action === action || p.action === '*')
      )
    })

    // Actions
    const setUser = (userData: User) => {
      user.value = userData
    }

    const setTokens = (tokens: AuthTokens) => {
      token.value = tokens.accessToken
      refreshToken.value = tokens.refreshToken
      tokenExpiresAt.value = Date.now() + tokens.expiresIn * 1000
    }

    const login = async (credentials: LoginCredentials): Promise<void> => {
      const response: LoginResponse = await authApi.login(credentials)
      setUser(response.user)
      setTokens(response.tokens)
    }

    const logout = async (): Promise<void> => {
      try {
        if (token.value) {
          await authApi.logout()
        }
      } finally {
        user.value = null
        token.value = ''
        refreshToken.value = ''
        tokenExpiresAt.value = 0
      }
    }

    const refreshAccessToken = async (): Promise<boolean> => {
      try {
        if (!refreshToken.value) return false
        const response = await authApi.refreshToken(refreshToken.value)
        setTokens(response.tokens)
        return true
      } catch {
        logout()
        return false
      }
    }

    const fetchCurrentUser = async (): Promise<void> => {
      const userData = await authApi.getCurrentUser()
      setUser(userData)
    }

    const updateProfile = async (data: Partial<User>): Promise<void> => {
      const updatedUser = await authApi.updateProfile(data)
      setUser(updatedUser)
    }

    return {
      user,
      token,
      refreshToken,
      tokenExpiresAt,
      isLoggedIn,
      isAdmin,
      hasPermission,
      setUser,
      setTokens,
      login,
      logout,
      refreshAccessToken,
      fetchCurrentUser,
      updateProfile
    }
  },
  {
    persist: {
      key: 'idc-user',
      paths: ['token', 'refreshToken', 'tokenExpiresAt']
    }
  }
)
