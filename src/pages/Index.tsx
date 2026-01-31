import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { IdeaInput } from "@/components/IdeaInput";
import { OverallGrade } from "@/components/OverallGrade";
import { GradeCard } from "@/components/GradeCard";
import { LoadingState } from "@/components/LoadingState";
import { GradeLegend } from "@/components/GradeLegend";
import { BusinessAnalysis } from "@/types/analysis";
import { Lightbulb, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [analysis, setAnalysis] = useState<BusinessAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submittedIdea, setSubmittedIdea] = useState("");
  const { toast } = useToast();

  const analyzeIdea = async (idea: string) => {
    setIsLoading(true);
    setAnalysis(null);
    setSubmittedIdea(idea);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-idea", {
        body: { businessIdea: idea },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysis(data.analysis);
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze your business idea. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetAnalysis = () => {
    setAnalysis(null);
    setSubmittedIdea("");
  };

  const sections = analysis ? [
    { title: "Market Opportunity", data: analysis.marketOpportunity },
    { title: "Risk Level", data: analysis.riskLevel },
    { title: "Time to Profitability", data: analysis.timeToProfitability },
    { title: "Competition Intensity", data: analysis.competitionIntensity },
    { title: "Scalability", data: analysis.scalability },
    { title: "Resource Requirements", data: analysis.resourceRequirements },
  ] : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
              <Lightbulb className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">IdeaGrade</h1>
              <p className="text-xs text-muted-foreground">AI Business Analyzer</p>
            </div>
          </div>
          {analysis && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetAnalysis}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              New Analysis
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {!analysis && !isLoading && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4 py-8">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-gradient">
                Rate Your Business Idea
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get instant AI-powered analysis of your business concept. Understand risks, 
                market potential, and how long it takes to build a real business.
              </p>
            </div>

            {/* Grade Legend */}
            <GradeLegend />

            {/* Input Form */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <IdeaInput onSubmit={analyzeIdea} isLoading={isLoading} />
            </div>
          </div>
        )}

        {isLoading && (
          <div className="bg-card rounded-2xl border border-border">
            <LoadingState />
          </div>
        )}

        {analysis && !isLoading && (
          <div className="space-y-8">
            {/* Submitted Idea */}
            <div className="bg-secondary/50 rounded-xl border border-border p-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">Analyzed Idea:</p>
              <p className="text-sm text-foreground">{submittedIdea}</p>
            </div>

            {/* Overall Grade */}
            <OverallGrade 
              grade={analysis.overallScore.grade}
              explanation={analysis.overallScore.explanation}
              summary={analysis.summary}
            />

            {/* Section Grades */}
            <div className="space-y-4">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Detailed Breakdown
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {sections.map((section, index) => (
                  <GradeCard
                    key={section.title}
                    title={section.title}
                    grade={section.data.grade}
                    explanation={section.data.explanation}
                    delay={index * 100}
                  />
                ))}
              </div>
            </div>

            {/* Analyze Another */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                Try Another Idea
              </h3>
              <IdeaInput onSubmit={analyzeIdea} isLoading={isLoading} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by AI • Grades range from A (worst) to F (best)
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;