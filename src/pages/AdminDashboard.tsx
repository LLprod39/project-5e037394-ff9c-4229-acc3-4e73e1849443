import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { getSubmissions, generateMockData } from '@/utils/storage';
import { Submission, RecommendationLevel } from '@/types/quiz';
import { ArrowLeft, FileText, ChevronRight } from 'lucide-react';

const levelBadge: Record<RecommendationLevel, { label: string; className: string }> = {
  no_risk: { label: 'Норма', className: 'bg-accent/20 text-accent-foreground' },
  attention: { label: 'Внимание', className: 'bg-[hsl(25,70%,70%)]/20 text-[hsl(25,80%,25%)]' },
  consultation: { label: 'Консультация', className: 'bg-secondary/20 text-secondary-foreground' },
  diagnosis: { label: 'Диагностика', className: 'bg-primary/20 text-primary' },
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    generateMockData();
    setSubmissions(getSubmissions().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <div className="flex items-center gap-3 px-4 pt-4 pb-2 border-b border-border/50">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-xl hover:bg-muted">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <span className="text-sm font-semibold text-foreground">Панель администратора</span>
      </div>

      <div className="flex-1 px-5 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Анкеты
          </h1>
          <span className="text-sm text-muted-foreground">{submissions.length} записей</span>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Пока нет заполненных анкет</p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((sub, i) => {
              const badge = levelBadge[sub.result.level];
              return (
                <motion.button
                  key={sub.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/admin/report/${sub.id}`)}
                  className="w-full text-left bg-card rounded-2xl border border-border p-4 flex items-center gap-3 active:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-foreground truncate">
                        {sub.userInfo.childName}
                      </p>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {sub.userInfo.parentName} · {sub.userInfo.childAge}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(sub.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
