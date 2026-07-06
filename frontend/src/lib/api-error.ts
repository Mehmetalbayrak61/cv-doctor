import { isAxiosError } from "axios"
import { toast } from "sonner"

/** Backend'in standart {"error": {"code","message"}} zarfından kullanıcıya gösterilecek mesajı çıkarır. */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const message = (error.response?.data as { error?: { message?: string } } | undefined)?.error
      ?.message
    if (typeof message === "string") return message
  }
  return fallback
}

/** AI üretim uçlarındaki saatlik rate limit hatası mı? `rate_limited` kodu
 * /auth/* uçlarındaki IP bazlı girişim limitinde de kullanıldığından, istek
 * URL'inin /auth/ ile başlamaması da şart koşulur. */
export function isAiRateLimitError(error: unknown): boolean {
  if (!isAxiosError(error) || error.response?.status !== 429) return false
  const code = (error.response?.data as { error?: { code?: string } } | undefined)?.error?.code
  const url = error.config?.url ?? ""
  return code === "rate_limited" && !url.includes("/auth/")
}

/** AI üretim çağrı noktalarında `toast.error(getApiErrorMessage(...))` yerine kullanılır:
 * saatlik limit hatasında toast göstermez (UpgradeModal, apiClient interceptor'ı üzerinden
 * zaten aynı bilgiyi verir), diğer tüm hatalarda normal toast akışına devam eder. */
export function showAiErrorToast(error: unknown, fallback: string): void {
  if (isAiRateLimitError(error)) return
  toast.error(getApiErrorMessage(error, fallback))
}
