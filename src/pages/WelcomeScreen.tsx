import { motion } from "framer-motion";
import { ArrowRight, Clock3, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import PublicControls from "@/components/PublicControls";
import SiteFooter from "@/components/SiteFooter";
import { useLocale } from "@/lib/i18n";
import { centerFacts, faqItems, heroContent, howItWorks } from "@/lib/public-content";
export default function WelcomeScreen() {
  const navigate = useNavigate();
  const { t } = useLocale();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(255,253,249,1),rgba(247,243,238,1))] text-foreground dark:bg-[linear-gradient(180deg,rgba(17,22,31,1),rgba(12,18,25,1))]">
      <header className="sticky top-0 z-40 border-b border-white/50 bg-white/70 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-black/20">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-bold shadow-sm dark:bg-white/5"
          >
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            Umay Kids
          </button>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate("/about")} className="hidden sm:inline-flex">
              {t({ ru: "О центре", kz: "Орталық туралы" })}
            </Button>
            <PublicControls />
          </div>
        </div>
      </header>

      <main>
        <section className="px-4 pb-8 pt-8 sm:pt-12">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card-strong space-y-6 p-6 sm:p-8"
            >
              <div className="section-chip">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                {t(heroContent.badge)}
              </div>

              <div className="space-y-4">
                <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-[-0.04em] text-foreground sm:text-5xl">
                  {t(heroContent.title)}
                </h1>
                <p className="max-w-3xl text-base leading-8 text-muted-foreground">{t(heroContent.description)}</p>
              </div>

              <div className="w-full sm:w-fit sm:min-w-[18rem]">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => navigate("/quiz")}
                >
                  {t(heroContent.start)}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="px-4 py-6">
          <div className="mx-auto max-w-6xl rounded-[2rem] bg-[linear-gradient(135deg,rgba(46,74,97,0.96),rgba(62,85,110,0.92))] p-6 text-white sm:p-8">
            <div className="max-w-2xl">
              <p className="section-chip border-white/10 bg-white/10 text-white">
                {t({ ru: "Как это работает", kz: "Бұл қалай жұмыс істейді" })}
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-tight">
                {t({ ru: "Три спокойных шага", kz: "Үш қарапайым қадам" })}
              </h2>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {howItWorks.map((item, index) => (
                <div key={item.title.ru} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">0{index + 1}</p>
                  <h3 className="mt-3 text-xl font-black">{t(item.title)}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/75">{t(item.text)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-6">
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="glass-card-strong p-6">
              <p className="section-chip">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                {t({ ru: "О центре", kz: "Орталық туралы" })}
              </p>
              <div className="mt-5 space-y-4">
                {centerFacts.map((fact) => (
                  <div key={fact.ru} className="rounded-[1.25rem] bg-muted/70 p-4 text-sm leading-7 text-foreground">
                    {t(fact)}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-black text-foreground">
                    {t({ ru: "Частые вопросы", kz: "Жиі қойылатын сұрақтар" })}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {t({
                      ru: "Коротко отвечаем на то, что больше всего волнует родителей.",
                      kz: "Ата-аналарды ең көп толғандыратын сұрақтарға қысқаша жауап береміз.",
                    })}
                  </p>
                </div>
                <Clock3 className="h-5 w-5 text-primary" />
              </div>
              <Accordion type="single" collapsible className="mt-4">
                {faqItems.map((item) => (
                  <AccordionItem key={item.question.ru} value={item.question.ru}>
                    <AccordionTrigger>{t(item.question)}</AccordionTrigger>
                    <AccordionContent>{t(item.answer)}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
