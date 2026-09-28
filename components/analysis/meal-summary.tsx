import type { MealSummary as MealSummaryData } from "@/lib/analysis/types";
import { NutritionSummary } from "@/components/analysis/nutrition-summary";
import { UncertaintyNotice } from "@/components/analysis/uncertainty-notice";

export function MealSummary({ summary }: { summary: MealSummaryData }) { return <section aria-labelledby="meal-summary-title" className="space-y-4"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">Combined meal</p><h2 id="meal-summary-title" className="mt-1 text-2xl font-semibold">The whole plate, together</h2><p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{summary.summaryText}</p></div><NutritionSummary nutrition={summary.combinedNutrition} title="Combined estimated nutrition" /><UncertaintyNotice reasons={summary.uncertaintyReasons} /></section>; }
