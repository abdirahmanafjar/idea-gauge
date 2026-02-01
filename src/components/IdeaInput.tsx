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
      <div className="relative">
        <Textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="A subscription service for sustainable, locally-sourced meal kits delivered in reusable containers..."
          className="min-h-[120px] resize-none bg-transparent border border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all rounded-xl"
          disabled={isLoading}
        />
      </div>
      
      <div className="flex items-center justify-between gap-4">
        <FileAttachment 
          files={files} 
          onFilesChange={setFiles} 
          disabled={isLoading}
        />
        
        <Button 
          type="submit" 
          className="h-10 px-6 bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!idea.trim() || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              Analyze Idea
              <Sparkles className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
      
      {showModeSelector && (
        <AnalysisModeSelector 
          value={mode} 
          onValueChange={setMode} 
          disabled={isLoading}
        />
      )}
    </form>
  );
};

export default IdeaInput;
