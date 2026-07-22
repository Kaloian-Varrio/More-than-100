export function escapeHtml(value = '') {
  const element = document.createElement('span');
  element.textContent = String(value);
  return element.innerHTML.replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

export function safeImageUrl(value) {
  if (!value) return '';
  try {
    const url = new URL(value, window.location.origin);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}
