import { motion } from "framer-motion";
import { questionBlocks } from "@/data/questionsConfig";
import { useLocale } from "@/lib/i18n";

interface StepProgressProps {
  currentBlockIndex: number;
  currentQuestionInBlock: number;
  totalQuestionsInBlock: number;
  answeredQuestionsCount: number;
  totalQuestions: number;
}

export default function StepProgress({
  currentBlockIndex,
  currentQuestionInBlock,
  totalQuestionsInBlock,
  answeredQuestionsCount,
  totalQuestions,
}: StepProgressProps) {
  const { t } = useLocale();
  const overallProgress = totalQuestions > 0 ? (answeredQuestionsCount / totalQuestions) * 100 : 0;
  const currentBlock = questionBlocks[currentBlockIndex];

  return (
    <div className="glass-card space-y-4 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {t({ ru: "Шаг", kz: "Қадам" })} {currentBlockIndex + 1} {t({ ru: "из", kz: "/" })}{" "}
            {questionBlocks.length}
          </p>

        </div>
        <div className="rounded-full bg-muted/70 px-3 py-2 text-xs font-semibold text-muted-foreground">
          {currentQuestionInBlock + 1}/{totalQuestionsInBlock}
        </div>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${overallProgress}%` }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {questionBlocks.map((block, index) => {
          const isActive = index === currentBlockIndex;
          const isDone = index < currentBlockIndex;

          return (
            <div
              key={block.id}
              className={[
                "rounded-[1rem] px-3 py-2 text-center text-xs font-semibold transition",
                isActive
                  ? "bg-primary/12 text-primary"
                  : isDone
                    ? "bg-accent/20 text-accent-foreground"
                    : "bg-muted/70 text-muted-foreground",
              ].join(" ")}
            >
              {t(block.shortTitle)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
