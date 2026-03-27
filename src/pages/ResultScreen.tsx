import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { getSubmissionById } from '@/utils/storage';
import { Heart, AlertTriangle, CheckCircle2, Stethoscope, MessageCircle } from 'lucide-react';
import { RecommendationLevel } from '@/types/quiz';

const levelConfig: Record<RecommendationLevel, { icon: React.ReactNode; color: string; bgColor: string }> = {
  no_risk: {
    icon: <CheckCircle2 className="w-10 h-10" />,
    color: 'text-accent',
    bgColor: 'bg-accent/10',
  },
  attention: {
    icon: <Heart className="w-10 h-10" />,
    color: 'text-[hsl(25,70%,70%)]',
    bgColor: 'bg-[hsl(25,70%,70%)]/10',
  },
  consultation: {
    icon: <MessageCircle className="w-10 h-10" />,
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
  },
  diagnosis: {
    icon: <Stethoscope className="w-10 h-10" />,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
};

export default function ResultScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const submission = id ? getSubmissionById(id) : undefined;

  if (!submission) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Результат не найден</p>
          <Button onClick={() => navigate('/')}>На главную</Button>
        </div>
      </div>
    );
  }

  const { result } = submission;
  const config = levelConfig[result.level];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <div className="flex-1 px-5 py-8 space-y-6">
        {/* Icon & Title */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <div className={`w-20 h-20 rounded-3xl ${config.bgColor} flex items-center justify-center mx-auto ${config.color}`}>
            {config.icon}
          </div>
          <h1
            className="text-xl font-extrabold text-foreground leading-tight"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            {result.title}
          </h1>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-[15px] text-muted-foreground leading-relaxed"
        >
          {result.description}
        </motion.p>

        {/* Risk factors */}
        {result.factors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-2xl border border-border p-5 space-y-3"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[hsl(25,70%,70%)]" />
              <h3 className="text-sm font-bold text-foreground">На что обратили внимание</h3>
            </div>
            <ul className="space-y-2">
              {result.factors.map((factor, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[hsl(25,70%,70%)] flex-shrink-0 mt-1.5" />
                  {factor}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Why this matters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-primary/5 rounded-2xl p-5 space-y-2"
        >
          <h3 className="text-sm font-bold text-foreground">Почему это важно?</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Раннее выявление особенностей развития позволяет вовремя начать поддерживающие занятия.
            Чем раньше ребёнок получает помощь, тем лучше результаты. В нашем центре работают
            опытные специалисты, которые помогут разобраться в ситуации и подобрать программу развития.
          </p>
        </motion.div>
      </div>

      {/* Bottom CTAs */}
      <div className="sticky bottom-0 px-5 py-4 bg-background/95 backdrop-blur-sm border-t border-border/50 safe-bottom space-y-3">
        <Button
          onClick={() => window.open('tel:+78001234567')}
          className="w-full h-14 text-base font-bold rounded-2xl"
          size="lg"
        >
          Записаться на консультацию
        </Button>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/about')}
            className="flex-1 h-12 rounded-2xl font-semibold"
          >
            О центре
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex-1 h-12 rounded-2xl font-semibold"
          >
            На главную
          </Button>
        </div>
      </div>
    </div>
  );
}
