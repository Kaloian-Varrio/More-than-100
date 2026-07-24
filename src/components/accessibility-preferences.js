import '../styles/accessibility.css';
import {
  changeAccessibilityTextSize,
  getAccessibilityPreferences,
  resetAccessibilityPreferences,
  updateAccessibilityPreferences,
} from '../services/accessibility-preferences.js';

const toggles = [
  ['highContrast', 'High contrast'],
  ['grayscale', 'Grayscale'],
  ['reduceMotion', 'Reduce motion'],
  ['underlineLinks', 'Underline links'],
  ['readableSpacing', 'Readable spacing'],
];

export function createAccessibilityPreferences() {
  return `
    <button class="accessibility-launcher btn btn-primary" id="accessibility-launcher" type="button" aria-label="Open accessibility preferences" aria-haspopup="dialog" aria-controls="accessibility-dialog">
      <i class="bi bi-universal-access" aria-hidden="true"></i>
      <span class="visually-hidden">Accessibility</span>
    </button>
    <dialog class="accessibility-dialog" id="accessibility-dialog" aria-labelledby="accessibility-title" aria-describedby="accessibility-description">
      <div class="accessibility-dialog__header">
        <div>
          <p class="section-eyebrow mb-1">Interface controls</p>
          <h2 class="h4 mb-0" id="accessibility-title">Accessibility preferences</h2>
        </div>
        <button class="btn-close" type="button" data-accessibility-close aria-label="Close accessibility preferences"></button>
      </div>
      <p class="text-body-secondary mt-3" id="accessibility-description">Adjust the interface to better match your viewing and reading preferences.</p>
      <div class="accessibility-text-size" role="group" aria-labelledby="accessibility-text-size-label">
        <div>
          <span class="fw-semibold" id="accessibility-text-size-label">Text size</span>
          <output class="accessibility-text-size__value" id="accessibility-text-size-value" aria-live="polite">100%</output>
        </div>
        <div class="btn-group" aria-label="Text size controls">
          <button class="btn btn-outline-primary" type="button" data-text-size-decrease aria-label="Decrease text size"><i class="bi bi-dash-lg" aria-hidden="true"></i><span class="ms-1">Decrease</span></button>
          <button class="btn btn-outline-primary" type="button" data-text-size-increase aria-label="Increase text size"><i class="bi bi-plus-lg" aria-hidden="true"></i><span class="ms-1">Increase</span></button>
        </div>
      </div>
      <fieldset class="accessibility-toggles">
        <legend class="visually-hidden">Visual and reading preferences</legend>
        ${toggles.map(([name, label]) => `<div class="form-check form-switch accessibility-toggle"><input class="form-check-input" id="accessibility-${name}" type="checkbox" data-accessibility-setting="${name}"><label class="form-check-label" for="accessibility-${name}">${label}</label></div>`).join('')}
      </fieldset>
      <div class="accessibility-dialog__actions">
        <button class="btn btn-outline-secondary" type="button" data-accessibility-reset><i class="bi bi-arrow-counterclockwise me-2" aria-hidden="true"></i>Reset accessibility settings</button>
      </div>
      <p class="small text-body-secondary mb-0 mt-3">These preferences complement your browser and operating system accessibility settings.</p>
    </dialog>`;
}

export function initializeAccessibilityPreferences() {
  const launcher = document.querySelector('#accessibility-launcher');
  const dialog = document.querySelector('#accessibility-dialog');
  if (!launcher || !dialog) return;

  const render = (preferences = getAccessibilityPreferences()) => {
    document.querySelector('#accessibility-text-size-value').value = `${preferences.textSize}%`;
    toggles.forEach(([name]) => {
      const input = document.querySelector(`[data-accessibility-setting="${name}"]`);
      if (input) input.checked = preferences[name];
    });
    document.querySelector('[data-text-size-decrease]').disabled = preferences.textSize === 90;
    document.querySelector('[data-text-size-increase]').disabled = preferences.textSize === 130;
  };

  launcher.addEventListener('click', () => {
    render();
    dialog.showModal();
    dialog.querySelector('[data-text-size-decrease]')?.focus();
  });
  dialog.querySelector('[data-accessibility-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => launcher.focus());
  dialog.querySelector('[data-text-size-decrease]').addEventListener('click', () => render(changeAccessibilityTextSize(-1)));
  dialog.querySelector('[data-text-size-increase]').addEventListener('click', () => render(changeAccessibilityTextSize(1)));
  dialog.querySelectorAll('[data-accessibility-setting]').forEach((input) => {
    input.addEventListener('change', () => render(updateAccessibilityPreferences({ [input.dataset.accessibilitySetting]: input.checked })));
  });
  dialog.querySelector('[data-accessibility-reset]').addEventListener('click', () => render(resetAccessibilityPreferences()));
  render();
}
