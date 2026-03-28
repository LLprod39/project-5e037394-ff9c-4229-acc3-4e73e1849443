import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ChevronRight,
  FileText,
  LoaderCircle,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/button";
import { getSubmissions } from "@/lib/submissions-api";
import { RecommendationLevel } from "@/types/quiz";

const levelBadge: Record<RecommendationLevel, { label: string; className: string }> = {
  no_risk: { label: "Норма", className: "bg-accent/20 text-accent-foreground" },
  attention: { label: "Внимание", className: "bg-warning/25 text-[hsl(25,70%,26%)]" },
  consultation: { label: "Консультация", className: "bg-secondary/25 text-secondary-foreground" },
  diagnosis: { label: "Диагностика", className: "bg-primary/15 text-primary" },
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const {
    data: submissions = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["submissions"],
    queryFn: getSubmissions,
  });

  const stats = useMemo(() => {
    const summary = {
      total: submissions.length,
      diagnosis: 0,
      consultation: 0,
      attention: 0,
    };

    for (const submission of submissions) {
      if (submission.result.level === "diagnosis") summary.diagnosis += 1;
      if (submission.result.level === "consultation") summary.consultation += 1;
      if (submission.result.level === "attention") summary.attention += 1;
    }

    return summary;
  }, [submissions]);

  return (
    <AppShell size="wide">
      <ScreenHeader
        title="Админ-панель"
        subtitle="Анкеты, результаты и быстрый просмотр рисков"
        onBack={() => navigate("/")}
        actions={
          <Button variant="outline" size="icon" onClick={() => refetch()} aria-label="Обновить">
            <RefreshCw className="h-4 w-4" />
          </Button>
        }
      />

      <div className="space-y-5">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card-strong p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <div className="section-chip mb-4">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Панель сопровождения заявок
              </div>
              <h1 className="text-[2rem] font-extrabold tracking-[-0.04em] text-foreground">
                Здесь видны все анкеты, уровень рекомендаций и детали по каждому ребёнку
              </h1>
              <p className="mt-3 text-[15px] leading-7 text-muted-foreground">
                Панель удобна для первичного обзвона родителей, распределения консультаций и
                приоритизации случаев с более высоким риском.
              </p>
            </div>

            <div className="rounded-[28px] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(246,240,234,0.88))] p-4 shadow-[0_28px_56px_-34px_rgba(92,104,125,0.45)]">
              <div className="flex h-24 w-24 items-center justify-center rounded-[24px] bg-primary/10 text-primary">
                <Stethoscope className="h-10 w-10" />
              </div>
            </div>
          </div>
        </motion.section>

        <section className="grid gap-4 md:grid-cols-4">
          {[
            { title: "Всего анкет", value: stats.total, tone: "bg-white/80 text-foreground", icon: FileText },
            { title: "Диагностика", value: stats.diagnosis, tone: "bg-primary/12 text-primary", icon: ShieldAlert },
            { title: "Консультация", value: stats.consultation, tone: "bg-secondary/20 text-secondary-foreground", icon: ArrowUpRight },
            { title: "Наблюдение", value: stats.attention, tone: "bg-warning/20 text-[hsl(25,70%,26%)]", icon: Sparkles },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * index }}
                className="glass-card p-5"
              >
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${item.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{item.title}</p>
                <p className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-foreground">{item.value}</p>
              </motion.div>
            );
          })}
        </section>

        {isLoading ? (
          <div className="glass-card p-10 text-center">
            <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">Загружаем анкеты с сервера...</p>
          </div>
        ) : null}

        {isError ? (
          <div className="glass-card p-8 text-center">
            <p className="text-sm text-foreground">
              {error instanceof Error ? error.message : "Не удалось загрузить анкеты."}
            </p>
            <Button onClick={() => refetch()} variant="outline" className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" />
              Повторить
            </Button>
          </div>
        ) : null}

        {!isLoading && !isError && submissions.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">Пока нет заполненных анкет</p>
          </div>
        ) : null}

        {!isLoading && !isError && submissions.length > 0 ? (
          <div className="space-y-3">
            {submissions.map((submission, index) => {
              const badge = levelBadge[submission.result.level];
              return (
                <motion.button
                  key={submission.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => navigate(`/admin/report/${submission.id}`)}
                  className="glass-card w-full p-5 text-left transition hover:bg-white/90"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-bold text-foreground">{submission.userInfo.childName}</p>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>
                          {badge.label}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {submission.userInfo.parentName} · {submission.userInfo.childAge}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{submission.userInfo.phone}</p>
                    </div>

                    <div className="flex items-center justify-between gap-4 md:justify-end">
                      <div className="rounded-[22px] bg-muted/65 px-4 py-3 text-sm">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Результат</p>
                        <p className="mt-1 font-semibold text-foreground">{submission.result.totalScore} баллов</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-foreground">
                          {new Date(submission.date).toLocaleDateString("ru-RU", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(submission.date).toLocaleTimeString("ru-RU", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
