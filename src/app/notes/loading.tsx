import { Skeleton } from "@/components/ui/skeleton";

export default function NotesLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-52 rounded-xl" />
        <Skeleton className="h-4 w-60 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
        <Skeleton className="h-6 w-44 rounded-md" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="flex justify-end gap-3 pt-2">
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
