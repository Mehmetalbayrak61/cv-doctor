import { Loader2 } from "lucide-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { useUpdateJob } from "../hooks/use-jobs"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getApiErrorMessage } from "@/lib/api-error"

interface JobFormValues {
  title: string
  company?: string
  location?: string
  description: string
}

interface JobEditDialogProps {
  job: JobDescription | null
  onOpenChange: (open: boolean) => void
}

/** İlan düzenleme modalı — sadece güncelleme akışı için (ekleme artık `JobAddCard`
 * ile sayfa içinde yapılıyor). Backend zaten `PATCH /jobs/{id}` destekliyor,
 * bu ekran sadece var olan kapasiteyi arayüze taşıyor. */
export function JobEditDialog({ job, onOpenChange }: JobEditDialogProps) {
  const { t } = useTranslation()
  const mutation = useUpdateJob(job?.id ?? "")
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobFormValues>()

  useEffect(() => {
    if (job) {
      reset({
        title: job.title,
        company: job.company ?? "",
        location: job.location ?? "",
        description: job.description,
      })
    }
  }, [job, reset])

  function onSubmit(values: JobFormValues) {
    mutation.mutate(values, {
      onSuccess: () => {
        toast.success(t("jobMatch.editDialog.updateSuccess"))
        onOpenChange(false)
      },
      onError: (error) => toast.error(getApiErrorMessage(error, t("errors.generic"))),
    })
  }

  return (
    <Dialog
      open={!!job}
      onOpenChange={(next) => {
        if (!next) mutation.reset()
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("jobMatch.editDialog.title")}</DialogTitle>
          <DialogDescription>{t("jobMatch.editDialog.description")}</DialogDescription>
        </DialogHeader>
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-job-title">{t("jobMatch.fields.jobTitle")}</Label>
              <Input
                id="edit-job-title"
                aria-invalid={!!errors.title}
                {...register("title", { required: true })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-company">{t("jobMatch.fields.company")}</Label>
              <Input id="edit-company" {...register("company")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-location">{t("jobMatch.fields.location")}</Label>
            <Input id="edit-location" {...register("location")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-description">{t("jobMatch.fields.description")}</Label>
            <Textarea
              id="edit-description"
              rows={8}
              placeholder={t("jobMatch.fields.descriptionPlaceholder")}
              aria-invalid={!!errors.description}
              {...register("description", { required: true, minLength: 30 })}
            />
            {errors.description && (
              <p className="text-destructive text-xs">{t("jobMatch.fields.descriptionError")}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending} className="w-full sm:w-auto">
              {mutation.isPending && <Loader2 className="animate-spin" />}
              {t("jobMatch.editDialog.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
