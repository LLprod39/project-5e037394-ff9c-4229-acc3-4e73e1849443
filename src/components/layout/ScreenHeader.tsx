import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  actions?: ReactNode;
  className?: string;
}

export default function ScreenHeader({
  title,
  subtitle,
  onBack,
  actions,
  className,
}: ScreenHeaderProps) {
  return (
    <div className={cn("sticky top-0 z-30 pb-4 print:hidden", className)}>
      <div className="glass-card flex items-center gap-3 px-4 py-3 lg:px-5 lg:py-4">
        {onBack ? (
          <button
            onClick={onBack}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 text-foreground shadow-sm transition hover:bg-white lg:h-12 lg:w-12"
            type="button"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : null}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-foreground lg:text-base">{title}</p>
          {subtitle ? <p className="mt-0.5 truncate text-xs text-muted-foreground lg:text-sm">{subtitle}</p> : null}
        </div>

        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
