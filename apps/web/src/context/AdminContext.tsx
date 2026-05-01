import { createContext, useContext, useState, type ReactNode } from 'react'

const STORAGE_KEY = 'klerek_admin_token'

interface AdminContextValue {
  token: string | null
  setToken: (t: string) => void
  logout: () => void
}

const AdminContext = createContext<AdminContextValue | null>(null)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(
    () => sessionStorage.getItem(STORAGE_KEY),
  )

  const setToken = (t: string) => {
    sessionStorage.setItem(STORAGE_KEY, t)
    setTokenState(t)
  }

  const logout = () => {
    sessionStorage.removeItem(STORAGE_KEY)
    setTokenState(null)
  }

  return (
    <AdminContext.Provider value={{ token, setToken, logout }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}
