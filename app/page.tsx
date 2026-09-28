"use client";

import { useState } from "react";
import { Leaf, ShieldCheck, Sparkles } from "lucide-react";
import { ImageReceiver } from "@/components/upload/image-receiver";
import { ImagePreview } from "@/components/upload/image-preview";
import { AnalysisProgress } from "@/components/analysis/analysis-progress";
import { AnalysisError } from "@/components/analysis/analysis-error";
import { FoodItemList } from "@/components/analysis/food-item-list";
import { MealSummary } from "@/components/analysis/meal-summary";
import { AnalysisState } from "@/components/analysis/analysis-state";
import type { AnalysisResult, FoodItem } from "@/lib/analysis/types";
import { useRestrictions } from "@/components/profile/restriction-context";

export default function HomePage() {
  const [preview, setPreview] = useState<string>();
  const [status, setStatus] = useState<"idle" | "analyzing" | "success" | "error">("idle");
  const [result, setResult] = useState<AnalysisResult>();
  const [error, setError] = useState<string[]>([]);
  const [restrictionInput, setRestrictionInput] = useState("");
  const { restrictions, setRestrictions } = useRestrictions();

  async function analyze(file: File, reference = file.name) {
    setPreview(URL.createObjectURL(file));
    setResult(undefined);
    setError([]);
    setStatus("analyzing");
    try {
      const response = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageReference: reference, mimeType: file.type, sizeBytes: file.size, restrictions }) });
      const data = (await response.json()) as AnalysisResult;
      if (!response.ok || data.status !== "succeeded") { setError(data.qualityIssues ?? ["Analysis could not be completed."]); setStatus("error"); return; }
      setResult(data);
      setStatus("success");
    } catch { setError(["The analysis service could not be reached. Please try another image."]); setStatus("error"); }
  }

  function updateItem(itemId: string, update: Partial<FoodItem>) {
    setResult((current) => current ? { ...current, foodItems: current.foodItems.map((item) => item.itemId === itemId ? { ...item, ...update } : item) } : current);
  }

  return <main className="mx-auto min-h-screen w-full max-w-6xl px-5 py-8 sm:px-8 lg:py-12">
    <header className="flex flex-wrap items-center justify-between gap-5 border-b border-[hsl(var(--border))] pb-6">
      <div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-2xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"><Leaf size={22} aria-hidden="true" /></div><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[hsl(var(--primary))]">Thoughts4food</p><p className="text-sm text-[hsl(var(--muted-foreground))]">Food, with the assumptions left visible.</p></div></div>
      <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]"><ShieldCheck size={17} aria-hidden="true" /> Estimates are not guarantees</div>
    </header>

    <section className="grid gap-8 py-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
      <div className="space-y-6 lg:sticky lg:top-6"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[hsl(var(--primary))]">Start with a picture</p><h1 className="mt-3 max-w-xl text-5xl font-semibold leading-[0.98] tracking-tight sm:text-6xl">A clearer read on what is on your plate.</h1><p className="mt-5 max-w-lg text-lg leading-8 text-[hsl(var(--muted-foreground))]">We identify what we can see, estimate what we cannot measure, and tell you where the uncertainty comes from.</p></div>
        {preview ? <ImagePreview src={preview} alt="Your selected food image" /> : <div className="grid aspect-[4/3] place-items-center rounded-[1.5rem] border border-dashed border-[hsl(var(--border))] bg-white/45 p-8 text-center"><div><Sparkles className="mx-auto mb-4 text-[hsl(var(--primary))]" size={32} aria-hidden="true" /><p className="font-semibold">Your food image will appear here</p><p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Use a well-lit image with the plate in view.</p></div></div>}
        <ImageReceiver disabled={status === "analyzing"} onSelect={(file) => void analyze(file)} />
        <form className="rounded-2xl border border-[hsl(var(--border))] bg-white/45 p-4" onSubmit={(event) => { event.preventDefault(); const value = restrictionInput.trim(); if (value) { setRestrictions([...restrictions, value]); setRestrictionInput(""); } }}><label htmlFor="restriction-input" className="text-sm font-semibold">Dietary restrictions for this scan</label><div className="mt-2 flex gap-2"><input id="restriction-input" value={restrictionInput} onChange={(event) => setRestrictionInput(event.target.value)} placeholder="e.g. gluten-free, vegetarian" className="min-h-10 min-w-0 flex-1 rounded-xl border border-[hsl(var(--border))] bg-white px-3 text-sm" /><button type="submit" className="rounded-xl bg-[hsl(var(--primary))] px-3 text-sm font-semibold text-[hsl(var(--primary-foreground))]">Add</button></div>{restrictions.length > 0 && <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">Current scan restrictions: {restrictions.join(", ")}</p>}</form>
        <p className="text-xs leading-5 text-[hsl(var(--muted-foreground))]">For this first slice, analysis runs on a safe fixture provider. No image is stored permanently.</p>
      </div>

      <div className="space-y-6" aria-live="polite">
        {status === "idle" && <AnalysisState><p className="font-semibold">Ready when you are.</p><p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">A result will always be marked as estimated, and unclear findings will ask for your review.</p></AnalysisState>}
        {status === "analyzing" && <AnalysisProgress />}
        {status === "error" && <AnalysisError issues={error} onRetry={() => { setStatus("idle"); setError([]); setResult(undefined); }} />}
        {status === "success" && result && <><FoodItemList items={result.foodItems} onConfirm={(id) => updateItem(id, { reviewStatus: "confirmed" })} onCorrect={(id, value) => updateItem(id, { displayName: value, reviewStatus: "corrected" })} />{result.mealSummary && <MealSummary summary={{ ...result.mealSummary, items: result.foodItems }} />}</>}
      </div>
    </section>

    <footer className="border-t border-[hsl(var(--border))] pt-5 text-sm text-[hsl(var(--muted-foreground))]">Nutrition estimates can be affected by ingredients, preparation, and portion size. Check labels and professional guidance for allergy or medical decisions.</footer>
  </main>;
}
