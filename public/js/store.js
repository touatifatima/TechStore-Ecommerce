(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#primary-nav');
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    nav.classList.toggle('is-open', open);
  });
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape' && nav?.classList.contains('is-open')) {toggle.click();toggle.focus();}
  });
  document.querySelectorAll('.primary-nav a').forEach(a => {
    if (a.pathname === location.pathname || (a.pathname === '/shop' && location.pathname.startsWith('/product/'))) a.setAttribute('aria-current', 'page');
  });
  document.querySelectorAll('img[data-fallback]').forEach(img => {
    const fallback = () => { if (img.getAttribute('src') !== img.dataset.fallback) img.src = img.dataset.fallback; };
    img.addEventListener('error', fallback);
    if (img.complete && !img.naturalWidth) fallback();
  });
  const grid = document.querySelector('[data-catalog]');
  if (grid) {
    const cards = [...grid.querySelectorAll('[data-product]')];
    let category = 'all';
    const update = () => {
      const order = document.querySelector('#sort')?.value;
      const sorted = [...cards].sort((a,b) => order === 'price-low' ? +a.dataset.price - +b.dataset.price : order === 'price-high' ? +b.dataset.price - +a.dataset.price : order === 'name' ? a.dataset.name.localeCompare(b.dataset.name) : +a.dataset.index - +b.dataset.index);
      sorted.forEach(card => { card.hidden = category !== 'all' && card.dataset.category !== category; grid.append(card); });
      const count = cards.filter(card => !card.hidden).length;
      const status = document.querySelector('[data-result-count]');
      if (status) status.textContent = `${count} product${count === 1 ? '' : 's'} in the collection`;
    };
    document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
      category = button.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      update();
    }));
    document.querySelector('#sort')?.addEventListener('change', update);
  }
  document.querySelectorAll('[data-preview-form]').forEach(form => form.addEventListener('submit', event => {
    event.preventDefault();
    const status = form.querySelector('[role=status]');
    status.hidden = false;
    status.textContent = form.dataset.previewForm;
    status.scrollIntoView({block:'nearest',behavior:'smooth'});
  }));
  document.querySelectorAll('.order-form').forEach(form => form.addEventListener('submit', () => {
    const button = form.querySelector('button[type="submit"]');
    if (button) { button.disabled = true; button.textContent = 'Enregistrement de votre demande...'; }
  }));
  document.querySelectorAll('form[data-confirm]').forEach(form => form.addEventListener('submit', event => {
    if (!window.confirm(form.dataset.confirm)) event.preventDefault();
  }));
})();
