import { motion } from "framer-motion";
import { Layers3, MousePointerClick } from "lucide-react";
import { questionBlocks } from "@/data/questionsConfig";
import { Question } from "@/types/quiz";
import SelectableOption from "./SelectableOption";

interface QuestionCardProps {
  question: Question;
  selectedOptions: string[];
  onSelect: (questionId: string, optionId: string) => void;
}

export default function QuestionCard({ question, selectedOptions, onSelect }: QuestionCardProps) {
  const block = questionBlocks.find((item) => item.id === question.blockId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="glass-card-strong p-5 sm:p-6"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 xl:mb-6">
        <div className="section-chip">
          <Layers3 className="h-3.5 w-3.5 text-primary" />
          {block?.icon} {block?.title}
        </div>
        <div className="rounded-full bg-muted/75 px-3 py-1 text-xs font-semibold text-muted-foreground">
          {question.type === "multiple" ? "Можно выбрать несколько" : "Один вариант ответа"}
        </div>
      </div>

      <div className="mb-6 rounded-[24px] bg-[linear-gradient(180deg,rgba(111,157,203,0.08),rgba(255,255,255,0))] p-4 xl:p-5">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80 text-primary shadow-sm">
          <MousePointerClick className="h-5 w-5" />
        </div>
        <h3 className="text-[1.45rem] font-extrabold leading-[1.15] tracking-[-0.03em] text-foreground xl:text-[1.75rem]">
          {question.text}
        </h3>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Отвечайте так, как обычно происходит в жизни. Здесь нет «правильного» ответа.
        </p>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        {question.options.map((option, index) => (
          <SelectableOption
            key={option.id}
            label={option.label}
            selected={selectedOptions.includes(option.id)}
            onToggle={() => onSelect(question.id, option.id)}
            type={question.type}
            index={index}
          />
        ))}
      </div>
    </motion.div>
  );
}
