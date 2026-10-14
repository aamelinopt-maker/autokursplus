(() => {
  document.querySelectorAll('img[data-lazy-src], iframe[data-lazy-src]').forEach(node => {
    if (!node.getAttribute('src')) node.setAttribute('src', node.dataset.lazySrc);
    if (node.dataset.lazySrcset && !node.getAttribute('srcset')) node.setAttribute('srcset', node.dataset.lazySrcset);
  });

  document.querySelectorAll('.elementor-menu-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const menu = toggle.closest('.elementor-widget-container')?.querySelector('.elementor-nav-menu--dropdown');
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      menu?.classList.toggle('elementor-hidden', expanded);
    });
  });

  document.querySelectorAll('form').forEach(form => form.addEventListener('submit', event => {
    event.preventDefault();
    let note = form.querySelector('.offline-form-note');
    if (!note) {
      note = document.createElement('p');
      note.className = 'offline-form-note';
      note.setAttribute('role', 'status');
      form.append(note);
    }
    note.textContent = 'Офлайн-копия: отправка формы недоступна.';
  }));
})();
