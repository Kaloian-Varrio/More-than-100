export function createMainContent(content, className = '') {
  return `
    <main class="flex-grow-1 ${className}" id="main-content">
      ${content}
    </main>`;
}
