import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, Phone, MapPin, Clock } from 'lucide-react';

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-muted">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <span className="text-sm font-semibold text-foreground">О центре</span>
      </div>

      <div className="flex-1 px-5 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Центр развития
          </h1>
          <p className="text-sm text-muted-foreground">Помогаем детям раскрывать свой потенциал</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-border p-5 space-y-3"
        >
          <p className="text-[15px] text-foreground leading-relaxed">
            Наш центр специализируется на раннем развитии и помощи детям с особенностями развития.
            Мы работаем с детьми от 6 месяцев и используем современные методики диагностики и коррекции.
          </p>
          <p className="text-[15px] text-foreground leading-relaxed">
            В нашей команде — логопеды, дефектологи, нейропсихологи, специалисты по сенсорной интеграции
            и ABA-терапии. Каждый ребёнок получает индивидуальную программу.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          {[
            { icon: <Phone className="w-5 h-5" />, title: 'Телефон', value: '+7 (800) 123-45-67' },
            { icon: <MapPin className="w-5 h-5" />, title: 'Адрес', value: 'г. Москва, ул. Примерная, 10' },
            { icon: <Clock className="w-5 h-5" />, title: 'Часы работы', value: 'Пн–Сб: 9:00–20:00' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 bg-card rounded-2xl border border-border p-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{item.title}</p>
                <p className="text-sm font-semibold text-foreground">{item.value}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="sticky bottom-0 px-5 py-4 bg-background/95 backdrop-blur-sm border-t border-border/50 safe-bottom">
        <Button
          onClick={() => window.open('tel:+78001234567')}
          className="w-full h-14 text-base font-bold rounded-2xl"
          size="lg"
        >
          Позвонить нам
        </Button>
      </div>
    </div>
  );
}
