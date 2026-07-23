# More Than 100

More Than 100 is a multi-page longevity and healthy lifestyle web application. This initial version provides the public home page and a dashboard shell with shared responsive navigation and layout components.

## Technology

- Vanilla JavaScript with ES modules
- HTML and CSS
- Bootstrap
- Vite
- Supabase Auth, PostgreSQL, Storage and Edge Functions

## User roles

- `reader` — authenticated read-only access to published content, Dashboard and Profile; cannot manage articles, comments, Stories or article media.
- `user` — standard contributor access, including own article and comment management.
- `admin` — full administration, publication controls and secure user/role management.

New registrations receive the `user` role. Administrators assign roles through the Admin Panel; direct browser role mutations are revoked, and the privileged `admin-users` Edge Function enforces allowed values and last-admin protection.

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

Run the reversible role/RLS security verification with configured local Supabase test credentials:

```bash
npm run test:roles:security
```

## AI Image Generation

Article contributors and administrators can request Article cover previews; only administrators can request Story covers. The browser sends validated content context to the JWT-protected `generate-cover-image` Supabase Edge Function, which builds a concise server-side prompt and calls a small replaceable provider adapter. Raw prompts and provider credentials never reach frontend code.

Configure the server secret with `supabase secrets set AI_IMAGE_PROVIDER_API_KEY=...` and optionally set `AI_IMAGE_MODEL`. Without a provider key, the function returns a friendly unavailable response and the application continues to support manual JPEG, PNG and WebP uploads through the existing `article-images` Storage workflow. Generated previews are only uploaded after the user explicitly accepts them and saves the Article or Story.

## Persistent content ordering

Admin management lists support curated ordering for Articles, Stories, Users and Comments. Standard Users can separately organize their own Dashboard Articles and Comments; Reader accounts remain read-only. Ordering is saved atomically through the authenticated `reorder_management_items` database function, while direct browser updates to ordering columns are denied.

Article and Story public lists use the Admin display order with deterministic creation-date fallback. Featured and recommended Articles retain their existing selection logic, and public Article comments remain chronological. Every reorderable list provides a drag handle plus Move Up and Move Down buttons for touch and keyboard access.

## Project structure

- `dashboard.html` — Dashboard HTML entry point
- `src/components/` — Shared layout components
- `src/pages/` — Page-specific JavaScript and CSS
- `src/styles/` — Shared application styles
- `index.html` — Home HTML entry point
- `vite.config.js` — Multi-page Vite configuration

Supabase, authentication, persistence, and business features are intentionally outside the scope of this initial setup.
