"use client";

import { useRef, useState } from "react";
import { BadgeCheck, Bookmark, Leaf, LoaderCircle, MessageCircle, Share2, ShieldCheck, Sparkles, UserRoundPlus, X } from "lucide-react";
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
  const [following, setFollowing] = useState(false);
  const [profileNotice, setProfileNotice] = useState("");

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

  return <main className="mx-auto min-h-screen w-full max-w-6xl px-3 py-5 sm:px-6 sm:py-8">
    <div className="overflow-hidden rounded-[1.75rem] border border-[#e8e4da] bg-[#fffdfa] shadow-[0_24px_70px_rgba(54,46,30,0.10)]">
      <header className="flex min-h-16 items-center justify-between gap-4 border-b border-[#eee9df] bg-white px-4 py-3 sm:px-7">
        <a href="#top" className="flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c94e35]" aria-label="Thoughts4food home">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[linear-gradient(145deg,_#f08a52,_#c94e35)] text-white shadow-sm"><Leaf size={20} aria-hidden="true" /></span>
          <span className="truncate text-lg font-black text-[#25372c]">Thoughts4food</span>
        </a>
        <nav aria-label="Profile navigation" className="hidden items-center gap-1 sm:flex">
          <a href="#profile" className="rounded-full px-4 py-2 text-sm font-semibold text-[#bd4a32] hover:bg-[#fff0e9]">Profile</a>
          <a href="#recipe-search" className="rounded-full px-4 py-2 text-sm font-medium text-[#657169] hover:bg-[#f5f6f2]">Discover</a>
          <a href="#recipe-feed" className="rounded-full px-4 py-2 text-sm font-medium text-[#657169] hover:bg-[#f5f6f2]">Recipes</a>
        </nav>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#68776d] sm:text-sm">
          <ShieldCheck size={17} className="text-[#1d5d46]" aria-hidden="true" />
          <span className="hidden sm:inline">Real publisher recipes</span>
          <span className="sm:hidden">Real recipes</span>
        </div>
      </header>

      <section id="top" aria-labelledby="profile-name" className="scroll-mt-5">
        <div
          className="relative flex min-h-[190px] items-end overflow-hidden bg-cover bg-center px-5 pb-5 pt-10 sm:min-h-[250px] sm:px-8 sm:pb-7"
          style={{ backgroundImage: "linear-gradient(90deg, rgba(70,31,22,.72), rgba(70,31,22,.04) 82%), linear-gradient(0deg, rgba(70,31,22,.28), transparent 72%), repeating-linear-gradient(132deg, rgba(255,255,255,.045) 0px, rgba(255,255,255,.045) 1px, transparent 1px, transparent 17px), linear-gradient(112deg, #a93e35 0%, #d85b3e 34%, #e99849 68%, #75884e 100%)" }}
        >
          <div className="relative z-10 max-w-xl text-white">
            <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/40 bg-[#c94e35]/80 px-3 py-1.5 text-xs font-bold backdrop-blur-sm"><Sparkles size={14} aria-hidden="true" /> FOOD, FOUND IN YOUR FRIDGE</p>
            <h1 className="text-3xl font-black leading-tight sm:text-5xl">Find something good with what you have.</h1>
            <p className="mt-2 max-w-lg text-sm leading-6 text-white/85 sm:text-base">A little inspiration for making more of the ingredients already at home.</p>
          </div>
          <span className="absolute right-5 top-5 rounded-full border border-white/30 bg-black/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">Thoughts4food kitchen</span>
        </div>

        <div id="profile" className="flex scroll-mt-5 flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:pb-6">
          <div className="-mt-10 flex min-w-0 items-end gap-4 sm:-mt-12">
            <div className="grid size-[88px] shrink-0 place-items-center rounded-full border-4 border-[#fffdfa] bg-[linear-gradient(145deg,_#f5bd64_0%,_#e47748_48%,_#287357_100%)] text-xl font-black text-white shadow-md sm:size-28 sm:text-2xl" aria-hidden="true">T4F</div>
            <div className="min-w-0 pb-1">
              <p className="text-xs font-semibold uppercase text-[#768276]">Food creator · recipe discovery</p>
              <h2 id="profile-name" className="mt-1 flex flex-wrap items-center gap-2 text-2xl font-black text-[#3c3129] sm:text-3xl">Thoughts4food <BadgeCheck size={19} className="text-[#d76545]" aria-label="Thoughts4food profile" /></h2>
              <p className="mt-1 text-sm text-[#69766c]">@thoughts4food · Ingredient-first ideas, with nutrition in view.</p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2 sm:pb-1">
            <button type="button" aria-pressed={following} onClick={() => setFollowing((current) => !current)} className={`inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c94e35] sm:flex-none ${following ? "border border-[#f0d6c8] bg-[#fff4ec] text-[#9d432e]" : "bg-[linear-gradient(110deg,_#d96242,_#bc4431)] text-white shadow-sm hover:brightness-95"}`}>
              {following ? <Bookmark size={16} aria-hidden="true" /> : <UserRoundPlus size={16} aria-hidden="true" />}
              {following ? "Following" : "Follow"}
            </button>
            <button type="button" onClick={async () => {
              try {
                if (navigator.share) await navigator.share({ title: "Thoughts4food", url: window.location.href });
                else if (navigator.clipboard) { await navigator.clipboard.writeText(window.location.href); setProfileNotice("Profile link copied."); }
                else setProfileNotice("Copy this page address to share the profile.");
              } catch { setProfileNotice("Copy this page address to share the profile."); }
            }} className="grid size-11 place-items-center rounded-full border border-[#dedfd7] bg-white text-[#48584d] hover:bg-[#f5f6f2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d5d46]" aria-label="Share profile"><Share2 size={17} aria-hidden="true" /></button>
          </div>
        </div>
        {profileNotice && <p role="status" className="px-5 pb-3 text-right text-xs text-[#1d5d46] sm:px-8">{profileNotice}</p>}

        <nav aria-label="Creator content" className="flex gap-1 overflow-x-auto border-b border-[#eee9df] px-4 sm:px-8">
          <a href="#recipe-search" className="inline-flex min-h-12 shrink-0 items-center border-b-2 border-[#d65d40] px-4 text-sm font-bold text-[#bd4a32]">For you</a>
          <a href="#recipe-feed" className="inline-flex min-h-12 shrink-0 items-center border-b-2 border-transparent px-4 text-sm font-semibold text-[#7b857c] hover:text-[#bd4a32]">Recipe feed</a>
          <a href="#profile-notes" className="inline-flex min-h-12 shrink-0 items-center border-b-2 border-transparent px-4 text-sm font-semibold text-[#7b857c] hover:text-[#bd4a32]">About</a>
        </nav>
      </section>

      <section className="grid min-w-0 grid-cols-1 gap-6 bg-[linear-gradient(145deg,_#fff4ea_0%,_#fbf6eb_50%,_#eff6f0_100%)] px-3 py-5 sm:px-6 sm:py-7 lg:grid-cols-[minmax(265px,0.78fr)_minmax(0,1.5fr)] lg:items-start lg:px-8">
        <aside className="min-w-0 space-y-4 lg:sticky lg:top-5">
          <section id="recipe-search" aria-labelledby="composer-title" className="scroll-mt-5 overflow-hidden rounded-2xl border border-[#f0d9c8] bg-[#fffdf9] shadow-[0_8px_26px_rgba(132,69,42,0.07)]">
            <div className="flex items-center gap-3 border-b border-[#f4e8dc] bg-[linear-gradient(100deg,_#fff4eb,_#fffaf3)] px-4 py-4">
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[linear-gradient(145deg,_#f5bd64,_#d85e42)] text-sm font-black text-white" aria-hidden="true">T4F</div>
              <div className="min-w-0">
                <h2 id="composer-title" className="font-bold text-[#29382e]">Start a kitchen post</h2>
                <p className="text-xs text-[#798278]">Let’s see what you can make.</p>
              </div>
            </div>
            <form className="p-4" onSubmit={(event) => { event.preventDefault(); void searchRecipes(); }}>
              <label htmlFor="ingredient-text" className="text-sm font-semibold text-[#34443a]">What ingredients do you have?</label>
              <textarea
                id="ingredient-text"
                value={ingredientText}
                onChange={(event) => { setIngredientText(event.target.value); setFormError(""); }}
                onKeyDown={(event) => { if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) { event.preventDefault(); void searchRecipes(); } }}
                placeholder="Chicken, rice, spinach, eggs..."
                aria-invalid={Boolean(formError)}
                aria-describedby={formError ? "ingredient-error ingredient-help" : "ingredient-help"}
                disabled={status === "searching"}
                className="mt-2 min-h-32 w-full resize-y rounded-xl border border-[#eadfd3] bg-[#fffaf4] px-3 py-3 text-sm text-[#3c3129] placeholder:text-[#94877b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c94e35] disabled:opacity-60"
              />
              <p id="ingredient-help" className="mt-2 text-xs leading-5 text-[#788278]">Separate ingredients with commas or new lines. Use Ctrl+Enter to post.</p>
              <div className="mt-3 flex flex-col gap-2">
                <button type="button" onClick={() => addIngredients([ingredientText])} disabled={status === "searching" || !ingredientText.trim()} className="min-h-10 rounded-xl border border-[#eed5c4] px-3 text-sm font-semibold text-[#b64b32] transition hover:bg-[#fff4ec] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c94e35] disabled:cursor-not-allowed disabled:opacity-50">Add ingredient</button>
                <button type="submit" disabled={status === "searching"} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(110deg,_#d96242,_#bc4431)] px-4 text-sm font-bold text-white shadow-sm transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c94e35] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
                  {status === "searching" && <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />}
                  {status === "searching" ? "Finding recipes..." : "Find Recipes"}
                </button>
              </div>
              {ingredients.length > 0 && <ul aria-label="Ingredients to search" className="mt-3 flex flex-wrap gap-2">
                {ingredients.map((ingredient, index) => <li key={ingredient} className={`inline-flex max-w-full items-center gap-1 rounded-full border py-1 pl-3 pr-1 text-xs font-semibold ${["border-[#f0d0bd] bg-[#fff0e8] text-[#a7432e]", "border-[#dce9dc] bg-[#f2f8f0] text-[#1d5d46]", "border-[#ead9a8] bg-[#fff7df] text-[#87631e]"][index % 3]}`}>
                  <span className="break-words">{ingredient}</span>
                  <button type="button" aria-label={`Remove ${ingredient}`} onClick={() => setIngredients((current) => current.filter((item) => item !== ingredient))} disabled={status === "searching"} className="grid size-7 shrink-0 place-items-center rounded-full transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c94e35] disabled:opacity-50"><X size={14} aria-hidden="true" /></button>
                </li>)}
              </ul>}
              {formError && <p id="ingredient-error" role="alert" className="mt-2 text-sm font-medium text-red-700">{formError}</p>}
            </form>
          </section>

          <section id="profile-notes" className="scroll-mt-5 rounded-2xl border border-[#eadcc9] bg-[linear-gradient(135deg,_#fffaf1,_#fff1e7)] p-4 shadow-[0_8px_26px_rgba(132,69,42,0.05)]">
            <h3 className="text-sm font-bold text-[#34443a]">The kitchen notes</h3>
            <p className="mt-2 text-sm leading-6 text-[#6f7b71]">Real recipes from original publishers, ranked around what’s already in your kitchen.</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-[#eef4eb] px-2.5 py-1.5 text-[#316447]">Ingredient-led</span>
              <span className="rounded-full bg-[#fbf1df] px-2.5 py-1.5 text-[#87631e]">Nutrition aware</span>
            </div>
          </section>
        </aside>

        <div id="recipe-feed" className="min-w-0 scroll-mt-5 space-y-4" aria-live="polite">
          {status === "idle" && <article className="overflow-hidden rounded-2xl border border-[#e9e5da] bg-white shadow-[0_8px_26px_rgba(43,48,37,0.05)]">
            <div className="flex items-center gap-3 border-b border-[#efeee8] px-4 py-4 sm:px-5">
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[#eaf1e7] text-sm font-black text-[#1d5d46]" aria-hidden="true">T4F</div>
              <div><p className="font-bold text-[#29382e]">Thoughts4food</p><p className="text-xs text-[#818980]">Recipe inspiration · Start here</p></div>
            </div>
            <div className="relative min-h-[245px] overflow-hidden bg-[#bb5638] bg-cover bg-center p-5 sm:min-h-[300px] sm:p-7" style={{ backgroundImage: "linear-gradient(90deg, rgba(80,34,22,.72), rgba(80,34,22,.04)), url('https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=85')" }}>
              <div className="relative max-w-sm text-white">
                <p className="text-xs font-bold uppercase text-white/75">Your next food story</p>
                <h2 className="mt-2 text-2xl font-black leading-tight sm:text-3xl">Make the most of what’s already here.</h2>
                <p className="mt-2 text-sm leading-6 text-white/85">Drop a few ingredients into the kitchen post and discover source-linked recipes that put them to use.</p>
                <a href="#recipe-search" className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full bg-[#fff3e8] px-4 text-sm font-bold text-[#a74430] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Share your ingredients <MessageCircle size={15} aria-hidden="true" /></a>
              </div>
            </div>
            <div className="flex items-center gap-5 px-4 py-3 text-xs font-semibold text-[#7b857c] sm:px-5"><span>Real publisher links</span><span>Ingredient matches</span><span>Nutrition comparison</span></div>
          </article>}

          {status === "searching" && <RecipeSearchSkeleton />}
          {status === "error" && <AnalysisError issues={[error]} onRetry={() => { setStatus("idle"); setError(""); setResult(undefined); }} />}
          {status === "success" && result && <RecipeResults recipes={result.recipes} requestedIngredients={searchedIngredients} message={result.message} />}
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-[#eee9df] bg-white px-4 py-4 text-xs text-[#788278] sm:px-7">
        <span>Recipe information is attributed to original publishers.</span>
        <span>Confirm ingredients, allergens, and nutrition on the source page.</span>
      </footer>
    </div>
  </main>;
}
