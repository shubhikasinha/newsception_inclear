import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  segments?: number;
}

export function Progress({
  value = 0,
  max = 100,
  segments = 20,
  className,
  ...props
}: ProgressProps) {
  const safeMax = max > 0 ? max : 100;
  const clampedValue = Math.max(0, Math.min(value, safeMax));
  const ratio = safeMax === 0 ? 0 : clampedValue / safeMax;
  const activeSegments = Math.round(ratio * segments);

  const ariaValueNow = Math.round(ratio * 100);

  return (
    <div role="progressbar" className={cn("flex w-full items-center gap-0.5", className)} {...props}>
      {Array.from({ length: segments }).map((_, index) => (
        <span
          key={index}
          className={cn(
            "h-2 flex-1 rounded-sm transition-colors",
            index < activeSegments
              ? "bg-[#d4af37]"
              : "bg-gray-200 dark:bg-gray-800"
          )}
        />
      ))}
    </div>
  );
}
