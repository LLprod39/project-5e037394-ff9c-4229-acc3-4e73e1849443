import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CalendarDays, LogOut, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/button";
import { normalizeAdminResult } from "@/lib/admin-result";
import { leadStatusLabels } from "@/lib/public-content";
import { getSubmissions, logoutAdmin } from "@/lib/submissions-api";
import { LeadStatus, RiskDomain, Submission } from "@/types/quiz";

const riskLabels = {
  green: "Профилактика",
  yellow: "Консультация",
  red: "Диагностика",
};

const domainLabels: Record<RiskDomain, string> = {
  perinatal: "Перинатальный",
  motor: "Моторика",
  speech: "Речь",
  communication: "Коммуникация",
  sensory: "Сенсорика",
  play: "Игра",
};

function getPriorityMarkers(submission: Submission) {
  return normalizeAdminResult(submission).priorityMarkers;
}

function getBlockProfiles(submission: Submission) {
  return normalizeAdminResult(submission).blockProfiles;
}

function getAgeLabel(birthDate: string) {
  const birth = new Date(birthDate);
  const now = new Date();
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());

  if (!Number.isFinite(months) || months < 0) return "Возраст не определен";
  if (months < 24) return `${months} мес`;

  const years = Math.floor(months / 12);
  const remainderMonths = months % 12;
  return remainderMonths > 0 ? `${years} г ${remainderMonths} мес` : `${years} г`;
}

function getRiskChipClass(status: Submission["result"]["status"]) {
  if (status === "red") return "bg-destructive/10 text-destructive";
  if (status === "yellow") return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
  return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
}

function getUrgencyScore(submission: Submission) {
  const base = submission.result.status === "red" ? 100 : submission.result.status === "yellow" ? 60 : 10;
  const priorityMarkers = getPriorityMarkers(submission);
  const blockProfiles = getBlockProfiles(submission);
  const criticalCount = priorityMarkers.filter((marker) => marker.severity === "critical").length;
  const highCount = priorityMarkers.filter((marker) => marker.severity === "high").length;
  const multiDomain = blockProfiles.filter((profile) => profile.level !== "low").length >= 2 ? 10 : 0;
  return base + criticalCount * 20 + highCount * 8 + multiDomain;
}

function getIndicators(submission: Submission) {
  const indicators: { label: string; tone: "danger" | "warning" | "neutral" }[] = [];
  const priorityMarkers = getPriorityMarkers(submission);
  const blockProfiles = getBlockProfiles(submission);
  const criticalCount = priorityMarkers.filter((marker) => marker.severity === "critical").length;
  const communicationRisk = blockProfiles.find((profile) => profile.domain === "communication");
  const motorRisk = blockProfiles.find((profile) => profile.domain === "motor");
  const activeDomains = blockProfiles.filter((profile) => profile.level !== "low");

  if (criticalCount > 0) {
    indicators.push({
      label: criticalCount === 1 ? "Красный флаг" : `Красные флаги: ${criticalCount}`,
      tone: "danger",
    });
  }

  if (communicationRisk?.level && communicationRisk.level !== "low") {
    indicators.push({ label: "Коммуникативный риск", tone: "warning" });
  }

  if (motorRisk?.level && motorRisk.level !== "low") {
    indicators.push({ label: "Моторный риск", tone: "warning" });
  }

  if (activeDomains.length >= 2) {
    indicators.push({ label: "Сочетанный профиль", tone: "neutral" });
  }

  return indicators;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [riskFilter, setRiskFilter] = useState<"all" | "green" | "yellow" | "red">("all");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [domainFilter, setDomainFilter] = useState<RiskDomain | "all">("all");

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

  const logoutMutation = useMutation({
    mutationFn: logoutAdmin,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["admin-session"] });
      navigate("/admin/login", { replace: true });
    },
  });

  const filteredSubmissions = useMemo(() => {
    return [...submissions]
      .filter((submission) => {
        const riskOk = riskFilter === "all" || submission.result.status === riskFilter;
        const statusOk = statusFilter === "all" || submission.leadStatus === statusFilter;
        const domainOk =
          domainFilter === "all" ||
          getBlockProfiles(submission).some(
            (profile) => profile.domain === domainFilter && profile.level !== "low"
          );

        return riskOk && statusOk && domainOk;
      })
      .sort((left, right) => getUrgencyScore(right) - getUrgencyScore(left));
  }, [domainFilter, riskFilter, statusFilter, submissions]);

  const stats = useMemo(() => {
    return submissions.reduce(
      (accumulator, submission) => {
        accumulator.total += 1;
        if (submission.leadStatus === "new") accumulator.new += 1;
        if (submission.leadStatus === "scheduled") accumulator.scheduled += 1;
        if (submission.leadStatus === "completed") accumulator.completed += 1;
        if (submission.result.status === "red") accumulator.red += 1;
        return accumulator;
      },
      { total: 0, new: 0, scheduled: 0, completed: 0, red: 0 }
    );
  }, [submissions]);

  return (
    <AppShell size="wide">
      <ScreenHeader
        title="Админка Umay Kids"
        subtitle="Очередь анкет, triage по рискам и маршрут записи"
        actions={
          <>
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </>
        }
      />

      <div className="space-y-5">
        <section className="grid gap-4 md:grid-cols-4">
          {[
            { title: "Всего тестов", value: stats.total },
            { title: "Новые", value: stats.new },
            { title: "Записаны", value: stats.scheduled },
            { title: "Красный риск", value: stats.red },
          ].map((item) => (
            <div key={item.title} className="glass-card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {item.title}
              </p>
              <p className="mt-2 text-3xl font-black tracking-tight text-foreground">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="glass-card p-5">
          <div className="flex flex-col gap-3 xl:flex-row">
            <FilterSelect
              label="Риск"
              value={riskFilter}
              onChange={(value) => setRiskFilter(value as typeof riskFilter)}
              options={[
                { value: "all", label: "Все" },
                { value: "green", label: "Профилактика" },
                { value: "yellow", label: "Консультация" },
                { value: "red", label: "Диагностика" },
              ]}
            />
            <FilterSelect
              label="Статус"
              value={statusFilter}
              onChange={(value) => setStatusFilter(value as typeof statusFilter)}
              options={[
                { value: "all", label: "Все" },
                { value: "new", label: leadStatusLabels.new },
                { value: "called", label: leadStatusLabels.called },
                { value: "scheduled", label: leadStatusLabels.scheduled },
                { value: "completed", label: leadStatusLabels.completed },
                { value: "declined", label: leadStatusLabels.declined },
              ]}
            />
            <FilterSelect
              label="Домен риска"
              value={domainFilter}
              onChange={(value) => setDomainFilter(value as typeof domainFilter)}
              options={[
                { value: "all", label: "Все домены" },
                { value: "perinatal", label: domainLabels.perinatal },
                { value: "motor", label: domainLabels.motor },
                { value: "speech", label: domainLabels.speech },
                { value: "communication", label: domainLabels.communication },
                { value: "sensory", label: domainLabels.sensory },
                { value: "play", label: domainLabels.play },
              ]}
            />
          </div>
        </section>

        {isLoading ? (
          <div className="glass-card p-8 text-center text-sm text-muted-foreground">Загружаем анкеты...</div>
        ) : null}

        {isError ? (
          <div className="glass-card p-8 text-center text-sm text-foreground">
            {error instanceof Error ? error.message : "Не удалось загрузить анкеты."}
          </div>
        ) : null}

        {!isLoading && !isError ? (
          <div className="space-y-3">
            {filteredSubmissions.map((submission) => (
              <SubmissionRow
                key={submission.id}
                submission={submission}
                onOpen={() => navigate(`/admin/report/${submission.id}`)}
              />
            ))}

            {filteredSubmissions.length === 0 ? (
              <div className="glass-card p-8 text-center text-sm text-muted-foreground">
                По выбранным фильтрам ничего не найдено.
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}

function SubmissionRow({ submission, onOpen }: { submission: Submission; onOpen: () => void }) {
  const indicators = getIndicators(submission);
  const dominantProfiles = getBlockProfiles(submission)
    .filter((profile) => profile.level !== "low")
    .slice(0, 3);
  const priorityMarkers = getPriorityMarkers(submission);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="glass-card w-full p-5 text-left transition hover:bg-white/90 dark:hover:bg-white/10"
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-black text-foreground">{submission.userInfo.childName}</p>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getRiskChipClass(submission.result.status)}`}>
              {riskLabels[submission.result.status]}
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
              {leadStatusLabels[submission.leadStatus]}
            </span>
          </div>

          <p className="text-sm text-muted-foreground">
            {submission.userInfo.parentName} · {getAgeLabel(submission.userInfo.birthDate)}
          </p>
          <p className="text-sm text-muted-foreground">{submission.userInfo.phone}</p>

          {indicators.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {indicators.map((indicator) => (
                <span
                  key={indicator.label}
                  className={[
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    indicator.tone === "danger"
                      ? "bg-destructive/10 text-destructive"
                      : indicator.tone === "warning"
                        ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                        : "bg-primary/10 text-primary",
                  ].join(" ")}
                >
                  {indicator.label}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 xl:items-end">
          <div className="rounded-[1rem] bg-muted/70 px-4 py-3 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">{new Date(submission.date).toLocaleDateString("ru-RU")}</p>
            <p>{new Date(submission.date).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {dominantProfiles.map((profile) => (
              <span key={profile.domain} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {domainLabels[profile.domain]}
              </span>
            ))}
          </div>

          <div className="rounded-[1rem] bg-muted/70 px-4 py-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <span className="font-semibold text-foreground">
                {submission.scheduledFor
                  ? new Date(submission.scheduledFor).toLocaleString("ru-RU")
                  : "Пока не записан"}
              </span>
            </div>
          </div>

          {priorityMarkers.some((marker) => marker.severity === "critical") ? (
            <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Срочно в приоритет
            </div>
          ) : null}
        </div>
      </div>
    </button>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex min-w-[12rem] flex-col gap-2 text-sm font-semibold text-foreground">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-[1rem] border border-input bg-background px-4 text-sm"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
