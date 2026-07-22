# More Than 100

More Than 100 is a multi-page longevity and healthy lifestyle web application. This initial version provides the public home page and a dashboard shell with shared responsive navigation and layout components.

## Technology

- Vanilla JavaScript with ES modules
- HTML and CSS
- Bootstrap
- Vite

## Pages

- `/` — Home
- `/dashboard` — Dashboard

## Local development

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
```

## Project structure

- `dashboard.html` — Dashboard HTML entry point
- `src/components/` — Shared layout components
- `src/pages/` — Page-specific JavaScript and CSS
- `src/styles/` — Shared application styles
- `index.html` — Home HTML entry point
- `vite.config.js` — Multi-page Vite configuration

Supabase, authentication, persistence, and business features are intentionally outside the scope of this initial setup.
