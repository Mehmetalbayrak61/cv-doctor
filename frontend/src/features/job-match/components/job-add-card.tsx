import { ClipboardPaste, Loader2, Plus } from "lucide-react"
import { useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { useCreateJob } from "../hooks/use-jobs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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

interface JobAddCardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Sayfa-içi, daraltılabilir ilan ekleme kartı — eski modal'ın yerini alır.
 * Daraltılmışken tek satır bir "yapıştırma istemi"; genişleyince açıklama
 * alanı öne çıkar (yapıştırma en sık işlem), meta alanlar altta kompakt. */
export function JobAddCard({ open, onOpenChange }: JobAddCardProps) {
  const { t } = useTranslation()
  const mutation = useCreateJob()
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobFormValues>()

  const { ref: descriptionFormRef, ...descriptionField } = register("description", {
    required: true,
    minLength: 30,
  })

  useEffect(() => {
    if (!open) return
    const id = requestAnimationFrame(() => descriptionRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [open])

  function onSubmit(values: JobFormValues) {
    mutation.mutate(
      { ...values, source: "manual" },
      {
        onSuccess: () => {
          toast.success(t("jobMatch.addCard.createSuccess"))
          reset()
          onOpenChange(false)
        },
        onError: (error) => toast.error(getApiErrorMessage(error, t("errors.generic"))),
      }
    )
  }

  function handleCancel() {
    reset()
    mutation.reset()
    onOpenChange(false)
  }

  if (!open) {
    return (
      <Card>
        <CardContent>
          <button
            type="button"
            onClick={() => onOpenChange(true)}
            className="group hover:border-primary/50 hover:bg-accent/40 flex w-full flex-col gap-3 rounded-lg border-2 border-dashed px-5 py-5 text-left transition-colors sm:flex-row sm:items-center"
          >
            <div className="bg-accent text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
              <ClipboardPaste className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{t("jobMatch.addCard.collapsedTitle")}</p>
              <p className="text-muted-foreground mt-0.5 text-sm">
                {t("jobMatch.addCard.collapsedPrompt")}
              </p>
            </div>
            <span className="border-primary/30 text-primary group-hover:bg-primary group-hover:text-primary-foreground flex shrink-0 items-center gap-1.5 self-start rounded-full border px-3 py-1.5 text-xs font-medium transition-colors sm:self-center">
              <Plus className="size-3.5" />
              {t("jobMatch.addJob")}
            </span>
          </button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          {mutation.isError && (
            <p className="text-destructive text-sm">
              {getApiErrorMessage(mutation.error, t("errors.generic"))}
            </p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="add-description">{t("jobMatch.fields.description")}</Label>
            <Textarea
              id="add-description"
              rows={7}
              placeholder={t("jobMatch.fields.descriptionPlaceholder")}
              aria-invalid={!!errors.description}
              {...descriptionField}
              ref={(el) => {
                descriptionFormRef(el)
                descriptionRef.current = el
              }}
            />
            {errors.description && (
              <p className="text-destructive text-xs">{t("jobMatch.fields.descriptionError")}</p>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="add-job-title">{t("jobMatch.fields.jobTitle")}</Label>
              <Input
                id="add-job-title"
                aria-invalid={!!errors.title}
                {...register("title", { required: true })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-company">{t("jobMatch.fields.company")}</Label>
              <Input id="add-company" {...register("company")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-location">{t("jobMatch.fields.location")}</Label>
              <Input id="add-location" {...register("location")} />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={handleCancel}>
              {t("jobMatch.addCard.cancel")}
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="animate-spin" />}
              {t("jobMatch.addCard.submit")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
