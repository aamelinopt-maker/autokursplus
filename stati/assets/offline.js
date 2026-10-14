(() => {
  const note = 'Офлайн-копия: отправка формы недоступна. Откройте исходный сайт, чтобы отправить заявку.';
  document.head.insertAdjacentHTML('beforeend', '<style>.elementor-field-type-recaptcha{display:none!important}</style>');
  document.addEventListener('submit', event => {
    const form = event.target.closest('form');
    if (!form) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    let message = form.querySelector('[data-offline-notice]');
    if (!message) {
      message = document.createElement('p');
      message.dataset.offlineNotice = '';
      message.setAttribute('role', 'status');
      message.style.cssText = 'margin:12px 0;color:var(--e-global-color-3c71fe9);font:500 14px/1.4 Gotham,sans-serif';
      form.append(message);
    }
    message.textContent = note;
  }, true);
  document.querySelectorAll('[data-lazy-src]').forEach(el => { if (!el.getAttribute('src') || el.getAttribute('src').startsWith('data:')) el.src = el.dataset.lazySrc; });
  document.querySelectorAll('[data-lazy-srcset]').forEach(el => { if (!el.getAttribute('srcset')) el.srcset = el.dataset.lazySrcset; });

  // Open the preserved source popups without Elementor's online chunk loader.
  const dialogs = new Map();
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#elementor-action"]');
    if (!link) return;
    let id;
    try {
      const action = decodeURIComponent(link.hash.slice(1));
      const encoded = action.split('settings=')[1];
      id = String(JSON.parse(atob(encoded)).id);
    } catch { return; }
    const source = document.querySelector(`[data-elementor-type="popup"][data-elementor-id="${CSS.escape(id)}"]`);
    if (!source) return;
    event.preventDefault();
    let dialog = dialogs.get(id);
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.className = 'blog-offline-popup';
      dialog.setAttribute('aria-label', id === '18' ? 'Запись на обучение' : 'Выбор филиала');
      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'blog-offline-popup__close';
      close.setAttribute('aria-label', 'Закрыть окно');
      close.textContent = '×';
      close.addEventListener('click', () => dialog.close());
      dialog.append(close, source);
      dialog.addEventListener('click', e => {
        if (e.target !== dialog) return;
        const bounds = dialog.getBoundingClientRect();
        if (e.clientX < bounds.left || e.clientX > bounds.right || e.clientY < bounds.top || e.clientY > bounds.bottom) dialog.close();
      });
      document.body.append(dialog);
      dialogs.set(id, dialog);
    }
    if (dialog.open) return;
    const previousOverflow = document.body.style.overflow;
    dialog.addEventListener('close', () => {
      document.body.style.overflow = previousOverflow;
      link.focus({ preventScroll: true });
    }, { once: true });
    document.body.style.overflow = 'hidden';
    dialog.showModal();
  });
})();
