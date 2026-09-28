import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/analyze/route";

describe("analysis route", () => {
  it("returns provider-neutral food results", async () => {
    const response = await POST(new Request("http://localhost/api/analyze", { method: "POST", body: JSON.stringify({ imageReference: "single-food", mimeType: "image/jpeg", sizeBytes: 100 }) }));
    const result = await response.json();
    expect(response.status).toBe(200);
    expect(result.status).toBe("succeeded");
    expect(result.foodItems).toHaveLength(1);
  });
});
