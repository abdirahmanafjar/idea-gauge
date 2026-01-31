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