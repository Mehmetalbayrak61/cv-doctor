import { Loader2 } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { useDeleteAccount } from "./hooks/use-account"
import { useAuth } from "@/features/auth/hooks/use-auth"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getApiErrorMessage } from "@/lib/api-error"

export function AccountPage() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState("")
  const deleteMutation = useDeleteAccount()

  function handleDelete() {
    deleteMutation.mutate(password, {
      onSuccess: () => {
        toast.success(t("account.danger.deleteSuccess"))
        logout()
        navigate("/")
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error, t("errors.generic")))
      },
    })
    setPassword("")
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6 px-6 py-10">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {t("account.title")}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">{t("account.subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle as="h2" className="text-base">
            {t("account.profile.heading")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-muted-foreground text-xs">{t("account.profile.name")}</p>
            <p className="text-sm font-medium">
              {user?.first_name} {user?.last_name}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">{t("account.profile.email")}</p>
            <p className="text-sm font-medium">{user?.email}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle as="h2" className="text-destructive text-base">
            {t("account.danger.heading")}
          </CardTitle>
          <CardDescription>{t("account.danger.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10"
              >
                {t("account.danger.deleteCta")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("account.danger.confirmTitle")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("account.danger.confirmDescription")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-1.5">
                <Label htmlFor="delete-account-password">
                  {t("account.danger.passwordLabel")}
                </Label>
                <Input
                  id="delete-account-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-white hover:bg-destructive/90"
                  disabled={!password || deleteMutation.isPending}
                  onClick={handleDelete}
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    t("account.danger.confirmButton")
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </section>
  )
}
