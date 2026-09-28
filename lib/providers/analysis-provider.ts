import type { AnalysisRequest, AnalysisResult } from "@/lib/analysis/types";

export interface AnalysisProvider {
  analyze(request: AnalysisRequest): Promise<AnalysisResult>;
}
