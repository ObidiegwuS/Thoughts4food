import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RecipeResults } from "@/components/recipes/recipe-results";
import type { RecipeSearchItem } from "@/lib/recipes/types";
import { validateRecipeSourceUrl } from "@/lib/recipes/source-url";

const recipe: RecipeSearchItem = {
  id: "123",
  title: "Chicken and Rice",
  imageUrl: null,
  publisher: "Example Publisher",
  sourceUrl: "https://publisher.example/chicken-rice",
  usedIngredients: ["chicken", "rice"],
  missingIngredients: ["olive oil"],
  ingredients: ["1 lb chicken breast", "2 cups brown rice"],
  servings: 4,
  caloriesPerServing: 420,
  proteinGramsPerServing: 30,
  carbohydratesGramsPerServing: null,
  fatGramsPerServing: 12,
  preparationTimeMinutes: 35
};

describe("recipe results", () => {
  it("renders source attribution, ingredient match comparison, and ingredient details without nutrition facts", () => {
    render(<RecipeResults recipes={[recipe]} requestedIngredients={["chicken", "rice", "tomatoes"]} />);

    expect(screen.getByRole("button", { name: /view original recipe/i })).toBeInTheDocument();
    expect(screen.getByText("Uses 2 of 3 ingredients")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /ingredient match/i })).toBeInTheDocument();
    expect(screen.queryByText(/calories|protein|carbohydrates|fat|nutrition unavailable/i)).not.toBeInTheDocument();
    expect(screen.getByText("Matched to your list (2)")).toBeInTheDocument();
    expect(screen.getByText("View Ingredients")).toBeInTheDocument();
    expect(screen.getByText("olive oil")).toBeInTheDocument();
  });

  it("shows an actionable empty-results message", () => {
    render(<RecipeResults recipes={[]} requestedIngredients={["dragon fruit"]} message="No matching recipes were returned. Try adding or changing ingredients." />);
    expect(screen.getByRole("status")).toHaveTextContent(/try adding or changing ingredients/i);
  });

  it.each([
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "http://publisher.example/recipe",
    "//publisher.example/recipe",
    "https://user:pass@publisher.example/recipe",
    "not a url"
  ])("rejects unsafe recipe URL %s", (url) => {
    expect(validateRecipeSourceUrl(url)).toBeNull();
  });

  it("accepts a valid HTTPS API source and returns only its hostname", () => {
    expect(validateRecipeSourceUrl("https://recipes.publisher.example/path?id=123")).toEqual({
      url: "https://recipes.publisher.example/path?id=123",
      hostname: "recipes.publisher.example"
    });
  });
});