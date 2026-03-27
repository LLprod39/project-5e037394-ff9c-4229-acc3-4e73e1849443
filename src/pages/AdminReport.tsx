import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { getSubmissionById } from '@/utils/storage';
import { questions } from '@/data/questionsConfig';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { RecommendationLevel } from '@/types/quiz';

const levelLabels: Record<RecommendationLevel, string> = {
  no_risk: '✅ Факторов риска не выявлено',
  attention: '⚠️ Требует наблюдения',
  consultation: '🔶 Рекомендована консультация',
  diagnosis: '🔴 Рекомендована диагностика',
};

export default function AdminReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const submission = id ? getSubmissionById(id) : undefined;

  if (!submission) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Анкета не найдена</p>
          <Button onClick={() => navigate('/admin')}>К списку анкет</Button>
        </div>
      </div>
    );
  }

  const { userInfo, result, answers, date } = submission;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      {/* Header — hidden in print */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2 border-b border-border/50 print:hidden">
        <button onClick={() => navigate('/admin')} className="p-2 -ml-2 rounded-xl hover:bg-muted">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <span className="text-sm font-semibold text-foreground">Отчёт</span>
        <div className="ml-auto flex gap-2">
          <button onClick={handlePrint} className="p-2 rounded-xl hover:bg-muted">
            <Printer className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>

      <div className="flex-1 px-5 py-6 space-y-6 max-w-2xl mx-auto w-full">
        {/* Title */}
        <div className="text-center print:text-left">
          <h1 className="text-xl font-extrabold text-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Отчёт по анкете
          </h1>
          <p className="text-sm text-muted-foreground">
            {new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* User Info */}
        <Section title="Данные ребёнка и родителя">
          <InfoRow label="Имя ребёнка" value={userInfo.childName} />
          <InfoRow label="Возраст" value={userInfo.childAge} />
          <InfoRow label="Родитель" value={userInfo.parentName} />
          <InfoRow label="Телефон" value={userInfo.phone} />
        </Section>

        {/* Result summary */}
        <Section title="Итоговая рекомендация">
          <p className="text-base font-bold text-foreground">{levelLabels[result.level]}</p>
          <p className="text-sm text-muted-foreground mt-1">{result.adminNote}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Балл: {result.totalScore} / {result.maxScore} ({Math.round((result.totalScore / result.maxScore) * 100)}%)
          </p>
        </Section>

        {/* Detailed factors */}
        {result.factors.length > 0 && (
          <Section title="Факторы риска">
            <ul className="space-y-1">
              {result.factors.map((f, i) => (
                <li key={i} className="text-sm text-foreground flex items-start gap-2">
                  <span className="text-[hsl(25,70%,70%)]">•</span> {f}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Detailed explanation */}
        <Section title="Подробное объяснение">
          <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
            {result.detailedExplanation}
          </pre>
        </Section>

        {/* All answers */}
        <Section title="Все ответы">
          <div className="space-y-4">
            {questions.map((q) => {
              const selectedIds = answers[q.id] || [];
              const selectedLabels = q.options
                .filter(o => selectedIds.includes(o.id))
                .map(o => {
                  const risk = o.riskLevel !== 'low' ? ` (${o.riskLevel === 'high' ? 'высокий' : 'средний'} риск)` : '';
                  return o.label + risk;
                });
              return (
                <div key={q.id}>
                  <p className="text-sm font-semibold text-foreground">{q.text}</p>
                  {selectedLabels.length > 0 ? (
                    <ul className="mt-1">
                      {selectedLabels.map((l, i) => (
                        <li key={i} className="text-sm text-muted-foreground">— {l}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Нет ответа</p>
                  )}
                </div>
              );
            })}
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border p-5 space-y-3 print:border-gray-300 print:rounded-none"
    >
      <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">{title}</h2>
      {children}
    </motion.div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}
