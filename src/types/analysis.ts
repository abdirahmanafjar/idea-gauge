export interface GradeSection {
  grade: string;
  explanation: string;
}

export interface BusinessAnalysis {
  overallScore: GradeSection;
  marketOpportunity: GradeSection;
  riskLevel: GradeSection;
  timeToProfitability: GradeSection;
  competitionIntensity: GradeSection;
  scalability: GradeSection;
  resourceRequirements: GradeSection;
  summary: string;
}

export interface ComparisonAnalysis {
  idea1: BusinessAnalysis;
  idea2: BusinessAnalysis;
  winner: "idea1" | "idea2" | "tie";
  comparisonSummary: string;
}

export interface AttachedFile {
  id: string;
  file: File;
  preview?: string;
  base64?: string;
}
