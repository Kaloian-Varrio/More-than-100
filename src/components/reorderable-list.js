import { persistManagementOrder } from '../services/ordering-service.js';

export function createReorderControls(label) {
  const safeLabel = escapeAttribute(label);
  return `
    <div class="reorder-controls" data-reorder-controls>
      <button class="reorder-handle" type="button" draggable="true" aria-label="Drag to reorder ${safeLabel}" title="Drag to reorder">
        <i class="bi bi-grip-vertical" aria-hidden="true"></i>
      </button>
      <div class="reorder-step-controls" aria-label="Keyboard and touch ordering controls">
        <button class="reorder-step" type="button" data-reorder-up aria-label="Move ${safeLabel} up" title="Move up"><i class="bi bi-chevron-up" aria-hidden="true"></i></button>
        <button class="reorder-step" type="button" data-reorder-down aria-label="Move ${safeLabel} down" title="Move down"><i class="bi bi-chevron-down" aria-hidden="true"></i></button>
      </div>
    </div>`;
}

export function initializeReorderableList({
  container,
  itemSelector,
  idAttribute,
  scope,
  successMessage = 'Order saved.',
  onFeedback,
}) {
  if (!container) return;
  let activeItem = null;
  let originalItems = [];
  let saving = false;
  const status = createStatus(container);

  const items = () => [...container.querySelectorAll(itemSelector)];
  const itemId = (item) => item.dataset[idAttribute];
  const announce = (message, type = 'success') => {
    status.textContent = message;
    status.className = `reorder-status small text-${type === 'danger' ? 'danger' : 'success'}`;
    onFeedback?.(message, type);
  };
  const updateButtons = () => {
    const current = items();
    current.forEach((item, index) => {
      const up = item.querySelector('[data-reorder-up]');
      const down = item.querySelector('[data-reorder-down]');
      const handle = item.querySelector('.reorder-handle');
      if (up) up.disabled = saving || index === 0;
      if (down) down.disabled = saving || index === current.length - 1;
      if (handle) handle.disabled = saving;
      item.querySelectorAll('[data-reorder-controls] button').forEach((button) => {
        if (saving) button.setAttribute('aria-busy', 'true');
        else button.removeAttribute('aria-busy');
      });
    });
  };
  const restore = (previous) => previous.forEach((item) => container.append(item));
  const save = async (previous) => {
    saving = true;
    container.classList.add('reorder-list--saving');
    updateButtons();
    announce('Saving order...');
    try {
      await persistManagementOrder(scope, items().map(itemId));
      announce(successMessage);
    } catch (error) {
      restore(previous);
      announce(error.message || 'The order could not be saved. The previous order was restored.', 'danger');
      console.error('List order could not be saved.', error);
    } finally {
      saving = false;
      container.classList.remove('reorder-list--saving');
      updateButtons();
    }
  };

  container.addEventListener('dragstart', (event) => {
    const handle = event.target.closest('.reorder-handle');
    if (!handle || saving) {
      event.preventDefault();
      return;
    }
    activeItem = handle.closest(itemSelector);
    originalItems = items();
    activeItem.classList.add('reorder-item--dragging');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', itemId(activeItem));
  });

  container.addEventListener('dragover', (event) => {
    if (!activeItem) return;
    event.preventDefault();
    const target = event.target.closest(itemSelector);
    if (!target || target === activeItem) return;
    const rectangle = target.getBoundingClientRect();
    const insertAfter = event.clientY > rectangle.top + rectangle.height / 2;
    container.insertBefore(activeItem, insertAfter ? target.nextSibling : target);
  });

  container.addEventListener('drop', async (event) => {
    if (!activeItem) return;
    event.preventDefault();
    const moved = originalItems.some((item, index) => items()[index] !== item);
    activeItem.classList.remove('reorder-item--dragging');
    activeItem = null;
    if (moved) await save(originalItems);
  });

  container.addEventListener('dragend', () => {
    activeItem?.classList.remove('reorder-item--dragging');
    if (activeItem) restore(originalItems);
    activeItem = null;
    updateButtons();
  });

  container.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-reorder-up], [data-reorder-down]');
    if (!button || saving) return;
    const item = button.closest(itemSelector);
    const previous = items();
    const sibling = button.hasAttribute('data-reorder-up') ? item.previousElementSibling : item.nextElementSibling;
    if (!sibling?.matches(itemSelector)) return;
    if (button.hasAttribute('data-reorder-up')) container.insertBefore(item, sibling);
    else container.insertBefore(sibling, item);
    item.querySelector('.reorder-handle')?.focus();
    await save(previous);
  });

  updateButtons();
}

function createStatus(container) {
  const status = document.createElement('p');
  status.className = 'reorder-status visually-hidden';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  (container.closest('table') || container).after(status);
  return status;
}

function escapeAttribute(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  })[character]);
}
