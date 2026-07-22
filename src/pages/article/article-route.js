const parts = window.location.pathname.split('/').filter(Boolean);
const isEditor = parts.at(-1) === 'create' || parts.at(-1) === 'edit';

await import(isEditor ? '../article-editor/article-editor.js' : './article.js');
