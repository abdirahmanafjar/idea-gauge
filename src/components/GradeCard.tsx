import { cn } from "@/lib/utils";

interface GradeCardProps {
  title: string;
  grade: string;
  explanation: string;
  delay?: number;
}

const gradeColors: Record<string, string> = {
  A: "bg-grade-a",
  B: "bg-grade-b", 
  C: "bg-grade-c",
  D: "bg-grade-d",
  E: "bg-grade-e",
  F: "bg-grade-f",
};

const gradeLabels: Record<string, string> = {
  A: "Very Poor",
  B: "Poor",
  C: "Below Avg",
  D: "Average",
  E: "Good",
  F: "Excellent",
};

export const GradeCard = ({ title, grade, explanation, delay = 0 }: GradeCardProps) => {
  return (
    <div 
      className="group relative rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg opacity-0 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-display text-lg font-semibold text-foreground mb-2">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {explanation}
          </p>
        </div>
        <div className="flex flex-col items-center">
          <div 
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-xl font-display text-2xl font-bold text-primary-foreground shadow-lg transition-transform group-hover:scale-110",
              gradeColors[grade] || "bg-muted"
            )}
          >
            {grade}
          </div>
          <span className="mt-2 text-xs font-medium text-muted-foreground">
            {gradeLabels[grade]}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GradeCard;