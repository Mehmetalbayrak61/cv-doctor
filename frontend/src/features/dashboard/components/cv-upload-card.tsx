import { useRef, useState, type DragEvent } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { UploadCloud } from "lucide-react"

import { ALLOWED_CV_EXTENSIONS, MAX_CV_UPLOAD_SIZE_BYTES, MAX_CV_UPLOAD_SIZE_MB } from "../constants"
import { useUploadCv } from "../hooks/use-cvs"
import { Button } from "@/components/ui/button"
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
  const inputRef = useRef<HTMLInputElement>(null)
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

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <Card>
      <CardContent>
        <div
          onDragOver={(event) => {
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") inputRef.current?.click()
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors",
            isDragging ? "border-primary bg-accent" : "border-border hover:border-primary/50"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_CV_EXTENSIONS.join(",")}
            className="hidden"
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploadMutation.isPending}
            onClick={(event) => {
              event.stopPropagation()
              inputRef.current?.click()
            }}
          >
            {t("dashboard.upload.browse")}
          </Button>

          {uploadMutation.isPending && (
            <div className="w-full max-w-xs space-y-1.5">
              <Progress value={progress} />
              <p className="text-muted-foreground text-xs">{t("dashboard.upload.uploading")}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
