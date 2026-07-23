import { escapeHtml } from '../utils/html.js';

export const miniBrandSlogan = 'Begin. Move. Fuel. Connect.';

export function createMiniBrandSlogan(className = '') {
  const classes = ['mini-brand-slogan', className].filter(Boolean).join(' ');
  return `<p class="${escapeHtml(classes)}">${miniBrandSlogan}</p>`;
}
