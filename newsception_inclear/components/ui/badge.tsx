import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "destructive";
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
          {
            "border-transparent bg-[#1a1a1a] text-white dark:bg-white dark:text-black":
              variant === "default",
            "border-transparent bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-100":
              variant === "secondary",
            "border-gray-300 text-gray-900 dark:border-gray-700 dark:text-gray-100": variant === "outline",            "border-transparent bg-red-500 text-white": variant === "destructive",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge };
