import axios from "axios"

import { clearStoredToken, getStoredToken } from "@/lib/auth-token"

/**
 * Backend API için merkezi axios instance.
 *
 * Auth Bearer JWT ile yapılır (cookie değil) — backend'in Flutter gibi diğer
 * istemcilerle de paylaşılabilmesi için. Her isteğe otomatik Authorization header'ı
 * eklenir; 401 alınırsa (login isteğinin kendisi hariç) oturum düşürülüp login'e
 * yönlendirilir.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1",
})

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginAttempt = error.config?.url?.includes("/auth/login")
    // DELETE /auth/me'de 401, token geçersiz değil "hesap silme şifresi yanlış"
    // anlamına gelir (bkz. AuthService.delete_account) — bunu global "oturum
    // düştü, login'e at" akışından hariç tutmazsak yanlış şifre girildiğinde
    // kullanıcı hatalı şekilde login sayfasına atılır.
    const isAccountDeleteAttempt =
      error.config?.url?.includes("/auth/me") && error.config?.method === "delete"
    if (error.response?.status === 401 && !isLoginAttempt && !isAccountDeleteAttempt) {
      clearStoredToken()
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login")
      }
    }
    return Promise.reject(error)
  }
)
