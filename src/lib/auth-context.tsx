import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { loginFn, logoutFn, getSessionFn } from './server-auth'

export interface User {
  username: string
  name: string
  role: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    getSessionFn().then((res) => {
      if (res.user) setUser(res.user as User)
    })
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const res = await loginFn({ data: { username, password } })
    if (res.success) setUser(res.user as User)
    return res
  }, [])

  const logout = useCallback(async () => {
    await logoutFn()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
