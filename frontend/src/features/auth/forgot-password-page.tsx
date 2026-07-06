import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { z } from "zod"

import { forgotPassword } from "./api/auth-api"
import { AuthLayout } from "./components/auth-layout"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const forgotPasswordSchema = z.object({
  email: z.email(),
})

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordPage() {
  const { t } = useTranslation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema) })

  const forgotPasswordMutation = useMutation({
    mutationFn: (values: ForgotPasswordValues) => forgotPassword(values.email),
  })

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("auth.forgotPassword.title")}</CardTitle>
          <CardDescription>{t("auth.forgotPassword.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          {forgotPasswordMutation.isSuccess ? (
            <Alert>
              <AlertDescription>{t("auth.forgotPassword.success")}</AlertDescription>
            </Alert>
          ) : (
            <form
              className="space-y-4"
              onSubmit={handleSubmit((values) => forgotPasswordMutation.mutate(values))}
              noValidate
            >
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

              <Button
                type="submit"
                className="w-full"
                disabled={forgotPasswordMutation.isPending}
              >
                {forgotPasswordMutation.isPending
                  ? t("auth.forgotPassword.submitting")
                  : t("auth.forgotPassword.submit")}
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
