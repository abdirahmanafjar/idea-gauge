import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { IdeaInput } from "@/components/IdeaInput";
import { CompareInput } from "@/components/CompareInput";
import { OverallGrade } from "@/components/OverallGrade";
import { GradeCard } from "@/components/GradeCard";
import { LoadingState } from "@/components/LoadingState";
import { GradeLegend } from "@/components/GradeLegend";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ExportActions } from "@/components/ExportActions";
import { ComparisonResults } from "@/components/ComparisonResults";
import { BusinessAnalysis, ComparisonAnalysis, AttachedFile } from "@/types/analysis";
import { AnalysisMode, AnalysisModeSelector } from "@/components/AnalysisModeSelector";
import { prepareFilesForAnalysis } from "@/lib/imageUtils";
import { Lightbulb, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [analysis, setAnalysis] = useState<BusinessAnalysis | null>(null);
  const [comparison, setComparison] = useState<ComparisonAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submittedIdea, setSubmittedIdea] = useState("");
  const [submittedIdea2, setSubmittedIdea2] = useState("");
  const [currentMode, setCurrentMode] = useState<AnalysisMode>("quick");
  const analysisRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const analyzeIdea = async (idea: string, mode: AnalysisMode, files: AttachedFile[]) => {
    setIsLoading(true);
    setAnalysis(null);
    setComparison(null);
    setSubmittedIdea(idea);
    setCurrentMode(mode);

    try {
      // Prepare images for OCR
      const preparedImages = await prepareFilesForAnalysis(files);
      
      const { data, error } = await supabase.functions.invoke("analyze-idea", {
        body: {
          businessIdea: idea,
          analysisMode: mode,
          images: preparedImages,
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setAnalysis(data.analysis);
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze your business idea. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const compareIdeas = async (idea1: string, idea2: string, files1: AttachedFile[], files2: AttachedFile[]) => {
    setIsLoading(true);
    setAnalysis(null);
    setComparison(null);
    setSubmittedIdea(idea1);
    setSubmittedIdea2(idea2);
    setCurrentMode("compare");

    try {
      // Prepare images for OCR
      const preparedImages1 = await prepareFilesForAnalysis(files1);
      const preparedImages2 = await prepareFilesForAnalysis(files2);

      const { data, error } = await supabase.functions.invoke("analyze-idea", {
        body: {
          analysisMode: "compare",
          idea1,
          idea2,
          images1: preparedImages1,
          images2: preparedImages2,
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setComparison(data.comparison);
    } catch (error) {
      console.error("Comparison error:", error);
      toast({
        title: "Comparison Failed",
        description: error instanceof Error ? error.message : "Failed to compare your business ideas. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetAnalysis = () => {
    setAnalysis(null);
    setComparison(null);
    setSubmittedIdea("");
    setSubmittedIdea2("");
    setCurrentMode("quick");
  };

  const sections = analysis ? [
    { title: "Market Opportunity", data: analysis.marketOpportunity },
    { title: "Risk Level", data: analysis.riskLevel },
    { title: "Time to Profitability", data: analysis.timeToProfitability },
    { title: "Competition Intensity", data: analysis.competitionIntensity },
    { title: "Scalability", data: analysis.scalability },
    { title: "Resource Requirements", data: analysis.resourceRequirements }
  ] : [];

  const hasResults = analysis || comparison;

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
              <h1 className="font-display text-xl font-bold text-foreground">Idea-key</h1>
              <p className="text-xs text-muted-foreground">AI Business Analyzer</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {hasResults && (
              <Button variant="outline" size="sm" onClick={resetAnalysis} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                New Analysis
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {!hasResults && !isLoading && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4 py-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <span className="text-primary text-sm font-medium">✨ AI-Powered Analysis</span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold">
                <span className="text-foreground">Business Idea </span>
                <span className="text-primary">Analyzer</span>
              </h2>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                Get instant, comprehensive analysis of your business idea with AI-powered
                insights across market potential, competition, revenue model, and more.
              </p>
            </div>

            {/* Mode Selector */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <AnalysisModeSelector 
                value={currentMode} 
                onValueChange={setCurrentMode} 
                disabled={isLoading}
              />
            </div>

            {/* Input Form - Conditional based on mode */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-lg">
              {currentMode === "compare" ? (
                <>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-primary">⚖️</span>
                    <h3 className="font-display font-semibold text-foreground">Compare Two Business Ideas</h3>
                  </div>
                  <CompareInput onSubmit={compareIdeas} isLoading={isLoading} />
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-primary">✨</span>
                    <h3 className="font-display font-semibold text-foreground">Describe Your Business Idea</h3>
                  </div>
                  <IdeaInput onSubmit={analyzeIdea} isLoading={isLoading} showModeSelector={false} />
                  <p className="text-xs text-muted-foreground mt-4 text-center">
                    Attach images with text (screenshots, notes, diagrams) - OCR will extract and analyze the content.
                  </p>
                </>
              )}
            </div>

            {/* Grade Legend */}
            <GradeLegend />
          </div>
        )}

        {isLoading && (
          <div className="bg-card rounded-2xl border border-border">
            <LoadingState />
          </div>
        )}

        {/* Single Analysis Results */}
        {analysis && !isLoading && (
          <div className="space-y-8" ref={analysisRef}>
            {/* Submitted Idea + Export Actions */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="bg-secondary/50 rounded-xl border border-border p-4 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-medium text-muted-foreground">Analyzed Idea:</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                    {currentMode} mode
                  </span>
                </div>
                <p className="text-sm text-foreground">{submittedIdea}</p>
              </div>
              <ExportActions analysis={analysis} idea={submittedIdea} analysisRef={analysisRef} />
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
              <IdeaInput onSubmit={analyzeIdea} isLoading={isLoading} showModeSelector={false} />
            </div>
          </div>
        )}

        {/* Comparison Results */}
        {comparison && !isLoading && (
          <div className="space-y-8" ref={analysisRef}>
            <ComparisonResults 
              comparison={comparison} 
              idea1Text={submittedIdea} 
              idea2Text={submittedIdea2} 
            />

            {/* Compare More */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                Compare More Ideas
              </h3>
              <CompareInput onSubmit={compareIdeas} isLoading={isLoading} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-xs text-muted-foreground">Analysis powered by Abdirahman. Results are for guidance only.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
