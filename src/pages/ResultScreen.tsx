import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Heart,
  Home,
  LoaderCircle,
  MessageCircle,
  Phone,
  RefreshCw,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getSubmissionById } from "@/lib/submissions-api";
import { RecommendationLevel } from "@/types/quiz";

const levelConfig: Record<
  RecommendationLevel,
  { icon: React.ReactNode; color: string; bgColor: string; accentText: string }
> = {
  no_risk: {
    icon: <CheckCircle2 className="h-10 w-10" />,
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/15",
    accentText: "Норма развития по текущим ответам",
  },
  attention: {
    icon: <Heart className="h-10 w-10" />,
    color: "text-amber-600",
    bgColor: "bg-amber-500/15",
    accentText: "Есть сигналы для наблюдения",
  },
  consultation: {
    icon: <MessageCircle className="h-10 w-10" />,
    color: "text-purple-600",
    bgColor: "bg-purple-500/15",
    accentText: "Стоит обсудить со специалистом",
  },
  diagnosis: {
    icon: <Stethoscope className="h-10 w-10" />,
    color: "text-blue-600",
    bgColor: "bg-blue-500/15",
    accentText: "Нужна более глубокая диагностика",
  },
};

export default function ResultScreen() {
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
      <div className="inner-page">
        <div className="result-loading-wrapper">
          <div className="result-loading-card">
            <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="result-loading-text">Загружаем результат...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="inner-page">
        <div className="result-loading-wrapper">
          <div className="result-loading-card">
            <p className="result-loading-text" style={{ color: "hsl(201, 27%, 19%)" }}>
              {error instanceof Error ? error.message : "Не удалось загрузить результат."}
            </p>
            <div className="result-error-actions">
              <Button onClick={() => refetch()} variant="outline" className="hero-btn-secondary" size="lg">
                <RefreshCw className="h-4 w-4" />
                Повторить
              </Button>
              <Button onClick={() => navigate("/")} className="hero-btn-primary" size="lg">
                <Home className="h-4 w-4" />
                На главную
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="inner-page">
        <div className="result-loading-wrapper">
          <div className="result-loading-card">
            <p className="result-loading-text">Результат не найден</p>
            <Button onClick={() => navigate("/")} className="hero-btn-primary" size="lg">
              <Home className="h-4 w-4" />
              На главную
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { result } = submission;
  const config = levelConfig[result.level];
  const percentage = Math.round((result.totalScore / result.maxScore) * 100);

  return (
    <div className="inner-page">
      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="inner-nav"
      >
        <div className="inner-nav-inner">
          <button onClick={() => navigate("/")} className="inner-nav-back">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="inner-nav-center">
            <span className="inner-nav-title">Результат теста</span>
            <span className="inner-nav-subtitle">Предварительная рекомендация</span>
          </div>
          <div style={{ width: 40 }} />
        </div>
      </motion.nav>

      {/* Result content */}
      <div className="result-content">
        {/* Main result card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="result-main-card"
        >
          <div className="result-header">
            <div>
              <div className="section-chip-new" style={{ marginBottom: 12 }}>
                <Sparkles className="h-3.5 w-3.5" />
                {config.accentText}
              </div>
              <h1 className="result-title">{result.title}</h1>
              <p className="result-desc">{result.description}</p>
            </div>
            <div className={`result-icon ${config.bgColor} ${config.color}`}>
              {config.icon}
            </div>
          </div>

          <div className="result-stats-row">
            <div className="result-stat-card">
              <p className="result-stat-label">Оценка риска</p>
              <p className="result-stat-value">{percentage}%</p>
              <p className="result-stat-hint">
                Балл {result.totalScore} из {result.maxScore}
              </p>
            </div>
            <div className="result-stat-card">
              <p className="result-stat-label">Что делать дальше</p>
              <p className="result-stat-text">
                Обсудите результат с администратором или специалистом центра для
                определения дальнейшего маршрута.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Factors */}
        {result.factors.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="result-factors"
          >
            <div className="result-factors-header">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h2 className="result-factors-title">На что система обратила внимание</h2>
            </div>
            <div className="result-factors-grid">
              {result.factors.map((factor) => (
                <div key={factor} className="result-factor-item">
                  <p>{factor}</p>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Detailed explanation */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="result-explanation"
        >
          <h2 className="result-explanation-title">Подробное пояснение</h2>
          <pre className="result-explanation-text">
            {result.detailedExplanation}
          </pre>
        </motion.section>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="result-actions"
        >
          <Button
            onClick={() => window.open("tel:+78001234567")}
            className="hero-btn-primary"
            size="lg"
          >
            <Phone className="h-4 w-4" />
            Записаться на консультацию
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/about")}
            className="hero-btn-secondary"
            size="lg"
          >
            Подробнее о центре
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="hero-btn-secondary"
            size="lg"
          >
            <Home className="h-4 w-4" />
            На главную
          </Button>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="welcome-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="nav-logo-icon">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="footer-brand-name">
              Центр развития особенных детей
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
