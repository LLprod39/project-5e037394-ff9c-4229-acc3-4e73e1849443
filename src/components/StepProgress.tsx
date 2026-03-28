import { motion } from "framer-motion";
import { getQuestionsByBlock, questionBlocks } from "@/data/questionsConfig";

interface StepProgressProps {
  currentBlockIndex: number;
  currentQuestionInBlock: number;
  totalQuestionsInBlock: number;
  layout?: "top" | "sidebar";
}

export default function StepProgress({
  currentBlockIndex,
  currentQuestionInBlock,
  totalQuestionsInBlock,
  layout = "top",
}: StepProgressProps) {
  const totalQuestions = questionBlocks.reduce(
    (sum, block) => sum + getQuestionsByBlock(block.id).length,
    0
  );
  const completedQuestionsBeforeCurrent = questionBlocks
    .slice(0, currentBlockIndex)
    .reduce((sum, block) => sum + getQuestionsByBlock(block.id).length, 0);

  const currentQuestionNumber = completedQuestionsBeforeCurrent + currentQuestionInBlock + 1;
  const overallProgress = totalQuestions > 0 ? (currentQuestionNumber / totalQuestions) * 100 : 0;
  const currentBlock = questionBlocks[currentBlockIndex];
  const isSidebar = layout === "sidebar";

  return (
    <div className={isSidebar ? "z-20" : "sticky top-[5.25rem] z-20 pb-4"}>
      <div className={isSidebar ? "glass-card space-y-4 px-5 py-5" : "glass-card space-y-4 px-4 py-4"}>
        <div className={`flex gap-3 ${isSidebar ? "flex-col" : "flex-wrap items-center justify-between"}`}>
          <div>
            <p className="section-chip">
              {currentBlock?.icon} Блок {currentBlockIndex + 1}
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">{currentBlock?.title}</p>
          </div>
          <div className="rounded-[20px] bg-muted/70 px-3 py-2 text-right">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Прогресс</p>
            <p className="mt-1 text-sm font-bold text-foreground">
              {currentQuestionNumber} / {totalQuestions}
            </p>
          </div>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-[rgba(242,235,228,0.95)]">
          <motion.div
            className="h-full rounded-full bg-[linear-gradient(90deg,rgba(111,157,203,1)_0%,rgba(160,196,228,1)_100%)]"
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          />
        </div>

        <div className={`grid gap-2 ${isSidebar ? "grid-cols-1" : "grid-cols-3"}`}>
          {questionBlocks.map((block, index) => {
            const isActive = index === currentBlockIndex;
            const isCompleted = index < currentBlockIndex;
            return (
              <div
                key={block.id}
                className={[
                  "rounded-[18px] px-3 py-2 text-xs font-semibold transition-colors",
                  isSidebar ? "flex items-center justify-between text-left" : "text-center",
                  isActive
                    ? "bg-primary/12 text-primary"
                    : isCompleted
                      ? "bg-accent/20 text-accent-foreground"
                      : "bg-muted/70 text-muted-foreground",
                ].join(" ")}
              >
                <span>
                  <span className="mr-1">{block.icon}</span>
                  {isSidebar ? block.title : index + 1}
                </span>
                {isSidebar ? <span className="text-[11px] opacity-70">{index + 1}</span> : null}
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground">
          В этом блоке вопрос {currentQuestionInBlock + 1} из {totalQuestionsInBlock}
        </p>
      </div>
    </div>
  );
}
