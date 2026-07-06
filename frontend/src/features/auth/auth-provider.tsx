import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useState, type ReactNode } from "react"

import { fetchCurrentUser } from "./api/auth-api"
import { AuthContext } from "./hooks/use-auth"
import { clearStoredToken, getStoredToken, setStoredToken } from "@/lib/auth-token"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken())
  const queryClient = useQueryClient()

  const meQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: fetchCurrentUser,
    enabled: !!token,
    retry: false,
  })

  const login = useCallback((newToken: string) => {
    setStoredToken(newToken)
    setToken(newToken)
  }, [])

  const logout = useCallback(() => {
    clearStoredToken()
    setToken(null)
    queryClient.clear()
  }, [queryClient])

  // Token geçersiz/süresi dolmuşsa (me isteği 401 ile patlar; axios interceptor'ı
  // localStorage'ı zaten temizler) React state'ini de senkron tutuyoruz.
  useEffect(() => {
    if (meQuery.isError) {
      setToken(null)
    }
  }, [meQuery.isError])

  return (
    <AuthContext.Provider
      value={{
        token,
        user: meQuery.data,
        isLoadingUser: !!token && meQuery.isPending,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
