// ============================================================
//  Rud1u5 Portfolio — main.js
// ============================================================

// ── COUNT-UP ANIMATION ──────────────────────────────────────
function animateCounters() {
  document.querySelectorAll('.stat-num[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    const duration = 1200;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current);
      if (current >= target) clearInterval(timer);
    }, 16);
  });
}

// ── RENDER MACHINE CARD ──────────────────────────────────────
function renderCard(m, linkPrefix = '') {
  const diffClass = `diff-${m.difficulty}`;
  const platClass = PLAT_CLASS[m.platform] || 'plat-htb';
  const diffLabel = DIFF_MAP[m.difficulty] || m.difficulty;
  const osIcon = OS_ICONS[m.os] || '💻';
  const osLabel = m.os ? m.os.charAt(0).toUpperCase() + m.os.slice(1) : '';
  const href = linkPrefix + `writeup.html?id=${m.id}`;
  const tags = (m.tags || []).slice(0, 3).map(t => `<span class="tag">${t}</span>`).join('');

  // Type indicator: icon-only (no text), same visual weight as OS badge
  // [ EASY ]  ⚙  🐧 Linux  2026-04-23
  let metaBadge = '';
  if (m.type) {
    const typeIcon = m.type === 'machine'
      ? '<i class="fa fa-server" title="Machine"></i>'
      : '<i class="fa fa-puzzle-piece" title="Challenge"></i>';
    const osPart = (m.type === 'machine' && m.os)
      ? `<span class="os-badge" style="margin-left:0" title="${osLabel}">${osIcon}</span>`
      : '';
    metaBadge = `<span class="type-icon-only" title="${m.type.charAt(0).toUpperCase() + m.type.slice(1)}">${typeIcon}</span>${osPart}`;
  } else if (m.os) {
    metaBadge = `<span class="os-badge" title="${osLabel}">${osIcon}</span>`;
  }

  return `
    <a class="machine-card card-${m.difficulty}" href="${href}"
       style="--diff-color: var(--${m.difficulty === 'easy' ? 'green' : m.difficulty === 'medium' ? 'orange' : 'red'})">
      <div class="card-top">
        ${m.avatar ? `<img src="${m.avatar}" class="machine-avatar-mini" alt="${m.title}" />` : ''}
        <span class="card-title" ${m.avatar ? 'style="margin-left: 0.1rem; flex: 1;"' : ''}>${m.title}${m.locked ? ' <span class="lock-badge"><i class="fa-solid fa-lock"></i> Active</span>' : ''}</span>
        <img src="${linkPrefix ? '' : '../'}assets/icon/${(typeof PLAT_LOGOS !== 'undefined' && PLAT_LOGOS[m.platform]) || 'Hackthebox-Logo.svg'}" class="card-platform-logo" alt="${m.platform}" />
      </div>
      <div class="card-meta">
        <span class="diff-badge ${diffClass}">${diffLabel}</span>
        ${metaBadge}
        <span class="card-date">${m.date}</span>
      </div>
      <p class="card-desc">${m.desc}</p>
      <div class="card-tags">${tags}</div>
      <div class="card-footer">
        <span class="btn-ghost">Read writeup →</span>
      </div>
    </a>`;
}

// ── HOME PAGE: latest 3 cards ────────────────────────────────
const homeGrid = document.getElementById('homeWriteups');
if (homeGrid) {
  homeGrid.innerHTML = WRITEUPS.slice(0, 3).map(m => renderCard(m, 'pages/')).join('');

  const writeupsCountEl = document.getElementById('writeups-count');
  if (writeupsCountEl) {
    writeupsCountEl.setAttribute('data-count', WRITEUPS.length);
  }

  animateCounters();
}

// ── WRITEUPS PAGE: all cards + filters ──────────────────────
const allGrid = document.getElementById('allWriteups');
if (allGrid) {
  let activePlatform = 'all';
  let activeDiff = 'all';
  let activeOS = 'all';
  let activeType = 'all';
  let activeCategory = 'all';

  const osRow = document.getElementById('osRow');
  const categoryRow = document.getElementById('categoryRow');

  function updateConditionalRows() {
    const isMachine = activeType === 'machine';
    const isChallenge = activeType === 'challenge';

    // OS row: visible only when Machine is selected
    if (osRow) {
      osRow.style.display = isMachine ? 'flex' : 'none';
      if (!isMachine) {
        activeOS = 'all';
        document.querySelectorAll('[data-filter="os"]').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.value === 'all');
        });
      }
    }

    // Category row: visible only when Challenge is selected
    if (categoryRow) {
      categoryRow.style.display = isChallenge ? 'flex' : 'none';
      if (!isChallenge) {
        activeCategory = 'all';
        document.querySelectorAll('[data-filter="category"]').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.value === 'all');
        });
      }
    }
  }

  function renderAll() {
    const filtered = WRITEUPS.filter(m => {
      const pMatch = activePlatform === 'all' || m.platform === activePlatform;
      const dMatch = activeDiff === 'all' || m.difficulty === activeDiff;
      const oMatch = activeOS === 'all' || m.os === activeOS;
      const tMatch = activeType === 'all' || m.type === activeType;
      const cMatch = activeCategory === 'all' || (m.category && m.category.toLowerCase() === activeCategory.toLowerCase());
      return pMatch && dMatch && oMatch && tMatch && cMatch;
    });

    const countEl = document.getElementById('writeupCount');
    if (countEl) countEl.innerHTML = `Showing <span>${filtered.length}</span> of <span>${WRITEUPS.length}</span> writeups`;

    allGrid.innerHTML = filtered.length
      ? filtered.map(m => renderCard(m)).join('')
      : `<p style="color:var(--text-dim);grid-column:1/-1;padding:2rem 0">No writeups found with those filters.</p>`;
  }

  function setFilter(type, val) {
    if (type === 'platform') activePlatform = val;
    if (type === 'diff') activeDiff = val;
    if (type === 'os') activeOS = val;
    if (type === 'type') activeType = val;
    if (type === 'category') activeCategory = val;

    document.querySelectorAll(`[data-filter="${type}"]`).forEach(btn => {
      btn.classList.toggle('active', btn.dataset.value === val);
    });

    updateConditionalRows();
    renderAll();
  }

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setFilter(btn.dataset.filter, btn.dataset.value);
    });
  });

  renderAll();
}

// ── EMAIL CLICK-TO-COPY ──────────────────────────────────────
document.addEventListener('click', function (e) {
  const emailLink = e.target.closest('a[href^="mailto:rud1u5@proton.me"]');
  if (emailLink) {
    const emailText = 'rud1u5@proton.me';
    navigator.clipboard.writeText(emailText).then(() => {
      showCopyTooltip(emailLink, 'Copied!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  }
});

function showCopyTooltip(element, text) {
  let existing = element.querySelector('.tooltip-toast');
  if (existing) existing.remove();

  const tooltip = document.createElement('span');
  tooltip.className = 'tooltip-toast';
  tooltip.textContent = text;
  element.appendChild(tooltip);

  // Trigger animation reflow
  setTimeout(() => tooltip.classList.add('visible'), 10);

  // Auto remove after 1.5 seconds
  setTimeout(() => {
    tooltip.classList.remove('visible');
    setTimeout(() => tooltip.remove(), 200);
  }, 1500);
}
