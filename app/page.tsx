"use client";

import { useRef, useState } from "react";
import { LoaderCircle, Search, ShieldCheck, Sparkles, X } from "lucide-react";
import { AnalysisError } from "@/components/analysis/analysis-error";
import { RecipeResults } from "@/components/recipes/recipe-results";
import { RecipeSearchSkeleton } from "@/components/recipes/recipe-search-skeleton";
import type { RecipeSearchResponse } from "@/lib/recipes/types";
import { normalizeIngredients } from "@/lib/analysis/ingredients";

export default function HomePage() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [ingredientText, setIngredientText] = useState("");
  const [formError, setFormError] = useState("");
  const [status, setStatus] = useState<"idle" | "searching" | "success" | "error">("idle");
  const [result, setResult] = useState<RecipeSearchResponse>();
  const [searchedIngredients, setSearchedIngredients] = useState<string[]>([]);
  const [error, setError] = useState("");
  const searchInFlight = useRef(false);

  function addIngredients(values: readonly string[]) {
    setIngredients((current) => normalizeIngredients([...current, ...values]));
    setIngredientText("");
    setFormError("");
  }

  async function searchRecipes() {
    if (searchInFlight.current) return;
    const submittedIngredients = normalizeIngredients([...ingredients, ingredientText]);
    if (submittedIngredients.length === 0) {
      setFormError("Add at least one ingredient before searching.");
      return;
    }
    searchInFlight.current = true;
    setIngredients(submittedIngredients);
    setIngredientText("");
    setFormError("");
    setSearchedIngredients(submittedIngredients);
    setResult(undefined);
    setError("");
    setStatus("searching");
    try {
      const response = await fetch("/api/recipes/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: submittedIngredients })
      });
      const data = (await response.json()) as RecipeSearchResponse;
      if (!response.ok) { setError(data.message ?? "Recipe search could not be completed. Please try again."); setStatus("error"); return; }
      setResult(data);
      setStatus("success");
    } catch { setError("We could not reach the recipe search service. Check your connection and try again."); setStatus("error"); }
    finally { searchInFlight.current = false; }
  }

  return <main className="mx-auto min-h-screen w-full max-w-[1440px] px-4 py-5 sm:px-7 lg:px-10 lg:py-7">
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4 px-1 sm:mb-8 sm:px-3">
      <a href="#top" aria-label="Thoughts4food home" className="flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#76efb5]">
        <span className="grid size-12 place-items-center rounded-[17px] bg-[linear-gradient(135deg,_#69efb5,_#6fc6ee)] text-base font-black text-[#102019]">T4F</span>
        <span><span className="block text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#78edb5]">Nutrition coach</span><span className="block text-xl font-black text-[#f0f5fa] sm:text-2xl">Thoughts4food</span></span>
      </a>
      <nav aria-label="Main navigation" className="hidden items-center gap-7 text-sm font-medium text-[#aab6c3] md:flex">
        <a href="#top" className="hover:text-white">Overview</a>
        <a href="#recipe-results" className="hover:text-white">Recipes</a>
        <a href="#nutrition-guide" className="hover:text-white">Progress</a>
      </nav>
      <button type="button" onClick={() => document.getElementById("recipe-search")?.scrollIntoView({ behavior: "smooth" })} className="min-h-11 rounded-full border border-white/15 bg-white/[0.03] px-5 text-sm font-semibold text-[#eef3f8] transition hover:border-[#78edb5]/50 hover:bg-[#78edb5]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78edb5]">Upgrade</button>
    </header>

    <section id="top" className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.18fr)_minmax(360px,0.82fr)] lg:items-start">
      <div id="recipe-search" className="min-w-0 overflow-hidden rounded-[28px] border border-white/[0.08] bg-[rgba(13,18,25,0.94)] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.32)] sm:p-7">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#91a0af]">Ingredient search</p><h1 className="mt-1 text-3xl font-black tracking-tight text-[#f0f4f8] sm:text-4xl">Find your next meal</h1></div>
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#76efb5]/25 bg-[#76efb5]/[0.08] px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-[#76efb5]"><span className="size-1.5 rounded-full bg-[#76efb5] shadow-[0_0_10px_#76efb5]" /> Ingredients ready</span>
        </div>

        <div className="relative mb-5 flex min-h-[205px] flex-col justify-between overflow-hidden rounded-[22px] border border-white/[0.08] bg-[radial-gradient(ellipse_at_18%_12%,_rgba(75,164,132,.35),_transparent_38%),radial-gradient(ellipse_at_90%_80%,_rgba(236,148,75,.24),_transparent_42%),linear-gradient(135deg,_#18251f,_#17202c_55%,_#281f28)] p-5 sm:min-h-[245px] sm:p-7">
          <div className="absolute -right-10 -top-16 size-64 rounded-full border border-[#76efb5]/30 shadow-[0_0_0_20px_rgba(118,239,181,0.035),0_0_60px_rgba(118,239,181,.08)]" aria-hidden="true" />
          <div className="relative max-w-md">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#b8c7d1]"><Sparkles size={13} className="text-[#f3b76c]" aria-hidden="true" /> From your kitchen</span>
            <h2 className="mt-4 text-2xl font-extrabold leading-tight text-white sm:text-3xl">Good food starts with what’s already here.</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-[#bdc8ce]">Add ingredients and discover real recipes ranked by what you can use.</p>
          </div>
          <div className="relative mt-5 flex flex-wrap gap-2 text-[11px] font-semibold">
            <span className="rounded-full border border-[#76efb5]/20 bg-[#76efb5]/10 px-3 py-1.5 text-[#9af4c5]">Use what you have</span>
            <span className="rounded-full border border-[#f0b96a]/25 bg-[#f0b96a]/10 px-3 py-1.5 text-[#f2ca8d]">See nutrition</span>
            <span className="rounded-full border border-[#a8a0f5]/25 bg-[#a8a0f5]/10 px-3 py-1.5 text-[#c6c0ff]">Compare recipes</span>
          </div>
        </div>

        <form className="rounded-[20px] border border-white/[0.08] bg-[#141b23] p-4 sm:p-5" onSubmit={(event) => { event.preventDefault(); void searchRecipes(); }}>
          <div className="mb-3 flex items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[linear-gradient(140deg,_#f0b96a,_#e36b4e)] text-xs font-black text-[#17151a]">T4F</div>
            <div><h2 className="text-sm font-bold text-[#edf2f7]">What ingredients do you have?</h2><p className="text-xs text-[#929fac]">Build your ingredient list</p></div>
          </div>
          <label htmlFor="ingredient-text" className="sr-only">What ingredients do you have?</label>
          <textarea
            id="ingredient-text"
            value={ingredientText}
            onChange={(event) => { setIngredientText(event.target.value); setFormError(""); }}
            onKeyDown={(event) => { if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) { event.preventDefault(); void searchRecipes(); } }}
            placeholder="Chicken, rice, spinach, eggs, tomatoes..."
            aria-invalid={Boolean(formError)}
            aria-describedby={formError ? "ingredient-error ingredient-help" : "ingredient-help"}
            disabled={status === "searching"}
            className="min-h-28 w-full resize-y rounded-2xl border border-white/[0.09] bg-[#0d1218] px-4 py-3 text-sm leading-6 text-[#eff4f7] placeholder:text-[#72808e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#76efb5] disabled:opacity-60"
          />
          <p id="ingredient-help" className="mt-2 text-xs text-[#8996a3]">Separate items with commas or new lines · Ctrl+Enter to search</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={() => addIngredients([ingredientText])} disabled={status === "searching" || !ingredientText.trim()} className="min-h-11 rounded-xl border border-[#76efb5]/25 bg-[#76efb5]/[0.06] px-4 text-sm font-semibold text-[#8cf0bb] hover:bg-[#76efb5]/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#76efb5] disabled:cursor-not-allowed disabled:opacity-45">Add ingredient</button>
            <button type="submit" disabled={status === "searching"} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(115deg,_#78efb5,_#76cbe9)] px-4 text-sm font-extrabold text-[#102019] shadow-[0_8px_24px_rgba(87,222,166,.16)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#141b23] disabled:cursor-not-allowed disabled:opacity-60">
              {status === "searching" ? <LoaderCircle size={17} className="animate-spin" aria-hidden="true" /> : <Search size={16} aria-hidden="true" />}
              {status === "searching" ? "Searching recipes..." : "Find Recipes"}
            </button>
          </div>
          {ingredients.length > 0 && <ul aria-label="Ingredients to search" className="mt-3 flex flex-wrap gap-2">
            {ingredients.map((ingredient, index) => <li key={ingredient} className={`inline-flex max-w-full items-center gap-1 rounded-full border py-1 pl-3 pr-1 text-xs font-semibold ${["border-[#f08b68]/25 bg-[#f08b68]/10 text-[#ffad91]", "border-[#76efb5]/20 bg-[#76efb5]/[0.08] text-[#96f2c2]", "border-[#f0b96a]/25 bg-[#f0b96a]/10 text-[#f2cc91]", "border-[#9e9af3]/25 bg-[#9e9af3]/10 text-[#c2beff]"][index % 4]}`}>
              <span className="break-words">{ingredient}</span>
              <button type="button" aria-label={`Remove ${ingredient}`} onClick={() => setIngredients((current) => current.filter((item) => item !== ingredient))} disabled={status === "searching"} className="grid size-7 shrink-0 place-items-center rounded-full transition hover:bg-black/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-50"><X size={14} aria-hidden="true" /></button>
            </li>)}
          </ul>}
          {formError && <p id="ingredient-error" role="alert" className="mt-2 text-sm font-medium text-[#ff9a91]">{formError}</p>}
        </form>
        <p className="mt-4 flex items-center gap-2 text-xs leading-5 text-[#8c99a5]"><ShieldCheck size={15} className="shrink-0 text-[#76efb5]" aria-hidden="true" /> Recipes link to their original publishers. Check allergy and nutrition details on the source site.</p>
      </div>

      <aside id="recipe-results" aria-labelledby="results-title" className="min-w-0 overflow-hidden rounded-[28px] border border-white/[0.08] bg-[rgba(13,18,25,0.94)] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.32)] sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#91a0af]">Recipe feed</p><h2 id="results-title" className="mt-1 text-2xl font-black text-[#f0f4f8]">Your recipe matches</h2></div>
          <span className="rounded-full border border-[#a49afa]/30 bg-[#a49afa]/10 px-3 py-1.5 text-[11px] font-bold text-[#c3baff]">Nutrition view</span>
        </div>
        <div className="min-w-0" aria-live="polite">
          {status === "idle" && <div className="relative flex min-h-[390px] flex-col justify-between overflow-hidden rounded-[22px] border border-white/[0.08] bg-[radial-gradient(ellipse_at_80%_15%,_rgba(121,104,181,.22),_transparent_38%),radial-gradient(ellipse_at_15%_90%,_rgba(66,157,113,.15),_transparent_40%),linear-gradient(150deg,_#151d25,_#171820)] p-5 sm:min-h-[520px] sm:p-7">
            <div className="absolute -right-12 top-20 size-64 rounded-full border border-[#a49afa]/20 shadow-[0_0_0_18px_rgba(164,154,250,.025),0_0_60px_rgba(164,154,250,.07)]" aria-hidden="true" />
            <div className="relative max-w-md">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#f0b96a]/25 bg-[#f0b96a]/[0.08] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#f0c987]"><Sparkles size={13} aria-hidden="true" /> Kitchen inspiration</span>
              <h3 className="mt-5 text-3xl font-black leading-tight text-white">A new meal is one good idea away.</h3>
              <p className="mt-3 text-sm leading-6 text-[#aebac5]">Enter what’s in your kitchen. We’ll find real publisher recipes and show their ingredient matches and nutrition when available.</p>
            </div>
            <div id="nutrition-guide" className="relative mt-8 grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-[#76efb5]/15 bg-[#76efb5]/[0.06] p-3"><p className="text-[10px] font-bold uppercase text-[#83eab5]">Match</p><p className="mt-1 text-xs text-[#c3cdd3]">Your pantry</p></div>
              <div className="rounded-xl border border-[#f0b96a]/15 bg-[#f0b96a]/[0.06] p-3"><p className="text-[10px] font-bold uppercase text-[#f1c67e]">Compare</p><p className="mt-1 text-xs text-[#c3cdd3]">Per serving</p></div>
              <div className="rounded-xl border border-[#a49afa]/15 bg-[#a49afa]/[0.06] p-3"><p className="text-[10px] font-bold uppercase text-[#bab2ff]">Discover</p><p className="mt-1 text-xs text-[#c3cdd3]">Real recipes</p></div>
            </div>
          </div>}
          {status === "searching" && <RecipeSearchSkeleton />}
          {status === "error" && <AnalysisError issues={[error]} onRetry={() => { setStatus("idle"); setError(""); setResult(undefined); }} />}
          {status === "success" && result && <RecipeResults recipes={result.recipes} requestedIngredients={searchedIngredients} message={result.message} />}
        </div>
      </aside>
    </section>

    <footer className="mt-5 flex flex-wrap items-center justify-between gap-2 px-2 py-3 text-xs text-[#798692] sm:px-3">
      <span>Thoughts4food · ingredient-first recipe discovery</span>
      <span>Recipe details and images are attributed to original publishers.</span>
    </footer>
  </main>;
}
