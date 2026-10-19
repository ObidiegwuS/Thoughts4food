import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/analyze/route";
import { appendFoodSearchTerm, parseFoodSearchTerms } from "@/lib/providers/fixture-analysis-provider";

describe("analysis route", () => {
  it("returns provider-neutral food results", async () => {
    const response = await POST(new Request("http://localhost/api/analyze", { method: "POST", body: JSON.stringify({ imageReference: "single-food", mimeType: "image/jpeg", sizeBytes: 100 }) }));
    const result = await response.json();
    expect(response.status).toBe(200);
    expect(result.status).toBe("succeeded");
    expect(result.foodItems).toHaveLength(1);
  });

  it("accepts a text food search query without an uploaded image", async () => {
    const response = await POST(new Request("http://localhost/api/analyze", { method: "POST", body: JSON.stringify({ foodQuery: "salmon and rice", restrictions: [] }) }));
    const result = await response.json();
    expect(response.status).toBe(200);
    expect(result.status).toBe("succeeded");
    expect(result.imageReference).toContain("salmon");
    expect(result.foodItems.some((food: { displayName: string }) => food.displayName.toLowerCase().includes("salmon"))).toBe(true);
    expect(result.foodItems.some((food: { displayName: string }) => food.displayName.toLowerCase().includes("rice"))).toBe(true);
  });

  it("accepts comma-separated foods and returns multiple matching items", async () => {
    const response = await POST(new Request("http://localhost/api/analyze", { method: "POST", body: JSON.stringify({ foodQuery: "salmon, rice, broccoli", restrictions: [] }) }));
    const result = await response.json();
    expect(response.status).toBe(200);
    expect(result.status).toBe("succeeded");
    expect(result.foodItems.length).toBeGreaterThanOrEqual(3);
    expect(result.foodItems.some((food: { displayName: string }) => food.displayName.toLowerCase().includes("salmon"))).toBe(true);
    expect(result.foodItems.some((food: { displayName: string }) => food.displayName.toLowerCase().includes("rice"))).toBe(true);
    expect(result.foodItems.some((food: { displayName: string }) => food.displayName.toLowerCase().includes("broccoli"))).toBe(true);
  });

  it("accepts a structured ingredient list and removes duplicates", async () => {
    const response = await POST(new Request("http://localhost/api/analyze", { method: "POST", body: JSON.stringify({ ingredients: [" salmon ", "rice", "SALMON"], restrictions: [] }) }));
    const result = await response.json();
    expect(response.status).toBe(200);
    expect(result.status).toBe("succeeded");
    expect(result.imageReference).toBe("salmon, rice");
    expect(result.foodItems).toHaveLength(2);
  });

  it("rejects an empty ingredient submission with a helpful message", async () => {
    const response = await POST(new Request("http://localhost/api/analyze", { method: "POST", body: JSON.stringify({ ingredients: ["  ", ""], restrictions: [] }) }));
    const result = await response.json();
    expect(response.status).toBe(400);
    expect(result.qualityIssues).toContain("Add at least one ingredient to get started.");
  });

  it("splits natural-language and comma-separated entries into individual food terms", () => {
    expect(parseFoodSearchTerms("salmon and rice, broccoli")).toEqual(["salmon", "rice", "broccoli"]);
    expect(parseFoodSearchTerms(" chicken & brown rice ")).toEqual(["chicken", "brown rice"]);
  });

  it("keeps spaces between appended foods and preserves comma separators", () => {
    expect(appendFoodSearchTerm("check pea soup", "brown rice")).toBe("check pea soup brown rice");
    expect(appendFoodSearchTerm("check pea soup, brown rice", "broccoli")).toBe("check pea soup, brown rice, broccoli");
    expect(appendFoodSearchTerm("check pea soup,", "brown rice")).toBe("check pea soup, brown rice");
  });
});
