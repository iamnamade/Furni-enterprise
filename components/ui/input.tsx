import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        {...props}
        className={cn(
          "h-11 w-full rounded-full border bg-[color:var(--surface)] px-4 text-sm font-medium text-[color:var(--foreground)] outline-none",
          "placeholder:text-[color:var(--muted)] transition duration-300 focus:ring-2",
          "focus:border-[color:var(--accent)] focus:ring-[color:var(--ring)]",
          className
        )}
      />
    );
  }
);

Input.displayName = "Input";
