import { escapeHtml } from './html.js';

export function renderRichContent(content = '') {
  const output = [];
  let paragraph = [];
  let listType = '';
  let listItems = [];
  const flushParagraph = () => {
    if (paragraph.length) output.push(`<p>${escapeHtml(paragraph.join(' '))}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (listItems.length) output.push(`<${listType}>${listItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</${listType}>`);
    listType = '';
    listItems = [];
  };
  content.trim().split('\n').forEach((line) => {
    const value = line.trim();
    if (!value) { flushParagraph(); flushList(); }
    else if (value.startsWith('## ')) { flushParagraph(); flushList(); output.push(`<h2>${escapeHtml(value.slice(3))}</h2>`); }
    else if (/^[-*] /.test(value) || /^\d+\. /.test(value)) {
      flushParagraph();
      const nextType = /^[-*] /.test(value) ? 'ul' : 'ol';
      if (listType && listType !== nextType) flushList();
      listType = nextType;
      listItems.push(value.replace(/^([-*] |\d+\. )/, ''));
    } else { flushList(); paragraph.push(value); }
  });
  flushParagraph();
  flushList();
  return output.join('');
}
