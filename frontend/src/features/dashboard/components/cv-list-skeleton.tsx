import { Skeleton } from "@/components/ui/skeleton"

export function CvListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((index) => (
        <div key={index} className="flex min-h-36 flex-col gap-4 rounded-xl p-5 ring-1 ring-foreground/10">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <div className="flex-1" />
          <div className="flex gap-2">
            <Skeleton className="h-8 flex-1 rounded-lg" />
            <Skeleton className="size-8 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}
