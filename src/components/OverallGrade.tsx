import { cn } from "@/lib/utils";

interface OverallGradeProps {
  grade: string;
  explanation: string;
  summary: string;
}

const gradeColors: Record<string, string> = {
  A: "from-grade-a to-red-700",
  B: "from-grade-b to-orange-600",
  C: "from-grade-c to-yellow-600",
  D: "from-grade-d to-lime-600",
  E: "from-grade-e to-green-600",
  F: "from-grade-f to-teal-600",
};

const gradeLabels: Record<string, string> = {
  A: "Very Poor Idea",
  B: "Poor Idea",
  C: "Below Average",
  D: "Average Idea",
  E: "Good Idea",
  F: "Excellent Idea",
};

export const OverallGrade = ({ grade, explanation, summary }: OverallGradeProps) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card to-background p-8 opacity-0 animate-fade-in">
      {/* Background glow effect */}
      <div 
        className={cn(
          "absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br opacity-20 blur-3xl",
          gradeColors[grade] || "from-muted to-muted"
        )} 
      />
      
      <div className="relative flex flex-col items-center text-center md:flex-row md:items-start md:text-left gap-8">
        {/* Grade Circle */}
        <div className="flex flex-col items-center">
          <div 
            className={cn(
              "flex h-32 w-32 items-center justify-center rounded-2xl bg-gradient-to-br font-display text-6xl font-bold text-foreground shadow-2xl",
              gradeColors[grade] || "from-muted to-muted"
            )}
          >
            {grade}
          </div>
          <span className="mt-3 text-lg font-semibold text-foreground">
            {gradeLabels[grade]}
          </span>
        </div>
        
        {/* Content */}
        <div className="flex-1 space-y-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Overall Assessment
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {explanation}
            </p>
          </div>
          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-semibold text-primary mb-2">Summary</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {summary}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverallGrade;