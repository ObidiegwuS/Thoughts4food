export interface ValidRecipeSource {
  url: string;
  hostname: string;
}

export function validateRecipeSourceUrl(value: unknown): ValidRecipeSource | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:" || !parsed.hostname || parsed.username || parsed.password) return null;
    return { url: parsed.href, hostname: parsed.hostname };
  } catch {
    return null;
  }
}