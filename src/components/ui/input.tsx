import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-md border border-input bg-card px-3.5 py-2 text-[0.9375rem] text-foreground shadow-soft file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-ink-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-brand-500 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
