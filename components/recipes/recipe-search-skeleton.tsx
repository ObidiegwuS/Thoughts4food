export function RecipeSearchSkeleton() {
  return <section aria-label="Searching recipes" aria-busy="true" className="space-y-4">
    <div className="h-8 w-56 animate-pulse rounded-lg bg-white/10" />
    <div className="grid gap-4">
      {[0, 1].map((item) => <div key={item} className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#131920] p-4">
        <div className="aspect-[16/8] animate-pulse rounded-xl bg-white/[0.08]" />
        <div className="mt-4 h-6 w-3/4 animate-pulse rounded bg-white/[0.08]" />
        <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-white/[0.05]" />
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[0, 1, 2, 3].map((metric) => <div key={metric} className={`h-16 animate-pulse rounded-xl ${["bg-[#f08a68]/10", "bg-[#76efb5]/10", "bg-[#76cbe9]/10", "bg-[#ed8db4]/10"][metric]}`} />)}
        </div>
        <div className="mt-4 h-4 w-full animate-pulse rounded bg-white/[0.05]" />
        <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-white/[0.05]" />
      </div>)}
    </div>
    <p className="sr-only">Searching Spoonacular and loading recipe details.</p>
  </section>;
}