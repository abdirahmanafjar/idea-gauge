import { ComparisonAnalysis } from "@/types/analysis";
import { GradeCard } from "@/components/GradeCard";
import { OverallGrade } from "@/components/OverallGrade";
import { Trophy, Award, Minus } from "lucide-react";

interface ComparisonResultsProps {
  comparison: ComparisonAnalysis;
  idea1Text: string;
  idea2Text: string;
}

const gradeCategories = [
  { key: "marketOpportunity", title: "Market Opportunity" },
  { key: "riskLevel", title: "Risk Level" },
  { key: "timeToProfitability", title: "Time to Profitability" },
  { key: "competitionIntensity", title: "Competition Intensity" },
  { key: "scalability", title: "Scalability" },
  { key: "resourceRequirements", title: "Resource Requirements" },
] as const;

export const ComparisonResults = ({ comparison, idea1Text, idea2Text }: ComparisonResultsProps) => {
  const { idea1, idea2, winner, comparisonSummary } = comparison;

  const getWinnerBadge = (ideaNumber: "idea1" | "idea2") => {
    if (winner === ideaNumber) {
      return (
        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-grade-f/20 text-grade-f text-sm font-medium">
          <Trophy className="h-4 w-4" />
          Winner
        </div>
      );
    }
    if (winner === "tie") {
      return (
        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-grade-d/20 text-grade-d text-sm font-medium">
          <Minus className="h-4 w-4" />
          Tie
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-medium">
        <Award className="h-4 w-4" />
        Runner-up
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Comparison Summary */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl border border-primary/20 p-6">
        <h3 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Comparison Summary
        </h3>
        <p className="text-muted-foreground">{comparisonSummary}</p>
      </div>

      {/* Side by Side Comparison */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Idea 1 Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                1
              </div>
              <h3 className="font-display font-semibold text-foreground">First Idea</h3>
            </div>
            {getWinnerBadge("idea1")}
          </div>
          
          <div className="bg-secondary/30 rounded-xl p-4 border border-border">
            <p className="text-sm text-muted-foreground line-clamp-2">{idea1Text}</p>
          </div>

          <OverallGrade 
            grade={idea1.overallScore.grade} 
            explanation={idea1.overallScore.explanation} 
            summary={idea1.summary}
          />

          <div className="space-y-3">
            {gradeCategories.map((cat, index) => (
              <GradeCard
                key={cat.key}
                title={cat.title}
                grade={idea1[cat.key].grade}
                explanation={idea1[cat.key].explanation}
                delay={index * 50}
              />
            ))}
          </div>
        </div>

        {/* Idea 2 Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm font-bold">
                2
              </div>
              <h3 className="font-display font-semibold text-foreground">Second Idea</h3>
            </div>
            {getWinnerBadge("idea2")}
          </div>
          
          <div className="bg-secondary/30 rounded-xl p-4 border border-border">
            <p className="text-sm text-muted-foreground line-clamp-2">{idea2Text}</p>
          </div>

          <OverallGrade 
            grade={idea2.overallScore.grade} 
            explanation={idea2.overallScore.explanation} 
            summary={idea2.summary}
          />

          <div className="space-y-3">
            {gradeCategories.map((cat, index) => (
              <GradeCard
                key={cat.key}
                title={cat.title}
                grade={idea2[cat.key].grade}
                explanation={idea2[cat.key].explanation}
                delay={index * 50}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonResults;
