import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PublicControls from "@/components/PublicControls";
import SiteFooter from "@/components/SiteFooter";
import { useLocale } from "@/lib/i18n";

export default function PrivacyPage() {
  const navigate = useNavigate();
  const { locale } = useLocale();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-white/50 bg-white/70 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-black/20">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {locale === "kz" ? "Артқа" : "Назад"}
          </Button>
          <PublicControls compact />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="glass-card-strong space-y-5 p-6 sm:p-8">
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            {locale === "kz" ? "Құпиялық саясаты" : "Политика конфиденциальности"}
          </h1>
          <div className="space-y-4 text-sm leading-7 text-muted-foreground">
            <p>
              {locale === "kz"
                ? "Umay Kids сайтта қалдырылған деректерді тек анкетаны сақтау, ата-анамен байланысу және алғашқы қабылдауға дайындық үшін пайдаланады."
                : "Umay Kids использует данные, оставленные на сайте, только для сохранения анкеты, связи с родителем и подготовки к первичному приему."}
            </p>
            <p>
              {locale === "kz"
                ? "Біз баланың деректерін үшінші тұлғаларға сатпаймыз және маркетплейстерге бермейміз. Қажет болған жағдайда бұл бет релиз алдында толық заңдық редакциямен заменяется на финальный текст центра."
                : "Мы не продаем и не передаем данные ребенка третьим лицам в маркетинговых целях. При необходимости перед публикацией эта страница может быть заменена на финальную юридическую редакцию центра."}
            </p>
            <p>
              {locale === "kz"
                ? "Сайттағы ақпарат алдын ала сипатта болады және дәрігердің диагнозын алмастырмайды."
                : "Информация на сайте носит предварительный характер и не заменяет очную диагностику специалиста."}
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
