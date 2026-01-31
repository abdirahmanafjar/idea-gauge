import { Brain, GitCompare, Zap, Target, Lightbulb } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type AnalysisMode = "quick" | "deep" | "compare" | "swot" | "pivot";

interface AnalysisModeSelectorProps {
  value: AnalysisMode;
  onValueChange: (value: AnalysisMode) => void;
  disabled?: boolean;
}

const modes = [
  { 
    value: "quick" as const, 
    label: "Quick", 
    icon: Zap, 
    description: "Fast analysis" 
  },
  { 
    value: "deep" as const, 
    label: "Deep Search", 
    icon: Brain, 
    description: "Comprehensive" 
  },
  { 
    value: "compare" as const, 
    label: "Compare", 
    icon: GitCompare, 
    description: "Two ideas" 
  },
  { 
    value: "swot" as const, 
    label: "SWOT", 
    icon: Target, 
    description: "Full SWOT" 
  },
  { 
    value: "pivot" as const, 
    label: "Pivot Ideas", 
    icon: Lightbulb, 
    description: "Alternatives" 
  },
];

export const AnalysisModeSelector = ({ 
  value, 
  onValueChange,
  disabled = false 
}: AnalysisModeSelectorProps) => {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Analysis Mode</p>
      <ToggleGroup 
        type="single" 
        value={value} 
        onValueChange={(val) => val && onValueChange(val as AnalysisMode)}
        className="flex flex-wrap gap-2 justify-start"
        disabled={disabled}
      >
        {modes.map((mode) => (
          <ToggleGroupItem
            key={mode.value}
            value={mode.value}
            aria-label={mode.label}
            className="flex items-center gap-2 px-4 py-2 h-auto data-[state=on]:bg-primary data-[state=on]:text-primary-foreground border border-border hover:bg-secondary"
          >
            <mode.icon className="h-4 w-4" />
            <span className="text-sm font-medium">{mode.label}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
};

export default AnalysisModeSelector;
