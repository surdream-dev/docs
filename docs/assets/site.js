(function () {
  const categories = window.CONTRACT_CATEGORIES || [];
  const typeLabels = window.ADDRESS_TYPE_LABELS || {};
  const body = document.body;
  const page = body.getAttribute('data-page');

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function shortAddress(address) {
    return address.slice(0, 6) + '...' + address.slice(-4);
  }

  function etherscanUrl(address) {
    return 'https://etherscan.io/address/' + address;
  }

  function typeClass(type) {
    return 'type-' + String(type || 'other');
  }

  function toast(message) {
    let el = document.querySelector('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = message;
    requestAnimationFrame(() => el.classList.add('show'));
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('show'), 1800);
  }

  function copyIcon() {
    return (
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<rect x="9" y="9" width="11" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/>' +
      '<path d="M5 15V5a2 2 0 0 1 2-2h10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
      '</svg>'
    );
  }

  function externalIcon() {
    return (
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M14 4h6v6M20 4l-9 9M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>'
    );
  }

  function renderEntry(entry) {
    const note = entry.note
      ? '<p class="row-note">⚠ ' + escapeHtml(entry.note) + '</p>'
      : '';
    const symbol = entry.symbol
      ? '<span class="symbol">' + escapeHtml(entry.symbol) + '</span>'
      : '';

    return (
      '<div class="address-row">' +
        '<div class="row-main">' +
          '<div class="row-title">' +
            '<span class="type-badge ' + typeClass(entry.type) + '">' +
              escapeHtml(typeLabels[entry.type] || 'Other') +
            '</span>' +
            '<strong>' + escapeHtml(entry.name) + '</strong>' +
            symbol +
          '</div>' +
          '<p class="row-purpose">' + escapeHtml(entry.purpose) + '</p>' +
          note +
        '</div>' +
        '<div class="row-actions">' +
          '<a class="address-link" href="' + etherscanUrl(entry.address) + '" target="_blank" rel="noopener noreferrer" title="' + escapeHtml(entry.address) + '">' +
            '<span class="mono">' + shortAddress(entry.address) + '</span>' +
            externalIcon() +
          '</a>' +
          '<button class="copy-btn" type="button" data-copy="' + escapeHtml(entry.address) + '">' +
            copyIcon() +
            '<span>Copy</span>' +
          '</button>' +
        '</div>' +
      '</div>'
    );
  }

  function renderSection(section, categoryId) {
    const rows = section.entries.map(renderEntry).join('');
    return (
      '<section class="address-section" id="sec-' + categoryId + '-' + section.id + '">' +
        '<div class="section-head">' +
          '<div>' +
            '<h3>' + escapeHtml(section.title) + '</h3>' +
            (section.description ? '<p>' + escapeHtml(section.description) + '</p>' : '') +
          '</div>' +
          '<span class="section-count">' + section.entries.length + '</span>' +
        '</div>' +
        rows +
      '</section>'
    );
  }

  function renderToc(sections, categoryId) {
    if (!sections.length) return '';
    const links = sections
      .map(
        (section) =>
          '<a href="#sec-' + categoryId + '-' + section.id + '">' + escapeHtml(section.title) + '</a>',
      )
      .join('');
    return '<div class="toc"><span class="toc-label">On this page</span>' + links + '</div>';
  }

  function filterSections(category, query) {
    if (!query) return category.sections;
    const q = query.toLowerCase();
    return category.sections
      .map((section) => ({
        ...section,
        entries: section.entries.filter((entry) =>
          [
            entry.name,
            entry.symbol || '',
            entry.address,
            entry.purpose,
            entry.note || '',
          ]
            .join(' ')
            .toLowerCase()
            .includes(q),
        ),
      }))
      .filter((section) => section.entries.length > 0);
  }

  function renderCategoryPage(category) {
    const pageHeader = document.getElementById('page-header');
    const toc = document.getElementById('toc');
    const sectionsEl = document.getElementById('sections');
    const countEl = document.getElementById('result-count');
    const pagerEl = document.getElementById('pager');
    const searchEl = document.getElementById('search');

    if (pageHeader) {
      pageHeader.innerHTML =
        '<p class="eyebrow">' + escapeHtml(category.subtitle) + '</p>' +
        '<h1>' + escapeHtml(category.title) + '</h1>' +
        '<p class="lead">' + escapeHtml(category.intro) + '</p>';
    }

    function draw(query) {
      const sections = filterSections(category, query);
      const total = sections.reduce((sum, section) => sum + section.entries.length, 0);

      if (toc) toc.innerHTML = query ? '' : renderToc(sections, category.id);
      if (sectionsEl) {
        sectionsEl.innerHTML = sections.length
          ? sections.map((section) => renderSection(section, category.id)).join('')
          : '<div class="empty-state"><p>No matching addresses</p></div>';
      }
      if (countEl) countEl.textContent = total + ' addresses';
    }

    if (searchEl) {
      searchEl.addEventListener('input', () => {
        draw(searchEl.value);
        const clear = document.getElementById('search-clear');
        if (clear) clear.style.display = searchEl.value ? 'block' : 'none';
      });
      const clear = document.getElementById('search-clear');
      if (clear) {
        clear.addEventListener('click', () => {
          searchEl.value = '';
          draw('');
          clear.style.display = 'none';
          searchEl.focus();
        });
      }
    }

    if (pagerEl) {
      const idx = categories.findIndex((item) => item.id === category.id);
      const prev = categories[idx - 1];
      const next = categories[idx + 1];
      pagerEl.innerHTML =
        (prev
          ? '<a href="../' + prev.page + '">← ' + escapeHtml(prev.title) + '</a>'
          : '<a class="disabled" href="#">← First page</a>') +
        (next
          ? '<a href="../' + next.page + '">' + escapeHtml(next.title) + ' →</a>'
          : '<a class="disabled" href="#">Last page →</a>');
    }

    draw('');
  }

  function renderIndex() {
    const cardsEl = document.getElementById('category-cards');
    const countEl = document.getElementById('total-count');

    if (cardsEl) {
      cardsEl.innerHTML = categories
        .map((category, index) => {
          const total = category.sections.reduce(
            (sum, section) => sum + section.entries.length,
            0,
          );
          return (
            '<a class="card" href="' + category.page + '">' +
              '<span class="card-index">' + String(index + 1).padStart(2, '0') + '</span>' +
              '<h3>' + escapeHtml(category.title) + '</h3>' +
              '<span class="card-sub">' + escapeHtml(category.subtitle) + '</span>' +
              '<p>' + escapeHtml(category.intro) + '</p>' +
            '</a>'
          );
        })
        .join('');
    }

    if (countEl) {
      const total = categories.reduce(
        (sum, category) =>
          sum +
          category.sections.reduce((s, section) => s + section.entries.length, 0),
        0,
      );
      countEl.textContent = total + ' addresses';
    }
  }

  function setupNav() {
    const nav = document.getElementById('site-nav');
    if (nav) {
      nav.querySelectorAll('a[data-nav]').forEach((link) => {
        if (link.getAttribute('data-nav') === page) link.classList.add('active');
      });
    }

    const toggle = document.getElementById('nav-toggle');
    if (toggle && nav) {
      toggle.addEventListener('click', () => nav.classList.toggle('open'));
    }
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-copy]');
    if (!button) return;
    const address = button.getAttribute('data-copy');
    if (!address) return;

    function fallbackCopy() {
      const textarea = document.createElement('textarea');
      textarea.value = address;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        toast('Address copied');
      } catch {
        toast('Copy failed. Select the address manually.');
      }
      document.body.removeChild(textarea);
    }

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(address)
        .then(() => toast('Address copied'))
        .catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
  });

  setupNav();

  if (page === 'index') {
    renderIndex();
  } else {
    const category = categories.find((item) => item.id === page);
    if (category) renderCategoryPage(category);
  }
})();
