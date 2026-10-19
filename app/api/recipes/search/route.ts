import { NextResponse } from "next/server";
import { normalizeIngredients } from "@/lib/analysis/ingredients";
import { RecipeSearchError } from "@/lib/recipes/types";
import { searchSpoonacularRecipes } from "@/lib/recipes/spoonacular";

const maxIngredients = 20;
const maxIngredientLength = 80;
const maxRequestBytes = 16 * 1024;

async function readRequestJson(request: Request): Promise<unknown> {
  if (!request.body) throw new SyntaxError("Missing request body");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > maxRequestBytes) {
      await reader.cancel();
      throw new RangeError("Request body too large");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
}

function responseForError(error: unknown) {
  if (!(error instanceof RecipeSearchError)) {
    return NextResponse.json({ recipes: [], message: "Recipe search is temporarily unavailable. Please try again." }, { status: 502 });
  }
  const messages = {
    "not-configured": "Recipe search is not configured yet. Add SPOONACULAR_API_KEY to the server environment.",
    "invalid-key": "Recipe search credentials were rejected. Check the server-side SPOONACULAR_API_KEY setting.",
    "rate-limit": "Recipe search is busy right now. Please wait a moment and try again.",
    quota: "The recipe provider quota has been reached. Check your Spoonacular plan and try again later.",
    timeout: "Recipe search took too long to respond. Please try again.",
    provider: "Recipe search is temporarily unavailable. Please try again."
  } satisfies Record<RecipeSearchError["code"], string>;
  const status = error.code === "not-configured" ? 503 : error.code === "rate-limit" || error.code === "quota" ? 429 : error.code === "timeout" ? 504 : 502;
  return NextResponse.json({ recipes: [], message: messages[error.code] }, { status });
}

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > maxRequestBytes) {
      return NextResponse.json({ recipes: [], message: "The ingredient request is too large. Shorten the ingredient list and try again." }, { status: 413 });
    }
    let body: unknown;
    try {
      body = await readRequestJson(request);
    } catch (error) {
      if (error instanceof RangeError) {
        return NextResponse.json({ recipes: [], message: "The ingredient request is too large. Shorten the ingredient list and try again." }, { status: 413 });
      }
      return NextResponse.json({ recipes: [], message: "The recipe search request was not valid JSON." }, { status: 400 });
    }
    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ recipes: [], message: "Submit an ingredient list to search recipes." }, { status: 400 });
    }
    if (!Array.isArray((body as { ingredients?: unknown }).ingredients)) {
      return NextResponse.json({ recipes: [], message: "Submit an ingredient list to search recipes." }, { status: 400 });
    }
    const rawIngredients = (body as { ingredients: unknown[] }).ingredients;
    if (rawIngredients.some((value) => typeof value !== "string")) {
      return NextResponse.json({ recipes: [], message: "Ingredients must be text values." }, { status: 400 });
    }
    const ingredients = normalizeIngredients(rawIngredients as string[]);
    if (ingredients.length === 0) {
      return NextResponse.json({ recipes: [], message: "Add at least one ingredient before searching." }, { status: 400 });
    }
    if (ingredients.length > maxIngredients || ingredients.some((value) => value.length > maxIngredientLength) || ingredients.join(",").length > 500) {
      return NextResponse.json({ recipes: [], message: "Use up to 20 ingredients, with no ingredient longer than 80 characters." }, { status: 400 });
    }

    const result = await searchSpoonacularRecipes(ingredients);
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return responseForError(error);
  }
}