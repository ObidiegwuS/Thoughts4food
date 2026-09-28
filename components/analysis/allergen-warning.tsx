import { ShieldAlert } from "lucide-react";
import { AnalysisState } from "@/components/analysis/analysis-state";
import type { AllergenFinding } from "@/lib/analysis/types";

export function AllergenWarning({ findings }: { findings: AllergenFinding[] }) { if (!findings.length) return null; return <AnalysisState tone="warning"><div className="flex gap-3"><ShieldAlert size={20} aria-hidden="true" /><div><strong>Allergen information</strong><ul className="mt-1 list-disc pl-5 text-sm">{findings.map((finding) => <li key={`${finding.name}-${finding.status}`}>{finding.warningText}</li>)}</ul></div></div></AnalysisState>; }
