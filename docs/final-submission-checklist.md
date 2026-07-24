# Final Submission Checklist

## Repository

- [x] Public repository: <https://github.com/Kaloian-Varrio/More-than-100>
- [x] Submission branch: `main`
- [x] Development history spans at least three calendar days
- [x] `.env.local`, dependencies and production output are ignored
- [x] No service-role or AI-provider secret is tracked
- [ ] Confirm the working tree is clean immediately before submission

## Live Application

- [x] Netlify deployment: <https://more-than-100.netlify.app/>
- [x] Production build and direct-route smoke checks pass
- [x] Desktop, tablet and mobile layouts verified
- [x] Protected routes redirect Guests appropriately
- [x] Accessibility Preferences are available globally

## Backend

- [x] Seven public PostgreSQL tables with relationships and indexes
- [x] Supabase Auth and Reader/User/Admin roles
- [x] RLS enabled for all public tables
- [x] Owner- and role-scoped Storage policies
- [x] `admin-users` and `generate-cover-image` Edge Functions deployed
- [x] Idempotent seed workflow and demonstration accounts
- [x] Historical local/remote migration timestamp mismatch documented
- [ ] Treat remote applied history as authoritative; create all future changes as new immutable migrations

## Features

- [x] Articles, Comments and publication controls
- [x] Stories and Admin Story management
- [x] Members directory and member profiles
- [x] Profile, avatar and social-link management
- [x] Dashboard, Assessment history and recommendations
- [x] Four-step, 20-question Assessment with three gauges
- [x] Admin moderation, secure roles, last-admin protection and deletion
- [x] Uploaded branding and persistent ordering
- [x] AI cover architecture with provider-disabled/manual fallback
- [x] Accessibility Preferences

## Documentation

- [x] Overview, features, roles and technology stack
- [x] Architecture and Mermaid database diagram
- [x] Authentication, RLS, Storage and Edge Functions
- [x] Local setup and environment variables
- [x] Supabase seed and Netlify deployment instructions
- [x] Demo credentials, testing and known limitations
- [x] Course-requirements coverage

## Final Presentation Preparation

- [ ] Capture final screenshots for desktop and mobile.
- [ ] Rehearse a short demo: Home → Articles → Members → Assessment → Dashboard → Admin.
- [ ] Confirm demo-account access shortly before presenting.
- [ ] Prepare a local screenshot/video backup in case the network is unavailable.
- [ ] Explain the MPA/Supabase architecture and RLS security boundary.
- [ ] Explain optional AI generation, provider-disabled behavior and manual fallback.
- [ ] Demonstrate keyboard navigation and Accessibility Preferences.
- [ ] Mention the accepted migration timestamp limitation accurately.
