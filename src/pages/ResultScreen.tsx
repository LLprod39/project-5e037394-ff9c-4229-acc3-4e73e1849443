import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, LoaderCircle, MessageCircle, RefreshCw } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PublicControls from "@/components/PublicControls";
import SiteFooter from "@/components/SiteFooter";
import { questionBlocks } from "@/data/questionsConfig";
import { useLocale } from "@/lib/i18n";
import {
  getRiskBadgeText,
  resultActionContent,
  statusContent,
} from "@/lib/public-content";
import {
  buildWhatsAppUrl,
  DIAGNOSTIC_FULL_PRICE,
  formatCurrency,
  INSTAGRAM_URL,
} from "@/lib/public-config";
import { getPublicSubmission } from "@/lib/submissions-api";

function softenPublicSummary(text: string) {
  return text
    .replace("В приоритете очной оценки:", "По анкете сейчас больше всего внимания требуют:")
    .replace(
      "Анкета содержит красные флаги, поэтому маршрут лучше строить без отсрочки.",
      "Некоторые сигналы повторяются, поэтому эти зоны лучше не откладывать."
    )
    .replace(
      "Выраженных одиночных красных флагов немного, но сочетание признаков уже влияет на профиль развития.",
      "Отдельные сигналы могут выглядеть умеренно, но вместе они уже складываются в устойчивую картину."
    )
    .replace(
      "Старт работы:",
      "Если двигаться дальше, логично начать с:"
    );
}

function softenBlockSummary(text: string) {
  return text
    .replace("требует приоритетной очной проверки и старта коррекции через тело", "сейчас особенно заметен и заслуживает отдельного внимания")
    .replace("требующие поэтапной очной диагностики", "которые сейчас выражены сильнее обычного")
    .replace("которые нельзя оставлять только на уровне онлайн-анкеты", "которые важно учитывать в общей картине развития")
    .replace("которые важно учитывать при очной работе", "которые важно учитывать дальше")
    .replace("требуют очного наблюдения", "сейчас заметны и заслуживают внимания");
}

export default function ResultScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, locale } = useLocale();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const {
    data: submission,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["public-submission", id, token],
    queryFn: () => getPublicSubmission(id!, token),
    enabled: Boolean(id && token),
    retry: false,
  });

  const statusCopy = submission ? statusContent[submission.result.status] : null;
  const actionCopy = submission ? resultActionContent[submission.result.status] : null;
  const displayedFullPrice = DIAGNOSTIC_FULL_PRICE;
  const displayedDiscountedPrice = Math.round(DIAGNOSTIC_FULL_PRICE * 0.8);
  const dynamicSummary =
    submission && locale === "ru"
      ? softenPublicSummary(submission.result.clinicalSummary)
      : null;

  const expiresDate = submission ? new Date(submission.result.offer.expiresAt) : new Date();
  const isExpired = new Date() > expiresDate;
  const formatExpiresAt = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}.${month}.${year} до ${hours}:${minutes}`;
  };

  const handleWhatsApp = () => {
    if (!submission) return;

    const message =
      locale === "kz"
        ? `Сәлеметсіз бе! ${submission.userInfo.childName} бойынша Umay Kids тестін өттік. Диагностикаға жазылғымыз келеді.`
        : `Здравствуйте! Мы прошли тест в Umay Kids по ребенку ${submission.userInfo.childName}. Хотим записаться на диагностику.`;

    window.open(buildWhatsAppUrl(message), "_blank", "noopener,noreferrer");
    navigate(`/thanks?child=${encodeURIComponent(submission.userInfo.childName)}`);
  };

  const blockCards = useMemo(() => {
    if (!submission) return [];

    const activeProfiles = submission.result.blockProfiles.filter((profile) => profile.level !== "low");
    const profilesToShow =
      locale === "ru" && activeProfiles.length > 0
        ? activeProfiles
        : submission.result.blockProfiles;

    return profilesToShow.map((profile) => {
      const block = questionBlocks.find((item) => item.id === profile.domain);

      return {
        id: profile.domain,
        title: block?.title?.[locale] || profile.title,
        summary: locale === "ru" ? softenBlockSummary(profile.summary) : profile.summary,
        concerns: locale === "ru" ? profile.concerns.slice(0, 2) : [],
      };
    });
  }, [locale, submission]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="glass-card max-w-md px-6 py-8 text-center">
          <LoaderCircle className="mx-auto h-6 w-6 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">
            {t({ ru: "Загружаем результат...", kz: "Нәтиже жүктелуде..." })}
          </p>
        </div>
      </div>
    );
  }

  if (!token || isError || !submission) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="glass-card max-w-md px-6 py-8 text-center">
          <p className="text-sm leading-7 text-foreground">
            {error instanceof Error
              ? error.message
              : t({ ru: "Результат не найден.", kz: "Нәтиже табылмады." })}
          </p>
          <div className="mt-5 flex flex-col gap-3">
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              {t({ ru: "Повторить", kz: "Қайталау" })}
            </Button>
            <Button onClick={() => navigate("/")}>
              {t({ ru: "На главную", kz: "Басты бетке" })}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(255,253,249,1),rgba(247,243,238,1))] dark:bg-[linear-gradient(180deg,rgba(17,22,31,1),rgba(12,18,25,1))]">
      <header className="sticky top-0 z-40 border-b border-white/50 bg-white/70 px-3 py-3 backdrop-blur dark:border-white/10 dark:bg-black/20 sm:px-4 lg:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/75 text-foreground shadow-sm dark:bg-white/5"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1 text-center">
            <p className="text-sm font-black text-foreground sm:text-base">
              {t({ ru: "Предварительный результат", kz: "Алдын ала нәтиже" })}
            </p>
            <p className="text-xs text-muted-foreground">
              {getRiskBadgeText(submission.result.status, locale)}
            </p>
          </div>

          <PublicControls compact />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-3 py-4 pb-24 sm:px-4 sm:py-6 lg:px-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.8fr)] lg:items-start lg:gap-6">
          <section className="glass-card-strong space-y-4 p-4 sm:space-y-6 sm:p-6 lg:p-8">
            <div className="section-chip w-fit">{t(statusCopy?.accent)}</div>

            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-4xl">
                {t(statusCopy?.title)}
              </h1>
              <p className="mt-3 text-sm leading-7 text-muted-foreground sm:mt-4 sm:text-base sm:leading-8">
                {dynamicSummary || t(statusCopy?.description)}
              </p>
            </div>

            <div className="rounded-[1.25rem] bg-muted/65 p-4 sm:rounded-[1.5rem] sm:p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {t({ ru: "Что это значит", kz: "Бұл нені білдіреді" })}
              </p>
              <p className="mt-3 text-sm leading-6 text-foreground sm:leading-7">
                {t(statusCopy?.explanation)}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {t({ ru: "На что специалист обратит внимание", kz: "Маман нені тексереді" })}
              </p>
              <div className="mt-3 grid gap-3 sm:gap-4 lg:grid-cols-2">
              {blockCards.map((block) => (
                <div
                  key={block.id}
                  className="rounded-[1.25rem] border border-white/70 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5 sm:rounded-[1.5rem] sm:p-5"
                >
                  <p className="text-sm font-bold text-foreground">{block.title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground sm:leading-7">
                    {block.summary}
                  </p>
                  {block.concerns.length > 0 ? (
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-foreground">
                      {block.concerns.map((concern) => (
                        <li key={concern} className="flex gap-2">
                          <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          <span>{concern}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
            </div>


          </section>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="glass-card-strong p-4 sm:p-6 lg:p-7">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {t({ ru: "Следующий шаг", kz: "Әрі қарай не істеу керек" })}
              </p>
              <p className="mt-3 text-lg font-black leading-8 text-foreground sm:text-xl">
                {t({
                  ru: "Если захотите обсудить результат подробнее, будем рады видеть вас в Umay Kids. А цена со скидкой сохранится для вас в течение 3 дней.",
                  kz: "Қазір ең дұрыс келесі қадам — маманға бетпе-бет кездесуге жазылу.",
                })}
              </p>
              {actionCopy ? (
                <div className="mt-4 space-y-3">
                  {actionCopy.steps.map((step, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/12 text-sm font-bold text-primary">
                        {index + 1}
                      </div>
                      <p className="pt-0.5 text-sm leading-6 text-foreground sm:leading-7">{t(step)}</p>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="mt-5 rounded-[1.25rem] bg-muted/60 p-4 sm:p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  {isExpired
                    ? t({ ru: "Стоимость приема", kz: "Диагностика құны" })
                    : t({ ru: "Ваша цена после теста", kz: "Тесттен кейінгі бағаңыз" })}
                </p>
                <p className="mt-3 text-2xl font-black text-foreground sm:text-3xl">
                  {formatCurrency(
                    isExpired ? displayedFullPrice : displayedDiscountedPrice
                  )}
                </p>
                {!isExpired && (
                  <p className="mt-1 text-sm text-muted-foreground line-through">
                    {formatCurrency(displayedFullPrice)}
                  </p>
                )}
                {!isExpired ? (
                  <>
                    <p className="mt-4 text-sm leading-6 text-foreground sm:leading-7">
                      {t({
                        ru: "Скидка за прохождение теста уже применена. Эта цена сохранится для вас в течение 3 дней:",
                        kz: "Тесттен өткені үшін жеңілдік қолданылды. Бұл баға сіз үшін 3 күн сақталады:",
                      })}
                    </p>
                    <p className="mt-2 text-[1.05rem] font-bold text-primary">
                      {formatExpiresAt(expiresDate)}
                    </p>
                  </>
                ) : (
                  <p className="mt-4 text-sm leading-6 text-foreground sm:leading-7">
                    {t({
                      ru: "Срок скидки завершился, но выбрать удобное время все равно можно в любой момент.",
                      kz: "Жеңілдікпен бронь мерзімі аяқталды, бірақ кездесуге кез келген уақытта жазылуға болады.",
                    })}
                  </p>
                )}
              </div>

              <Button size="lg" className="mt-5 w-full" onClick={handleWhatsApp}>
                <MessageCircle className="mr-2 h-4 w-4" />
                {t({
                  ru: "Записаться в WhatsApp",
                  kz: "WhatsApp арқылы жазылу",
                })}
              </Button>
            </div>

            <div className="glass-card p-4 sm:p-6 lg:p-7">
              <p className="text-sm font-bold text-foreground">
                {t({ ru: "Пока ждете ответ", kz: "Жауап күтіп тұрған кезде" })}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground sm:leading-7">
                {t({
                  ru: "Можно перейти в Instagram Umay Kids и посмотреть полезные материалы для родителей.",
                  kz: "Umay Kids Instagram парақшасына өтіп, ата-аналарға арналған пайдалы материалдарды көре аласыз.",
                })}
              </p>
              <Button variant="outline" className="mt-4 w-full" asChild>
                <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
                  Instagram
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
