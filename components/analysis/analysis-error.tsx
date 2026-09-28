import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnalysisState } from "@/components/analysis/analysis-state";

export function AnalysisError({ issues, onRetry }: { issues: string[]; onRetry: () => void }) { return <AnalysisState tone="error"><h2 className="font-semibold">We could not make a reliable food estimate</h2><ul className="mt-2 list-disc pl-5 text-sm">{issues.map((issue) => <li key={issue}>{issue}</li>)}</ul><Button type="button" variant="outline" className="mt-4" onClick={onRetry}><RefreshCw size={16} aria-hidden="true" /> Try another image</Button></AnalysisState>; }
