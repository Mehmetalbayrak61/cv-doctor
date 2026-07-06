import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { z } from "zod"

import { loginUser, registerUser } from "./api/auth-api"
import { AuthLayout } from "./components/auth-layout"
import { useAuth } from "./hooks/use-auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const registerSchema = z.object({
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  email: z.email(),
  password: z.string().min(8).max(128),
})

type RegisterValues = z.infer<typeof registerSchema>

export function RegisterPage() {
  const { t } = useTranslation()
  const { token, login } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) })

  const registerMutation = useMutation({
    mutationFn: async (values: RegisterValues) => {
      await registerUser(values)
      return loginUser({ email: values.email, password: values.password })
    },
    onSuccess: (data) => {
      login(data.access_token)
      navigate("/dashboard", { replace: true })
    },
  })

  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  const errorMessage = isAxiosError(registerMutation.error)
    ? registerMutation.error.response?.status === 409
      ? t("auth.register.emailTaken")
      : t("errors.generic")
    : null

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("auth.register.title")}</CardTitle>
          <CardDescription>{t("auth.register.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={handleSubmit((values) => registerMutation.mutate(values))}
            noValidate
          >
            {errorMessage && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="first_name">{t("auth.fields.firstName")}</Label>
                <Input
                  id="first_name"
                  autoComplete="given-name"
                  aria-invalid={!!errors.first_name}
                  {...register("first_name")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="last_name">{t("auth.fields.lastName")}</Label>
                <Input
                  id="last_name"
                  autoComplete="family-name"
                  aria-invalid={!!errors.last_name}
                  {...register("last_name")}
                />
              </div>
            </div>
            {(errors.first_name || errors.last_name) && (
              <p className="text-destructive -mt-2 text-xs">{t("auth.validation.required")}</p>
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
              <Label htmlFor="password">{t("auth.fields.password")}</Label>
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

            <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
              {registerMutation.isPending
                ? t("auth.register.submitting")
                : t("auth.register.submit")}
            </Button>

            <p className="text-muted-foreground text-center text-sm">
              {t("auth.register.haveAccount")}{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">
                {t("auth.register.loginLink")}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
