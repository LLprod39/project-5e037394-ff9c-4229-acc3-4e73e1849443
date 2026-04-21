import { ArrowLeft, ExternalLink, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PublicControls from "@/components/PublicControls";
import SiteFooter from "@/components/SiteFooter";
import { useLocale } from "@/lib/i18n";
import { centerFacts } from "@/lib/public-content";
import { INSTAGRAM_URL, PAVLODAR_ADDRESS, REVIEWS_URL } from "@/lib/public-config";

export default function AboutPage() {
  const navigate = useNavigate();
  const { t } = useLocale();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(255,253,249,1),rgba(247,243,238,1))] dark:bg-[linear-gradient(180deg,rgba(17,22,31,1),rgba(12,18,25,1))]">
      <header className="border-b border-white/50 bg-white/70 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-black/20">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t({ ru: "Назад", kz: "Артқа" })}
          </Button>
          <PublicControls />
        </div>
      </header>

      <main className="px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="glass-card-strong grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="section-chip">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                {t({
                  ru: "Центр комплексного развития и коррекции",
                  kz: "Кешенді даму және түзету орталығы",
                })}
              </p>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-foreground">
                {t({ ru: "Центр, где с тревогой работают спокойно и по делу", kz: "Мазасыздықпен сабырлы әрі нақты жұмыс істейтін орталық" })}
              </h1>
              <p className="mt-4 text-base leading-8 text-muted-foreground">
                {t({
                  ru: "Мы готовим семью к очной диагностике без перегруза, помогаем собрать анамнез и заранее увидеть ключевые зоны риска.",
                  kz: "Біз отбасын бетпе-бет диагностикаға артық жүктемесіз дайындап, анамнезді жинауға және негізгі қауіп аймақтарын алдын ала көруге көмектесеміз.",
                })}
              </p>
            </div>
            <div className="glass-card overflow-hidden p-3">
              <img src="/hero-illustration.png" alt="Umay Kids" className="h-full min-h-[18rem] w-full rounded-[1.5rem] object-cover" />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {centerFacts.map((fact) => (
              <div key={fact.ru} className="glass-card p-5 text-sm leading-7 text-foreground">
                {t(fact)}
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="glass-card p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {t({ ru: "Контакты", kz: "Байланыс" })}
              </p>
              <p className="mt-3 text-lg font-bold text-foreground">{PAVLODAR_ADDRESS}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button variant="outline" asChild>
                  <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
                    Instagram
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href={REVIEWS_URL} target="_blank" rel="noreferrer">
                    2GIS
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
            <div className="glass-card p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {t({ ru: "Следующий шаг", kz: "Келесі қадам" })}
              </p>
              <p className="mt-3 text-base leading-8 text-foreground">
                {t({
                  ru: "Пройдите тест, чтобы специалист заранее увидел вашу карту случая и не тратил первую встречу на сбор базовой информации.",
                  kz: "Маман жағдай картасын алдын ала көріп, алғашқы кездесуді тек бастапқы мәлімет жинауға жұмсамауы үшін тесттен өтіңіз.",
                })}
              </p>
              <Button className="mt-5" onClick={() => navigate("/quiz")}>
                {t({ ru: "Перейти к тесту", kz: "Тестке өту" })}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
