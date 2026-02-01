import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, ArrowLeftRight } from "lucide-react";
import { FileAttachment } from "@/components/FileAttachment";
import { AttachedFile } from "@/types/analysis";

interface CompareInputProps {
  onSubmit: (idea1: string, idea2: string, files1: AttachedFile[], files2: AttachedFile[]) => void;
  isLoading: boolean;
}

export const CompareInput = ({ onSubmit, isLoading }: CompareInputProps) => {
  const [idea1, setIdea1] = useState("");
  const [idea2, setIdea2] = useState("");
  const [files1, setFiles1] = useState<AttachedFile[]>([]);
  const [files2, setFiles2] = useState<AttachedFile[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (idea1.trim() && idea2.trim() && !isLoading) {
      onSubmit(idea1.trim(), idea2.trim(), files1, files2);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Idea 1 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              1
            </div>
            <h4 className="font-medium text-foreground">First Business Idea</h4>
          </div>
          <Textarea
            value={idea1}
            onChange={(e) => setIdea1(e.target.value)}
            placeholder="Describe your first business idea..."
            className="min-h-[120px] resize-none bg-transparent border border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all rounded-xl"
            disabled={isLoading}
          />
          <FileAttachment 
            files={files1} 
            onFilesChange={setFiles1} 
            disabled={isLoading}
          />
        </div>

        {/* Idea 2 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-bold">
              2
            </div>
            <h4 className="font-medium text-foreground">Second Business Idea</h4>
          </div>
          <Textarea
            value={idea2}
            onChange={(e) => setIdea2(e.target.value)}
            placeholder="Describe your second business idea..."
            className="min-h-[120px] resize-none bg-transparent border border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all rounded-xl"
            disabled={isLoading}
          />
          <FileAttachment 
            files={files2} 
            onFilesChange={setFiles2} 
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex justify-center">
        <Button 
          type="submit" 
          className="h-12 px-8 bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!idea1.trim() || !idea2.trim() || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Comparing Ideas...
            </>
          ) : (
            <>
              <ArrowLeftRight className="mr-2 h-5 w-5" />
              Compare Ideas
              <Sparkles className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default CompareInput;
