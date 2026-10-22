import { Skeleton } from "@/components/ui/skeleton";

export default function DevotionalsLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-48 rounded-xl" />
        <Skeleton className="h-4 w-72 rounded-lg" />
      </div>
      <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-40 rounded-md" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>
      <div className="space-y-4 pt-4">
        <Skeleton className="h-6 w-36 rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-5 rounded-2xl border border-border bg-card space-y-3">
              <Skeleton className="h-5 w-2/3 rounded-md" />
              <Skeleton className="h-4 w-1/3 rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
