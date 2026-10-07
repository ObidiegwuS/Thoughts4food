"use client";

import { useMemo, useState } from "react";
import { Leaf, ShieldCheck } from "lucide-react";
import { AnalysisProgress } from "@/components/analysis/analysis-progress";
import { AnalysisError } from "@/components/analysis/analysis-error";
import { FoodItemList } from "@/components/analysis/food-item-list";
import { MealSummary } from "@/components/analysis/meal-summary";
import { AnalysisState } from "@/components/analysis/analysis-state";
import type { AnalysisResult, FoodItem } from "@/lib/analysis/types";
import { useRestrictions } from "@/components/profile/restriction-context";
import { parseFoodSearchTerms } from "@/lib/providers/fixture-analysis-provider";

export default function HomePage() {
  const [foodQuery, setFoodQuery] = useState("");
  const [status, setStatus] = useState<"idle" | "analyzing" | "success" | "error">("idle");
  const [result, setResult] = useState<AnalysisResult>();
  const [error, setError] = useState<string[]>([]);
  const [restrictionInput, setRestrictionInput] = useState("");
  const { restrictions, setRestrictions } = useRestrictions();

  const parsedFoods = useMemo(() => parseFoodSearchTerms(foodQuery), [foodQuery]);

  function normalizeFoodQueryInput(value: string) {
    return value
      .replace(/\s+and\s+/gi, " ")
      .replace(/\s*,\s*/g, ", ")
      .replace(/\s{2,}/g, " ")
      .trimStart();
  }

  async function analyzeFood() {
    const trimmedQuery = normalizeFoodQueryInput(foodQuery).trim();
    if (!trimmedQuery) {
      setError(["Please type a food or meal to analyze."]);
      setStatus("error");
      return;
    }
    setResult(undefined);
    setError([]);
    setStatus("analyzing");
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foodQuery: trimmedQuery, restrictions })
      });
      const data = (await response.json()) as AnalysisResult;
      if (!response.ok || data.status !== "succeeded") { setError(data.qualityIssues ?? ["Analysis could not be completed."]); setStatus("error"); return; }
      setResult(data);
      setStatus("success");
    } catch { setError(["The analysis service could not be reached. Please try a different food search."]); setStatus("error"); }
  }

  function updateItem(itemId: string, update: Partial<FoodItem>) {
    setResult((current) => current ? { ...current, foodItems: current.foodItems.map((item) => item.itemId === itemId ? { ...item, ...update } : item) } : current);
  }

  return <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
    <div className="rounded-[2rem] border border-white/60 bg-white/60 p-3 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm">
      <header className="flex flex-wrap items-center justify-between gap-5 rounded-[1.5rem] bg-[#fffaf4] px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-[radial-gradient(circle_at_top,_#f9dba3,_#d38f3d)] text-white shadow-lg shadow-orange-200/70"><Leaf size={22} aria-hidden="true" /></div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#9c5d20]">Thoughts4food</p>
            <p className="text-sm text-[#6f7a6b]">Healthy living, beautifully simplified.</p>
          </div>
        </div>

        <nav className="hidden items-center gap-8 text-sm font-medium text-[#5f665d] md:flex">
          <a href="#" className="transition hover:text-[#1d5d46]">Discover</a>
          <a href="#" className="transition hover:text-[#1d5d46]">Meal plans</a>
          <a href="#" className="transition hover:text-[#1d5d46]">Reviews</a>
          <a href="#" className="transition hover:text-[#1d5d46]">Community</a>
        </nav>

        <div className="flex items-center gap-2 rounded-full border border-[#f0d7aa] bg-white px-3 py-2 text-sm text-[#5b6a5f]">
          <ShieldCheck size={16} className="text-[#1d5d46]" aria-hidden="true" />
          Smart meal insights
        </div>
      </header>

      <section className="grid gap-8 px-2 pb-2 pt-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:px-4">
        <div className="space-y-6 lg:sticky lg:top-6">
          <div className="rounded-[2rem] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.92),_rgba(255,245,223,0.88)_40%,_rgba(230,244,236,0.95)_100%)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1d5d46]">Meal search</p>
              <h1 className="max-w-xl text-4xl font-black tracking-[-0.06em] text-[#1e2a1f] sm:text-5xl">Your next healthy obsession starts here.</h1>
              <p className="max-w-lg text-base leading-7 text-[#536458]">Track what you eat, understand the trade-offs, and discover food stories that feel as good as they taste.</p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium text-[#2b5f4c]">
              <span className="rounded-full border border-[#d7eadf] bg-[#edf9f0] px-2.5 py-1.5">#wellness</span>
              <span className="rounded-full border border-[#f0dfb4] bg-[#fff7e7] px-2.5 py-1.5">#meals</span>
              <span className="rounded-full border border-[#dfe7f9] bg-[#edf3ff] px-2.5 py-1.5">#nutrition</span>
            </div>
          </div>

          <form
            className="rounded-[1.75rem] border border-[#f0dfb4] bg-[#fffdf9] p-4 shadow-[0_18px_40px_rgba(91,80,50,0.08)]"
            onSubmit={(event) => {
              event.preventDefault();
              void analyzeFood();
            }}
          >
            <label htmlFor="food-query" className="text-sm font-semibold text-[#1e2a1f]">Food or meal</label>
            {parsedFoods.length > 0 && <div className="mt-3 flex flex-wrap gap-2">
              {parsedFoods.map((food) => <span key={food} className="rounded-full bg-[#ecf9f3] px-2.5 py-1 text-xs font-medium text-[#1d5d46]">{food}</span>)}
            </div>}
            <div className="mt-3 flex gap-2">
              <input
                id="food-query"
                value={foodQuery}
                onChange={(event) => setFoodQuery(event.target.value)}
                placeholder="Try salmon, rice, broccoli or salmon and rice"
                className="min-h-12 w-full rounded-2xl border border-[#f0d7aa] bg-white px-3 text-sm text-[#1f2a1f] shadow-inner shadow-orange-50 placeholder:text-[#768178]"
              />
              <button type="submit" className="rounded-2xl bg-[linear-gradient(135deg,_#1d5d46,_#59a47c)] px-4 text-sm font-semibold text-white shadow-lg shadow-emerald-200 disabled:opacity-60" disabled={status === "analyzing"}>Analyze</button>
            </div>
            </form>

          <form className="rounded-[1.5rem] border border-[#ebebeb] bg-white/80 p-4 shadow-sm" onSubmit={(event) => { event.preventDefault(); const value = restrictionInput.trim(); if (value) { setRestrictions([...restrictions, value]); setRestrictionInput(""); } }}>
            <label htmlFor="restriction-input" className="text-sm font-semibold text-[#1e2a1f]">Dietary restrictions for this scan</label>
            <div className="mt-2 flex gap-2">
              <input id="restriction-input" value={restrictionInput} onChange={(event) => setRestrictionInput(event.target.value)} placeholder="e.g. gluten-free, vegetarian" className="min-h-10 min-w-0 flex-1 rounded-xl border border-[#ebebeb] bg-[#fafaf7] px-3 text-sm text-[#1f2a1f]" />
              <button type="submit" className="rounded-xl bg-[#f6d48e] px-3 text-sm font-semibold text-[#3d2b0c]">Add</button>
            </div>
            {restrictions.length > 0 && <p className="mt-2 text-xs text-[#5d695f]">Current scan restrictions: {restrictions.join(", ")}</p>}
          </form>

          <p className="text-xs leading-5 text-[#6b7d72]">This first pass uses a safe fixture dataset for demo nutrition estimates.</p>
        </div>

        <div className="space-y-6" aria-live="polite">
          {status === "idle" && <div className="overflow-hidden rounded-[2rem] border border-[#f0ddab] bg-[linear-gradient(135deg,_#fffaf0_0%,_#ffffff_42%,_#eefaf5_100%)] p-5 shadow-[0_24px_60px_rgba(70,93,80,0.08)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d6b4e]">Trending now</p>
                <p className="mt-1 text-lg font-semibold text-[#1e2a1f]">Healthy eats, beautifully explained</p>
              </div>
              <div className="rounded-full bg-[#f8eac1] px-2.5 py-1 text-xs font-semibold text-[#8a5b12]">Live</div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-3 shadow-sm"><p className="text-[11px] uppercase tracking-[0.16em] text-[#7a8a7d]">Protein</p><p className="mt-2 text-2xl font-black text-[#1e2a1f]">36g</p></div>
              <div className="rounded-2xl bg-white p-3 shadow-sm"><p className="text-[11px] uppercase tracking-[0.16em] text-[#7a8a7d]">Calories</p><p className="mt-2 text-2xl font-black text-[#1e2a1f]">548</p></div>
              <div className="rounded-2xl bg-white p-3 shadow-sm"><p className="text-[11px] uppercase tracking-[0.16em] text-[#7a8a7d]">Mood</p><p className="mt-2 text-2xl font-black text-[#1e2a1f]">Glow</p></div>
            </div>
          </div>}

          {status === "analyzing" && <AnalysisProgress />}
          {status === "error" && <AnalysisError issues={error} onRetry={() => { setStatus("idle"); setError([]); setResult(undefined); }} />}
          {status === "success" && result && <><FoodItemList items={result.foodItems} onConfirm={(id) => updateItem(id, { reviewStatus: "confirmed" })} onCorrect={(id, value) => updateItem(id, { displayName: value, reviewStatus: "corrected" })} />{result.mealSummary && <MealSummary summary={{ ...result.mealSummary, items: result.foodItems }} />}</>}
          {status === "idle" && <div className="rounded-[2rem] border border-[#eaeef1] bg-white/80 p-4 shadow-sm">
            <AnalysisState><p className="font-semibold">Ready when you are.</p><p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">A result will always be marked as estimated, and unclear findings will ask for your review.</p></AnalysisState>
          </div>}
        </div>
      </section>

      <footer className="border-t border-[#f2e4c7] px-4 py-5 text-sm text-[#66776a]">Nutrition estimates can be affected by ingredients, preparation, and portion size. Check labels and professional guidance for allergy or medical decisions.</footer>
    </div>
  </main>;
}
