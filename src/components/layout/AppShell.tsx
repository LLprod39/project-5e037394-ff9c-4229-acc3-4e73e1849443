import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  size?: "compact" | "wide" | "narrow";
  plain?: boolean;
}

const sizeMap = {
  narrow:  "max-w-2xl",
  compact: "max-w-3xl lg:max-w-5xl",
  wide:    "max-w-6xl 2xl:max-w-[80rem]",
} as const;

export default function AppShell({
  children,
  className,
  contentClassName,
  size = "compact",
  plain = false,
}: AppShellProps) {
  return (
    <div className={cn("relative min-h-screen", plain ? "bg-page-plain" : "bg-page", className)}>
      <div
        className={cn(
          "relative mx-auto w-full px-4 pb-10 pt-4 sm:px-6 lg:px-8 lg:pb-14 lg:pt-6",
          sizeMap[size],
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
