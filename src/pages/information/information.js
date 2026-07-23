import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../styles/global.css';
import './information.css';
import { renderLayout } from '../../components/layout.js';

const sections = [
  ['about', 'About Us', 'More Than 100 shares practical ideas for healthier habits, movement, mindfulness, connection and longevity. Our aim is to make positive everyday choices feel useful, realistic and encouraging.'],
  ['contact', 'Contact', 'Contact options are being prepared. Until then, please use the application’s existing account and content tools.'],
  ['terms', 'Terms and Conditions', 'Detailed terms and conditions will be published here before additional public services are introduced. More Than 100 currently provides general lifestyle information and does not provide medical or psychological diagnosis.'],
  ['privacy', 'Privacy Policy', 'A complete privacy policy is being prepared. Account and application data are handled through the services described in the project documentation and are not used by the demo newsletter form.'],
  ['data-protection', 'GDPR / Data Protection', 'Data protection information, including access and deletion request procedures, will be published here. The newsletter demonstration does not store or transmit the email address entered.'],
  ['cookies', 'Cookie Policy', 'A detailed cookie notice will be added if optional tracking or analytics are introduced. The current application uses only the storage required for its implemented account and application features.'],
];

const content = `
  <header class="information-hero py-5">
    <div class="container py-lg-4">
      <p class="information-eyebrow mb-2">More Than 100</p>
      <h1 class="display-5 fw-bold mb-3">About and information</h1>
      <p class="lead mb-0">A clear home for platform details, contact information and temporary legal notices.</p>
    </div>
  </header>
  <div class="container py-5">
    <div class="row g-4">
      ${sections.map(([id, title, description]) => `<div class="col-md-6" id="${id}"><section class="information-card h-100 p-4 p-lg-5" aria-labelledby="${id}-title"><h2 class="h3 mb-3" id="${id}-title">${title}</h2><p class="text-body-secondary mb-0">${description}</p></section></div>`).join('')}
    </div>
  </div>`;

renderLayout({ activePath: '/information', content, mainClass: 'information-page' });
