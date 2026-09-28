import { NextResponse } from "next/server";
import { validateImage } from "@/lib/analysis/image-validation";
import { fixtureProvider } from "@/lib/providers/fixture-analysis-provider";
import type { AnalysisRequest } from "@/lib/analysis/types";

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > 12 * 1024 * 1024) return NextResponse.json({ status: "failed", foodItems: [], qualityIssues: ["The request is too large. Please choose an image smaller than 10 MB."] }, { status: 413 });
    const body = (await request.json()) as Partial<AnalysisRequest>;
    const imageReference = body.imageReference ?? "single-food";
    const qualityIssues = /blurry/i.test(imageReference) ? ["The image appears blurry, so the food cannot be identified confidently."] : /dark|poor-light/i.test(imageReference) ? ["The image is too dark to support a reliable estimate."] : /obstructed|cropped/i.test(imageReference) ? ["The food is obstructed or too tightly cropped."] : undefined;
    const validation = validateImage({ mimeType: body.mimeType ?? "image/jpeg", sizeBytes: body.sizeBytes ?? 1, qualityIssues, identifiableFood: /non-food|no-food|unknown/i.test(imageReference) ? false : undefined });
    if (!validation.valid) {
      return NextResponse.json({ requestId: body.requestId ?? crypto.randomUUID(), status: validation.status, qualityIssues: validation.issues, foodItems: [] }, { status: validation.status === "failed" ? 400 : 200 });
    }
    const result = await Promise.race([
      fixtureProvider.analyze({ requestId: body.requestId ?? crypto.randomUUID(), imageReference, mimeType: body.mimeType ?? "image/jpeg", sizeBytes: body.sizeBytes ?? 1, restrictions: body.restrictions ?? [] }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Analysis timed out")), 4500))
    ]);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ status: "failed", foodItems: [], qualityIssues: ["Analysis could not be completed. Please try another image."] }, { status: 500 });
  }
}
