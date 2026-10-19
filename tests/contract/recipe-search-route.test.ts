import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/recipes/search/route";

describe("recipe search route", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("returns a setup message when the server API key is absent", async () => {
    vi.stubEnv("SPOONACULAR_API_KEY", "");
    const response = await POST(new Request("http://localhost/api/recipes/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients: ["rice"] })
    }));
    const result = await response.json();
    expect(response.status).toBe(503);
    expect(result.message).toContain("SPOONACULAR_API_KEY");
    expect(JSON.stringify(result)).not.toContain("test-secret");
  });

  it("rejects empty, malformed, non-string, and oversized ingredient input", async () => {
    const empty = await POST(new Request("http://localhost/api/recipes/search", { method: "POST", body: JSON.stringify({ ingredients: [" "] }) }));
    const malformed = await POST(new Request("http://localhost/api/recipes/search", { method: "POST", body: "{" }));
    const nonString = await POST(new Request("http://localhost/api/recipes/search", { method: "POST", body: JSON.stringify({ ingredients: [null] }) }));
    const oversized = await POST(new Request("http://localhost/api/recipes/search", { method: "POST", headers: { "content-length": "20000" }, body: "{}" }));
    const oversizedStream = await POST(new Request("http://localhost/api/recipes/search", { method: "POST", body: JSON.stringify({ ingredients: ["x".repeat(17000)] }) }));
    const excessiveCount = await POST(new Request("http://localhost/api/recipes/search", { method: "POST", body: JSON.stringify({ ingredients: Array.from({ length: 21 }, (_, index) => `item ${index}`) }) }));

    expect(empty.status).toBe(400);
    expect(malformed.status).toBe(400);
    expect(nonString.status).toBe(400);
    expect(oversized.status).toBe(413);
    expect(oversizedStream.status).toBe(413);
    expect(excessiveCount.status).toBe(400);
  });
});