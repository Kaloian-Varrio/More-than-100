import { createHash } from 'node:crypto';

const REQUIRED_ENV = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SEED_ADMIN_PASSWORD',
  'SEED_JOHN_PASSWORD',
  'SEED_DENIS_PASSWORD',
  'SEED_NELINA_PASSWORD',
];
const validationOnly = process.argv.includes('--validate');
const usersOnly = process.argv.includes('--users-only');

const missingEnvironmentVariables = REQUIRED_ENV.filter((name) => !process.env[name]);

if (!validationOnly && missingEnvironmentVariables.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvironmentVariables.join(', ')}. ` +
      'Copy .env.example to .env.local and add local values before seeding.',
  );
}

const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const authUsers = [
  {
    email: 'kaloianh@gmail.com',
    password: process.env.SEED_ADMIN_PASSWORD,
    role: 'admin',
    profile: {
      first_name: 'Kaloian',
      last_name: 'Hristov',
      nickname: 'kaloian-active',
      bio: 'Longevity enthusiast who enjoys strength training, mountain walks and practical healthy habits.',
      website_url: 'https://example.com/kaloian-active',
      instagram_url: 'https://instagram.com/kaloian.active',
    },
  },
  {
    email: 'john@gmail.com',
    password: process.env.SEED_JOHN_PASSWORD,
    role: 'user',
    profile: {
      first_name: 'John',
      last_name: 'Miller',
      nickname: 'john-moves',
      bio: 'Weekend runner, home cook and believer in small daily improvements.',
      instagram_url: 'https://instagram.com/john.moves',
    },
  },
  {
    email: 'denis@gmail.com',
    password: process.env.SEED_DENIS_PASSWORD,
    role: 'user',
    profile: {
      first_name: 'Denis',
      last_name: 'Petrov',
      nickname: 'denis-outdoors',
      bio: 'Outdoor enthusiast exploring better sleep, mindful breathing and everyday mobility.',
      facebook_url: 'https://facebook.com/denis.outdoors',
    },
  },
  {
    email: 'nelina@gmail.com',
    password: process.env.SEED_NELINA_PASSWORD,
    role: 'user',
    profile: {
      first_name: 'Nelina',
      last_name: 'Ivanova',
      nickname: 'nelina-wellbeing',
      bio: 'Yoga practitioner who values nourishing food, close friendships and time in nature.',
      instagram_url: 'https://instagram.com/nelina.wellbeing',
    },
  },
];

const categoryTree = {
  Foods: ['Fruits', 'Vegetables', 'Nuts', 'Dairy', 'Meat', 'Fish', 'Fermented Foods', 'Baked Foods', 'Root Vegetables'],
  Drinks: ['Water', 'Tea', 'Coffee', 'Kombucha'],
  Herbs: [],
  Mindfulness: ['Family', 'Meditation', 'Cold Therapy', 'Sleep', 'Breathing', 'Work', 'Activity'],
  Movement: ['Stretching', 'Yoga', 'Outdoor Activities', 'Running', 'Water Sports', 'Winter Sports'],
  'Emotions and Senses': [
    'Love',
    'Sharing',
    'Social Connection',
    'Volunteering',
    'Pets',
    'Connection with Nature',
    'Grounding',
    'Touch',
    'Intimacy',
  ],
};

const articles = [
  {
    title: 'A Short Morning Walk to Start the Day',
    slug: 'short-morning-walk-start-day',
    category: 'Outdoor Activities',
    author: 'john@gmail.com',
    short_description: 'A practical way to add gentle movement, daylight and a calm start to your morning.',
    content: 'Set out for ten to fifteen minutes at a comfortable pace. Leave your phone in your pocket, notice the light and let your breathing settle. A short walk is easy to repeat, and consistency matters more than distance.',
  },
  {
    title: 'Build a More Regular Sleep Rhythm',
    slug: 'build-regular-sleep-rhythm',
    category: 'Sleep',
    author: 'denis@gmail.com',
    short_description: 'Simple cues that can make evenings calmer and mornings more predictable.',
    content: 'Choose a realistic wake-up time and keep it fairly steady. Dim bright lights in the evening, finish demanding tasks earlier when possible and create a short wind-down routine that you can maintain.',
  },
  {
    title: 'A Simple Breathing Pause for Busy Moments',
    slug: 'simple-breathing-pause-busy-moments',
    category: 'Breathing',
    author: 'nelina@gmail.com',
    short_description: 'Use one quiet minute to slow down and reconnect with the present moment.',
    content: 'Sit or stand comfortably and breathe without forcing the pace. Let each exhale last slightly longer than the inhale for five gentle rounds. Stop if you feel uncomfortable and return to normal breathing.',
  },
  {
    title: 'Hydration as an Everyday Habit',
    slug: 'hydration-everyday-habit',
    category: 'Water',
    author: 'kaloianh@gmail.com',
    short_description: 'Straightforward reminders that make drinking water easier during a full day.',
    content: 'Keep water visible, drink with meals and carry a reusable bottle when you leave home. Needs vary with weather and activity, so use thirst and your daily routine as practical guides.',
  },
  {
    title: 'Make More Room for Nature',
    slug: 'make-more-room-for-nature',
    category: 'Connection with Nature',
    author: 'denis@gmail.com',
    short_description: 'Small ways to spend meaningful time outdoors even during a busy week.',
    content: 'Eat lunch outside, take a familiar route through a park or plan one longer weekend outing. Pay attention to sounds, textures and seasonal changes instead of treating outdoor time as another task.',
  },
  {
    title: 'Stretching After Long Periods of Sitting',
    slug: 'stretching-after-long-sitting',
    category: 'Stretching',
    author: 'john@gmail.com',
    short_description: 'A brief movement sequence for desk days and long journeys.',
    content: 'Stand up, roll your shoulders, reach overhead and gently move your hips and ankles. Keep every movement comfortable. Two or three minutes repeated through the day can feel more approachable than one long session.',
  },
  {
    title: 'Social Connection in Everyday Life',
    slug: 'social-connection-everyday-life',
    category: 'Social Connection',
    author: 'nelina@gmail.com',
    short_description: 'Simple, genuine ways to maintain relationships that matter.',
    content: 'Send a thoughtful message, share a walk or schedule an unhurried meal. Regular small moments of attention often support a relationship better than waiting for a perfect special occasion.',
  },
  {
    title: 'Adding Fermented Foods to Familiar Meals',
    slug: 'fermented-foods-familiar-meals',
    category: 'Fermented Foods',
    author: 'kaloianh@gmail.com',
    short_description: 'Easy serving ideas for yogurt, kefir, sauerkraut and other fermented foods.',
    content: 'Start with a small portion alongside foods you already enjoy. Add plain yogurt to breakfast, serve sauerkraut with lunch or try kefir in a smoothie. Choose products you like and check labels for ingredients.',
  },
  {
    title: 'Cold Exposure Basics for Beginners',
    slug: 'cold-exposure-basics-beginners',
    category: 'Cold Therapy',
    author: 'denis@gmail.com',
    short_description: 'A cautious introduction to brief, controlled encounters with cold water.',
    content: 'Begin by making the final seconds of a normal shower slightly cooler. Stay calm, never force yourself to continue and warm up naturally afterward. Avoid extreme temperatures and practise with extra caution if unsure.',
  },
  {
    title: 'What Pets Teach Us About Daily Presence',
    slug: 'pets-daily-presence',
    category: 'Pets',
    author: 'nelina@gmail.com',
    short_description: 'How ordinary routines with animals can create moments of connection and joy.',
    content: 'Feeding, walking and playing with a pet invite attention to a simple shared activity. Put distractions aside for a few minutes and notice the animal’s signals, energy and personality.',
  },
  {
    title: 'A Colorful Bowl of Everyday Vegetables',
    slug: 'colorful-bowl-everyday-vegetables',
    category: 'Vegetables',
    author: 'kaloianh@gmail.com',
    short_description: 'A flexible formula for preparing vegetables without a complicated recipe.',
    content: 'Combine two or three vegetables with a grain or bean, a favorite herb and a simple dressing. Mix raw and cooked textures, use what is in season and prepare extra portions for tomorrow.',
  },
  {
    title: 'Running at a Conversational Pace',
    slug: 'running-conversational-pace',
    category: 'Running',
    author: 'john@gmail.com',
    short_description: 'An approachable way to keep an easy run relaxed and enjoyable.',
    content: 'Choose a pace at which short sentences still feel comfortable. Slow down or take walking breaks whenever needed. Finish with energy left over so the next session feels inviting rather than intimidating.',
  },
  {
    title: 'Create a Quiet Tea Ritual',
    slug: 'create-quiet-tea-ritual',
    category: 'Tea',
    author: 'nelina@gmail.com',
    short_description: 'Turn an ordinary cup of tea into a brief mindful pause.',
    content: 'Choose a tea you enjoy, notice its aroma and sit down while you drink it. Let the preparation become a transition between tasks. Keep the ritual simple enough to fit naturally into your day.',
  },
  {
    title: 'Share Food, Time and Attention',
    slug: 'share-food-time-attention',
    category: 'Sharing',
    author: 'kaloianh@gmail.com',
    short_description: 'Low-pressure ideas for creating warm moments around a table.',
    content: 'Invite someone for a simple meal, bring fruit to a shared break or cook together. The menu does not need to be elaborate; attention and a welcoming atmosphere are what make the time memorable.',
  },
  {
    title: 'A Gentle Ten-Minute Yoga Reset',
    slug: 'gentle-ten-minute-yoga-reset',
    category: 'Yoga',
    author: 'denis@gmail.com',
    short_description: 'A short sequence focused on comfortable movement and steady breathing.',
    content: 'Move through an easy forward fold, a supported lunge and a seated twist without pushing your range. Pause between shapes, breathe normally and adapt each position to what feels comfortable today.',
  },
];

const comments = [
  ['short-morning-walk-start-day', 'nelina@gmail.com', 'I tried this before breakfast and enjoyed how calm the street felt.'],
  ['short-morning-walk-start-day', 'denis@gmail.com', 'Keeping the phone in my pocket made the walk feel much longer in a good way.'],
  ['build-regular-sleep-rhythm', 'john@gmail.com', 'A consistent wake-up time has been the easiest part for me to control.'],
  ['build-regular-sleep-rhythm', 'nelina@gmail.com', 'The short wind-down routine is a helpful idea.'],
  ['simple-breathing-pause-busy-moments', 'kaloianh@gmail.com', 'Clear and practical. One minute is easy to fit between meetings.'],
  ['hydration-everyday-habit', 'john@gmail.com', 'Keeping a bottle on my desk is the reminder that works best.'],
  ['hydration-everyday-habit', 'denis@gmail.com', 'I also fill mine before leaving the house so it is ready to go.'],
  ['make-more-room-for-nature', 'nelina@gmail.com', 'Lunch outside is such a simple change when the weather is good.'],
  ['make-more-room-for-nature', 'john@gmail.com', 'Noticing seasonal details makes my usual park route feel fresh.'],
  ['stretching-after-long-sitting', 'denis@gmail.com', 'The ankle movements are especially useful after a long drive.'],
  ['stretching-after-long-sitting', 'nelina@gmail.com', 'Short movement breaks feel more realistic than one long routine.'],
  ['social-connection-everyday-life', 'john@gmail.com', 'I sent a message to an old friend after reading this.'],
  ['social-connection-everyday-life', 'kaloianh@gmail.com', 'Shared walks are a great way to talk without rushing.'],
  ['fermented-foods-familiar-meals', 'denis@gmail.com', 'Plain yogurt with fruit has become an easy breakfast for me.'],
  ['cold-exposure-basics-beginners', 'john@gmail.com', 'I appreciate the cautious approach and reminder not to force it.'],
  ['pets-daily-presence', 'denis@gmail.com', 'Walking my dog is often the most mindful part of my afternoon.'],
  ['pets-daily-presence', 'kaloianh@gmail.com', 'Animals are very good at bringing attention back to the moment.'],
  ['colorful-bowl-everyday-vegetables', 'nelina@gmail.com', 'Preparing an extra portion makes the next lunch much easier.'],
  ['running-conversational-pace', 'denis@gmail.com', 'Walking breaks helped me enjoy running again instead of chasing speed.'],
  ['create-quiet-tea-ritual', 'john@gmail.com', 'This is a nice transition away from the computer in the afternoon.'],
  ['share-food-time-attention', 'nelina@gmail.com', 'Simple meals often lead to the best conversations.'],
  ['gentle-ten-minute-yoga-reset', 'john@gmail.com', 'Ten minutes feels approachable even on a busy morning.'],
  ['gentle-ten-minute-yoga-reset', 'kaloianh@gmail.com', 'Adapting the movement to the day is an important reminder.'],
];

const assessmentResults = [
  ['john@gmail.com', 5, 7, 3, 'Moderate sitting time; regular movement breaks and social routines may support a more balanced week.'],
  ['john@gmail.com', 4, 5, 3, 'A steady week with improving activity habits and good opportunities to keep moving consistently.'],
  ['denis@gmail.com', 6, 4, 5, 'Some busy-day stress; brief breathing pauses and planned connection time may be useful.'],
  ['denis@gmail.com', 4, 3, 4, 'A fairly active period with room for a calmer evening routine and regular recovery time.'],
  ['nelina@gmail.com', 3, 5, 2, 'Strong social wellbeing with an opportunity to add more movement during desk-based days.'],
  ['nelina@gmail.com', 4, 4, 3, 'Generally balanced habits; maintaining sleep rhythm and outdoor time may help preserve momentum.'],
];

function stableUuid(value) {
  const bytes = createHash('sha256').update(`more-than-100-seed:${value}`).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function slugify(value) {
  return value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function placeholderImageUrl(title) {
  return `https://placehold.co/1600x900/2f6b4f/ffffff?text=${encodeURIComponent(`Temporary: ${title}`)}`;
}

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const response = await fetch(`${supabaseUrl}${path}`, {
    method,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const responseText = await response.text();
  const responseBody = responseText ? JSON.parse(responseText) : null;

  if (!response.ok) {
    const detail = responseBody?.message || responseBody?.msg || responseBody?.error_description || responseText;
    throw new Error(`${method} ${path} failed (${response.status}): ${detail}`);
  }

  return responseBody;
}

async function authRequest(path, options) {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      return await request(path, options);
    } catch (error) {
      const retryable = error.message.includes('unable to parse or verify signature');
      if (!retryable || attempt === 5) throw error;
      console.log(`  retrying temporary Auth API verification failure (${attempt}/5)`);
    }
  }
}

async function upsert(table, rows, conflictColumn) {
  return request(`/rest/v1/${table}?on_conflict=${encodeURIComponent(conflictColumn)}`, {
    method: 'POST',
    body: rows,
    headers: {
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
  });
}

async function listAuthUsers() {
  const users = [];
  let page = 1;

  while (true) {
    const result = await authRequest(`/auth/v1/admin/users?page=${page}&per_page=100`);
    users.push(...result.users);
    if (result.users.length < 100) return users;
    page += 1;
  }
}

async function createAuthUser(seedUser) {
  const payload = {
    email: seedUser.email,
    password: seedUser.password,
    email_confirm: true,
    user_metadata: {
      first_name: seedUser.profile.first_name,
      last_name: seedUser.profile.last_name,
    },
  };

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await authRequest('/auth/v1/admin/users', { method: 'POST', body: payload });
    } catch (error) {
      const existing = (await listAuthUsers()).find(
        (user) => user.email?.toLowerCase() === seedUser.email.toLowerCase(),
      );
      if (existing) return existing;
      if (attempt === 3) throw error;
      console.log(`  retrying a temporary Auth API failure for ${seedUser.email}`);
    }
  }
}

async function ensureAuthUsers() {
  console.log('1/7 Creating or reusing sample Auth users...');
  const existingUsers = await listAuthUsers();
  const usersByEmail = new Map(existingUsers.map((user) => [user.email.toLowerCase(), user]));
  const result = new Map();

  for (const seedUser of authUsers) {
    const email = seedUser.email.toLowerCase();
    let user = usersByEmail.get(email);

    if (!user) {
      user = await createAuthUser(seedUser);
      console.log(`  created ${email}`);
    } else {
      console.log(`  reused ${email}`);
    }

    result.set(email, { ...seedUser, id: user.id });
  }

  return result;
}

async function seedProfilesAndRoles(usersByEmail) {
  console.log('2/7 Upserting profiles and roles...');
  const users = [...usersByEmail.values()];
  const profiles = users.map(({ id, profile }) => ({
    id,
    first_name: profile.first_name || null,
    last_name: profile.last_name || null,
    nickname: profile.nickname || null,
    bio: profile.bio || null,
    avatar_url: profile.avatar_url || null,
    website_url: profile.website_url || null,
    instagram_url: profile.instagram_url || null,
    facebook_url: profile.facebook_url || null,
  }));
  const roles = users.map(({ id, email, role }) => ({
    id: stableUuid(`role:${email}`),
    user_id: id,
    role,
  }));

  await upsert('profiles', profiles, 'id');
  await upsert('user_roles', roles, 'user_id');
  console.log(`  ${profiles.length} profiles and ${roles.length} roles ready`);
}

async function seedCategories() {
  console.log('3/7 Creating or reusing categories...');
  const existing = await request('/rest/v1/categories?select=id,name,slug,parent_id');
  const bySlug = new Map(existing.map((category) => [category.slug, category]));

  for (const name of Object.keys(categoryTree)) {
    const slug = slugify(name);
    if (!bySlug.has(slug)) {
      const [created] = await upsert('categories', [{ id: stableUuid(`category:${slug}`), name, slug }], 'slug');
      bySlug.set(slug, created);
    }
  }

  for (const [parentName, childNames] of Object.entries(categoryTree)) {
    const parent = bySlug.get(slugify(parentName));
    for (const name of childNames) {
      const slug = slugify(name);
      const payload = {
        id: bySlug.get(slug)?.id || stableUuid(`category:${slug}`),
        name,
        slug,
        parent_id: parent.id,
      };
      const [category] = await upsert('categories', [payload], 'slug');
      bySlug.set(slug, category);
    }
  }

  console.log(`  ${bySlug.size} categories and subcategories ready`);
  return bySlug;
}

async function seedArticles(usersByEmail, categoriesBySlug) {
  console.log('4/7 Upserting sample articles...');
  const existing = await request('/rest/v1/articles?select=id,slug');
  const existingBySlug = new Map(existing.map((article) => [article.slug, article]));
  const payload = articles.map((article) => ({
    id: existingBySlug.get(article.slug)?.id || stableUuid(`article:${article.slug}`),
    author_id: usersByEmail.get(article.author).id,
    category_id: categoriesBySlug.get(slugify(article.category)).id,
    title: article.title,
    slug: article.slug,
    short_description: article.short_description,
    content: article.content,
    cover_image_url: placeholderImageUrl(article.title),
  }));
  const saved = await upsert('articles', payload, 'slug');
  console.log(`  ${saved.length} articles ready`);
  return new Map(saved.map((article) => [article.slug, article]));
}

async function seedComments(usersByEmail, articlesBySlug) {
  console.log('5/7 Upserting sample comments...');
  const payload = comments.map(([articleSlug, authorEmail, content], index) => ({
    id: stableUuid(`comment:${index}:${articleSlug}:${authorEmail}`),
    article_id: articlesBySlug.get(articleSlug).id,
    author_id: usersByEmail.get(authorEmail).id,
    content,
  }));
  const saved = await upsert('comments', payload, 'id');
  console.log(`  ${saved.length} comments ready`);
}

async function seedAssessmentResults(usersByEmail) {
  console.log('6/7 Upserting sample assessment results...');
  const payload = assessmentResults.map(([email, stressScore, sedentaryScore, socialScore, summary], index) => ({
    id: stableUuid(`assessment:${index}:${email}`),
    user_id: usersByEmail.get(email).id,
    stress_score: stressScore,
    sedentary_score: sedentaryScore,
    social_score: socialScore,
    summary,
  }));
  const saved = await upsert('assessment_results', payload, 'id');
  console.log(`  ${saved.length} assessment results ready`);
}

async function verifySeed(usersByEmail) {
  console.log('7/7 Verifying seeded records...');
  const userIds = [...usersByEmail.values()].map(({ id }) => id);
  const encodedIds = encodeURIComponent(`(${userIds.join(',')})`);
  const [profiles, roles, categories, savedArticles, savedComments, assessments] = await Promise.all([
    request(`/rest/v1/profiles?select=id&id=in.${encodedIds}`),
    request(`/rest/v1/user_roles?select=user_id,role&user_id=in.${encodedIds}`),
    request('/rest/v1/categories?select=id,slug'),
    request(`/rest/v1/articles?select=id,slug&slug=in.(${articles.map(({ slug }) => `\"${slug}\"`).join(',')})`),
    request(`/rest/v1/comments?select=id&id=in.(${comments.map((entry, index) => stableUuid(`comment:${index}:${entry[0]}:${entry[1]}`)).join(',')})`),
    request(`/rest/v1/assessment_results?select=id&id=in.(${assessmentResults.map((entry, index) => stableUuid(`assessment:${index}:${entry[0]}`)).join(',')})`),
  ]);

  const expectedCategoryCount = Object.keys(categoryTree).length + Object.values(categoryTree).flat().length;
  const admin = usersByEmail.get('kaloianh@gmail.com');
  const adminRole = roles.find((role) => role.user_id === admin.id)?.role;
  const checks = {
    profiles: [profiles.length, authUsers.length],
    roles: [roles.length, authUsers.length],
    categories: [categories.filter(({ slug }) => Object.keys(categoryTree).some((name) => slug === slugify(name)) || Object.values(categoryTree).flat().some((name) => slug === slugify(name))).length, expectedCategoryCount],
    articles: [savedArticles.length, articles.length],
    comments: [savedComments.length, comments.length],
    assessments: [assessments.length, assessmentResults.length],
  };

  for (const [label, [actual, expected]] of Object.entries(checks)) {
    if (actual !== expected) throw new Error(`Verification failed for ${label}: expected ${expected}, found ${actual}`);
  }
  if (adminRole !== 'admin') throw new Error('Verification failed: the admin sample user does not have the admin role.');

  console.log('  verification passed');
  console.table(Object.fromEntries(Object.entries(checks).map(([label, [count]]) => [label, { count }])));
}

async function verifyUsers(usersByEmail) {
  console.log('3/3 Verifying Auth users, profiles and roles...');
  const allAuthUsers = await listAuthUsers();
  const userIds = [...usersByEmail.values()].map(({ id }) => id);
  const encodedIds = encodeURIComponent(`(${userIds.join(',')})`);
  const [profiles, roles] = await Promise.all([
    request(`/rest/v1/profiles?select=id&id=in.${encodedIds}`),
    request(`/rest/v1/user_roles?select=user_id,role&user_id=in.${encodedIds}`),
  ]);

  for (const [email, expected] of usersByEmail) {
    const matchingAuthUsers = allAuthUsers.filter((user) => user.email?.toLowerCase() === email);
    const matchingProfiles = profiles.filter((profile) => profile.id === expected.id);
    const matchingRoles = roles.filter((role) => role.user_id === expected.id);

    if (matchingAuthUsers.length !== 1) {
      throw new Error(`Verification failed for ${email}: expected one Auth user, found ${matchingAuthUsers.length}.`);
    }
    if (matchingProfiles.length !== 1) {
      throw new Error(`Verification failed for ${email}: expected one profile, found ${matchingProfiles.length}.`);
    }
    if (matchingRoles.length !== 1 || matchingRoles[0].role !== expected.role) {
      throw new Error(`Verification failed for ${email}: expected exactly one ${expected.role} role.`);
    }
  }

  console.log('  all four users have exactly one Auth account, profile and correct role');
}

async function main() {
  console.log('Seeding More Than 100 sample data...');
  const usersByEmail = await ensureAuthUsers();
  await seedProfilesAndRoles(usersByEmail);
  if (usersOnly) {
    await verifyUsers(usersByEmail);
    console.log('Sample user seed completed successfully.');
    return;
  }
  const categoriesBySlug = await seedCategories();
  const articlesBySlug = await seedArticles(usersByEmail, categoriesBySlug);
  await seedComments(usersByEmail, articlesBySlug);
  await seedAssessmentResults(usersByEmail);
  await verifySeed(usersByEmail);
  console.log('Seed completed successfully. It is safe to rerun this script.');
}

function validateSeedDefinition() {
  const expectedCategoryCount = Object.keys(categoryTree).length + Object.values(categoryTree).flat().length;
  const categoryNames = new Set([...Object.keys(categoryTree), ...Object.values(categoryTree).flat()]);
  const userEmails = new Set(authUsers.map(({ email }) => email));
  const uniqueArticleSlugs = new Set(articles.map(({ slug }) => slug));
  const uniqueNicknames = new Set(authUsers.map(({ profile }) => profile.nickname));

  const checks = [
    [authUsers.length === 4, 'exactly four Auth users'],
    [userEmails.size === authUsers.length, 'unique Auth user emails'],
    [uniqueNicknames.size === authUsers.length, 'unique profile nicknames'],
    [expectedCategoryCount === 41, 'six main categories and 35 subcategories'],
    [articles.length === 15 && uniqueArticleSlugs.size === articles.length, '15 uniquely slugged articles'],
    [articles.every(({ author, category }) => userEmails.has(author) && categoryNames.has(category)), 'valid article references'],
    [comments.length >= 20 && comments.length <= 25, '20-25 comments'],
    [comments.every(([slug, email]) => uniqueArticleSlugs.has(slug) && userEmails.has(email)), 'valid comment references'],
    [assessmentResults.every(([email]) => email !== 'kaloianh@gmail.com' && userEmails.has(email)), 'normal-user assessment results only'],
  ];
  const failed = checks.filter(([passed]) => !passed).map(([, label]) => label);
  if (failed.length) throw new Error(`Seed definition validation failed: ${failed.join(', ')}`);
  console.log('Seed definition is valid.');
  for (const [, label] of checks) console.log(`  ok: ${label}`);
}

const operation = validationOnly ? Promise.resolve().then(validateSeedDefinition) : main();

operation.catch((error) => {
  console.error(`Seed failed: ${error.message}`);
  process.exitCode = 1;
});
