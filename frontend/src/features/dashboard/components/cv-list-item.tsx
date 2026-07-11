import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { FileText, Loader2, Trash2 } from "lucide-react"

import { useDeleteCv } from "../hooks/use-cvs"
import type { CVDocument } from "../types"
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
import { Card, CardContent } from "@/components/ui/card"
import { getApiErrorMessage } from "@/lib/api-error"
import { formatDate, formatFileSize } from "@/lib/format"

export function CvListItem({ cv }: { cv: CVDocument }) {
  const { t, i18n } = useTranslation()
  const deleteMutation = useDeleteCv()

  return (
    <Card elevation="interactive" className="hover:bg-muted/30 h-full">
      <CardContent className="flex h-full min-w-0 flex-col gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="bg-accent text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
            <FileText className="size-5" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate font-medium" title={cv.file_name}>{cv.file_name}</p>
            <p className="text-muted-foreground text-xs">
              {formatFileSize(cv.file_size)} · {formatDate(cv.created_at, i18n.language)}
            </p>
          </div>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link to={`/cvs/${cv.id}`}>{t("dashboard.list.view")}</Link>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon-sm" aria-label={t("dashboard.list.delete")}>
                <Trash2 className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("dashboard.list.deleteConfirmTitle")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("dashboard.list.deleteConfirmDescription", { name: cv.file_name })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-white hover:bg-destructive/90"
                  disabled={deleteMutation.isPending}
                  onClick={() => {
                    deleteMutation.mutate(cv.id, {
                      onSuccess: () => toast.success(t("dashboard.list.deleteSuccess")),
                      onError: (error) => toast.error(getApiErrorMessage(error, t("errors.generic"))),
                    })
                  }}
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    t("dashboard.list.deleteConfirm")
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
