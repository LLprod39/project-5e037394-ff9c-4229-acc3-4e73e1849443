import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Download, LoaderCircle, Printer, RefreshCw, ShieldCheck } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/button";
import { questions } from "@/data/questionsConfig";
import { getSubmissionById } from "@/lib/submissions-api";
import { RecommendationLevel } from "@/types/quiz";

const levelLabels: Record<RecommendationLevel, string> = {
  no_risk: "Факторов риска не выявлено",
  attention: "Требует наблюдения",
  consultation: "Рекомендована консультация",
  diagnosis: "Рекомендована диагностика",
};

export default function AdminReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    data: submission,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["submission", id],
    queryFn: () => getSubmissionById(id!),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <AppShell size="wide" contentClassName="flex items-center justify-center">
        <div className="glass-card w-full max-w-md p-8 text-center">
          <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Загружаем отчёт...</p>
        </div>
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell size="wide" contentClassName="flex items-center justify-center">
        <div className="glass-card w-full max-w-md p-8 text-center">
          <p className="text-sm text-foreground">
            {error instanceof Error ? error.message : "Не удалось загрузить отчёт."}
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Повторить
            </Button>
            <Button onClick={() => navigate("/admin")}>К списку анкет</Button>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!submission) {
    return (
      <AppShell size="wide" contentClassName="flex items-center justify-center">
        <div className="glass-card w-full max-w-md p-8 text-center">
          <p className="text-sm text-muted-foreground">Анкета не найдена</p>
          <Button onClick={() => navigate("/admin")} className="mt-4">
            К списку анкет
          </Button>
        </div>
      </AppShell>
    );
  }

  const { userInfo, result, answers, date } = submission;
  const percentage = Math.round((result.totalScore / result.maxScore) * 100);

  return (
    <AppShell size="wide">
      <ScreenHeader
        title={`Отчёт: ${userInfo.childName}`}
        subtitle={`Создан ${new Date(date).toLocaleDateString("ru-RU", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}`}
        onBack={() => navigate("/admin")}
        actions={
          <>
            <Button variant="outline" size="icon" onClick={() => window.print()} aria-label="Печать">
              <Printer className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" disabled aria-label="Скачать PDF">
              <Download className="h-4 w-4" />
            </Button>
          </>
        }
      />

      <div className="space-y-5 print:space-y-4">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card-strong p-6 print:shadow-none"
        >
          <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
            <div>
              <div className="section-chip mb-4">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Итоговая рекомендация
              </div>
              <h1 className="text-[2rem] font-extrabold tracking-[-0.04em] text-foreground">
                {levelLabels[result.level]}
              </h1>
              <p className="mt-3 text-[15px] leading-7 text-muted-foreground">{result.adminNote}</p>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{result.detailedExplanation}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <InfoMetric label="Итоговый балл" value={`${result.totalScore} / ${result.maxScore}`} />
              <InfoMetric label="Уровень риска" value={`${percentage}%`} />
            </div>
          </div>
        </motion.section>

        <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass-card p-5"
          >
            <h2 className="text-lg font-bold text-foreground">Данные ребёнка и родителя</h2>
            <div className="mt-4 space-y-3">
              <InfoRow label="Имя ребёнка" value={userInfo.childName} />
              <InfoRow label="Возраст" value={userInfo.childAge} />
              <InfoRow label="Родитель" value={userInfo.parentName} />
              <InfoRow label="Телефон" value={userInfo.phone} />
              <InfoRow label="Дата анкеты" value={new Date(date).toLocaleString("ru-RU")} />
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="glass-card p-5"
          >
            <h2 className="text-lg font-bold text-foreground">Факторы риска</h2>
            {result.factors.length > 0 ? (
              <div className="mt-4 space-y-3">
                {result.factors.map((factor) => (
                  <div key={factor} className="soft-panel p-4">
                    <p className="text-sm leading-6 text-foreground">{factor}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Выраженные факторы риска не выявлены.</p>
            )}
          </motion.section>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="glass-card p-5"
        >
          <h2 className="text-lg font-bold text-foreground">Все ответы анкеты</h2>
          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            {questions.map((question) => {
              const selectedIds = answers[question.id] || [];
              const selectedLabels = question.options
                .filter((option) => selectedIds.includes(option.id))
                .map((option) => {
                  const risk =
                    option.riskLevel !== "low"
                      ? ` (${option.riskLevel === "high" ? "высокий" : "средний"} риск)`
                      : "";
                  return option.label + risk;
                });

              return (
                <div key={question.id} className="soft-panel p-4">
                  <p className="text-sm font-semibold leading-6 text-foreground">{question.text}</p>
                  {selectedLabels.length > 0 ? (
                    <ul className="mt-3 space-y-2">
                      {selectedLabels.map((label) => (
                        <li key={label} className="text-sm text-muted-foreground">
                          • {label}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm italic text-muted-foreground">Нет ответа</p>
                  )}
                </div>
              );
            })}
          </div>
        </motion.section>
      </div>
    </AppShell>
  );
}

function InfoMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="soft-panel p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-foreground">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="soft-panel flex items-center justify-between gap-4 px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}
