import type { PortionEstimate } from "@/lib/analysis/types";
import { formatEstimate } from "@/lib/analysis/nutrition-format";

export function PortionEstimateView({ portion }: { portion: PortionEstimate }) { return <div className="rounded-2xl border border-[hsl(var(--border))] p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">Portion assumption</p><p className="mt-2 text-lg font-semibold">{formatEstimate(portion.amount, ` ${portion.unit}`)}</p><p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{portion.assumptionText} Basis: {portion.basis}.</p></div>; }
