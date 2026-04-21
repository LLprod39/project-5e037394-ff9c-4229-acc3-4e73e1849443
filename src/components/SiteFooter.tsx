import { ExternalLink, Instagram, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useLocale } from "@/lib/i18n";
import { INSTAGRAM_URL, PAVLODAR_ADDRESS, REVIEWS_URL } from "@/lib/public-config";

export default function SiteFooter() {
  const { locale } = useLocale();

  return (
    <footer className="border-t border-white/60 bg-white/50 px-4 py-8 backdrop-blur dark:border-white/10 dark:bg-white/5">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-foreground">Umay Kids</p>
          <p>{PAVLODAR_ADDRESS}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href={REVIEWS_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-foreground shadow-sm dark:border-white/10 dark:bg-white/5"
          >
            <MapPin className="h-4 w-4" />
            2GIS
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-foreground shadow-sm dark:border-white/10 dark:bg-white/5"
          >
            <Instagram className="h-4 w-4" />
            Instagram
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
        <Link to="/privacy" className="text-xs underline underline-offset-4">
          {locale === "kz" ? "Құпиялық саясаты" : "Политика конфиденциальности"}
        </Link>
      </div>
    </footer>
  );
}
