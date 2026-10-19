# Thoughts4food

Next.js App Router application for ingredient-based recipe discovery.

## Development

```powershell
npm install
npm run dev
```

Open `http://localhost:3000/`.

Recipe search uses the Spoonacular Food API from a server-only route. The API key is read only by the server and must never use a `NEXT_PUBLIC_` prefix.

## Configure Recipe Search

1. Create a Spoonacular Food API account at [spoonacular.com/food-api/console](https://spoonacular.com/food-api/console), choose a plan, and copy your API key. Check the plan's current request/point quotas before use.
2. Copy `.env.example` to `.env.local` in the repository root.
3. Set `SPOONACULAR_API_KEY` in `.env.local` to your key. Do not commit `.env.local` or share the key in browser code, screenshots, logs, or support requests.
4. Restart `npm run dev`, enter ingredients, then choose **Find Recipes**. Without a key, the UI shows a setup message and does not return provider details.

For deployment, add `SPOONACULAR_API_KEY` as a server-side environment variable in your hosting provider's project settings. Do not configure it as a public/build-exposed variable.

The server queries Spoonacular's official [Search Recipes by Ingredients](https://spoonacular.com/food-api/docs#Search-Recipes-by-Ingredients) endpoint, ranked to maximize used ingredients, and fetches full details for the highest-ranked candidates. Results are normalized, source-linked to their original publishers, and show only provider-returned values. Recipe instructions are not copied into Thoughts4food. Spoonacular requires attribution to original recipe sources and restricts caching: this integration sends `no-store` requests and does not persist provider results. Review the current [Spoonacular terms](https://spoonacular.com/food-api/terms) and subscription quotas before production use.

The original `Mockup/` directory remains a static visual reference. The Next.js app is the working recipe-search experience.

## Validation

```powershell
npm run typecheck
npm test
npm run test:e2e
```

## Vercel

Import the repository into Vercel or run `npx vercel`. Set `SPOONACULAR_API_KEY` under the project's server environment variables for each environment that should provide recipe search. Preview deployments should run the same build and browser checks before production promotion.
