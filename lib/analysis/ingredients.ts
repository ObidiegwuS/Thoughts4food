export function normalizeIngredients(values: readonly string[]): string[] {
  const seen = new Set<string>();

  return values
    .flatMap((value) => value.split(/[,;\n]+/))
    .map((value) => value.trim().replace(/\s+/g, " "))
    .filter((value) => {
      const key = value.toLocaleLowerCase();
      if (!value || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}