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

/** AI üretim çağrılarında backend'in açıklayıcı hata mesajını gösterir. */
export function showAiErrorToast(error: unknown, fallback: string): void {
  toast.error(getApiErrorMessage(error, fallback))
}
