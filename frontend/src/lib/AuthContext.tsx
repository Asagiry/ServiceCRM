import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearAuth, loadAuth, saveAuth } from './api'
import type { StoredAuth } from './api'
import type { LoginResponse } from './types'
import { onUnauthorized } from './authEvents'

interface AuthContextValue {
  auth: StoredAuth | null
  login: (res: LoginResponse) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue>({
  auth: null,
  login: () => {},
  logout: () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<StoredAuth | null>(() => loadAuth())
  const navigate = useNavigate()

  const logout = useCallback(() => {
    clearAuth()
    setAuth(null)
    navigate('/login', { replace: true })
  }, [navigate])

  const login = useCallback((res: LoginResponse) => {
    saveAuth(res)
    setAuth(loadAuth())
  }, [])

  // 401 из api-слоя → разлогин
  useEffect(() => {
    onUnauthorized(logout)
    return () => onUnauthorized(() => {})
  }, [logout])

  // протухший токен → разлогин по таймеру
  useEffect(() => {
    if (!auth) return
    const ms = new Date(auth.expiresAt).getTime() - Date.now()
    if (ms <= 0) {
      logout()
      return
    }
    const t = window.setTimeout(logout, ms)
    return () => window.clearTimeout(t)
  }, [auth, logout])

  const value = useMemo(() => ({ auth, login, logout }), [auth, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
