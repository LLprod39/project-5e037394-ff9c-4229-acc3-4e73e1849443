import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Brain,
  CheckCircle2,
  Clock,
  HeartHandshake,
  MessageCircle,
  Phone,
  Shield,
  Sparkles,
  Star,
  Stethoscope,
  UsersRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

/* ─── Data ─── */

const stats = [
  { value: "2 000+", label: "семей прошли скрининг" },
  { value: "5 мин", label: "на прохождение теста" },
  { value: "12+", label: "специалистов в команде" },
];

const services = [
  {
    icon: Stethoscope,
    title: "Диагностика развития",
    text: "Первичный скрининг и маршрутизация к нужному специалисту — без стресса и ожидания.",
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: Brain,
    title: "Нейропсихология",
    text: "Нейропсихолог определяет особенности развития и предлагает понятный план поддержки.",
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  {
    icon: UsersRound,
    title: "Команда специалистов",
    text: "Логопед, дефектолог, нейропсихолог и специалисты ранней помощи работают вместе.",
    gradient: "from-emerald-500/20 to-teal-500/20",
  },
  {
    icon: HeartHandshake,
    title: "Поддержка семьи",
    text: "Мы сопровождаем не только ребёнка, но и помогаем родителям на каждом этапе.",
    gradient: "from-amber-500/20 to-orange-500/20",
  },
];

const steps = [
  {
    num: "01",
    title: "Пройдите онлайн-тест",
    text: "Ответьте на вопросы о развитии ребёнка — это занимает всего 5 минут.",
    icon: MessageCircle,
  },
  {
    num: "02",
    title: "Получите рекомендацию",
    text: "Система формирует мягкую предварительную рекомендацию без пугающих терминов.",
    icon: CheckCircle2,
  },
  {
    num: "03",
    title: "Запишитесь на консультацию",
    text: "Администратор предложит консультацию или диагностику, если это нужно.",
    icon: Phone,
  },
];

const testimonials = [
  {
    text: "Тест помог понять, что не нужно паниковать, а нужно просто сходить к логопеду. Спасибо за спокойный подход!",
    author: "Анна М.",
    role: "мама, ребёнку 3 года",
  },
  {
    text: "Очень деликатный формат. Никаких страшных слов — только понятные рекомендации и поддержка.",
    author: "Елена К.",
    role: "мама, ребёнку 2.5 года",
  },
  {
    text: "Прошли тест вечером, утром уже созвонились с центром. Быстро и без лишнего стресса.",
    author: "Дмитрий С.",
    role: "папа, ребёнку 4 года",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function WelcomeScreen() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="welcome-page">
      {/* ═══ Floating Nav ═══ */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="welcome-nav"
      >
        <div className="welcome-nav-inner">
          <div className="nav-brand">
            <div className="nav-logo-icon">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="nav-logo-text">Центр развития</span>
          </div>
          <div className="nav-links">
            <button onClick={() => navigate("/about")} className="nav-link">
              О центре
            </button>
            <button
              onClick={() => navigate("/quiz")}
              className="nav-cta-btn"
            >
              Пройти тест
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ═══ HERO ═══ */}
      <section ref={heroRef} className="hero-section">
        {/* Animated background orbs */}
        <div className="hero-bg-orbs">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="hero-content"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hero-text-area"
          >
            <div className="hero-badge">
              <Shield className="h-3.5 w-3.5" />
              Бережный подход · Без стресса · Результат сразу
            </div>
            <h1 className="hero-main-title">
              Спокойная помощь для{" "}
              <span className="hero-title-accent">вашего ребёнка</span>
            </h1>
            <p className="hero-subtitle">
              Пройдите бесплатный онлайн-скрининг развития за 5 минут. Без
              резких формулировок, с понятным следующим шагом и поддержкой
              специалистов.
            </p>

            <div className="hero-actions">
              <Button
                onClick={() => navigate("/quiz")}
                className="hero-btn-primary"
                size="lg"
              >
                Пройти тест бесплатно
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open("tel:+78001234567")}
                className="hero-btn-secondary"
                size="lg"
              >
                <Phone className="h-4 w-4" />
                Позвонить
              </Button>
            </div>

            <div className="hero-trust-markers">
              <div className="hero-trust-item">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Бесплатно</span>
              </div>
              <div className="hero-trust-item">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>5 минут</span>
              </div>
              <div className="hero-trust-item">
                <Shield className="h-4 w-4 text-purple-500" />
                <span>Конфиденциально</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="hero-image-area"
          >
            <div className="hero-image-wrapper">
              <img
                src="/hero-illustration.png"
                alt="Мама с ребёнком"
                className="hero-image"
              />
              <div className="hero-image-glow" />
            </div>

            {/* Floating stat cards */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="floating-card floating-card-left"
            >
              <Star className="h-5 w-5 text-amber-400" />
              <div>
                <p className="floating-card-value">4.9 / 5</p>
                <p className="floating-card-label">Отзывы родителей</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="floating-card floating-card-right"
            >
              <BadgeCheck className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="floating-card-value">2 000+</p>
                <p className="floating-card-label">Семей доверяют</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ STATS BAR ═══ */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="stats-section"
      >
        <div className="stats-inner">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              custom={i}
              className="stat-item"
            >
              <p className="stat-value">{stat.value}</p>
              <p className="stat-label">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ═══ SERVICES ═══ */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="services-section section-container"
      >
        <motion.div variants={fadeUp} custom={0} className="section-header">
          <div className="section-chip-new">
            <Sparkles className="h-3.5 w-3.5" />
            Наши услуги
          </div>
          <h2 className="section-title">
            Комплексная поддержка развития ребёнка
          </h2>
          <p className="section-desc">
            Мы помогаем семьям увидеть сигналы развития, выстроить маршрут и
            получить профессиональную помощь вовремя.
          </p>
        </motion.div>

        <div className="services-grid">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                variants={fadeUp}
                custom={i + 1}
                className="service-card"
              >
                <div className={`service-icon-wrap bg-gradient-to-br ${service.gradient}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-text">{service.text}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="how-section">
        <div className="how-bg-gradient" />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="section-container"
        >
          <motion.div variants={fadeUp} custom={0} className="section-header">
            <div className="section-chip-new section-chip-light">
              <BadgeCheck className="h-3.5 w-3.5" />
              Как это работает
            </div>
            <h2 className="section-title section-title-light">
              Три простых шага к спокойствию
            </h2>
            <p className="section-desc section-desc-light">
              Весь процесс занимает несколько минут и не требует специальной
              подготовки.
            </p>
          </motion.div>

          <div className="steps-grid">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.num}
                  variants={fadeUp}
                  custom={i + 1}
                  className="step-card"
                >
                  <div className="step-number">{step.num}</div>
                  <div className="step-icon-wrap">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-text">{step.text}</p>
                </motion.div>
              );
            })}
          </div>

          <motion.div variants={fadeUp} custom={4} className="how-cta-wrap">
            <Button
              onClick={() => navigate("/quiz")}
              className="how-cta-btn"
              size="lg"
            >
              Начать тест сейчас
              <ArrowRight className="h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="testimonials-section section-container"
      >
        <motion.div variants={fadeUp} custom={0} className="section-header">
          <div className="section-chip-new">
            <Star className="h-3.5 w-3.5" />
            Отзывы
          </div>
          <h2 className="section-title">Что говорят родители</h2>
          <p className="section-desc">
            Реальные истории семей, которые прошли наш скрининг и получили
            поддержку.
          </p>
        </motion.div>

        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.author}
              variants={fadeUp}
              custom={i + 1}
              className="testimonial-card"
            >
              <div className="testimonial-stars">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">
                  {t.author[0]}
                </div>
                <div>
                  <p className="testimonial-name">{t.author}</p>
                  <p className="testimonial-role">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="final-cta-section">
        <div className="final-cta-bg" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="final-cta-content"
        >
          <div className="final-cta-badge">
            <Shield className="h-4 w-4" />
            Это бесплатно и конфиденциально
          </div>
          <h2 className="final-cta-title">
            Готовы сделать первый шаг?
          </h2>
          <p className="final-cta-desc">
            Пройдите тест прямо сейчас и получите бережную рекомендацию. Это не
            диагноз — это спокойный ориентир для вашей семьи.
          </p>
          <div className="final-cta-actions">
            <Button
              onClick={() => navigate("/quiz")}
              className="final-cta-primary"
              size="lg"
            >
              Пройти тест ребёнка
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/about")}
              className="final-cta-secondary"
              size="lg"
            >
              Подробнее о центре
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ═══ FOOTER ═══ */}
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
          <div className="footer-contacts">
            <a href="tel:+78001234567" className="footer-link">
              <Phone className="h-4 w-4" />
              +7 (800) 123-45-67
            </a>
            <span className="footer-divider">·</span>
            <span className="footer-text">Пн-Сб: 9:00-20:00</span>
          </div>
          <p className="footer-copy">
            © {new Date().getFullYear()} Центр развития. Бережная поддержка
            развития вашего ребёнка.
          </p>
        </div>
      </footer>
    </div>
  );
}
