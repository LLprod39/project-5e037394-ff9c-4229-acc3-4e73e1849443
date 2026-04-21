import { motion } from "framer-motion";
import { useLocale } from "@/lib/i18n";
import { Question, QuizAnswerValue } from "@/types/quiz";
import { cn } from "@/lib/utils";
import QuestionIllustration from "./QuestionIllustration";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface QuestionCardProps {
  question: Question;
  selectedOptions: string[];
  answerValue?: QuizAnswerValue;
  onToggle: (optionId: string) => void;
  onCustomInputChange?: (value: string) => void;
}

export default function QuestionCard({
  question,
  selectedOptions,
  answerValue,
  onToggle,
  onCustomInputChange,
}: QuestionCardProps) {
  const { t } = useLocale();
  const blockTitle = {
    perinatal: t({ ru: "Беременность и роды", kz: "Жүктілік және босану" }),
    motor: t({ ru: "Моторика", kz: "Моторика" }),
    communication: t({ ru: "Коммуникация", kz: "Коммуникация" }),
  }[question.blockId];
  const customValue =
    question.customInput &&
    typeof answerValue === "string" &&
    !question.options.some((option) => option.id === answerValue)
      ? answerValue
      : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="glass-card-strong space-y-5 p-5 sm:p-6"
    >
      <div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {blockTitle}
        </p>
        <h2 className="text-[1.45rem] font-black leading-tight tracking-[-0.03em] text-foreground">
          {t(question.text)}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {question.helperText
            ? t(question.helperText)
            : question.type === "multiple"
              ? t({ ru: "Можно выбрать несколько", kz: "Бірнешеуін таңдауға болады" })
              : t({ ru: "Один вариант ответа", kz: "Бір жауап нұсқасы" })}
        </p>
      </div>

      <QuestionIllustration kind={question.illustration} />

      <div className="grid gap-3">
        {question.customInput ? (
          <div className="rounded-[1.5rem] border border-white/70 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-5">
            <p className="text-sm font-semibold text-foreground">{t(question.customInput.inputLabel)}</p>
            {question.customInput.multiline ? (
              <Textarea
                value={customValue}
                onChange={(event) => onCustomInputChange?.(event.target.value)}
                placeholder={t(question.customInput.placeholder)}
                className="mt-3 min-h-[140px] rounded-[1rem] border-primary/20 bg-background/90 text-base leading-7"
              />
            ) : (
              <Input
                value={customValue}
                onChange={(event) => onCustomInputChange?.(event.target.value)}
                placeholder={t(question.customInput.placeholder)}
                inputMode="numeric"
                className="mt-3 h-14 rounded-[1rem] border-primary/20 text-lg font-semibold tracking-[0.08em]"
              />
            )}
          </div>
        ) : null}

        {question.options.map((option) => {
          const isSelected = selectedOptions.includes(option.id);

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onToggle(option.id)}
              className={cn(
                "rounded-[1.5rem] border px-4 py-4 text-left text-base font-semibold leading-6 transition-all sm:px-5 sm:py-5",
                isSelected
                  ? "border-primary/40 bg-primary/10 text-foreground shadow-[0_18px_32px_-22px_rgba(92,132,175,0.55)]"
                  : "border-white/70 bg-white/75 text-foreground shadow-sm hover:border-primary/20 hover:bg-white dark:border-white/10 dark:bg-white/5"
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                    isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"
                  )}
                >
                  <div className={cn("h-2.5 w-2.5 rounded-full bg-white", !isSelected && "hidden")} />
                </div>
                <div className="space-y-1">
                  <p>{t(option.label)}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
