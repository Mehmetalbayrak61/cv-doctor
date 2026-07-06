import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Link, useSearchParams } from "react-router-dom"
import { z } from "zod"

import { resetPassword } from "./api/auth-api"
import { AuthLayout } from "./components/auth-layout"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getApiErrorMessage } from "@/lib/api-error"

const resetPasswordSchema = z
  .object({
    password: z.string().min(8).max(128),
    confirmPassword: z.string().min(1),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
  })

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

export function ResetPasswordPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema) })

  const resetPasswordMutation = useMutation({
    mutationFn: (values: ResetPasswordValues) => resetPassword(token ?? "", values.password),
  })

  const errorMessage = resetPasswordMutation.isError
    ? getApiErrorMessage(resetPasswordMutation.error, t("errors.generic"))
    : null

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("auth.resetPassword.title")}</CardTitle>
          <CardDescription>{t("auth.resetPassword.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          {!token ? (
            <Alert variant="destructive">
              <AlertDescription>{t("auth.resetPassword.missingToken")}</AlertDescription>
            </Alert>
          ) : resetPasswordMutation.isSuccess ? (
            <Alert>
              <AlertDescription>{t("auth.resetPassword.success")}</AlertDescription>
            </Alert>
          ) : (
            <form
              className="space-y-4"
              onSubmit={handleSubmit((values) => resetPasswordMutation.mutate(values))}
              noValidate
            >
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="password">{t("auth.resetPassword.newPassword")}</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-destructive text-xs">{t("auth.validation.passwordMin")}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">
                  {t("auth.resetPassword.confirmPassword")}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirmPassword}
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-destructive text-xs">
                    {t("auth.resetPassword.passwordMismatch")}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending
                  ? t("auth.resetPassword.submitting")
                  : t("auth.resetPassword.submit")}
              </Button>
            </form>
          )}

          <p className="text-muted-foreground mt-4 text-center text-sm">
            <Link to="/login" className="text-primary font-medium hover:underline">
              {t("auth.forgotPassword.backToLogin")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
