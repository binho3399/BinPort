# cloned-web

Minimal setup notes for running the project locally.

## Local setup

1. Copy the example env file to a local-only file:

   ```bash
   cp .env.example .env.local
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

## Available scripts

```bash
npm run dev
npm run build
npm run lint
npm run type-check
npm run format:check
```

## Environment variables

This app currently does not depend on any runtime environment variables beyond `NODE_ENV`.

`.env.example` only documents placeholders for likely future configuration:

- `NEXT_PUBLIC_SITE_URL`: reserved for future metadata or canonical URL wiring.
- `CODEGRAPH_ENABLED`: reserved for internal CodeGraph-related documentation/workflows and is not used by the current runtime.

Do not store real secrets in `.env.example` or commit local env files.
