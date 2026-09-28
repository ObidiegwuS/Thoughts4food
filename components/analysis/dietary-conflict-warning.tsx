import { TriangleAlert } from "lucide-react";
import { AnalysisState } from "@/components/analysis/analysis-state";
import type { DietaryConflict } from "@/lib/analysis/types";

export function DietaryConflictWarning({ conflicts }: { conflicts: DietaryConflict[] }) { if (!conflicts.length) return null; return <AnalysisState tone="warning"><div className="flex gap-3"><TriangleAlert size={20} aria-hidden="true" /><div><strong>Potential dietary conflict</strong><ul className="mt-1 list-disc pl-5 text-sm">{conflicts.map((conflict) => <li key={`${conflict.restrictionName}-${conflict.affectedItemOrIngredient}`}>{conflict.warningText} {conflict.assumptionImpact}</li>)}</ul></div></div></AnalysisState>; }
