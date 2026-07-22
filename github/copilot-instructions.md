# More Than 100

More Than 100 is a longevity and healthy lifestyle web app built with JavaScript and Supabase. The app provides practical articles, tips and proven everyday practices related to healthy food, drinks, herbs, mindfulness, movement, sports, emotions and social wellbeing.

Visitors can browse and search public content. Registered users can create profiles, publish articles, comment, manage their own content and use a personal lifestyle assessment tool. The assessment evaluates stress, sedentary lifestyle and social wellbeing, saves user results and recommends relevant articles and healthy practices.

The app includes normal users and admin users. Admin users can manage users, profiles, articles and comments.

## Architecture and Tech Stack

Classical client-server app:

- Front-end: JavaScript app, Bootstrap, HTML, CSS
- Back-end: Supabase
- Database: PostgreSQL
- Authentication: Supabase Auth
- Authorization: Supabase RLS policies
- File storage: Supabase Storage
- Build tools: Vite, npm, Node.js
- API: Supabase REST API
- Hosting: Netlify
- Source code: GitHub

Always use the latest stable versions of npm dependencies when installing new packages. Check the current latest stable version before installation.

-Do not use TypeScript.
-Do not use front-end frameworks such as React or Vue.
-Keep the architecture simple and appropriate for the project requirements.

## Modular Design

-Use a modular code structure, with separate files for different components, pages, services, utilities and features.

-Use ES6 modules to organize the JavaScript code.
-Keep files small, focused and easy to understand.
-Each module should have one clear responsibility.
- Separate UI rendering, business logic, Supabase services, utility functions and styles when reasonable.
- Reuse common components such as the header, footer, navigation and article cards.
- Avoid large and complex monolithic files.

-Do not introduce unnecessary abstractions, dependencies or architectural layers.
-Prefer simple and readable solutions.

## UI Guidelines

- Use HTML, CSS, Bootstrap and Vanilla JavaScript for the front-end.
- Use Bootstrap components and utilities to create a responsive and user-friendly interface.
- Implement a modern, clean and responsive UI design with semantic HTML.
- Support both desktop and mobile browsers.
- Use a consistent color scheme inspired by health, longevity, nature, energy and wellbeing.
- Use consistent typography throughout the app.
- Use appropriate icons, hover effects, transitions and visual cues to improve usability.
- Use clear visual hierarchy for categories, subcategories and content.
- Use reusable article cards and content components where appropriate.
- Keep the interface simple, accessible and easy to navigate.
- Avoid excessive animations and unnecessary visual complexity.

## Pages and Navigation

- Split the app into multiple pages.
- Keep each main page in a separate HTML file.
- Implement multi-page navigation instead of building the application as a single-page app with popups.
- Implement pages as reusable and modular components using separate HTML, CSS and JavaScript code where reasonable.
- Use routing and clean URLs to navigate between pages.
- Use consistent header and footer components across the application.

Main application pages may include:

- Home page
- Login page
- Registration page
- Category pages
- Article details page
- Search results page
- User profile page
- User dashboard
- Create article page
- Edit article page
- Personal assessment page
- Assessment results page
- Admin panel

The main content categories are:

- Foods
- Drinks
- Herbs
- Mindfulness
- Movement
- Emotions and Senses

Categories may contain subcategories.

Each category and article should have a unique slug and URL.

The header navigation should clearly display the relationship between main categories and their subcategories.

Guests should see Login and Register options.

Authenticated users should see their profile, Dashboard and Logout options instead of Login and Register.

## Backend and Database

- Use Supabase as the backend and database for the app.
- Use PostgreSQL through Supabase for all persistent application data.
- Use database relationships and foreign keys where appropriate.
- Keep the database schema simple, normalized and easy to understand.
- Add indexes only where they provide a clear benefit.
- Do not create unnecessary database tables.

The database should support the main application entities, including:

- User profiles
- User roles
- Categories
- Articles
- Comments
- Tags when needed
- Assessment results

Use relationship tables only when required, for example for many-to-many relationships between articles and tags.

When changing the database schema, always use Supabase migrations to keep track of changes.

After applying a migration in Supabase, keep a copy of the migration SQL file in the local project.

Store migration files inside:

`supabase/migrations/`

Commit all database migration SQL files to GitHub.

Do not make undocumented database schema changes.

## Authentication and Authorization

- Use Supabase Auth for user registration, login and logout.
- Use Supabase Auth JWT sessions for authenticated users.
- Implement normal user and admin roles.
- Implement user roles with a separate database table `user_roles` and a role field or enum when appropriate.
- Use Row-Level Security (RLS) policies to restrict access to data based on the authenticated user and user role.
- Authorization must be enforced in Supabase and not only in the front-end UI.

Guests:

- Can browse public pages.
- Can read published articles.
- Can use search.
- Cannot publish articles.
- Cannot create comments.
- Cannot access the personal assessment tool.
- Cannot access the user Dashboard.

Authenticated users:

- Can access their profile and Dashboard.
- Can use the personal assessment tool.
- Can create articles.
- Can create comments.
- Can edit or delete only their own articles.
- Can edit or delete only their own comments.
- Can edit their own profile.
- Can upload and manage their own profile image.
- Can view their saved assessment results and recommendations.

Admin users:

- Can access the admin panel.
- Can manage all articles.
- Can manage all comments.
- Can manage user profiles.
- Can perform administrative actions allowed by the RLS policies.

Never rely only on hidden buttons or front-end route checks for security.

Always implement the corresponding RLS policy for protected database operations.

## User Profiles

Each registered user should have a profile associated with their Supabase Auth account.

A user profile may contain:

- First name
- Last name
- Nickname
- Profile image
- Short bio
- Social media links

Store profile images in Supabase Storage.

Limit profile image uploads to approximately 1 MB.

Validate file type and file size before upload.

Users should be able to edit their own profile.

Users should not be able to edit other users' profiles.

Admin users may manage user profiles according to the defined RLS policies.

## Articles and Content

Articles are the main content entity of More Than 100.

Articles should belong to a category and may optionally contain tags.

Articles should support:

- Title
- Slug
- Short description
- Main content
- Cover image when needed
- Author
- Category
- Tags when needed
- Created date
- Updated date

Authenticated users can create articles.

Users can edit and delete only their own articles.

Admin users can manage all articles.

Public users can read published articles.

Use reusable article card components to display articles on the Home page, category pages, search results and recommendation sections.

## Comments

Authenticated users can comment on articles.

Users can edit and delete only their own comments.

Admin users can manage all comments.

Guests can read comments but cannot create them.

Use RLS policies to enforce comment permissions at the database level.

## Personal Assessment Tool

The personal assessment tool is available only to authenticated users.

The assessment should contain approximately 20 multiple-choice questions.

Each question should have three possible answers.

The assessment evaluates three main areas:

- Stress level
- Sedentary lifestyle and physical inactivity
- Social wellbeing

Calculate separate scores for the three areas.

Display the results using three visual semicircle indicators or gauges.

The visual scale should progress from a low-risk state on the left to a higher-risk state on the right.

After calculating the results:

- Display a short personalized result summary.
- Provide lifestyle recommendations.
- Recommend approximately five relevant articles from the application.
- Save the assessment result for the authenticated user.
- Allow users to view previous assessment results from their Dashboard.

The tool is a lifestyle and wellbeing self-assessment.

Do not present the assessment as a medical or psychological diagnosis.

## Search, Categories and Tags

Implement a search feature that allows users to find relevant articles.

Use categories and subcategories to organize content.

Use tags only when they provide meaningful additional content relationships.

Tags should link to pages showing related articles.

Keep category and tag logic simple and avoid unnecessary duplication.

## File Storage

Use Supabase Storage for application file uploads.

The project must implement real file upload and retrieval functionality.

Use Supabase Storage primarily for:

- User profile images
- Article images when needed

Validate file types and file sizes before uploading.

Use appropriate Supabase Storage policies to control access.

Do not store private Supabase service role keys in front-end code.

## Environment Variables and Security

Store environment-specific configuration in environment files.

Use:

`.env.local`

for local environment values.

Provide:

`.env.example`

with example variable names but without real secret values.

Never commit secrets, private API keys or Supabase service role keys to GitHub.

Only expose environment variables that are safe for use in the browser.

Keep `.env.local` excluded from Git using `.gitignore`.

## Supabase Migrations and Seed Data

- Keep all database schema changes inside Supabase migration files.

- Store migrations in:
`supabase/migrations/`

- Keep sample database seed logic in:
`supabase/seed-data/`

- Use seed data to create useful demonstration content when appropriate.

Seed data may include:

- Categories
- Example articles
- Example profiles
- Example comments
- Tags
- Assessment-related sample data

Keep seed scripts separate from database migrations.

Do not place sensitive credentials in seed scripts committed to GitHub.

## Admin Panel

- Implement a dedicated admin panel for admin users.
-Protect the admin panel from unauthorized access.

The admin panel should provide simple management capabilities for:

- Users and profiles
- Articles
- Comments

Keep the admin interface simple and appropriate for the course project.

Do not duplicate Supabase security logic in the UI.

The UI controls access visually, but Supabase RLS policies provide the actual authorization.

## Project Structure

-Keep the project structure simple, modular and easy to navigate.
-Follow a structure similar to:

.github/
  copilot-instructions.md

.vscode/
  mcp.json

src/
  components/
  pages/
  services/
  utils/
  styles/

supabase/
  migrations/
  seed-data/

.env.example
.env.local
.gitignore
index.html
netlify.toml
package.json
package-lock.json
README.md
vite.config.js

-Create additional folders only when there is a clear need.
-Do not over-engineer the folder structure.

## Development Workflow

- Use AI-assisted development with GitHub Copilot or another development agent.
- Work in small and manageable development steps.
- Follow this development loop:
- Prompt → Implement → Run → Test → Review → Refine → Commit and Push
- For every implementation task:

1. Understand the existing project structure before making changes.
2. Modify only the files required for the requested feature.
3. Keep existing functionality working.
4. Keep the code modular, readable and simple.
5. Do not add unnecessary dependencies.
6. When a new npm dependency is required, check and install only the latest stable version.
7. Run the application after implementation.
8. Test the new functionality.
9. Check the browser console and terminal for errors.
10. Review the implementation for broken imports, links and navigation.
11. Fix discovered issues before considering the task complete.
12. Summarize the files that were created or changed.

Do not make unrelated changes outside the scope of the current task.

## Git and GitHub

- Use Git and GitHub to keep the full development history.
- Commit successful development steps regularly.
- Use clear and descriptive commit messages.



- Do not combine the entire application development into a small number of large commits.
- Do not commit broken or unfinished changes unless explicitly requested.

Do not commit:

- `.env.local`
- Supabase service role keys
- Private API keys
- Passwords or other sensitive secrets

## Documentation

Maintain project documentation in the GitHub repository.

The main `README.md` should include:

- Project name
- Project description
- Main features
- User roles and permissions
- Architecture overview
- Technologies used
- Database schema overview
- Database relationships
- Local development setup
- Environment variable setup
- Supabase setup
- How to run the project locally
- Deployment information
- Demo account information when appropriate
- Key folders and files and their purpose

Keep the documentation updated when important architecture or setup changes are made.

## Code Quality and Testing

- Keep the code simple, readable and maintainable.
- Use clear and descriptive names for variables, functions and files.
- Prefer small focused functions.
- Avoid duplicated code when a simple reusable function or component is appropriate.
- Do not create unnecessary helper functions or abstractions.
- Before completing every development task:

- Review the implementation.
- Run the application.
- Test the requested functionality.
- Test relevant navigation.
- Check responsive behavior when UI changes are made.
- Check browser console errors.
- Check terminal errors.
- Verify that existing functionality is not broken.
- Fix discovered issues before finishing the task.

Always provide a short summary of the completed work and any remaining issues.

## Media, Images and Visual Content

Use high-quality visual content throughout the application.

### Image Uploads

- Allow authenticated users to upload images where appropriate, including profile photos and article images.
- Limit uploaded image files to a maximum size of 1 MB.
- Validate file type and file size before upload.
- Store uploaded images in Supabase Storage.
- Use appropriate Supabase Storage policies to control access.
- Optimize image usage for good web performance and responsive design.

### AI Image Generation

Where appropriate, provide an option or button that allows users or admins to generate a relevant image with AI instead of uploading their own image.

The AI-generated image must be relevant to the current context, such as:

- The article topic
- The selected category or subcategory
- The user's content
- The overall More Than 100 visual identity

Keep AI image generation logic modular and separate from the main page logic.

Do not hardcode secret API keys in front-end code or commit them to GitHub.

If AI image generation requires a private API key, use a secure server-side solution such as a Supabase Edge Function or another protected backend service.

### Seed Content Images

All seeded articles and demonstration content should include high-quality, photorealistic and visually attractive images.

Seed images should be generated with AI or come from properly licensed sources.

The images must be strongly relevant to the topic of each article and consistent with the More Than 100 concept of:

- Health
- Longevity
- Strength
- Energy
- Active lifestyle
- Beauty
- Nature
- Positive emotions
- Human connection

When appropriate, visual content may include:

- Healthy and active adults
- Athletic people
- Fit and strong bodies
- People showing natural positive emotions
- Families
- Happy children in appropriate family or wellbeing contexts
- Outdoor activities
- Nature
- Healthy food and drinks
- Sports and movement
- Pets and human-animal interaction

Human subjects should be represented in a positive, natural, tasteful and contextually appropriate way.

Avoid generic, irrelevant or low-quality stock-image appearance.

Keep the visual style of seed content consistent across the application.

### Visual Style

Use a visually rich but clean presentation.

Images should support the overall application color and emotional identity related to:

- Health
- Vitality
- Strength
- Freshness
- Energy
- Nature
- Positive lifestyle

Use colorful and lively imagery where appropriate, while maintaining visual consistency and good readability.

Use responsive image layouts and appropriate aspect ratios for:

- Hero banners
- Article cards
- Article detail pages
- User profile images
- Recommended content cards

Avoid distorted or stretched images.

### Icons

Use a consistent, high-quality icon library across the application.

Prefer Bootstrap Icons as the primary icon library because it integrates naturally with Bootstrap and provides a consistent visual style.

Use icons where they improve usability, including:

- Navigation
- Search
- Login and logout
- User profiles
- Dashboard
- Categories
- Comments
- Edit and delete actions
- Uploads
- AI image generation
- Assessment tool
- Social links

Do not use icons only for decoration when they do not improve usability.

When an icon represents an action, provide an accessible label, tooltip or visible text when necessary.

### Interaction and Motion

Use subtle visual interactions to make the application feel modern and responsive.

Use lightweight effects such as:

- Hover effects
- Slight image zoom on article cards
- Button state transitions
- Smooth color transitions
- Subtle card elevation on hover
- Visual feedback for clickable elements

Keep animations short and subtle.

Do not use excessive motion, distracting animations or heavy visual effects.

Interactive effects should improve usability and clearly indicate that an element can be clicked or interacted with.

Maintain consistent interaction behavior throughout the application.

## Responsive and Adaptive Design

- Design the entire application as fully responsive and mobile-friendly.
- Use a mobile-first approach where appropriate.
- Ensure layouts adapt intelligently to different screen sizes, not only by shrinking elements.
- Optimize navigation, spacing, typography, forms, cards, images and interactive elements for desktop, tablet and mobile devices.
- Avoid horizontal scrolling and broken layouts on small screens.
- Test all major pages and components at common desktop, tablet and mobile viewport sizes.
- Use Bootstrap responsive grid, breakpoints and utilities consistently.
- When a desktop interaction does not translate well to mobile, implement an appropriate mobile-specific layout or interaction pattern.