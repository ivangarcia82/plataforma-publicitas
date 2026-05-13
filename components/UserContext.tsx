'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export interface CurrentUser {
  id: string
  email: string
  nombre: string
  rol: 'admin' | 'ejecutivo'
  ejecutivoId: string | null
}

interface UserContextValue {
  user: CurrentUser | null
  loading: boolean
  refresh: () => Promise<void>
}

const UserContext = createContext<UserContextValue>({ user: null, loading: true, refresh: async () => {} })

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      setUser(data.user || null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  return (
    <UserContext.Provider value={{ user, loading, refresh }}>
      {children}
    </UserContext.Provider>
  )
}

export function useCurrentUser() {
  return useContext(UserContext)
}
