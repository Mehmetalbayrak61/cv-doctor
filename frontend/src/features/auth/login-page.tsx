import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom"
import { z } from "zod"

import { loginUser } from "./api/auth-api"
import { AuthLayout } from "./components/auth-layout"
import { useAuth } from "./hooks/use-auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const { t } = useTranslation()
  const { token, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      login(data.access_token)
      const from = (location.state as { from?: Location })?.from?.pathname ?? "/dashboard"
      navigate(from, { replace: true })
    },
  })

  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  const errorMessage = isAxiosError(loginMutation.error)
    ? loginMutation.error.response?.status === 401
      ? t("auth.login.invalidCredentials")
      : t("errors.generic")
    : null

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("auth.login.title")}</CardTitle>
          <CardDescription>{t("auth.login.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={handleSubmit((values) => loginMutation.mutate(values))}
            noValidate
          >
            {errorMessage && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">{t("auth.fields.email")}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-destructive text-xs">{t("auth.validation.emailInvalid")}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("auth.fields.password")}</Label>
                <Link
                  to="/forgot-password"
                  className="text-muted-foreground text-xs hover:underline"
                >
                  {t("auth.login.forgotPassword")}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-destructive text-xs">{t("auth.validation.required")}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? t("auth.login.submitting") : t("auth.login.submit")}
            </Button>

            <p className="text-muted-foreground text-center text-sm">
              {t("auth.login.noAccount")}{" "}
              <Link to="/register" className="text-primary font-medium hover:underline">
                {t("auth.login.registerLink")}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
