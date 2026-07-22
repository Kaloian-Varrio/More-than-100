import morningWalkImage from '../../assets/home/morning-walk.jpg';
import breakfastImage from '../../assets/home/nourishing-breakfast.jpg';
import breathingImage from '../../assets/home/mindful-breathing.jpg';

const contentAreas = [
  { title: 'Foods', icon: 'basket2', description: 'Everyday ingredients and practical ways to build satisfying meals.' },
  { title: 'Drinks', icon: 'cup-straw', description: 'Hydration, tea and simple drink habits that fit real life.' },
  { title: 'Herbs', icon: 'flower1', description: 'A grounded introduction to culinary herbs and daily rituals.' },
  { title: 'Mindfulness', icon: 'sun', description: 'Small pauses for attention, rest, breathing and better balance.' },
  { title: 'Movement', icon: 'activity', description: 'Approachable ideas for mobility, strength and outdoor activity.' },
  { title: 'Emotions and Senses', icon: 'heart', description: 'Connection, joy and the relationships that enrich our days.' },
];

const featuredArticles = [
  {
    image: morningWalkImage,
    imageAlt: 'A group of healthy adults enjoying a morning walk through a sunlit park',
    category: 'Movement',
    title: 'A short morning walk to start the day',
    description: 'Add gentle movement, natural light and a calmer rhythm to the beginning of your morning.',
  },
  {
    image: breakfastImage,
    imageAlt: 'A colorful breakfast with fruit, yogurt, nuts, whole-grain toast and water',
    category: 'Foods',
    title: 'Build a nourishing breakfast you enjoy',
    description: 'Use a flexible mix of whole foods, color and hydration—without making mornings complicated.',
  },
  {
    image: breathingImage,
    imageAlt: 'A woman taking a quiet mindful breathing break beside a mountain lake',
    category: 'Mindfulness',
    title: 'One quiet minute for a breathing pause',
    description: 'Step away from the rush and reconnect with the present through a simple, comfortable practice.',
  },
];

function createSectionHeading(eyebrow, title, description) {
  return `
    <div class="section-heading mx-auto text-center">
      <p class="section-eyebrow mb-2">${eyebrow}</p>
      <h2 class="section-title mb-3">${title}</h2>
      <p class="section-description text-body-secondary mb-0">${description}</p>
    </div>`;
}

function createContentAreaCard({ title, icon, description }) {
  return `
    <div class="col-sm-6 col-lg-4">
      <a class="area-card card h-100 border-0" href="#featured-content" aria-label="Explore ${title} content">
        <div class="card-body p-4 p-xl-5">
          <span class="area-card__icon" aria-hidden="true"><i class="bi bi-${icon}"></i></span>
          <h3 class="h4 mt-4 mb-2">${title}</h3>
          <p class="text-body-secondary mb-4">${description}</p>
          <span class="area-card__link">Explore ideas <i class="bi bi-arrow-right" aria-hidden="true"></i></span>
        </div>
      </a>
    </div>`;
}

function createArticleCard({ image, imageAlt, category, title, description }) {
  return `
    <div class="col-md-6 col-lg-4">
      <article class="article-card card h-100 border-0">
        <div class="article-card__image-wrap">
          <img class="article-card__image" src="${image}" alt="${imageAlt}" loading="lazy" width="1536" height="1024" />
        </div>
        <div class="card-body d-flex flex-column p-4">
          <p class="article-card__category mb-2">${category}</p>
          <h3 class="h4 card-title mb-3">${title}</h3>
          <p class="card-text text-body-secondary mb-4">${description}</p>
          <a class="article-card__link mt-auto" href="#get-started" aria-label="Read more about ${title}">
            Read the preview <i class="bi bi-arrow-up-right" aria-hidden="true"></i>
          </a>
        </div>
      </article>
    </div>`;
}

export function createHeroSection() {
  return `
    <section class="home-hero" aria-labelledby="hero-title">
      <div class="container position-relative py-5 py-lg-6">
        <div class="row align-items-center g-5">
          <div class="col-lg-7">
            <p class="hero-kicker mb-3"><i class="bi bi-stars me-2" aria-hidden="true"></i>Healthy living, made practical</p>
            <h1 class="hero-headline mb-4" id="hero-title">
              <span class="hero-headline__small">Small</span> choices.
              <span class="hero-headline__smart">Smart</span> actions.
              A <span class="hero-headline__life">longer, healthier life.</span>
            </h1>
            <p class="hero-copy mb-4">
              Discover everyday habits for better nutrition, joyful movement, mindful living and stronger social connection—designed to help you invest in a healthier future, one choice at a time.
            </p>
            <div class="d-flex flex-column flex-sm-row flex-wrap gap-3" aria-label="Get started">
              <a class="btn btn-primary btn-lg px-4" href="#get-started"><i class="bi bi-person-plus me-2" aria-hidden="true"></i>Register</a>
              <a class="btn btn-outline-primary btn-lg px-4" href="#get-started"><i class="bi bi-box-arrow-in-right me-2" aria-hidden="true"></i>Login</a>
              <a class="btn btn-link btn-lg hero-assessment-link px-2" href="#assessment">
                Personal Assessment <i class="bi bi-arrow-right ms-1" aria-hidden="true"></i>
              </a>
            </div>
            <p class="hero-note mt-4 mb-0"><i class="bi bi-check-circle-fill me-2" aria-hidden="true"></i>Practical ideas. No pressure. Progress at your pace.</p>
          </div>
          <div class="col-lg-5">
            <div class="hero-visual" aria-label="A balanced approach to everyday wellbeing">
              <div class="hero-orbit hero-orbit--outer"></div>
              <div class="hero-orbit hero-orbit--inner"></div>
              <div class="hero-visual__center">
                <span class="hero-visual__number">100<span>+</span></span>
                <span class="hero-visual__label">reasons to begin</span>
              </div>
              <div class="hero-pill hero-pill--move"><i class="bi bi-activity"></i><span>Move</span></div>
              <div class="hero-pill hero-pill--nourish"><i class="bi bi-basket2"></i><span>Nourish</span></div>
              <div class="hero-pill hero-pill--connect"><i class="bi bi-people"></i><span>Connect</span></div>
              <div class="hero-pill hero-pill--restore"><i class="bi bi-moon-stars"></i><span>Restore</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>`;
}

export function createContentAreasSection() {
  return `
    <section class="content-areas section-space" id="content-areas" aria-labelledby="content-areas-title">
      <div class="container">
        ${createSectionHeading('Explore your wellbeing', '<span id="content-areas-title">Six areas. One healthier whole.</span>', 'Find approachable ideas across the parts of daily life that help us feel energized, connected and well.')}
        <div class="row g-4 mt-4">${contentAreas.map(createContentAreaCard).join('')}</div>
      </div>
    </section>`;
}

export function createFeaturedContentSection() {
  return `
    <section class="featured-content section-space" id="featured-content" aria-labelledby="featured-title">
      <div class="container">
        <div class="d-lg-flex justify-content-between align-items-end gap-4 mb-4 mb-lg-5">
          <div class="section-heading text-lg-start mb-3 mb-lg-0">
            <p class="section-eyebrow mb-2">A good place to start</p>
            <h2 class="section-title mb-3" id="featured-title">Practical reads for real life</h2>
            <p class="section-description text-body-secondary mb-0">Short, useful ideas you can carry into your next meal, walk or quiet moment.</p>
          </div>
          <a class="view-all-link" href="#content-areas">Browse all areas <i class="bi bi-arrow-right" aria-hidden="true"></i></a>
        </div>
        <div class="row g-4">${featuredArticles.map(createArticleCard).join('')}</div>
      </div>
    </section>`;
}

export function createValueSection() {
  const values = [
    ['lightning-charge', 'Small actions', 'Make useful habits feel achievable in an ordinary day.'],
    ['person-walking', 'Active living', 'Find enjoyable ways to move, recover and build consistency.'],
    ['people', 'Stronger connection', 'Make room for relationships, shared time and emotional wellbeing.'],
  ];

  return `
    <section class="value-section section-space" id="why-it-matters" aria-labelledby="value-title">
      <div class="container">
        <div class="value-panel">
          <div class="row align-items-center g-5">
            <div class="col-lg-5">
              <p class="section-eyebrow section-eyebrow--light mb-2">Why More Than 100</p>
              <h2 class="section-title text-white mb-3" id="value-title">Healthier years are built in everyday moments.</h2>
              <p class="value-copy mb-0">You do not need to transform everything overnight. Start with one practical habit, learn what works for you and keep moving forward.</p>
            </div>
            <div class="col-lg-7">
              <div class="row g-3">
                ${values.map(([icon, title, description]) => `
                  <div class="col-md-4">
                    <div class="value-item h-100">
                      <i class="bi bi-${icon}" aria-hidden="true"></i>
                      <h3 class="h6 mt-3 mb-2">${title}</h3>
                      <p class="mb-0">${description}</p>
                    </div>
                  </div>`).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="get-started pb-5 pb-lg-6" id="get-started" aria-labelledby="get-started-title">
      <div class="container">
        <div class="get-started__panel text-center" id="assessment">
          <span class="get-started__icon" aria-hidden="true"><i class="bi bi-compass"></i></span>
          <h2 class="h1 mt-4 mb-3" id="get-started-title">Ready for your next small step?</h2>
          <p class="text-body-secondary mx-auto mb-4">Registration, login and the personal lifestyle assessment are coming in the next stage of the application.</p>
          <a class="btn btn-primary btn-lg px-4" href="#content-areas">Explore healthy ideas now</a>
        </div>
      </div>
    </section>`;
}
