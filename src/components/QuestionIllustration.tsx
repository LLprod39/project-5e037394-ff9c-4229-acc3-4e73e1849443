import { Baby, Hand, Handshake, Waves } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { IllustrationKey } from "@/types/quiz";

export default function QuestionIllustration({ kind }: { kind?: IllustrationKey }) {
  const { t } = useLocale();

  if (!kind) {
    return null;
  }

  const map: Record<
    IllustrationKey,
    { icon?: any; title?: { ru: string; kz: string }; text: { ru: string; kz: string } }
  > = {
    pointing: {
      text: {
        ru: "Показывает пальцем, чтобы разделить интерес с взрослым.",
        kz: "Ересекпен қызығушылықты бөлісу үшін саусағымен көрсетеді.",
      },
    },
    crawling: {
      text: {
        ru: "Нормой считаем ползание на четвереньках с перекрестным движением.",
        kz: "Қалыптысы — төрт тағандап айқас қимылмен еңбектеу.",
      },
    },
    ivl: {
      text: {
        ru: "Искусственная вентиляция легких после рождения относится к важным данным анамнеза.",
        kz: "Туғаннан кейінгі жасанды өкпе желдетуі анамнездегі маңызды дерек болып саналады.",
      },
    },
    "shared-attention": {
      text: {
        ru: "Ребенок приносит игрушку не за помощью, а чтобы поделиться интересом.",
        kz: "Бала ойыншықты көмек сұрау үшін емес, қызығушылығын бөлісу үшін әкеледі.",
      },
    },
  };

  const illustration = map[kind];
  const Icon = illustration.icon;

  return (
    <div className="rounded-[1.5rem] bg-muted/65 p-4 text-sm leading-6 text-muted-foreground">
      {Icon && (
        <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      )}
      {illustration.title && (
        <p className="font-semibold text-foreground">{t(illustration.title)}</p>
      )}
      <p className={illustration.title ? "mt-1" : ""}>{t(illustration.text)}</p>
    </div>
  );
}
