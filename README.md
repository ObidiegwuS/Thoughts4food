# Thoughts4food

Next.js App Router application for conservative food image nutrition analysis.

## Development

```powershell
npm install
npm run dev
```

Open `http://localhost:3000/`.

The original `Mockup/` directory is retained as visual reference while the production UI migrates into the Next.js app. Analysis provider credentials belong only in server-side environment variables. The initial implementation uses a fixture provider and session-scoped state; durable storage and an external analysis provider require separate approval.

## Validation

```powershell
npm run typecheck
npm test
npm run test:e2e
```

## Vercel

Import the repository into Vercel or run `npx vercel`. Configure server-side provider variables only in Vercel Project Settings and keep `ANALYSIS_PROVIDER=fixture` for the current prototype. Preview deployments should run the same build and browser checks before production promotion.
