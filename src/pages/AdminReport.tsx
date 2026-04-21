import { ReactNode, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ChevronDown,
  MessageCircle,
  Printer,
  RefreshCw,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/button";
import { questionBlocks, questions } from "@/data/questionsConfig";
import { normalizeAdminResult } from "@/lib/admin-result";
import { leadStatusLabels } from "@/lib/public-content";
import { buildWhatsAppUrl } from "@/lib/public-config";
import { getSubmissionById, updateSubmissionStatus } from "@/lib/submissions-api";
import { LeadStatus, RiskDomain } from "@/types/quiz";

const domainLabels: Record<RiskDomain, string> = {
  perinatal: "Перинатальный риск",
  motor: "Моторика",
  speech: "Речь",
  communication: "Коммуникация",
  sensory: "Сенсорика",
  play: "Игра и поведение",
};

const riskLabels = {
  green: "Профилактика",
  yellow: "Нужна консультация",
  red: "Нужна диагностика",
};

function getAgeLabel(birthDate: string) {
  const birth = new Date(birthDate);
  const now = new Date();
  const months =
    (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());

  if (!Number.isFinite(months) || months < 0) return "Возраст не определен";
  if (months < 24) return `${months} мес`;

  const years = Math.floor(months / 12);
  const remainder = months % 12;
  return remainder > 0 ? `${years} г ${remainder} мес` : `${years} г`;
}

function getRiskClass(status: "green" | "yellow" | "red") {
  if (status === "red") return "bg-destructive/10 text-destructive";
  if (status === "yellow") return "bg-amber-500/10 text-amber-700";
  return "bg-emerald-500/10 text-emerald-700";
}

function getSeverityClass(severity: "medium" | "high" | "critical") {
  if (severity === "critical") return "bg-destructive/10 text-destructive";
  if (severity === "high") return "bg-amber-500/10 text-amber-700";
  return "bg-primary/10 text-primary";
}

export default function AdminReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [leadStatus, setLeadStatus] = useState<LeadStatus>("new");
  const [scheduledFor, setScheduledFor] = useState("");
  const [showTrace, setShowTrace] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);

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

  useEffect(() => {
    if (submission) {
      setLeadStatus(submission.leadStatus);
      setScheduledFor(
        submission.scheduledFor ? new Date(submission.scheduledFor).toISOString().slice(0, 16) : ""
      );
    }
  }, [submission]);

  const updateStatusMutation = useMutation({
    mutationFn: () =>
      updateSubmissionStatus(id!, {
        leadStatus,
        scheduledFor:
          leadStatus === "scheduled" && scheduledFor ? new Date(scheduledFor).toISOString() : null,
      }),
    onSuccess: (nextSubmission) => {
      queryClient.setQueryData(["submission", id], nextSubmission);
      queryClient.setQueryData(["submissions"], (current: any[] | undefined) =>
        current?.map((item) => (item.id === nextSubmission.id ? nextSubmission : item)) || [
          nextSubmission,
        ]
      );
    },
  });

  const groupedAnswers = useMemo(() => {
    if (!submission) return [];

    return questionBlocks
      .map((block) => ({
        block,
        items: questions
          .filter((question) => question.blockId === block.id)
          .map((question) => {
            const rawValue = submission.answers[question.id];
            let labels: string[] = [];

            if (
              question.customInput &&
              typeof rawValue === "string" &&
              rawValue !== "unknown"
            ) {
              labels = [rawValue];
            } else {
              const selectedIds = Array.isArray(rawValue) ? rawValue : rawValue ? [rawValue] : [];
              labels = question.options
                .filter((option) => selectedIds.includes(option.id))
                .map((option) => option.label.ru);
            }

            return {
              id: question.id,
              question: question.text.ru,
              labels,
            };
          })
          .filter((item) => item.labels.length > 0),
      }))
      .filter((group) => group.items.length > 0);
  }, [submission]);

  if (isLoading) {
    return (
      <AppShell contentClassName="flex items-center justify-center">
        <div className="glass-card p-8 text-center text-sm text-muted-foreground">
          Загружаем карту приема...
        </div>
      </AppShell>
    );
  }

  if (isError || !submission) {
    return (
      <AppShell contentClassName="flex items-center justify-center">
        <div className="glass-card p-8 text-center text-sm text-foreground">
          {error instanceof Error ? error.message : "Анкета не найдена."}
          <div className="mt-4">
            <Button onClick={() => navigate("/admin")}>К списку</Button>
          </div>
        </div>
      </AppShell>
    );
  }

  const report = normalizeAdminResult(submission);
  const criticalMarkers = report.alerts.filter((item) => item.severity === "critical");
  const whatsappMessage = `Здравствуйте! Пишем из Umay Kids по анкете ребенка ${submission.userInfo.childName}.`;

  return (
    <AppShell size="wide">
      <ScreenHeader
        title={`Карта приема: ${submission.userInfo.childName}`}
        subtitle={`${getAgeLabel(submission.userInfo.birthDate)} · ${leadStatusLabels[submission.leadStatus]}`}
        onBack={() => navigate("/admin")}
        actions={
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        }
      />

      <div className="mx-auto max-w-3xl space-y-4 print:max-w-none print:space-y-3">
        <section className="glass-card-strong px-6 py-5 sm:px-7 sm:py-6">
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="section-chip print:bg-transparent">Карта первичного приема</span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getRiskClass(
                    submission.result.status
                  )}`}
                >
                  {riskLabels[submission.result.status]}
                </span>
              </div>

              <div>
                <h1 className="text-3xl font-black tracking-tight text-foreground">
                  {submission.userInfo.childName}
                </h1>
                <p className="mt-3 text-sm leading-7 text-foreground sm:text-base">
                  {report.clinicalSummary}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <InfoRow label="Возраст" value={getAgeLabel(submission.userInfo.birthDate)} />
              <InfoRow label="Дата анкеты" value={new Date(submission.date).toLocaleString("ru-RU")} />
              <InfoRow label="Родитель" value={submission.userInfo.parentName} />
              <InfoRow label="Телефон" value={submission.userInfo.phone} />
              {submission.userInfo.ageNote ? (
                <InfoRow label="Комментарий" value={submission.userInfo.ageNote} />
              ) : null}
            </div>

            {report.summary.length > 0 ? (
              <div className="rounded-[1.5rem] bg-muted/60 px-5 py-4 sm:px-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Коротко по анкете
                </p>
                <BulletList items={report.summary} className="mt-3" />
              </div>
            ) : null}

            {criticalMarkers.length > 0 ? (
              <div className="rounded-[1.5rem] bg-destructive/10 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  Сразу в приоритете
                </div>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-foreground">
                  {criticalMarkers.map((marker) => (
                    <li key={marker.code}>{marker.title}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="space-y-3 border-t border-border/60 pt-4 print:hidden">
              <label className="flex flex-col gap-2 text-sm font-semibold text-foreground">
                Статус клиента
                <select
                  value={leadStatus}
                  onChange={(event) => setLeadStatus(event.target.value as LeadStatus)}
                  className="h-11 rounded-[1rem] border border-input bg-background px-4 text-sm"
                >
                  {Object.entries(leadStatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              {leadStatus === "scheduled" ? (
                <label className="flex flex-col gap-2 text-sm font-semibold text-foreground">
                  Дата и время записи
                  <input
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(event) => setScheduledFor(event.target.value)}
                    className="h-11 rounded-[1rem] border border-input bg-background px-4 text-sm"
                  />
                </label>
              ) : null}

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <Button onClick={() => updateStatusMutation.mutate()} disabled={updateStatusMutation.isPending}>
                  {updateStatusMutation.isPending ? "Сохраняем..." : "Сохранить"}
                </Button>
                <Button variant="outline" asChild>
                  <a href={buildWhatsAppUrl(whatsappMessage)} target="_blank" rel="noreferrer">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    WhatsApp
                  </a>
                </Button>
                <Button variant="outline" onClick={() => window.print()} className="col-span-2 sm:col-span-1">
                  <Printer className="mr-2 h-4 w-4" />
                  PDF
                </Button>
              </div>
            </div>
          </div>
        </section>

        <ReportSection title="Главное по анкете">{null}</ReportSection>

        <ReportSection title="Что видим по анкете">
          <BulletList items={report.concerns} />
          {report.blockProfiles.filter((profile) => profile.level !== "low").length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {report.blockProfiles
                .filter((profile) => profile.level !== "low")
                .map((profile) => (
                  <span
                    key={profile.domain}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      profile.level === "high"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-amber-500/10 text-amber-700"
                    }`}
                  >
                    {domainLabels[profile.domain]}
                  </span>
                ))}
            </div>
          ) : null}
        </ReportSection>

        <ReportSection title="Что проверить на встрече">
          <BulletList items={report.checks} />
          {report.contraNotes.length > 0 ? (
            <div className="mt-4 rounded-[1.25rem] bg-muted/60 px-4 py-4 text-sm text-muted-foreground">
              {report.contraNotes.map((note) => (
                <p key={note} className="leading-6">
                  {note}
                </p>
              ))}
            </div>
          ) : null}
        </ReportSection>

        <ReportSection title="С чего начать работу">
          <BulletList items={report.sessionStart} />
        </ReportSection>

        <ExpandableSection
          title="Как система к этому пришла"
          open={showTrace}
          onToggle={() => setShowTrace((value) => !value)}
        >
          {report.clinicalHypotheses.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Рабочие гипотезы
              </p>
              {report.clinicalHypotheses.map((item) => (
                <div key={item.code} className="border-b border-border/60 pb-3 last:border-b-0 last:pb-0">
                  <p className="font-semibold text-foreground">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.summary}</p>
                </div>
              ))}
            </div>
          ) : null}

          {report.ruleTrace.length > 0 ? (
            <div className="space-y-4">
              {report.ruleTrace.map((item) => (
                <div key={item.code} className="border-b border-border/60 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getSeverityClass(
                        item.severity
                      )}`}
                    >
                      {item.severity === "critical"
                        ? "Критично"
                        : item.severity === "high"
                          ? "Высокий приоритет"
                          : "Рабочая зона"}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {domainLabels[item.domain]}
                    </span>
                  </div>
                  <p className="mt-3 font-semibold text-foreground">{item.title}</p>

                  {item.triggeredBy.length > 0 ? (
                    <div className="mt-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        На основе ответов
                      </p>
                      <BulletList items={item.triggeredBy} className="mt-2" dense />
                    </div>
                  ) : null}

                  {item.outputs.length > 0 ? (
                    <div className="mt-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Что из этого получилось
                      </p>
                      <BulletList items={item.outputs} className="mt-2" dense />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Для этой анкеты система не сохранила подробную трассировку.
            </p>
          )}
        </ExpandableSection>

        <ExpandableSection
          title="Полные ответы анкеты"
          open={showAnswers}
          onToggle={() => setShowAnswers((value) => !value)}
          className="print:[break-before:page]"
        >
          {groupedAnswers.length > 0 ? (
            <div className="space-y-5">
              {groupedAnswers.map((group) => (
                <div key={group.block.id} className="space-y-3">
                  <h3 className="text-base font-black text-foreground">{group.block.title.ru}</h3>
                  <div className="space-y-3">
                    {group.items.map((item) => (
                      <div key={item.id} className="border-b border-border/60 pb-3 last:border-b-0 last:pb-0">
                        <p className="text-sm font-semibold leading-6 text-foreground">{item.question}</p>
                        <BulletList items={item.labels} className="mt-2" dense />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">В этой анкете нет сохраненных ответов.</p>
          )}
        </ExpandableSection>

        <ReportSection title="Заметки специалиста">
          <NotesBlock title="Очные пробы" />
          <NotesBlock title="Наблюдения" />
          <NotesBlock title="План занятий" />
        </ReportSection>
      </div>
    </AppShell>
  );
}

function ReportSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  if (children == null) {
    return null;
  }

  return (
    <section className="glass-card px-6 py-5 sm:px-7">
      <h2 className="text-xl font-black text-foreground">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ExpandableSection({
  title,
  open,
  onToggle,
  className,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`glass-card px-6 py-4 sm:px-7 ${className ?? ""}`}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="text-xl font-black text-foreground">{title}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div className={open ? "mt-4 block print:block" : "mt-4 hidden print:block"}>{children}</div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-2 last:border-b-0 last:pb-0">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <span className="max-w-[65%] text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function BulletList({
  items,
  className,
  dense = false,
}: {
  items: string[];
  className?: string;
  dense?: boolean;
}) {
  return (
    <ul className={`${dense ? "space-y-1.5" : "space-y-2.5"} pl-1 text-sm leading-7 text-foreground ${className ?? ""}`}>
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="flex gap-2">
          <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function NotesBlock({ title }: { title: string }) {
  return (
    <div className="border-b border-border/60 py-4 first:pt-0 last:border-b-0 last:pb-0">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <div className="mt-3 space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="border-b border-dashed border-border pb-4" />
        ))}
      </div>
    </div>
  );
}
