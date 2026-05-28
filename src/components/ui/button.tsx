import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-[0.9375rem] font-semibold transition-[background,color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-brand-600 text-primary-foreground shadow-brand hover:bg-brand-700 hover:shadow-lift",
        destructive:
          "bg-risk-high text-destructive-foreground hover:bg-risk-high/90",
        outline:
          "border border-ink-200 bg-transparent text-foreground hover:bg-ink-50 hover:border-ink-300",
        subtle:
          "bg-ink-50 text-foreground hover:bg-ink-100",
        secondary:
          "bg-warm-100 text-warm-600 hover:bg-warm-100/80",
        ghost:
          "text-foreground hover:bg-ink-50",
        link:
          "text-brand-600 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5",
        sm:      "h-9 px-3.5 text-[0.875rem] rounded-md",
        lg:      "h-12 px-6 text-base rounded-lg",
        xl:      "h-14 px-7 text-base rounded-lg",
        icon:    "h-10 w-10",
        "icon-sm": "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
