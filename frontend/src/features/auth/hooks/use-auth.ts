import { createContext, useContext } from "react"

import type { UserRead } from "../types"

export interface AuthContextValue {
  token: string | null
  user: UserRead | undefined
  isLoadingUser: boolean
  login: (token: string) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth, AuthProvider içinde kullanılmalı.")
  }
  return ctx
}
