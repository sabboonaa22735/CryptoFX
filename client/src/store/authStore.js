import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

const API_URL = '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken })
          localStorage.setItem('token', data.token)
          localStorage.setItem('refreshToken', data.refreshToken)
          originalRequest.headers.Authorization = `Bearer ${data.token}`
          return api(originalRequest)
        } catch {
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
        }
      }
    }
    
    return Promise.reject(error)
  }
)

export { api }

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      error: null,

      isAuthenticated: () => {
        const token = get().token
        if (!token) return false
        if (token.startsWith('mock-')) return false
        return true
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await api.post('/auth/login', { email, password })
          localStorage.setItem('token', data.token)
          localStorage.setItem('refreshToken', data.refreshToken)
          set({ 
            user: data.user, 
            token: data.token, 
            refreshToken: data.refreshToken,
            isLoading: false 
          })
          return { success: true }
        } catch (error) {
          const message = error.response?.data?.message || 'Invalid credentials'
          set({ error: message, isLoading: false })
          return { success: false, error: message }
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await api.post('/auth/register', { name, email, password })
          localStorage.setItem('token', data.token)
          localStorage.setItem('refreshToken', data.refreshToken)
          set({ 
            user: data.user, 
            token: data.token, 
            refreshToken: data.refreshToken,
            isLoading: false 
          })
          return { success: true }
        } catch (error) {
          const message = error.response?.data?.message || 'Registration failed'
          set({ error: message, isLoading: false })
          return { success: false, error: message }
        }
      },

      logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('auth-storage')
        set({ user: null, token: null, refreshToken: null })
        window.location.href = '/'
      },

      fetchUser: async () => {
        try {
          const { data } = await api.get('/users/me')
          set({ user: data })
        } catch (error) {
          console.error('Failed to fetch user:', error)
        }
      },

      updateUser: (updates) => {
        set((state) => ({ user: { ...state.user, ...updates } }))
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token })
    }
  )
)
