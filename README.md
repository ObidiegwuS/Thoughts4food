# Thoughts4food

Next.js App Router application for ingredient-based recipe discovery.

## Development

```powershell
npm install
npm run dev
```

Open `http://localhost:3000/`.

Recipe search prefers Spoonacular when `SPOONACULAR_API_KEY` is configured and otherwise falls back to TheMealDB's documented free development API key. Both providers are called only from the server route. API keys must never use a `NEXT_PUBLIC_` prefix.

## Configure Recipe Search

1. For local development, no key is required: ingredient searches use TheMealDB's documented test key `1`.
2. For Spoonacular results, create an account at [spoonacular.com/food-api/console](https://spoonacular.com/food-api/console), choose a plan, and copy its API key. Check current request/point quotas before use.
3. Copy `.env.example` to `.env.local` in the repository root, then set `SPOONACULAR_API_KEY` to opt into Spoonacular. Keep it blank to use TheMealDB. For public production use of TheMealDB, obtain a supporter API key and set optional `THEMEALDB_API_KEY`.
4. Never commit `.env.local` or expose either key in browser code, screenshots, logs, or support requests. Restart `npm run dev` after changing environment variables, enter ingredients, and choose **Find Recipes**.

For deployment, add `SPOONACULAR_API_KEY` as a server-side environment variable in your hosting provider's project settings. Do not configure it as a public/build-exposed variable.

With Spoonacular configured, the server uses its official [ingredient search](https://spoonacular.com/food-api/docs#Search-Recipes-by-Ingredients), ranked to maximize used ingredients, then fetches details for candidates. Without Spoonacular, it uses TheMealDB's official [ingredient filter](https://www.themealdb.com/api.php) per submitted ingredient and looks up the full meal records. Results are normalized and source-linked. Nutrition is shown only when returned by the provider; TheMealDB does not supply nutrition in these endpoints, so it is displayed as unavailable. Recipe instructions are not copied. Both integrations request fresh responses without local caching. Review the [Spoonacular terms](https://spoonacular.com/food-api/terms) and TheMealDB's [API terms](https://www.themealdb.com/terms_of_use.php) before public production use.

The original `Mockup/` directory remains a static visual reference. The Next.js app is the working recipe-search experience.

## Validation

```powershell
npm run typecheck
npm test
npm run test:e2e
```

## Vercel

Import the repository into Vercel or run `npx vercel`. Set `SPOONACULAR_API_KEY` for Spoonacular, or the supporter `THEMEALDB_API_KEY` for public TheMealDB use, as server environment variables. Preview deployments should run the same build and browser checks before production promotion.
