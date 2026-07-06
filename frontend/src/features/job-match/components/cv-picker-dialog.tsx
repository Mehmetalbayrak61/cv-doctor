import { FileText, Loader2 } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { useCreateMatch } from "../hooks/use-job-match"
import type { JobDescription } from "../types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useCvList } from "@/features/dashboard/hooks/use-cvs"
import { getApiErrorMessage } from "@/lib/api-error"
import { cn } from "@/lib/utils"

interface CvPickerDialogProps {
  job: JobDescription | null
  onOpenChange: (open: boolean) => void
}

export function CvPickerDialog({ job, onOpenChange }: CvPickerDialogProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const cvListQuery = useCvList()
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null)
  const matchMutation = useCreateMatch(job?.id ?? "", selectedCvId ?? "")

  function handleConfirm() {
    if (!job || !selectedCvId) return
    matchMutation.mutate(undefined, {
      onSuccess: () => {
        onOpenChange(false)
        navigate(`/jobs/${job.id}/match/${selectedCvId}`)
      },
      onError: (error) => toast.error(getApiErrorMessage(error, t("errors.generic"))),
    })
  }

  return (
    <Dialog
      open={!!job}
      onOpenChange={(next) => {
        if (!next) setSelectedCvId(null)
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("jobMatch.cvPicker.title")}</DialogTitle>
          <DialogDescription>{t("jobMatch.cvPicker.description", { title: job?.title })}</DialogDescription>
        </DialogHeader>

        <div className="max-h-64 space-y-1.5 overflow-y-auto">
          {cvListQuery.data?.items.length === 0 && (
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">{t("jobMatch.cvPicker.empty")}</p>
              <Button asChild variant="outline" size="sm">
                <Link to="/cvs">{t("jobMatch.cvPicker.goToDashboard")}</Link>
              </Button>
            </div>
          )}
          {cvListQuery.data?.items.map((cv) => (
            <button
              key={cv.id}
              type="button"
              onClick={() => setSelectedCvId(cv.id)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                selectedCvId === cv.id ? "border-primary bg-accent" : "hover:bg-muted"
              )}
            >
              <FileText className="text-primary size-4 shrink-0" />
              <span className="truncate">{cv.file_name}</span>
            </button>
          ))}
        </div>

        <DialogFooter>
          <Button
            onClick={handleConfirm}
            disabled={!selectedCvId || matchMutation.isPending}
            className="w-full sm:w-auto"
          >
            {matchMutation.isPending && <Loader2 className="animate-spin" />}
            {t("jobMatch.cvPicker.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
