"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Bookmark, ExternalLink, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import type { RecipeSearchItem } from "@/lib/recipes/types";
import { validateRecipeSourceUrl } from "@/lib/recipes/source-url";

interface RecipeResultsProps {
  recipes: RecipeSearchItem[];
  requestedIngredients: string[];
  message?: string;
}

function RecipeImage({ src, alt }: { src: string; alt: string }) {
  const [unavailable, setUnavailable] = useState(false);
  if (unavailable) return null;
  return <div className="relative aspect-[16/8] bg-[#f2f4ee]">
    <Image src={src} alt={alt} fill unoptimized sizes="(max-width: 1280px) 100vw, 50vw" className="object-cover" onError={() => setUnavailable(true)} />
  </div>;
}

export function RecipeResults({ recipes, requestedIngredients, message }: RecipeResultsProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeSearchItem | null>(null);
  const [sourceErrorId, setSourceErrorId] = useState<string | null>(null);
  const [savedRecipeIds, setSavedRecipeIds] = useState<Set<string>>(() => new Set());
  const sourceButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!selectedRecipe && sourceButtonRef.current) sourceButtonRef.current.focus();
  }, [selectedRecipe]);

  if (recipes.length === 0) {
    return <section aria-labelledby="recipe-results-title" className="space-y-3">
      <h2 id="recipe-results-title" className="text-2xl font-semibold text-[#f0f4f8]">Recipe matches</h2>
      <div role="status" className="rounded-2xl border border-white/[0.08] bg-[#141a22] p-5 text-sm text-[#b4bec9]">
        {message ?? "No matching recipes were found. Try adding or changing ingredients."}
      </div>
    </section>;
  }

  return <section aria-labelledby="recipe-results-title" className="space-y-4">
    <div className="flex flex-wrap items-end justify-between gap-3 px-1">
      <div>
        <p className="text-xs font-bold uppercase text-[#f08a68]">Recipe matches</p>
        <h2 id="recipe-results-title" className="mt-1 text-2xl font-black text-[#f0f4f8]">Fresh from the recipe feed</h2>
        <p className="mt-1 text-sm text-[#a7b2bf]">Publisher recipes ranked by how many of your ingredients they use.</p>
      </div>
      <span className="rounded-full border border-[#f08a68]/25 bg-[#f08a68]/10 px-3 py-1.5 text-xs font-bold text-[#ffad91]">{recipes.length} {recipes.length === 1 ? "post" : "posts"}</span>
      {message && <p role="status" className="w-full text-sm text-[#f2c987]">{message}</p>}
    </div>

    <section aria-labelledby="ingredient-match-title" className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#141a22]">
      <div className="border-b border-white/[0.08] bg-[linear-gradient(100deg,_rgba(240,138,104,.11),_rgba(164,154,250,.10),_rgba(118,239,181,.07))] px-4 py-3">
        <h3 id="ingredient-match-title" className="font-semibold text-[#f0f4f8]">Ingredient match</h3>
        <p className="mt-1 text-xs text-[#a0adba]">Compare how many of your ingredients appear in each recipe.</p>
      </div>
      <div className="min-w-0 max-w-full overflow-x-auto">
        <table className="min-w-[420px] w-full border-collapse text-left text-sm">
          <thead className="bg-[#1a222c] text-xs uppercase text-[#a0adba]">
            <tr>
              <th scope="col" className="sticky left-0 bg-[#1a222c] px-4 py-3">Ingredients matched</th>
              {recipes.map((recipe, index) => <th scope="col" key={recipe.id} className={`min-w-36 px-4 py-3 align-top normal-case ${["text-[#ffad91]", "text-[#91edba]", "text-[#f2c987]", "text-[#c2bbff]"][index % 4]}`}>{recipe.title}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06] text-[#d7dfe6]">
            <tr>
              <th scope="row" className="sticky left-0 bg-[#141a22] px-4 py-3 font-medium text-[#b9c4ce]">Your ingredients used</th>
              {recipes.map((recipe) => <td key={recipe.id} className="px-4 py-3">{recipe.usedIngredients.length} of {requestedIngredients.length}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div className="grid gap-4 xl:grid-cols-2">
      {recipes.map((recipe) => {
        const matchingIngredientCount = recipe.usedIngredients.filter((ingredient) => requestedIngredients.some((requested) => requested.toLocaleLowerCase() === ingredient.toLocaleLowerCase())).length;

        const isSaved = savedRecipeIds.has(recipe.id);

        return <article key={recipe.id} aria-labelledby={`recipe-${recipe.id}`} className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#131920] shadow-[0_12px_34px_rgba(0,0,0,0.24)]">
          <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-[13px] bg-[linear-gradient(145deg,_#69efb5,_#70c6ec)] text-xs font-black text-[#102019]" aria-hidden="true">T4F</div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[#edf3f8]">Thoughts4food</p>
                <p className="truncate text-xs text-[#94a1ae]">Recipe pick · {recipe.publisher}</p>
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-[#76efb5]/20 bg-[#76efb5]/[0.08] px-2.5 py-1 text-[11px] font-bold text-[#91edba]">{matchingIngredientCount} matched</span>
          </div>
          {recipe.imageUrl && <RecipeImage src={recipe.imageUrl} alt={recipe.title} />}
          <div className="space-y-4 p-4">
            <div>
              <h3 id={`recipe-${recipe.id}`} className="text-xl font-semibold text-[#f0f4f8]">{recipe.title}</h3>
              <p className="mt-1 text-sm text-[#9ba8b4]">From {recipe.publisher}</p>
              <Button type="button" variant="outline" className="mt-2 min-h-10 rounded-xl border-[#76efb5]/25 bg-[#76efb5]/[0.06] px-3 text-[#91edba] hover:bg-[#76efb5]/[0.12]" onClick={(event) => {
                sourceButtonRef.current = event.currentTarget;
                if (!validateRecipeSourceUrl(recipe.sourceUrl)) {
                  setSourceErrorId(recipe.id);
                  setSelectedRecipe(null);
                  return;
                }
                setSourceErrorId(null);
                setSelectedRecipe(recipe);
              }}><ExternalLink size={16} aria-hidden="true" /> View Original Recipe</Button>
              {sourceErrorId === recipe.id && <p id={`recipe-source-error-${recipe.id}`} role="alert" className="mt-2 text-sm text-red-700">This recipe does not have a valid secure source website to open.</p>}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#536458]">
              {recipe.servings !== null && <span>Serves {recipe.servings}</span>}
              {recipe.preparationTimeMinutes !== null && <span>{recipe.preparationTimeMinutes} min</span>}
              <span className="font-semibold text-[#91edba]">Uses {matchingIngredientCount} of {requestedIngredients.length} ingredients</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <h4 className="text-sm font-semibold text-[#8ae8bd]">Matched to your list ({matchingIngredientCount})</h4>
                {recipe.usedIngredients.length > 0
                  ? <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-[#c0cbd4]">{recipe.usedIngredients.map((ingredient, index) => <li key={`${recipe.id}-used-${index}`}>{ingredient}</li>)}</ul>
                  : <p className="mt-1 text-sm text-[#8f9ca8]">No submitted ingredients were matched.</p>}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#f2bd72]">Additional ingredients needed ({recipe.missingIngredients.length})</h4>
                {recipe.missingIngredients.length > 0
                  ? <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-[#c0cbd4]">{recipe.missingIngredients.map((ingredient, index) => <li key={`${recipe.id}-missing-${index}`}>{ingredient}</li>)}</ul>
                  : <p className="mt-1 text-sm text-[#8f9ca8]">No additional ingredients listed by the provider.</p>}
              </div>
            </div>

            <details className="border-t border-white/[0.08] pt-3">
              <summary className="cursor-pointer text-sm font-semibold text-[#eaf0f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#76efb5]">View Ingredients</summary>
              {recipe.ingredients.length > 0
                ? <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#c0cbd4]">{recipe.ingredients.map((ingredient, index) => <li key={`${recipe.id}-ingredient-${index}`}>{ingredient}</li>)}</ul>
                : <p className="mt-2 text-sm text-[#8f9ca8]">The provider did not return a complete ingredient list. See the original recipe source.</p>}
            </details>
          </div>
          <div className="flex items-center justify-between border-t border-white/[0.07] bg-[#10161d] px-4 py-3 sm:px-5">
            <div className="flex items-center gap-1 text-xs text-[#91a0ad]">
              <MessageCircle size={15} aria-hidden="true" />
              <span>Original recipe by {recipe.publisher}</span>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" aria-pressed={isSaved} aria-label={isSaved ? `Remove ${recipe.title} from saved recipes` : `Save ${recipe.title}`} onClick={() => setSavedRecipeIds((current) => {
                const next = new Set(current);
                if (next.has(recipe.id)) next.delete(recipe.id);
                else next.add(recipe.id);
                return next;
              })} className={`inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0b96a] ${isSaved ? "bg-[#f08a68]/10 text-[#ffad91]" : "text-[#a7b2bf] hover:bg-white/[0.06]"}`}>
                <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} aria-hidden="true" />{isSaved ? "Saved" : "Save"}
              </button>
              <button type="button" aria-label={`Share ${recipe.title}`} onClick={async () => {
                try {
                  if (navigator.share) await navigator.share({ title: recipe.title, url: recipe.sourceUrl });
                } catch { /* Share was dismissed or unavailable. */ }
              }} className="grid size-10 place-items-center rounded-full text-[#a7b2bf] transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#76efb5]"><Share2 size={16} aria-hidden="true" /></button>
            </div>
          </div>
        </article>;
      })}
    </div>

    <p className="text-xs leading-5 text-[#8794a1]">Recipe information and images are attributed to the provider and original publisher. Follow the linked recipe page for nutrition details and cooking instructions.</p>
    <span className="sr-only">Search included: {requestedIngredients.join(", ")}</span>
    {selectedRecipe && <Dialog open title="You're leaving Thoughts4food" onClose={() => setSelectedRecipe(null)} descriptionId="external-recipe-description">
      <ExternalRecipeConfirmation recipe={selectedRecipe} onStay={() => setSelectedRecipe(null)} />
    </Dialog>}
  </section>;
}

function ExternalRecipeConfirmation({ recipe, onStay }: { recipe: RecipeSearchItem; onStay: () => void }) {
  const source = validateRecipeSourceUrl(recipe.sourceUrl);
  if (!source) return <p role="alert" className="text-sm text-red-700">This recipe does not have a valid secure source website to open.</p>;

  return <div className="space-y-4">
    <p id="external-recipe-description" className="text-sm leading-6 text-[#c1cbd5]">This recipe is hosted on an external website. Would you like to continue?</p>
    <p className="rounded-xl border border-white/[0.08] bg-[#1c2530] px-3 py-2 text-sm text-[#c1cbd5]">Destination: <span className="font-semibold text-[#91edba]">{source.hostname}</span></p>
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button type="button" variant="outline" className="rounded-xl border-white/15 text-[#e2e8ee] hover:bg-white/[0.06]" onClick={onStay}>Stay Here</Button>
      <Button type="button" className="rounded-xl bg-[linear-gradient(115deg,_#78efb5,_#76cbe9)] text-[#102019] hover:brightness-105" onClick={() => {
        window.open(source.url, "_blank", "noopener,noreferrer");
        onStay();
      }}>Continue to Recipe</Button>
    </div>
  </div>;
}