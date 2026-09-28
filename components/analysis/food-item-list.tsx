import type { FoodItem } from "@/lib/analysis/types";
import { FoodItemResult } from "@/components/analysis/food-item-result";

export function FoodItemList({ items, onConfirm, onCorrect }: { items: FoodItem[]; onConfirm: (id: string) => void; onCorrect: (id: string, value: string) => void }) { return <section aria-labelledby="identified-foods-title" className="space-y-4"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">Item-by-item</p><h2 id="identified-foods-title" className="mt-1 text-2xl font-semibold">What we can see</h2></div>{items.map((item) => <FoodItemResult key={item.itemId} item={item} onConfirm={() => onConfirm(item.itemId)} onCorrect={(value) => onCorrect(item.itemId, value)} />)}</section>; }
