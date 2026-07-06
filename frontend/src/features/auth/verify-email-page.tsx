import { useQueryClient } from "@tanstack/react-query"
import { CheckCircle2, XCircle } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, useSearchParams } from "react-router-dom"

import { verifyEmail } from "./api/auth-api"
import { AuthLayout } from "./components/auth-layout"
import { useAuth } from "./hooks/use-auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getApiErrorMessage } from "@/lib/api-error"

type VerifyState = { status: "pending" } | { status: "success" } | { status: "error"; message: string }

export function VerifyEmailPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const { token: authToken } = useAuth()
  const queryClient = useQueryClient()
  const hasStarted = useRef(false)
  const [state, setState] = useState<VerifyState>({ status: "pending" })

  useEffect(() => {
    if (!token || hasStarted.current) return
    hasStarted.current = true

    verifyEmail(token)
      .then(() => {
        setState({ status: "success" })
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] })
      })
      .catch((error: unknown) => {
        setState({ status: "error", message: getApiErrorMessage(error, t("errors.generic")) })
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("auth.verifyEmail.title")}</CardTitle>
          <CardDescription>{t("auth.verifyEmail.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!token && (
            <Alert variant="destructive">
              <AlertDescription>{t("auth.verifyEmail.missingToken")}</AlertDescription>
            </Alert>
          )}

          {token && state.status === "pending" && (
            <div className="flex justify-center py-4">
              <div className="border-muted border-t-primary size-8 animate-spin rounded-full border-4" />
            </div>
          )}

          {state.status === "success" && (
            <Alert>
              <CheckCircle2 />
              <AlertDescription>{t("auth.verifyEmail.success")}</AlertDescription>
            </Alert>
          )}

          {state.status === "error" && (
            <Alert variant="destructive">
              <XCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <Button asChild className="w-full">
            <Link to={authToken ? "/dashboard" : "/login"}>
              {authToken ? t("auth.verifyEmail.goToDashboard") : t("auth.verifyEmail.goToLogin")}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
