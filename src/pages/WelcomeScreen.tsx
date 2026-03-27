import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Heart, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6"
        >
          <Heart className="w-10 h-10 text-primary" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-2xl font-extrabold text-foreground mb-3 leading-tight"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          Тест на развитие ребёнка
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-base text-muted-foreground mb-8 max-w-xs leading-relaxed"
        >
          Ответьте на несколько вопросов, чтобы понять, стоит ли пройти диагностику или обратиться к специалисту
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-full max-w-xs"
        >
          <Button
            onClick={() => navigate('/quiz')}
            className="w-full h-14 text-base font-bold rounded-2xl shadow-lg shadow-primary/20"
            size="lg"
          >
            Начать тест
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex items-start gap-2 mt-8 px-4 py-3 bg-muted/60 rounded-xl max-w-xs"
        >
          <ShieldCheck className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground text-left leading-relaxed">
            Это не медицинский диагноз, а предварительная рекомендация. Результаты носят ориентировочный характер.
          </p>
        </motion.div>
      </div>

      <div className="px-6 py-4 text-center">
        <button
          onClick={() => navigate('/about')}
          className="text-sm text-primary font-medium"
        >
          О центре
        </button>
      </div>
    </div>
  );
}
