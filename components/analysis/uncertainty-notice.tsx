import { CircleAlert } from "lucide-react";
import { AnalysisState } from "@/components/analysis/analysis-state";

export function UncertaintyNotice({ reasons }: { reasons: string[] }) { if (!reasons.length) return null; return <AnalysisState tone="warning"><div className="flex gap-3"><CircleAlert size={20} aria-hidden="true" /><div><strong>What is uncertain</strong><ul className="mt-1 list-disc pl-5">{reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul></div></div></AnalysisState>; }
