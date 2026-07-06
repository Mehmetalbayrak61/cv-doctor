import { DollarSign, Loader2, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { useEstimateSalary } from "../hooks/use-job-tools"
import type { SalaryEstimationRequest } from "../types"
import type { AIOutput } from "@/features/cv-analysis/types/rewrite"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { showAiErrorToast } from "@/lib/api-error"

interface SalaryEstimateCardProps {
  jobId: string
  cvId: string
  latestOutput: AIOutput | undefined
}

/** Eskiden modal arkasında üretilip kaybolan sonucu, sayfada kalıcı bir kart
 * haline getirir (CV Detay'daki ProfileSummaryEditor deseni): boş durumda kısa
 * bir form, üretilince aynı kart AI çıktısını gösterir. */
export function SalaryEstimateCard({ jobId, cvId, latestOutput }: SalaryEstimateCardProps) {
  const { t } = useTranslation()
  const mutation = useEstimateSalary(jobId, cvId)
  const [output, setOutput] = useState<AIOutput | undefined>(latestOutput)
  const { register, handleSubmit, reset } = useForm<SalaryEstimationRequest>()

  useEffect(() => {
    setOutput(latestOutput)
  }, [latestOutput])

  function onSubmit(values: SalaryEstimationRequest) {
    mutation.mutate(values, {
      onSuccess: (result) => {
        setOutput(result)
        reset()
      },
      onError: (error) => showAiErrorToast(error, t("errors.generic")),
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2" className="text-base">
          {t("jobMatch.salary.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {output ? (
          <div className="space-y-3">
            <span className="border-primary/30 bg-accent text-primary inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
              <Sparkles className="size-3.5" />
              {t("jobMatch.result.aiGenerated")}
            </span>
            <div className="bg-muted/60 rounded-lg border p-4">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{output.content}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed px-6 py-7">
            <div className="mx-auto flex max-w-sm flex-col items-center gap-3 text-center">
              <div className="bg-accent text-primary flex size-10 items-center justify-center rounded-lg">
                <DollarSign className="size-5" />
              </div>
              <p className="text-muted-foreground text-sm">{t("jobMatch.salary.description")}</p>
            </div>
            <form
              className="mx-auto mt-5 max-w-sm space-y-3"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="salary-country">{t("jobMatch.salary.country")}</Label>
                  <Input id="salary-country" {...register("country")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="salary-city">{t("jobMatch.salary.city")}</Label>
                  <Input id="salary-city" {...register("city")} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="animate-spin" />}
                {t("jobMatch.salary.submit")}
              </Button>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
