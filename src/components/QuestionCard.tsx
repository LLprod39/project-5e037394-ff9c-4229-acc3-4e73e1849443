import { Question } from '@/types/quiz';
import SelectableOption from './SelectableOption';
import { motion } from 'framer-motion';

interface QuestionCardProps {
  question: Question;
  selectedOptions: string[];
  onSelect: (questionId: string, optionId: string) => void;
}

export default function QuestionCard({ question, selectedOptions, onSelect }: QuestionCardProps) {
  const handleToggle = (optionId: string) => {
    onSelect(question.id, optionId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="space-y-4"
    >
      <h3 className="text-lg font-bold text-foreground leading-snug">
        {question.text}
      </h3>
      {question.type === 'multiple' && (
        <p className="text-sm text-muted-foreground">Можно выбрать несколько вариантов</p>
      )}
      <div className="space-y-3">
        {question.options.map((option) => (
          <SelectableOption
            key={option.id}
            label={option.label}
            selected={selectedOptions.includes(option.id)}
            onToggle={() => handleToggle(option.id)}
            type={question.type}
          />
        ))}
      </div>
    </motion.div>
  );
}
