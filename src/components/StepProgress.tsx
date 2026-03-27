import { motion } from 'framer-motion';
import { questionBlocks } from '@/data/questionsConfig';

interface StepProgressProps {
  currentBlockIndex: number;
  currentQuestionInBlock: number;
  totalQuestionsInBlock: number;
}

export default function StepProgress({ currentBlockIndex, currentQuestionInBlock, totalQuestionsInBlock }: StepProgressProps) {
  const totalBlocks = questionBlocks.length;
  const blockProgress = totalQuestionsInBlock > 0 ? currentQuestionInBlock / totalQuestionsInBlock : 0;
  const overallProgress = ((currentBlockIndex + blockProgress) / totalBlocks) * 100;

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-5 pt-4 pb-3 border-b border-border/50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-foreground">
          {questionBlocks[currentBlockIndex]?.icon} {questionBlocks[currentBlockIndex]?.title}
        </span>
        <span className="text-xs text-muted-foreground font-medium">
          {currentBlockIndex + 1} / {totalBlocks}
        </span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${overallProgress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
