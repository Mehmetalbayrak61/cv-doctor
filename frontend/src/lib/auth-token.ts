/**
 * Access token'ın localStorage'da saklanması. Backend Bearer JWT ile çalışır
 * (cookie değil) — bu yüzden token'ı biz saklayıp her isteğe biz ekliyoruz.
 */
const TOKEN_KEY = "cv_doktor_access_token"

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}
