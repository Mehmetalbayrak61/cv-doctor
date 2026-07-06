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
import { getApiErrorMessage } from "@/lib/api-error"
import { formatDate, formatFileSize } from "@/lib/format"

export function CvListItem({ cv }: { cv: CVDocument }) {
  const { t, i18n } = useTranslation()
  const deleteMutation = useDeleteCv()

  return (
    <div className="flex items-center gap-3 rounded-lg border px-4 py-3">
      <div className="bg-accent text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
        <FileText className="size-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{cv.file_name}</p>
        <p className="text-muted-foreground text-xs">
          {formatFileSize(cv.file_size)} · {formatDate(cv.created_at, i18n.language)}
        </p>
      </div>

      <Button asChild variant="outline" size="sm">
        <Link to={`/cvs/${cv.id}`}>{t("dashboard.list.view")}</Link>
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={t("dashboard.list.delete")}>
            <Trash2 className="text-destructive size-4" />
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
  )
}
