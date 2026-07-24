# More Than 100

**Begin. Move. Fuel. Connect.**

More Than 100 is a full-stack, multi-page longevity and healthy-lifestyle application developed as a final educational course project. It brings together practical content about active longevity, nutrition, movement, recovery and social connection through Articles, inspirational Stories, a personal lifestyle Assessment, community Members and user-created content.

The Assessment offers non-medical lifestyle insights and recommendations. It is not a diagnostic, treatment or prevention tool.

## Live Demo

- Application: [https://more-than-100.netlify.app/](https://more-than-100.netlify.app/)
- Source: [https://github.com/Kaloian-Varrio/More-than-100](https://github.com/Kaloian-Varrio/More-than-100)

## Main Features

- Responsive Home page with uploaded brand identity and category discovery.
- Public Articles library with category/subcategory filtering, detail pages and comments.
- User Article creation, editing, deletion, publication controls and 1 MB cover uploads.
- Inspirational Stories with public detail pages and Admin management.
- Authenticated Members directory, read-only member profiles and published Articles by member.
- Profile management with avatar upload, biography and social links.
- Personal Dashboard with owned content and Assessment history.
- Four-step, 20-question lifestyle Assessment covering stress, sedentary-lifestyle risk and social-disconnection risk.
- Three semicircular result gauges, personalized analysis and relevant Article recommendations.
- Reader, User and Admin roles with server-enforced permissions.
- Admin Panel for users, profiles, roles, Articles, Comments, Stories, branding and publication state.
- Last-admin protection, secure user deletion and comment moderation.
- Persistent drag-and-drop ordering with touch and keyboard controls.
- Optional AI cover-image workflow with preview, Accept, Regenerate and Cancel controls.
- Manual image upload fallback for Article and Story covers.
- Global Accessibility Preferences that persist in the browser.

## User Roles and Permissions

| Role | Allowed | Restricted |
|---|---|---|
| **Reader** | Browse published content; view Members after login; manage their Profile; use Dashboard and Assessment | Cannot create or manage Articles or Comments, upload Article media, access Admin, or change roles |
| **User** | Reader access plus create/manage own Articles and Comments, upload own Article images, view Assessment history and recommendations, and reorder own Dashboard content | Cannot access Admin, manage other users, change roles or manage Stories |
| **Admin** | Full moderation and management for users, profiles, roles, Articles, Comments, Stories, branding, publication and global ordering | Cannot remove or demote the final Admin |

New registrations receive the `user` role. Privileged role changes and Auth-user deletion are performed through an authenticated Edge Function, not direct browser mutations.

## Technology Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript ES modules, Bootstrap 5, Bootstrap Icons and Vite.
- **Backend:** Supabase PostgreSQL, Auth, JavaScript client/REST API, Row Level Security, Storage and Edge Functions.
- **Workflow and deployment:** Node.js, npm, Git, GitHub, VS Code, Netlify and AI-assisted development.

The project is a true multi-page application, not an SPA and not a frontend-framework project.

## Application Architecture

Standard application operations follow this flow:

```text
Browser → Supabase JavaScript client → Auth / REST API / Storage → PostgreSQL
```

Privileged operations follow:

```text
Browser → authenticated Supabase Edge Function → server-side authorization → privileged operation
```

Each page has a Vite HTML entry point and focused JavaScript/CSS modules. Shared components and services provide layout, authentication, data access and media handling. Netlify rewrites map clean URLs to the correct HTML entries for direct navigation and refreshes.

The frontend contains only the public Supabase URL and publishable key. Service-role and AI-provider credentials remain server-side. Database access is gated by PostgreSQL grants and RLS; privileged Edge Functions also authorize the caller.

## Database

All current public tables use RLS.

| Table | Purpose and important relationships |
|---|---|
| `profiles` | Safe member profile data keyed by the Auth user ID; includes social links, avatar and Admin ordering |
| `user_roles` | One role (`reader`, `user` or `admin`) per Auth user |
| `categories` | Article categories with optional self-referencing `parent_id` subcategories |
| `articles` | Auth-owned content linked to `categories`; includes slug, cover, publication state and Admin/owner ordering |
| `comments` | Auth-owned comments linked to Articles; includes Admin/owner ordering |
| `assessment_results` | Private Assessment scores and summaries owned by an Auth user |
| `stories` | Admin-managed inspirational content with themes, publication state and display ordering |

### Database Relationships

| Source | Relationship | Target | Description |
|---|---|---|---|
| `auth.users.id` | One-to-one | `profiles.id` | Each application Profile uses the Auth user ID as its primary and foreign key; deleting the Auth user cascades to the Profile |
| `auth.users.id` | One-to-one | `user_roles.user_id` | Each Auth user has one unique application role; deleting the Auth user cascades to the role record |
| `auth.users.id` | One-to-many | `articles.author_id` | An Auth user can author multiple Articles; deleting the Auth user cascades to owned Articles |
| `auth.users.id` | One-to-many | `comments.author_id` | An Auth user can write multiple Comments; deleting the Auth user cascades to owned Comments |
| `auth.users.id` | One-to-many | `assessment_results.user_id` | An Auth user can own multiple private Assessment results; deleting the Auth user cascades to those results |
| `categories.id` | Self-referencing one-to-many | `categories.parent_id` | A Category can contain child categories; deleting a parent sets the child `parent_id` to `NULL` |
| `categories.id` | One-to-many | `articles.category_id` | A Category can classify multiple Articles; deletion is restricted while Articles reference it |
| `articles.id` | One-to-many | `comments.article_id` | An Article can receive multiple Comments; deleting the Article cascades to its Comments |

```text
Auth users → Profiles, Roles, Articles, Comments and Assessment results
Categories → Child categories and Articles → Comments
```

`stories` has no author foreign key and is intentionally independent from the user relationship model.

## Authentication, Security and RLS

- Supabase Auth provides JWT-based sessions and protected routes.
- Signup automatically creates a Profile and default `user` role.
- Guests can read published Articles and Stories but cannot enumerate Members.
- Authenticated roles can read safe Profile fields; users update only their own Profile.
- Users manage only their own Articles and Comments; Readers cannot create content.
- Assessment results are private to their owner.
- Unpublished Articles and Stories are excluded from public reads.
- Admin moderation remains controlled by RLS and server-authorized operations.
- Direct ordering-column updates are blocked; the reorder RPC validates role and ownership.
- Last-admin protection prevents removing the final administrator.
- No service-role key or AI-provider key is exposed in frontend code.

The SQL files under `supabase/migrations/` document the intended schema and policies; the remote applied migration history is the production source of truth.

### Migration history limitation

Local and remote Supabase migration histories contain historical timestamp differences. The current production database and application behavior are working and verified. Reconciliation was intentionally deferred to avoid unnecessary risk to a stable production system. The remote applied history is the production source of truth, and every future database change must be created as a new immutable migration.

## Supabase Storage

| Bucket | Purpose | Access model |
|---|---|---|
| `avatars` | Profile images | Public reads; authenticated writes scoped to the owner folder |
| `article-images` | Article and Story cover images | Public reads; 1 MB JPEG/PNG/WebP uploads; owner-scoped writes with Admin moderation |
| `site-assets` | Uploaded site branding | Public discovery within `branding/`; 1 MB JPEG/PNG/WebP; Admin-only writes |

Readers cannot upload Article media. Client-side validation and Storage policies work together; Storage policies remain the authorization boundary.

## Supabase Edge Functions

- **`admin-users`** — JWT-protected Admin operations for role changes and secure Auth-user deletion. It validates Admin access and enforces last-admin protection while keeping service credentials server-side.
- **`generate-cover-image`** — authenticated Article/Story cover generation using sanitized context, caller role/ownership checks and a replaceable provider adapter.

## AI Image Generation

Article and Story editors include **Generate with AI**. The frontend sends sanitized context to `generate-cover-image`; the provider adapter can use the OpenAI Images API when `AI_IMAGE_PROVIDER_API_KEY` is configured server-side. `AI_IMAGE_MODEL` optionally selects the model.

Without a provider key, the function returns a provider-disabled message and manual JPEG, PNG or WebP upload remains available. A generated result is only stored after the user accepts the preview and submits the form. The public demo does not make a real provider request unless the server-side key is configured.

## Accessibility Preferences

The application uses semantic HTML, a skip link, visible focus states, keyboard navigation, form labels, descriptive action labels and reduced-motion support.

The global, keyboard-accessible preferences dialog provides:

- Text sizes of 90%, 100%, 110%, 120% and 130%.
- High contrast and grayscale.
- Manual reduced motion alongside `prefers-reduced-motion`.
- Link underlining and readable text spacing.
- `localStorage` persistence across navigation and refresh.
- Escape-to-close, focus return and responsive mobile presentation.

These features improve accessibility but do not constitute a formal WCAG certification or accessibility compliance audit.

## Persistent Ordering

Admins can reorder Articles, Stories, Users and Comments. Users can independently reorder their own Dashboard Articles and Comments. Changes are saved through the authenticated `reorder_management_items` RPC, with rollback when saving fails.

Drag handles support pointer/touch interaction, while Move Up and Move Down controls provide keyboard and mobile alternatives. Published-content rules remain enforced; public comments remain chronological, recommendations keep relevance order and Featured Articles retain their existing selection logic.

## Local Development

Prerequisites: a current Node.js installation, npm and a Supabase project.

```bash
git clone https://github.com/Kaloian-Varrio/More-than-100.git
cd More-than-100
npm install
copy .env.example .env.local
npm run dev
```

On macOS or Linux, replace the `copy` command with `cp`.

Production build and local preview:

```bash
npm run build
npm run preview
```

## Environment Variables

Copy `.env.example` to `.env.local` and supply only values appropriate to the environment.

| Scope | Variables |
|---|---|
| Public frontend build | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` |
| Local seed workflow | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SEED_ADMIN_PASSWORD`, `SEED_JOHN_PASSWORD`, `SEED_DENIS_PASSWORD`, `SEED_NELINA_PASSWORD` |
| Edge Function secrets | `AI_IMAGE_PROVIDER_API_KEY`, `AI_IMAGE_MODEL` |

`VITE_*` values are embedded in the browser build. Never prefix service-role or provider secrets with `VITE_`, never expose them in frontend code, and never commit `.env.local`.

## Supabase and Seed Setup

1. Create a Supabase project and configure the frontend URL and publishable key.
2. Review and apply migrations from `supabase/migrations/` in chronological order for a new environment.
3. Deploy `admin-users` and `generate-cover-image` separately as Supabase Edge Functions.
4. Configure required Edge Function secrets.
5. Configure Auth URLs:
   - Site URL: `https://more-than-100.netlify.app`
   - Production redirect: `https://more-than-100.netlify.app/**`
   - Local redirect example: `http://localhost:5173/**`
6. Configure `.env.local`, then seed:

```bash
npm run db:seed:validate
npm run db:seed
```

The idempotent seed workflow is in `supabase/seed-data/seed-sample-db-data.js`; details are in `supabase/seed-data/README.md`. It creates or updates four demo users, 41 categories, 15 seeded Articles, 20 seeded Comments, 6 seeded Assessment results and 3 Stories while avoiding duplicate users and slugs. Production may contain additional user-created records.

## Netlify Deployment

| Setting | Value |
|---|---|
| Branch | `main` |
| Base directory | Repository root / blank |
| Build command | `npm run build` |
| Publish directory | `dist` |
| Netlify Functions directory | Unused / blank |
| Frontend variables | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` |

Supabase Edge Functions deploy separately. Vite copies `public/_redirects` into `dist`; its explicit rewrites cover Articles, categories, Stories and protected application pages without a blanket SPA fallback.

## Demo Accounts

These credentials are intentionally seeded for the educational demonstration.

| Role | Email | Password |
|---|---|---|
| Admin | `kaloianh@gmail.com` | `123More!` |
| User | `john@gmail.com` | `John123!` |
| User | `denis@gmail.com` | `Denis123!` |
| User | `nelina@gmail.com` | `Nelina123!` |

Do not reuse these demonstration passwords for personal accounts.

## Testing and Validation

Validation performed during development includes:

- Production Vite builds, JavaScript syntax checks and route smoke tests.
- Direct-route production-preview and responsive checks.
- Guest/Reader/User/Admin authorization and RLS tests.
- Profile, Article and Comment security/CRUD checks.
- Story RLS, role management, last-admin and secure-deletion tests.
- Storage RLS and media authorization tests.
- Ordering persistence, rollback and permission tests.
- AI authorization and provider-disabled tests.
- Accessibility state, persistence, keyboard and reduced-motion checks.

No formal penetration-test, code-coverage percentage or WCAG certification is claimed.

## Known Limitations

- Local and remote migration timestamps differ historically; remote applied history is authoritative.
- Real AI generation requires a server-side provider key and may be disabled in the public demo.
- Stories are inspirational educational content, not verified medical case studies or user submissions.
- The project has no notification system, production analytics or complex editorial approval workflow.
- Accessibility improvements have not undergone a formal WCAG audit.

## Course Requirements Coverage

| Requirement | Status | Evidence |
|---|---|---|
| HTML, CSS, Vanilla JavaScript, Bootstrap | Met | Multi-page HTML entries and modular page/component styles and scripts |
| Node.js, npm and Vite | Met | Package scripts, dependency lockfile and production build |
| Client-server architecture | Met | Browser client with Supabase Auth, REST, Storage and PostgreSQL |
| True multi-page navigation and 5+ screens | Met | Home, Articles, Stories, Members, Dashboard, Profile, Assessment, Admin and Auth pages |
| Responsive desktop/mobile UI | Met | Bootstrap layout, responsive CSS and representative viewport checks |
| Database with 4+ related tables and indexes | Met | Seven public tables, foreign keys, self-reference and query/order indexes |
| Authentication, JWT roles and RLS | Met | Supabase Auth, Reader/User/Admin roles and RLS on all public tables |
| Admin Panel | Met | Moderation, roles, content, branding and ordering |
| Storage and file uploads | Met | Avatars, Article/Story covers and branding buckets |
| Migrations and seed data | Met with limitation | Versioned SQL and idempotent seed; historical timestamp mismatch documented |
| Public GitHub repository and deployment | Met | GitHub source and Netlify production links above |
| Architecture and database visualization | Met | Architecture summary and Mermaid ER diagram |
| AI-related functionality | Met | Secure optional Edge Function workflow with manual fallback |
| Accessibility functionality | Met | Global persisted preferences and foundational accessibility support |

## Project Structure

```text
public/                 Images and explicit Netlify route rewrites
src/
  components/           Shared header, footer, layout and UI components
  pages/                Page-specific JavaScript and CSS modules
  services/             Supabase, Auth, content, media and role services
  styles/               Shared application and accessibility styles
  utils/                Reusable utility functions
supabase/
  functions/            Supabase Edge Functions
  migrations/           Versioned schema and security SQL
  seed-data/            Idempotent demonstration-data workflow
scripts/                Security and regression verification scripts
docs/                   Final submission material
*.html                  Vite multi-page entry points
vite.config.js          Build entries and clean development routes
```

## Author and Ownership

Maintainer: **Kaloian Varrio**, as recorded in repository metadata.

© 2026 More Than 100. All rights reserved. More Than 100 and its content belong to Varrio Sport Ltd.
