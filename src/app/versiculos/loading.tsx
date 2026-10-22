import { Skeleton } from "@/components/ui/skeleton";

export default function VersiculosLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-44 rounded-xl" />
        <Skeleton className="h-4 w-64 rounded-lg" />
      </div>
      <div className="p-8 rounded-2xl border border-border bg-card space-y-4">
        <Skeleton className="h-7 w-48 rounded-md" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
