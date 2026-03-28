import { motion } from "framer-motion";
import { ArrowLeft, Home, SearchX, Sparkles } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="inner-page">
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
          <span className="inner-nav-title">Страница не найдена</span>
          <div style={{ width: 40 }} />
        </div>
      </motion.nav>

      <div className="notfound-wrapper">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="notfound-card"
        >
          <div className="notfound-icon-wrap">
            <SearchX className="h-10 w-10" />
          </div>

          <p className="notfound-code">404</p>
          <h1 className="notfound-title">Страница не найдена</h1>
          <p className="notfound-desc">
            Возможно, эта страница была удалена или вы ввели неверный адрес.
            Попробуйте вернуться на главную.
          </p>

          <div className="notfound-actions">
            <Button
              onClick={() => navigate("/")}
              className="hero-btn-primary"
              size="lg"
            >
              <Home className="h-4 w-4" />
              На главную
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="hero-btn-secondary"
              size="lg"
            >
              <ArrowLeft className="h-4 w-4" />
              Назад
            </Button>
          </div>
        </motion.div>
      </div>

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
