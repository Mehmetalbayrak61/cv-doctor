import { apiClient } from "@/lib/api-client"

import type { LoginPayload, RegisterPayload, TokenResponse, UserRead } from "../types"

export async function registerUser(payload: RegisterPayload): Promise<UserRead> {
  const { data } = await apiClient.post<UserRead>("/auth/register", payload)
  return data
}

export async function loginUser(payload: LoginPayload): Promise<TokenResponse> {
  const form = new URLSearchParams()
  form.set("username", payload.email)
  form.set("password", payload.password)

  const { data } = await apiClient.post<TokenResponse>("/auth/login", form, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  })
  return data
}

export async function fetchCurrentUser(): Promise<UserRead> {
  const { data } = await apiClient.get<UserRead>("/auth/me")
  return data
}

export async function verifyEmail(token: string): Promise<UserRead> {
  const { data } = await apiClient.post<UserRead>("/auth/verify-email", { token })
  return data
}

export async function resendVerification(): Promise<void> {
  await apiClient.post("/auth/resend-verification")
}

export async function forgotPassword(email: string): Promise<void> {
  await apiClient.post("/auth/forgot-password", { email })
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await apiClient.post("/auth/reset-password", { token, new_password: newPassword })
}

export async function deleteAccount(password: string): Promise<void> {
  await apiClient.delete("/auth/me", { data: { password } })
}
