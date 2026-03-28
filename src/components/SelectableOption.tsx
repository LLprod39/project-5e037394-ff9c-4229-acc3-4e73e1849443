import { motion } from "framer-motion";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectableOptionProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
  type: "single" | "multiple";
  index?: number;
}

export default function SelectableOption({
  label,
  selected,
  onToggle,
  type,
  index = 0,
}: SelectableOptionProps) {
  const ControlIcon = type === "single" ? Circle : Check;

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.24 }}
      whileTap={{ scale: 0.985 }}
      className={cn(
        "group h-full w-full overflow-hidden rounded-[24px] border p-4 text-left transition-all duration-200 xl:p-5",
        selected
          ? "border-primary/30 bg-[linear-gradient(135deg,rgba(111,157,203,0.14),rgba(255,255,255,0.92))] shadow-[0_22px_48px_-34px_rgba(95,135,181,0.75)]"
          : "border-white/75 bg-white/72 shadow-[0_18px_42px_-34px_rgba(92,104,125,0.42)] hover:border-primary/20 hover:bg-white/82"
      )}
    >
      <div className="flex items-center gap-3 xl:min-h-[88px]">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center transition-colors",
            type === "single" ? "rounded-full" : "rounded-2xl",
            selected
              ? "bg-primary text-primary-foreground"
              : "bg-muted/80 text-muted-foreground"
          )}
        >
          <ControlIcon className={cn("h-4.5 w-4.5", selected && type === "single" ? "fill-current" : "")} />
        </div>

        <div className="flex-1">
          <p className="text-[15px] font-semibold leading-6 text-foreground">{label}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {selected ? "Выбрано" : type === "multiple" ? "Можно сочетать с другими вариантами" : "Нажмите, чтобы выбрать"}
          </p>
        </div>

        <div
          className={cn(
            "h-2.5 w-2.5 rounded-full transition-colors",
            selected ? "bg-primary" : "bg-muted-foreground/25 group-hover:bg-primary/30"
          )}
        />
      </div>
    </motion.button>
  );
}
