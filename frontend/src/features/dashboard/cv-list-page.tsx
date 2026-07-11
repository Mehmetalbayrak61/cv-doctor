import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { FileStack } from "lucide-react"
import { toast } from "sonner"

import { CvListItem } from "./components/cv-list-item"
import { CvListSkeleton } from "./components/cv-list-skeleton"
import { CvUploadCard } from "./components/cv-upload-card"
import { useCvList } from "./hooks/use-cvs"
import { resendVerification } from "@/features/auth/api/auth-api"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/empty-state"
import { ErrorState } from "@/components/error-state"
import { getApiErrorMessage } from "@/lib/api-error"

export function CvListPage() {
  const { t } = useTranslation()
  const { data, isPending, isError, refetch } = useCvList()
  const { user } = useAuth()

  const resendMutation = useMutation({
    mutationFn: resendVerification,
    onSuccess: () => toast.success(t("dashboard.verifyBanner.resendSuccess")),
    onError: (error) => toast.error(getApiErrorMessage(error, t("errors.generic"))),
  })

  return (
    <section className="mx-auto max-w-6xl space-y-8 px-6 py-10 lg:px-10">
      <div>
        <h1 className="font-heading text-2xl font-medium tracking-tight">
          {t("dashboard.title")}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">{t("dashboard.subtitle")}</p>
      </div>

      {user && !user.is_email_verified && (
        <Alert>
          <AlertTitle>{t("dashboard.verifyBanner.title")}</AlertTitle>
          <AlertDescription>{t("dashboard.verifyBanner.description")}</AlertDescription>
          <AlertAction>
            <Button size="sm" variant="outline" disabled={resendMutation.isPending} onClick={() => resendMutation.mutate()}>
              {t("dashboard.verifyBanner.resend")}
            </Button>
          </AlertAction>
        </Alert>
      )}

      <CvUploadCard />

      <div className="space-y-3">
        <h2 className="text-sm font-medium">{t("dashboard.list.heading")}</h2>

        {isPending && <CvListSkeleton />}

        {isError && (
          <ErrorState
            title={t("dashboard.list.errorTitle")}
            retryLabel={t("common.retry")}
            onRetry={() => refetch()}
          />
        )}

        {data && data.items.length === 0 && (
          <EmptyState
            icon={FileStack}
            title={t("dashboard.list.emptyTitle")}
            description={t("dashboard.list.emptyDescription")}
          />
        )}

        {data && data.items.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((cv) => (
              <CvListItem key={cv.id} cv={cv} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
