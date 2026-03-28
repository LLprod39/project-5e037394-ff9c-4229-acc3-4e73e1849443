import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[20px] text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(135deg,rgba(111,157,203,1)_0%,rgba(137,177,215,1)_100%)] text-primary-foreground shadow-[0_24px_44px_-24px_rgba(95,135,181,0.95)] hover:-translate-y-0.5 hover:shadow-[0_30px_54px_-24px_rgba(95,135,181,0.9)]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-white/70 bg-white/78 text-foreground shadow-[0_16px_34px_-24px_rgba(92,104,125,0.45)] hover:bg-white hover:text-foreground",
        secondary:
          "bg-[linear-gradient(135deg,rgba(205,188,223,0.95)_0%,rgba(222,205,237,0.95)_100%)] text-secondary-foreground shadow-[0_20px_44px_-26px_rgba(144,115,180,0.68)] hover:-translate-y-0.5",
        ghost: "text-foreground hover:bg-white/65 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 rounded-2xl px-3",
        lg: "h-12 rounded-[22px] px-8 text-base",
        icon: "h-11 w-11 rounded-2xl",
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
