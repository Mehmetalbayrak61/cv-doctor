import axios from "axios"

/**
 * Backend API için merkezi axios instance.
 * Faz 2'de auth interceptor'ları (access token ekleme, 401'de refresh) burada eklenecek.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1",
  withCredentials: true,
})
