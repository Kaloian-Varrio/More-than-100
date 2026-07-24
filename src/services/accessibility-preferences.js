const storageKey = 'more-than-100-accessibility';
const textSizes = [90, 100, 110, 120, 130];
const defaults = Object.freeze({
  textSize: 100,
  highContrast: false,
  grayscale: false,
  reduceMotion: false,
  underlineLinks: false,
  readableSpacing: false,
});

let preferences = loadPreferences();

export function getAccessibilityPreferences() {
  return { ...preferences };
}

export function updateAccessibilityPreferences(changes) {
  preferences = normalizePreferences({ ...preferences, ...changes });
  persistPreferences();
  applyAccessibilityPreferences();
  return getAccessibilityPreferences();
}

export function changeAccessibilityTextSize(direction) {
  const currentIndex = textSizes.indexOf(preferences.textSize);
  const nextIndex = Math.min(textSizes.length - 1, Math.max(0, currentIndex + direction));
  return updateAccessibilityPreferences({ textSize: textSizes[nextIndex] });
}

export function resetAccessibilityPreferences() {
  preferences = { ...defaults };
  try {
    localStorage.removeItem(storageKey);
  } catch {
    // Preferences still reset for the current page when storage is unavailable.
  }
  applyAccessibilityPreferences();
  return getAccessibilityPreferences();
}

export function shouldReduceMotion() {
  return preferences.reduceMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function applyAccessibilityPreferences() {
  const root = document.documentElement;
  root.style.fontSize = `${preferences.textSize}%`;
  root.dataset.a11yHighContrast = String(preferences.highContrast);
  root.dataset.a11yGrayscale = String(preferences.grayscale);
  root.dataset.a11yReduceMotion = String(preferences.reduceMotion);
  root.dataset.a11yUnderlineLinks = String(preferences.underlineLinks);
  root.dataset.a11yReadableSpacing = String(preferences.readableSpacing);
}

function normalizePreferences(value) {
  return {
    textSize: textSizes.includes(Number(value?.textSize)) ? Number(value.textSize) : defaults.textSize,
    highContrast: value?.highContrast === true,
    grayscale: value?.grayscale === true,
    reduceMotion: value?.reduceMotion === true,
    underlineLinks: value?.underlineLinks === true,
    readableSpacing: value?.readableSpacing === true,
  };
}

function loadPreferences() {
  try {
    return normalizePreferences(JSON.parse(localStorage.getItem(storageKey) || '{}'));
  } catch {
    return { ...defaults };
  }
}

function persistPreferences() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(preferences));
  } catch {
    // The active page still receives preferences when storage is unavailable.
  }
}

applyAccessibilityPreferences();
