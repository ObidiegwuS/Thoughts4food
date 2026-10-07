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
