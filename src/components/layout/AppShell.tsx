import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  size?: "compact" | "wide";
}

export default function AppShell({
  children,
  className,
  contentClassName,
  size = "compact",
}: AppShellProps) {
  return (
    <div className={cn("app-shell", className)}>
      <div className="ambient-orb left-[-5rem] top-[-3rem] h-52 w-52 bg-primary/35 lg:left-[-2rem] lg:top-8 lg:h-72 lg:w-72" />
      <div className="ambient-orb right-[-4rem] top-24 h-48 w-48 bg-secondary/35 lg:right-8 lg:top-16 lg:h-64 lg:w-64" />
      <div className="ambient-orb bottom-[-4rem] left-1/2 h-64 w-64 -translate-x-1/2 bg-accent/30 lg:bottom-0 lg:h-80 lg:w-80" />

      <div
        className={cn(
          "content-shell px-4 pb-6 pt-4 sm:px-6 sm:pb-8 lg:px-8 lg:pt-6 xl:px-10 xl:pb-10",
          size === "compact" ? "max-w-[34rem] lg:max-w-6xl" : "max-w-7xl 2xl:max-w-[88rem]",
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}
