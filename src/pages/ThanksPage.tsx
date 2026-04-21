import { ArrowLeft, ExternalLink, Instagram, MessageCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n";
import { buildWhatsAppUrl, INSTAGRAM_URL } from "@/lib/public-config";

export default function ThanksPage() {
  const navigate = useNavigate();
  const { locale } = useLocale();
  const [searchParams] = useSearchParams();
  const childName = searchParams.get("child") || "";
  const message =
    locale === "kz"
      ? `Сәлеметсіз бе! Мен ${childName || "балам"} бойынша Umay Kids тестінен кейін жазып тұрмын.`
      : `Здравствуйте! Пишу после прохождения теста в Umay Kids по ребенку ${childName || ""}.`;

  return (
    <AppShell contentClassName="flex items-center justify-center">
      <div className="glass-card-strong w-full max-w-2xl space-y-6 p-6 sm:p-8">
        <div className="space-y-3">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              {locale === "kz" ? "Рақмет! Өтініміңіз қабылданды" : "Спасибо! Мы получили вашу заявку"}
            </h1>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {locale === "kz"
                ? "Маман сізбен жақын арада хабарласады. Осы уақытта біздің Instagram парақшасындағы пайдалы материалдарды қарап шығуға болады."
                : "Мы свяжемся с вами в ближайшее время. Пока ждете ответа, можно посмотреть полезные материалы в нашем Instagram."}
            </p>
          </div>
        </div>

        <div className="rounded-[1.5rem] bg-muted/70 p-5 text-sm leading-7 text-foreground">
          {locale === "kz"
            ? "Қазір-ақ қайтадан WhatsApp ашып, жазбаны бекіте аласыз немесе орталық туралы көбірек біле аласыз."
            : "Вы можете повторно открыть WhatsApp, чтобы закрепить запись, или пока остаться в экосистеме Umay Kids и посмотреть полезный контент."}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="sm:flex-1" size="lg">
            <a href={buildWhatsAppUrl(message)} target="_blank" rel="noreferrer">
              <MessageCircle className="mr-2 h-4 w-4" />
              {locale === "kz" ? "WhatsApp қайта ашу" : "Снова открыть WhatsApp"}
            </a>
          </Button>
          <Button asChild variant="outline" className="sm:flex-1" size="lg">
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
              <Instagram className="mr-2 h-4 w-4" />
              Instagram
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>

        <Button variant="ghost" onClick={() => navigate("/")} className="w-full justify-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {locale === "kz" ? "Басты бетке оралу" : "Вернуться на главную"}
        </Button>
      </div>
    </AppShell>
  );
}
