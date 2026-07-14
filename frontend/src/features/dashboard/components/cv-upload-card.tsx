import { useState, type DragEvent } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { UploadCloud } from "lucide-react"

import { ALLOWED_CV_EXTENSIONS, MAX_CV_UPLOAD_SIZE_BYTES, MAX_CV_UPLOAD_SIZE_MB } from "../constants"
import { useUploadCv } from "../hooks/use-cvs"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getApiErrorMessage } from "@/lib/api-error"
import { cn } from "@/lib/utils"

function getExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf(".")
  return dotIndex === -1 ? "" : fileName.slice(dotIndex).toLowerCase()
}

export function CvUploadCard() {
  const { t } = useTranslation()
  const [isDragging, setIsDragging] = useState(false)
  const [progress, setProgress] = useState(0)
  const uploadMutation = useUploadCv()

  function validate(file: File): string | null {
    if (!ALLOWED_CV_EXTENSIONS.includes(getExtension(file.name))) {
      return t("dashboard.upload.errorType")
    }
    if (file.size > MAX_CV_UPLOAD_SIZE_BYTES) {
      return t("dashboard.upload.errorSize", { size: MAX_CV_UPLOAD_SIZE_MB })
    }
    return null
  }

  function handleFile(file: File) {
    const validationError = validate(file)
    if (validationError) {
      toast.error(validationError)
      return
    }

    setProgress(0)
    uploadMutation.mutate(
      { file, onProgress: setProgress },
      {
        onSuccess: () => {
          toast.success(t("dashboard.upload.success", { name: file.name }))
        },
        onError: (error) => {
          toast.error(getApiErrorMessage(error, t("errors.generic")))
        },
      }
    )
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <Card>
      <CardContent>
        <label
          htmlFor="cv-upload-input"
          onDragOver={(event) => {
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "focus-within:border-ring focus-within:ring-ring/50 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors focus-within:ring-3 sm:px-6 sm:py-10",
            isDragging ? "border-primary bg-accent" : "border-border hover:border-primary/50"
          )}
        >
          <input
            id="cv-upload-input"
            type="file"
            accept={ALLOWED_CV_EXTENSIONS.join(",")}
            className="sr-only"
            disabled={uploadMutation.isPending}
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) handleFile(file)
              event.target.value = ""
            }}
          />
          <div className="bg-accent text-primary flex size-12 items-center justify-center rounded-full">
            <UploadCloud className="size-6" />
          </div>
          <div>
            <p className="font-medium">{t("dashboard.upload.title")}</p>
            <p className="text-muted-foreground mt-1 text-sm">
              {t("dashboard.upload.hint", { size: MAX_CV_UPLOAD_SIZE_MB })}
            </p>
          </div>
          <span className="border-border bg-background inline-flex min-h-11 items-center rounded-lg border px-3 text-sm font-medium md:min-h-10">
            {t("dashboard.upload.browse")}
          </span>

          {uploadMutation.isPending && (
            <div className="w-full max-w-xs space-y-1.5">
              <Progress value={progress} />
              <p className="text-muted-foreground text-xs">{t("dashboard.upload.uploading")}</p>
            </div>
          )}
        </label>
      </CardContent>
    </Card>
  )
}
