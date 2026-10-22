import * as React from "react";
import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-muted/70 dark:bg-muted/40",
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

export { Skeleton };
