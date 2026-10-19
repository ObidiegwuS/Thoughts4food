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

function formatNumber(value: number | null, suffix = ""): string | null {
  return value === null ? null : `${Number.isInteger(value) ? value : value.toFixed(1)}${suffix}`;
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
      <h2 id="recipe-results-title" className="text-2xl font-semibold text-[#1e2a1f]">Recipe matches</h2>
      <div role="status" className="rounded-2xl border border-[#ebebeb] bg-white/80 p-5 text-sm text-[#536458]">
        {message ?? "No matching recipes were found. Try adding or changing ingredients."}
      </div>
    </section>;
  }

  return <section aria-labelledby="recipe-results-title" className="space-y-4">
    <div className="flex flex-wrap items-end justify-between gap-3 px-1">
      <div>
        <p className="text-xs font-bold uppercase text-[#c45137]">Thoughts4food picks</p>
        <h2 id="recipe-results-title" className="mt-1 text-2xl font-black text-[#3c3129]">Fresh from the recipe feed</h2>
        <p className="mt-1 text-sm text-[#746c61]">Publisher recipes ranked by how many of your ingredients they use.</p>
      </div>
      <span className="rounded-full border border-[#f0d0bd] bg-[#fff0e8] px-3 py-1.5 text-xs font-bold text-[#a7432e]">{recipes.length} {recipes.length === 1 ? "post" : "posts"}</span>
      {message && <p role="status" className="w-full text-sm text-[#7d5b22]">{message}</p>}
    </div>

    <section aria-labelledby="nutrition-comparison-title" className="overflow-hidden rounded-2xl border border-[#ecdcca] bg-[#fffdfa]">
      <div className="border-b border-[#f0e5d9] bg-[linear-gradient(100deg,_#fff5ec,_#fff8eb)] px-4 py-3">
        <h3 id="nutrition-comparison-title" className="font-semibold text-[#3c3129]">Nutrition comparison</h3>
        <p className="mt-1 text-xs text-[#746c61]">Provider estimates per serving. Values may vary with brands, ingredient quantities, substitutions, and preparation.</p>
      </div>
      <div className="min-w-0 max-w-full overflow-x-auto">
        <table className="min-w-[620px] w-full border-collapse text-left text-sm">
          <thead className="bg-[#fff5eb] text-xs uppercase text-[#746c61]">
            <tr>
              <th scope="col" className="sticky left-0 bg-[#fff5eb] px-4 py-3">Per serving</th>
              {recipes.map((recipe, index) => <th scope="col" key={recipe.id} className={`min-w-36 px-4 py-3 align-top normal-case ${["text-[#b84b34]", "text-[#286a4f]", "text-[#8a661f]"][index % 3]}`}>{recipe.title}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0e9df] text-[#443c33]">
            {([
              ["Calories", (recipe: RecipeSearchItem) => formatNumber(recipe.caloriesPerServing, " kcal")],
              ["Protein", (recipe: RecipeSearchItem) => formatNumber(recipe.proteinGramsPerServing, " g")],
              ["Carbohydrates", (recipe: RecipeSearchItem) => formatNumber(recipe.carbohydratesGramsPerServing, " g")],
              ["Fat", (recipe: RecipeSearchItem) => formatNumber(recipe.fatGramsPerServing, " g")]
            ] as const).map(([label, getValue]) => <tr key={label}>
              <th scope="row" className="sticky left-0 bg-[#fffdfa] px-4 py-3 font-medium">{label}</th>
              {recipes.map((recipe) => <td key={recipe.id} className="px-4 py-3">{getValue(recipe) ?? "Unavailable"}</td>)}
            </tr>)}
            <tr>
              <th scope="row" className="sticky left-0 bg-[#fffdfa] px-4 py-3 font-medium">Ingredients used</th>
              {recipes.map((recipe) => <td key={recipe.id} className="px-4 py-3">{recipe.usedIngredients.length} of {requestedIngredients.length}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div className="grid gap-4 xl:grid-cols-2">
      {recipes.map((recipe) => {
        const nutrition = [
          ["Calories", formatNumber(recipe.caloriesPerServing, " kcal")],
          ["Protein", formatNumber(recipe.proteinGramsPerServing, " g protein")],
          ["Carbohydrates", formatNumber(recipe.carbohydratesGramsPerServing, " g carbohydrates")],
          ["Fat", formatNumber(recipe.fatGramsPerServing, " g fat")]
        ] as const;
        const hasNutrition = nutrition.some(([, value]) => value !== null);
        const matchingIngredientCount = recipe.usedIngredients.filter((ingredient) => requestedIngredients.some((requested) => requested.toLocaleLowerCase() === ingredient.toLocaleLowerCase())).length;

        const isSaved = savedRecipeIds.has(recipe.id);

        return <article key={recipe.id} aria-labelledby={`recipe-${recipe.id}`} className="overflow-hidden rounded-2xl border border-[#eadfd2] bg-[#fffdfa] shadow-[0_9px_28px_rgba(112,68,42,0.08)]">
          <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[linear-gradient(145deg,_#f5bd64_0%,_#e47748_48%,_#287357_100%)] text-xs font-black text-white" aria-hidden="true">T4F</div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[#3c3129]">Thoughts4food</p>
                <p className="truncate text-xs text-[#818980]">Recipe pick · {recipe.publisher}</p>
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-[#dce9dc] bg-[#f2f8f0] px-2.5 py-1 text-[11px] font-bold text-[#286a4f]">{matchingIngredientCount} matched</span>
          </div>
          {recipe.imageUrl && <RecipeImage src={recipe.imageUrl} alt={recipe.title} />}
          <div className="space-y-4 p-4">
            <div>
              <h3 id={`recipe-${recipe.id}`} className="text-xl font-semibold text-[#1e2a1f]">{recipe.title}</h3>
              <p className="mt-1 text-sm text-[#6b7d72]">From {recipe.publisher}</p>
              <Button type="button" variant="outline" className="mt-2 min-h-10 rounded-xl border-[#cfe3d7] px-3 text-[#1d5d46]" onClick={(event) => {
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
              <span className="font-semibold text-[#1d5d46]">Uses {matchingIngredientCount} of {requestedIngredients.length} ingredients</span>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-[#6b7d72]">Estimated per serving</p>
              {hasNutrition ? <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {nutrition.map(([name, value], index) => <div key={name} className={`rounded-xl px-3 py-2 ${["bg-[#fff0e8]", "bg-[#eef6ea]", "bg-[#edf5fb]", "bg-[#fff4dc"][index]}`}>
                  <dt className="text-[11px] font-medium uppercase text-[#6b7d72]">{name}</dt>
                  <dd className="mt-1 font-semibold text-[#1e2a1f]">{value ?? "Unavailable"}</dd>
                </div>)}
              </dl> : <p className="rounded-xl bg-[#fff4e8] px-3 py-2 text-sm text-[#796a58]">Nutrition unavailable from the recipe provider.</p>}
              {hasNutrition && <p className="mt-2 text-xs text-[#6b7d72]">Actual nutrition can vary with ingredient brands, quantities, substitutions, and preparation.</p>}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <h4 className="text-sm font-semibold text-[#286a4f]">Matched to your list ({matchingIngredientCount})</h4>
                {recipe.usedIngredients.length > 0
                  ? <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-[#536458]">{recipe.usedIngredients.map((ingredient) => <li key={ingredient}>{ingredient}</li>)}</ul>
                  : <p className="mt-1 text-sm text-[#6b7d72]">No submitted ingredients were matched.</p>}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#a45a2c]">Additional ingredients needed ({recipe.missingIngredients.length})</h4>
                {recipe.missingIngredients.length > 0
                  ? <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-[#536458]">{recipe.missingIngredients.map((ingredient) => <li key={ingredient}>{ingredient}</li>)}</ul>
                  : <p className="mt-1 text-sm text-[#6b7d72]">No additional ingredients listed by the provider.</p>}
              </div>
            </div>

            <details className="border-t border-[#f0e5d9] pt-3">
              <summary className="cursor-pointer text-sm font-semibold text-[#1e2a1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d5d46]">View Ingredients</summary>
              {recipe.ingredients.length > 0
                ? <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#536458]">{recipe.ingredients.map((ingredient, index) => <li key={`${recipe.id}-ingredient-${index}`}>{ingredient}</li>)}</ul>
                : <p className="mt-2 text-sm text-[#6b7d72]">The provider did not return a complete ingredient list. See the original recipe source.</p>}
            </details>
          </div>
          <div className="flex items-center justify-between border-t border-[#f0e5d9] bg-[#fffaf4] px-4 py-3 sm:px-5">
            <div className="flex items-center gap-1 text-xs text-[#758076]">
              <MessageCircle size={15} aria-hidden="true" />
              <span>Original recipe by {recipe.publisher}</span>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" aria-pressed={isSaved} aria-label={isSaved ? `Remove ${recipe.title} from saved recipes` : `Save ${recipe.title}`} onClick={() => setSavedRecipeIds((current) => {
                const next = new Set(current);
                if (next.has(recipe.id)) next.delete(recipe.id);
                else next.add(recipe.id);
                return next;
              })} className={`inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c94e35] ${isSaved ? "bg-[#fff0e8] text-[#b84b34]" : "text-[#766f65] hover:bg-[#fff0e8]"}`}>
                <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} aria-hidden="true" />{isSaved ? "Saved" : "Save"}
              </button>
              <button type="button" aria-label={`Share ${recipe.title}`} onClick={async () => {
                try {
                  if (navigator.share) await navigator.share({ title: recipe.title, url: recipe.sourceUrl });
                } catch { /* Share was dismissed or unavailable. */ }
              }} className="grid size-10 place-items-center rounded-full text-[#766f65] transition hover:bg-[#eef6ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#286a4f]"><Share2 size={16} aria-hidden="true" /></button>
            </div>
          </div>
        </article>;
      })}
    </div>

    <p className="text-xs leading-5 text-[#746c61]">Recipe data and images provided by <a href="https://spoonacular.com/food-api" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#b84b34] underline underline-offset-2">Spoonacular</a>. Nutrition values are provider estimates when supplied; follow the linked publisher page for the authoritative recipe and instructions.</p>
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
    <p id="external-recipe-description" className="text-sm leading-6 text-[#536458]">This recipe is hosted on an external website. Would you like to continue?</p>
    <p className="rounded-xl bg-[#f5f8f4] px-3 py-2 text-sm text-[#34453a]">Destination: <span className="font-semibold">{source.hostname}</span></p>
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button type="button" variant="outline" className="rounded-xl" onClick={onStay}>Stay Here</Button>
      <Button type="button" className="rounded-xl bg-[#1d5d46] text-white hover:opacity-90" onClick={() => {
        window.open(source.url, "_blank", "noopener,noreferrer");
        onStay();
      }}>Continue to Recipe</Button>
    </div>
  </div>;
}