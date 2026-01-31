import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";
import { AnalysisModeSelector, AnalysisMode } from "@/components/AnalysisModeSelector";
import { FileAttachment } from "@/components/FileAttachment";

interface AttachedFile {
  id: string;
  file: File;
  preview?: string;
}

interface IdeaInputProps {
  onSubmit: (idea: string, mode: AnalysisMode, files: AttachedFile[]) => void;
  isLoading: boolean;
  showModeSelector?: boolean;
}

export const IdeaInput = ({ onSubmit, isLoading, showModeSelector = true }: IdeaInputProps) => {
  const [idea, setIdea] = useState("");
  const [mode, setMode] = useState<AnalysisMode>("quick");
  const [files, setFiles] = useState<AttachedFile[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim() && !isLoading) {
      onSubmit(idea.trim(), mode, files);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      {showModeSelector && (
        <AnalysisModeSelector 
          value={mode} 
          onValueChange={setMode} 
          disabled={isLoading}
        />
      )}
      
      <div className="relative">
        <Textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="Describe your business idea... e.g., 'A subscription service for personalized vitamin packs delivered monthly based on DNA testing results'"
          className="min-h-[140px] resize-none bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          disabled={isLoading}
        />
      </div>
      
      <FileAttachment 
        files={files} 
        onFilesChange={setFiles} 
        disabled={isLoading}
      />
      
      <Button 
        type="submit" 
        className="w-full h-12 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-base hover:opacity-90 transition-all glow-primary disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!idea.trim() || isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Analyzing Your Idea...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Analyze Business Idea
          </>
        )}
      </Button>
    </form>
  );
};

export default IdeaInput;
