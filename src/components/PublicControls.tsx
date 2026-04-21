import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const controlClassName =
  "inline-flex h-10 items-center rounded-full border border-white/70 bg-white/80 px-1 text-sm shadow-sm backdrop-blur";

export default function PublicControls({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useLocale();

  return (
    <div className={cn("flex items-center gap-2", compact && "gap-1")}>
      <div className={controlClassName}>
        <button
          type="button"
          onClick={() => setLocale("ru")}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold transition",
            locale === "ru"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          RU
        </button>
        <button
          type="button"
          onClick={() => setLocale("kz")}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold transition",
            locale === "kz"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          KZ
        </button>
      </div>
    </div>
  );
}
