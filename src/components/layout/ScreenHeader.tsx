import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  actions?: ReactNode;
  className?: string;
  sticky?: boolean;
}

export default function ScreenHeader({
  title,
  subtitle,
  onBack,
  backLabel = "Назад",
  actions,
  className,
  sticky = true,
}: ScreenHeaderProps) {
  return (
    <div
      className={cn(
        "z-30 mb-5 no-print",
        sticky && "sticky top-0 -mx-4 sm:-mx-6 lg:-mx-8",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 border-b border-border/60 bg-card/85 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8",
          sticky && "safe-top",
        )}
      >
        {onBack ? (
          <button
            onClick={onBack}
            aria-label={backLabel}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/60 bg-card text-foreground transition hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        ) : null}

        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[0.9375rem] font-semibold text-ink-800">
            {title}
          </p>
          {subtitle ? (
            <p className="mt-0.5 truncate text-[0.75rem] text-ink-500">{subtitle}</p>
          ) : null}
        </div>

        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
