import { createFooter, initializeFooter } from './footer.js';
import { createHeader, initializeAuthHeader } from './header.js';
import { createMainContent } from './main-content.js';
import { initializeBrandLogos } from '../services/brand-logo-service.js';

export function renderLayout({ activePath, content, mainClass = '' }) {
  const app = document.querySelector('#app');

  if (!app) {
    throw new Error('Application root element was not found.');
  }

  app.innerHTML = `
    <div class="d-flex flex-column min-vh-100">
      ${createHeader(activePath)}
      ${createMainContent(content, mainClass)}
      ${createFooter()}
    </div>`;

  initializeAuthHeader(activePath);
  initializeFooter();
  initializeBrandLogos();
}
