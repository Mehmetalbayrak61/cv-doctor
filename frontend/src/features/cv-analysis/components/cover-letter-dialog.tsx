import { Loader2 } from "lucide-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { useGenerateCoverLetter } from "../hooks/use-rewrites"
import type { AIOutput, CoverLetterRequest } from "../types/rewrite"
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

interface CoverLetterDialogProps {
  cvId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onGenerated: (output: AIOutput) => void
  /** "Tekrar Oluştur" akışında önceki üretimin girdilerini (input_context)
   * formu boş açmak yerine önceden doldurmak için. */
  defaultValues?: Partial<CoverLetterRequest>
}

export function CoverLetterDialog({
  cvId,
  open,
  onOpenChange,
  onGenerated,
  defaultValues,
}: CoverLetterDialogProps) {
  const { t } = useTranslation()
  const mutation = useGenerateCoverLetter(cvId)
  const { register, handleSubmit, reset, formState } = useForm<CoverLetterRequest>()

  useEffect(() => {
    if (open) reset(defaultValues)
  }, [open, defaultValues, reset])

  function onSubmit(values: CoverLetterRequest) {
    mutation.mutate(values, {
      onSuccess: (output) => {
        reset()
        onOpenChange(false)
        onGenerated(output)
      },
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) mutation.reset()
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("aiTools.coverLetter.title")}</DialogTitle>
          <DialogDescription>{t("aiTools.coverLetter.description")}</DialogDescription>
        </DialogHeader>
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)} noValidate>
          {mutation.isError && (
            <p className="text-destructive text-sm">
              {getApiErrorMessage(mutation.error, t("errors.generic"))}
            </p>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="job_title">{t("aiTools.coverLetter.jobTitle")}</Label>
            <Input
              id="job_title"
              aria-invalid={!!formState.errors.job_title}
              {...register("job_title", { required: true })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="company_name">{t("aiTools.coverLetter.companyName")}</Label>
            <Input id="company_name" {...register("company_name")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="job_description">{t("aiTools.coverLetter.jobDescription")}</Label>
            <Textarea id="job_description" rows={4} {...register("job_description")} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending} className="w-full sm:w-auto">
              {mutation.isPending && <Loader2 className="animate-spin" />}
              {t("aiTools.coverLetter.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
