export function createLoadingState(label = 'Loading content...') {
  return `<div class="content-state text-center py-5" role="status"><span class="spinner-border text-success mb-3" aria-hidden="true"></span><p class="fw-semibold mb-0">${label}</p></div>`;
}

export function createEmptyState(title, message) {
  return `<div class="content-state text-center py-5"><i class="bi bi-inbox" aria-hidden="true"></i><h2 class="h4 mt-3">${title}</h2><p class="text-body-secondary mb-0">${message}</p></div>`;
}

export function createErrorState() {
  return '<div class="content-state text-center py-5" role="alert"><i class="bi bi-exclamation-circle" aria-hidden="true"></i><h2 class="h4 mt-3">Content unavailable</h2><p class="text-body-secondary mb-0">Please try again in a little while.</p></div>';
}
