(() => {
  const catalog = document.querySelector('[data-blog-catalog]');
  if (!catalog) return;

  const filters = [...catalog.querySelectorAll('[data-blog-filter]')];
  const cards = [...catalog.querySelectorAll('[data-blog-category]')];
  const search = catalog.querySelector('[data-blog-search]');
  const clear = catalog.querySelector('[data-blog-search-clear]');
  const reset = catalog.querySelector('[data-blog-search-reset]');
  const status = catalog.querySelector('[data-blog-search-status]');
  const empty = catalog.querySelector('[data-blog-search-empty]');
  const normalize = text => text.normalize('NFKC').toLocaleLowerCase('ru-RU')
    .replaceAll('ё', 'е').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const texts = cards.map(card => normalize([
    card.querySelector('.blog-card__title')?.textContent || '',
    card.querySelector('.blog-card__excerpt')?.textContent || '',
  ].join(' ')));
  let category = filters.find(button => button.getAttribute('aria-pressed') === 'true')?.dataset.blogFilter || 'all';

  const update = () => {
    const query = search?.value.trim() || '';
    const words = normalize(query).split(/\s+/).filter(Boolean);
    let count = 0;
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.blogFilter === category)));
    cards.forEach((card, index) => {
      const matchesCategory = category === 'all' || card.dataset.blogCategory === category;
      const matchesSearch = words.every(word => texts[index].includes(word));
      card.hidden = !matchesCategory || !matchesSearch;
      if (!card.hidden) count++;
    });
    if (clear) clear.hidden = search.value.length === 0;
    if (empty) empty.hidden = count !== 0;
    if (status) {
      const label = filters.find(button => button.dataset.blogFilter === category)?.textContent.trim();
      status.hidden = !query;
      status.textContent = count
        ? `Найдено статей: ${count}`
        : category === 'all' ? 'Ничего не найдено' : `Ничего не найдено в рубрике «${label}»`;
    }
  };
  filters.forEach(filter => filter.addEventListener('click', () => {
    category = filter.dataset.blogFilter;
    update();
  }));
  search?.addEventListener('input', update);
  search?.addEventListener('search', update);
  search?.addEventListener('keydown', event => {
    if (event.key === 'Enter') event.preventDefault();
    if (event.key === 'Escape') {
      search.value = '';
      update();
    }
  });
  clear?.addEventListener('click', () => {
    search.value = '';
    update();
    search.focus();
  });
  reset?.addEventListener('click', () => {
    search.value = '';
    category = 'all';
    update();
    search.focus();
  });
  update();
})();
