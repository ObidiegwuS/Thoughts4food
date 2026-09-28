"use client";

import { useState } from "react";
import type { FoodItem } from "@/lib/analysis/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IngredientList } from "@/components/analysis/ingredient-list";
import { NutritionSummary } from "@/components/analysis/nutrition-summary";
import { PortionEstimateView } from "@/components/analysis/portion-estimate";
import { UncertaintyNotice } from "@/components/analysis/uncertainty-notice";
import { ReviewActions } from "@/components/analysis/review-actions";
import { ReviewStatusBadge } from "@/components/analysis/review-status";
import { AllergenWarning } from "@/components/analysis/allergen-warning";
import { DietaryConflictWarning } from "@/components/analysis/dietary-conflict-warning";
import { CorrectionForm } from "@/components/analysis/correction-form";
import { Dialog } from "@/components/ui/dialog";

export function FoodItemResult({ item, onConfirm, onCorrect }: { item: FoodItem; onConfirm: () => void; onCorrect: (value: string) => void }) { const [editing, setEditing] = useState(false); return <Card className="overflow-hidden"><CardHeader className="bg-[hsl(var(--muted))]/50"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">Identified food</p><CardTitle className="mt-1">{item.displayName}</CardTitle></div><div className="flex flex-wrap gap-2"><Badge>{item.identificationStatus}</Badge><ReviewStatusBadge status={item.reviewStatus} /></div></div></CardHeader><CardContent className="space-y-5 pt-5"><NutritionSummary nutrition={item.nutrition} /><div className="grid gap-5 md:grid-cols-2"><IngredientList ingredients={item.ingredients} /><PortionEstimateView portion={item.portion} /></div><div><h3 className="font-semibold">Relevant micronutrients</h3><div className="mt-3 flex flex-wrap gap-2">{item.micronutrients.map((nutrient) => <Badge key={nutrient.nutrientName}>{nutrient.nutrientName}: {nutrient.value ?? "Unavailable"}</Badge>)}</div></div><UncertaintyNotice reasons={item.uncertaintyReasons} /><AllergenWarning findings={item.allergens} /><DietaryConflictWarning conflicts={item.dietaryConflicts} /><ReviewActions item={item} onConfirm={onConfirm} onCorrect={() => setEditing(true)} /><Dialog open={editing} title="Correct this finding" onClose={() => setEditing(false)}><CorrectionForm initialValue={item.displayName} onSave={(value) => { onCorrect(value); setEditing(false); }} /></Dialog></CardContent></Card>; }
