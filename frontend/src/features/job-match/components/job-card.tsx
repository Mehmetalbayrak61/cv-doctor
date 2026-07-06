import { Briefcase, Building2, EllipsisVertical, MapPin, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { useDeleteJob } from "../hooks/use-jobs"
import type { JobDescription, JobMatchHistoryItem } from "../types"
import { MatchStatusBadge } from "./match-status-badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getApiErrorMessage } from "@/lib/api-error"
import { formatDate } from "@/lib/format"

interface JobCardProps {
  job: JobDescription
  latestMatch: JobMatchHistoryItem | undefined
  onMatch: (job: JobDescription) => void
  onEdit: (job: JobDescription) => void
}

export function JobCard({ job, latestMatch, onMatch, onEdit }: JobCardProps) {
  const { t, i18n } = useTranslation()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const deleteMutation = useDeleteJob()

  return (
    <Card className="group h-full transition-[transform,box-shadow] duration-300 ease-out motion-safe:hover:-translate-y-1 hover:shadow-lg hover:shadow-foreground/[0.06]">
      <CardContent className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-2.5">
            <div className="bg-accent text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
              <Building2 className="size-4.5" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold">{job.title}</h3>
              <p className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                {job.company && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="size-3" />
                    {job.company}
                  </span>
                )}
                {job.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" />
                    {job.location}
                  </span>
                )}
                <span>{formatDate(job.created_at, i18n.language)}</span>
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={t("jobMatch.actionsMenu")}>
                <EllipsisVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onEdit(job)}>
                <Pencil /> {t("jobMatch.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
                <Trash2 /> {t("jobMatch.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <MatchStatusBadge match={latestMatch} />

        <p className="text-muted-foreground line-clamp-2 text-sm">{job.description}</p>

        <div className="flex-1" />

        <Button size="sm" className="w-full" onClick={() => onMatch(job)}>
          {t("jobMatch.matchAction")}
        </Button>
      </CardContent>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("jobMatch.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("jobMatch.deleteConfirmDescription", { title: job.title })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() =>
                deleteMutation.mutate(job.id, {
                  onError: (error) => toast.error(getApiErrorMessage(error, t("errors.generic"))),
                })
              }
            >
              {t("jobMatch.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
