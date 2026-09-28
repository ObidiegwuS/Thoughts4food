import { Check, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FoodItem } from "@/lib/analysis/types";

export function ReviewActions({ item, onConfirm, onCorrect }: { item: FoodItem; onConfirm: () => void; onCorrect: () => void }) { const blocked = item.reviewStatus === "unreviewed"; return <div className="flex flex-wrap items-center gap-3 border-t border-[hsl(var(--border))] pt-4"><Button type="button" onClick={onConfirm} disabled={!blocked}><Check size={16} aria-hidden="true" /> Confirm this finding</Button><Button type="button" variant="outline" onClick={onCorrect}><Pencil size={16} aria-hidden="true" /> Correct details</Button>{blocked && <span className="text-sm text-[hsl(var(--muted-foreground))]">Review the estimate before treating it as consumed.</span>}</div>; }
