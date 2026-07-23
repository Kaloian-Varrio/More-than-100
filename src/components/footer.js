import { getCurrentUser, onAuthStateChange } from '../services/auth-service.js';

const primaryLinks = [
  ['Home', '/'],
  ['Articles', '/articles'],
  ['Stories', '/stories'],
  ['Personal Assessment', '/assessment'],
  ['About Us', '/information.html#about'],
  ['Contact', '/information.html#contact'],
];

const categoryLinks = [
  ['Foods', '/categories/foods'],
  ['Drinks', '/categories/drinks'],
  ['Herbs', '/categories/herbs'],
  ['Mindfulness', '/categories/mindfulness'],
  ['Movement', '/categories/movement'],
  ['Emotions and Senses', '/categories/emotions-and-senses'],
];

const legalLinks = [
  ['Terms and Conditions', '/information.html#terms'],
  ['Privacy Policy', '/information.html#privacy'],
  ['GDPR / Data Protection', '/information.html#data-protection'],
  ['Cookie Policy', '/information.html#cookies'],
];

const socialLinks = [
  ['Facebook', 'facebook', 'https://www.facebook.com/'],
  ['Instagram', 'instagram', 'https://www.instagram.com/'],
  ['YouTube', 'youtube', 'https://www.youtube.com/'],
  ['LinkedIn', 'linkedin', 'https://www.linkedin.com/'],
];

function createLinkList(items) {
  return items.map(([label, href]) => `<li><a href="${href}">${label}</a></li>`).join('');
}

export function createFooter() {
  return `
    <footer class="site-footer mt-auto" aria-labelledby="footer-title">
      <div class="footer-glow" aria-hidden="true"></div>
      <div class="container position-relative py-5 py-lg-6">
        <div class="row g-5">
          <div class="col-lg-5">
            <a class="footer-brand d-inline-flex align-items-center gap-2" href="/" id="footer-title" aria-label="More Than 100 home" data-brand-identity>
              <span class="footer-brand__mark" aria-hidden="true" data-brand-fallback>100<span>+</span></span>
              <img class="brand-logo brand-logo--footer" alt="" data-brand-logo hidden>
              <span data-brand-label>More Than 100</span>
            </a>
            <p class="footer-tagline mt-3 mb-2">Small choices. Smart actions. A longer, healthier life.</p>
            <p class="footer-description mb-4">Practical ideas for nourishing habits, joyful movement, mindfulness and lasting wellbeing.</p>
            <form class="newsletter-form" id="newsletter-form" novalidate>
              <label class="form-label footer-heading" for="newsletter-email">Fresh ideas, occasionally</label>
              <div class="newsletter-controls">
                <input class="form-control" id="newsletter-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" aria-describedby="newsletter-note newsletter-feedback" required>
                <button class="btn btn-footer" type="submit">Subscribe</button>
              </div>
              <p class="footer-form-note mt-2 mb-0" id="newsletter-note">Demo only—no email address is stored or sent.</p>
              <p class="newsletter-feedback mt-2 mb-0" id="newsletter-feedback" role="status" aria-live="polite"></p>
            </form>
          </div>

          <div class="col-sm-6 col-lg-3">
            <div class="row g-4">
              <nav class="col-6 col-sm-12" aria-labelledby="footer-navigation-title">
                <h2 class="footer-heading" id="footer-navigation-title">Navigate</h2>
                <ul class="footer-links list-unstyled mb-0">
                  ${createLinkList(primaryLinks)}
                  <li class="d-none" data-footer-auth-only><a href="/dashboard">Dashboard</a></li>
                </ul>
              </nav>
              <nav class="col-6 col-sm-12" aria-labelledby="footer-categories-title">
                <h2 class="footer-heading" id="footer-categories-title">Explore</h2>
                <ul class="footer-links list-unstyled mb-0">${createLinkList(categoryLinks)}</ul>
              </nav>
            </div>
          </div>

          <div class="col-sm-6 col-lg-4">
            <nav aria-labelledby="footer-legal-title">
              <h2 class="footer-heading" id="footer-legal-title">Information</h2>
              <ul class="footer-links footer-links--legal list-unstyled mb-4">${createLinkList(legalLinks)}</ul>
            </nav>
            <div aria-labelledby="footer-social-title">
              <h2 class="footer-heading" id="footer-social-title">Find us online</h2>
              <div class="footer-socials">
                ${socialLinks.map(([label, icon, href]) => `<a href="${href}" target="_blank" rel="noopener noreferrer" aria-label="${label} (opens in a new tab)"><i class="bi bi-${icon}" aria-hidden="true"></i></a>`).join('')}
              </div>
              <p class="footer-form-note mt-3 mb-0">Social links currently lead to the platform homepages.</p>
            </div>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="container py-3">
          <p class="copyright mb-0">&copy; 2026 More Than 100. All rights reserved. More Than 100 and its content belong to Varrio Sport Ltd.</p>
        </div>
      </div>
    </footer>`;
}

function initializeNewsletterForm() {
  const form = document.querySelector('#newsletter-form');
  const feedback = document.querySelector('#newsletter-feedback');
  if (!form || !feedback) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    feedback.textContent = '';
    form.classList.add('was-validated');

    if (!form.checkValidity()) {
      feedback.textContent = 'Please enter a valid email address.';
      feedback.className = 'newsletter-feedback newsletter-feedback--error mt-2 mb-0';
      return;
    }

    feedback.textContent = 'Thanks for your interest! Newsletter subscription will be available soon.';
    feedback.className = 'newsletter-feedback newsletter-feedback--success mt-2 mb-0';
    form.reset();
    form.classList.remove('was-validated');
  });
}

function showAuthenticatedFooterLinks(user) {
  document.querySelectorAll('[data-footer-auth-only]').forEach((item) => {
    item.classList.toggle('d-none', !user);
  });
}

export async function initializeFooter() {
  initializeNewsletterForm();
  onAuthStateChange(showAuthenticatedFooterLinks);
  showAuthenticatedFooterLinks(await getCurrentUser().catch(() => null));
}
