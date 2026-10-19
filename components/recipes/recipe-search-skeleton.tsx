export function RecipeSearchSkeleton() {
  return <section aria-label="Searching recipes" aria-busy="true" className="space-y-4">
    <div className="h-8 w-56 animate-pulse rounded-lg bg-[#e4e9e2]" />
    <div className="grid gap-4 xl:grid-cols-2">
      {[0, 1, 2].map((item) => <div key={item} className="overflow-hidden rounded-2xl border border-[#e7e7df] bg-white p-4">
        <div className="aspect-[16/8] animate-pulse rounded-xl bg-[#e4e9e2]" />
        <div className="mt-4 h-6 w-3/4 animate-pulse rounded bg-[#e4e9e2]" />
        <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-[#edf0eb]" />
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[0, 1, 2, 3].map((metric) => <div key={metric} className="h-16 animate-pulse rounded-xl bg-[#edf4ee]" />)}
        </div>
        <div className="mt-4 h-4 w-full animate-pulse rounded bg-[#edf0eb]" />
        <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-[#edf0eb]" />
      </div>)}
    </div>
    <p className="sr-only">Searching Spoonacular and loading recipe details.</p>
  </section>;
}