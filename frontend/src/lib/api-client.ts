import axios from "axios"

/**
 * Backend API için merkezi axios instance.
 *
 * Auth Bearer JWT ile yapılır (cookie değil) — backend'in Flutter gibi diğer
 * istemcilerle de paylaşılabilmesi için. Faz 2'de: access token'ı Authorization
 * header'ına ekleyen ve 401'de refresh token ile yenileyen interceptor'lar burada
 * eklenecek.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1",
})
