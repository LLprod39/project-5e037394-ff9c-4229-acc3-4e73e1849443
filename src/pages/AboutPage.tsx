import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Clock3,
  HeartHandshake,
  MapPin,
  Phone,
  Sparkles,
  Stethoscope,
  UsersRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const team = [
  {
    icon: Stethoscope,
    title: "Педиатр развития",
    text: "Отслеживает динамику раннего развития и координирует работу всей команды.",
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: Brain,
    title: "Нейропсихолог",
    text: "Оценивает когнитивные функции, внимание и особенности нервной системы ребёнка.",
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  {
    icon: UsersRound,
    title: "Логопед и дефектолог",
    text: "Работают с речью, коммуникацией и помогают формировать необходимые навыки.",
    gradient: "from-emerald-500/20 to-teal-500/20",
  },
  {
    icon: HeartHandshake,
    title: "Специалист ранней помощи",
    text: "Сопровождает семью от первого обращения до устойчивого результата.",
    gradient: "from-amber-500/20 to-orange-500/20",
  },
];

const directions = [
  { title: "Логопед и дефектолог", desc: "Речевое развитие и коммуникация" },
  { title: "Нейропсихологическая диагностика", desc: "Когнитивные функции и внимание" },
  { title: "Сенсорная интеграция", desc: "Работа с сенсорными особенностями" },
  { title: "Индивидуальные маршруты", desc: "Персональный план для каждого ребёнка" },
];

const contacts = [
  { icon: Phone, title: "Телефон", value: "+7 (800) 123-45-67", href: "tel:+78001234567" },
  { icon: MapPin, title: "Адрес", value: "г. Москва, ул. Примерная, 10", href: undefined },
  { icon: Clock3, title: "Часы работы", value: "Пн-Сб: 9:00-20:00", href: undefined },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function AboutPage() {
  const navigate = useNavigate();

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
          <button onClick={() => navigate(-1)} className="inner-nav-back">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="inner-nav-title">О центре</span>
          <button onClick={() => navigate("/quiz")} className="inner-nav-cta">
            Пройти тест
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="inner-hero">
        <div className="inner-hero-orbs">
          <div className="inner-orb inner-orb-1" />
          <div className="inner-orb inner-orb-2" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="inner-hero-content"
        >
          <div className="section-chip-new">
            <Sparkles className="h-3.5 w-3.5" />
            Пространство поддержки
          </div>
          <h1 className="inner-hero-title">
            Центр, где родителю объясняют{" "}
            <span className="hero-title-accent">спокойно</span>, а ребёнку
            помогают вовремя
          </h1>
          <p className="inner-hero-desc">
            Мы специализируемся на раннем развитии и диагностике особенностей у
            детей. Наша задача — не напугать, а дать понятный маршрут: что
            наблюдать, к кому идти и как выстроить поддержку.
          </p>
        </motion.div>
      </section>

      {/* Team */}
      <motion.section
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="section-container"
      >
        <motion.div variants={fadeUp} custom={0} className="section-header">
          <div className="section-chip-new">
            <UsersRound className="h-3.5 w-3.5" />
            Наша команда
          </div>
          <h2 className="section-title">Специалисты ранней помощи</h2>
          <p className="section-desc">
            Каждый специалист работает в связке с командой, чтобы ребёнок получил
            максимально эффективную поддержку.
          </p>
        </motion.div>

        <div className="services-grid">
          {team.map((member, i) => {
            const Icon = member.icon;
            return (
              <motion.div
                key={member.title}
                variants={fadeUp}
                custom={i + 1}
                className="service-card"
              >
                <div className={`service-icon-wrap bg-gradient-to-br ${member.gradient}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="service-title">{member.title}</h3>
                <p className="service-text">{member.text}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Directions */}
      <section className="directions-section">
        <div className="how-bg-gradient" />
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="section-container"
          style={{ position: "relative", zIndex: 1 }}
        >
          <motion.div variants={fadeUp} custom={0} className="section-header">
            <div className="section-chip-new section-chip-light">
              <Sparkles className="h-3.5 w-3.5" />
              Направления
            </div>
            <h2 className="section-title section-title-light">
              Чем мы помогаем
            </h2>
          </motion.div>

          <div className="directions-grid">
            {directions.map((dir, i) => (
              <motion.div
                key={dir.title}
                variants={fadeUp}
                custom={i + 1}
                className="direction-card"
              >
                <div className="direction-dot" />
                <div>
                  <p className="direction-title">{dir.title}</p>
                  <p className="direction-desc">{dir.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Contacts */}
      <motion.section
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="section-container"
      >
        <motion.div variants={fadeUp} custom={0} className="section-header">
          <div className="section-chip-new">
            <Phone className="h-3.5 w-3.5" />
            Контакты
          </div>
          <h2 className="section-title">Свяжитесь с нами</h2>
        </motion.div>

        <div className="contacts-grid">
          {contacts.map((item, i) => {
            const Icon = item.icon;
            const Tag = item.href ? "a" : "div";
            return (
              <motion.div key={item.title} variants={fadeUp} custom={i + 1}>
                <Tag
                  {...(item.href ? { href: item.href } : {})}
                  className="contact-card"
                >
                  <div className="contact-icon">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="contact-label">{item.title}</p>
                    <p className="contact-value">{item.value}</p>
                  </div>
                </Tag>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* CTA */}
      <section className="about-cta-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="about-cta-card"
        >
          <h2 className="about-cta-title">Хотите узнать больше?</h2>
          <p className="about-cta-desc">
            Пройдите бесплатный онлайн-тест и получите бережную рекомендацию по
            развитию вашего ребёнка.
          </p>
          <div className="about-cta-actions">
            <Button
              onClick={() => navigate("/quiz")}
              className="hero-btn-primary"
              size="lg"
            >
              Пройти тест
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
        </motion.div>
      </section>

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
          <p className="footer-copy">
            © {new Date().getFullYear()} Центр развития. Бережная поддержка
            развития вашего ребёнка.
          </p>
        </div>
      </footer>
    </div>
  );
}
