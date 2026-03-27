import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface SelectableOptionProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
  type: 'single' | 'multiple';
}

export default function SelectableOption({ label, selected, onToggle, type }: SelectableOptionProps) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'w-full text-left p-4 rounded-2xl border-2 transition-colors duration-200 flex items-center gap-3 min-h-[56px]',
        selected
          ? 'border-primary bg-primary/10 text-foreground'
          : 'border-border bg-card text-foreground hover:border-primary/30'
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 w-6 h-6 flex items-center justify-center transition-colors duration-200',
          type === 'single' ? 'rounded-full' : 'rounded-md',
          selected
            ? 'bg-primary text-primary-foreground'
            : 'border-2 border-muted-foreground/30'
        )}
      >
        {selected && <Check className="w-4 h-4" />}
      </div>
      <span className="text-[15px] leading-snug font-medium">{label}</span>
    </motion.button>
  );
}
