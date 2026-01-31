import { useState } from "react";
import { Download, Share2, Copy, Check, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { BusinessAnalysis } from "@/types/analysis";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface ExportActionsProps {
  analysis: BusinessAnalysis;
  idea: string;
  analysisRef: React.RefObject<HTMLDivElement>;
}

export const ExportActions = ({ analysis, idea, analysisRef }: ExportActionsProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const exportToPDF = async () => {
    if (!analysisRef.current) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(analysisRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#0a0f1a",
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`IdeaGrade-Analysis-${Date.now()}.pdf`);
      
      toast({
        title: "PDF Downloaded",
        description: "Your analysis has been exported as a PDF.",
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const generateShareableText = () => {
    const sections = [
      { name: "Market Opportunity", data: analysis.marketOpportunity },
      { name: "Risk Level", data: analysis.riskLevel },
      { name: "Time to Profitability", data: analysis.timeToProfitability },
      { name: "Competition Intensity", data: analysis.competitionIntensity },
      { name: "Scalability", data: analysis.scalability },
      { name: "Resource Requirements", data: analysis.resourceRequirements },
    ];

    return `🎯 IdeaGrade Analysis

💡 Idea: ${idea}

📊 Overall Grade: ${analysis.overallScore.grade} - ${analysis.overallScore.explanation}

📋 Breakdown:
${sections.map(s => `• ${s.name}: ${s.data.grade}`).join("\n")}

📝 Summary: ${analysis.summary}

—
Analyzed with IdeaGrade`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateShareableText());
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Analysis copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const shareViaLink = async () => {
    const shareData = {
      title: "IdeaGrade Analysis",
      text: generateShareableText(),
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={exportToPDF}
        disabled={isExporting}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        {isExporting ? "Exporting..." : "Export PDF"}
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={copyToClipboard}>
            {copied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            Copy to Clipboard
          </DropdownMenuItem>
          <DropdownMenuItem onClick={shareViaLink}>
            <Link2 className="mr-2 h-4 w-4" />
            Share via Link
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ExportActions;
