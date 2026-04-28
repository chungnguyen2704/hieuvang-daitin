/**
 * Tiệm Vàng — fetch dữ liệu từ Google Sheet và render.
 * Sheet phải bật share "Anyone with the link can view".
 */

(function () {
  const CFG = window.CONFIG || {};

  /* ---------------- Google Sheet CSV URL ---------------- */
  function csvUrl(sheetName) {
    const id = encodeURIComponent(CFG.SHEET_ID);
    const name = encodeURIComponent(sheetName);
    const cb = Date.now();
    return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${name}&_=${cb}`;
  }

  /* ---------------- CSV parser (RFC 4180 - đơn giản) ---------------- */
  function parseCSV(text) {
    const rows = [];
    let row = [], field = '', inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (inQuotes) {
        if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
        else if (c === '"') inQuotes = false;
        else field += c;
      } else {
        if (c === '"') inQuotes = true;
        else if (c === ',') { row.push(field); field = ''; }
        else if (c === '\n' || c === '\r') {
          if (field !== '' || row.length > 0) { row.push(field); rows.push(row); }
          row = []; field = '';
          if (c === '\r' && text[i + 1] === '\n') i++;
        } else field += c;
      }
    }
    if (field !== '' || row.length > 0) { row.push(field); rows.push(row); }
    return rows;
  }

  /* ---------------- Fetch + parse Sheet ---------------- */
  async function fetchSheet(tab) {
    const res = await fetch(csvUrl(tab), { cache: 'no-store' });
    if (!res.ok) throw new Error(`Không tải được Sheet (HTTP ${res.status})`);
    const text = await res.text();
    return parseCSV(text);
  }

  function rowsToObjects(rows) {
    if (!rows.length) return [];
    const headers = rows[0].map(h => String(h).trim().toLowerCase());
    return rows.slice(1).map(r => {
      const o = {};
      headers.forEach((h, i) => { o[h] = (r[i] || '').trim(); });
      return o;
    });
  }

  /* ---------------- Demo mode (khi chưa cấu hình SHEET_ID) ---------------- */
  function demoData() {
    return {
      shop_name: "DNTN HIỆU VÀNG ĐẠI TÍN",
      tagline: "Vàng bạc trang sức — Đá quý phong thuỷ",
      address: "302 - 304 Lê Duẩn, An Nhơn, Gia Lai",
      products: [
         { name: "VÀNG NHẪN 980",   unit: "nghìn/chỉ", buy: 14860000, sell: 15160000 },
        { name: "VÀNG NHẪN 9999",   unit: "nghìn/chỉ", buy: 15220000, sell: 15540000 },
        { name: "VÀNG TRANG SỨC 610",        unit: "nghìn/chỉ", buy: 9200000, sell: 9800000 },
        { name: "BẠC",             unit: "nghìn/chỉ", buy: 140000,   sell: 300000   }
      ],
      fetched_at: new Date()
    };
  }

  async function loadAllData() {
    if (!CFG.SHEET_ID || CFG.SHEET_ID === 'PASTE_YOUR_SHEET_ID_HERE') {
      // Demo mode — show sample data so user can see the design first
      return demoData();
    }
    const [pricesRows, configRows] = await Promise.all([
      fetchSheet(CFG.PRICES_TAB || 'Prices'),
      fetchSheet(CFG.CONFIG_TAB || 'Config').catch(() => [])
    ]);

    // Config: key/value pairs
    const cfg = {};
    rowsToObjects(configRows).forEach(o => {
      if (o.key) cfg[o.key.toLowerCase()] = o.value;
    });

    // Prices: filter empty rows
    const products = rowsToObjects(pricesRows)
      .filter(p => p.name && (p.buy || p.sell))
      .map(p => ({
        name: p.name,
        unit: p.unit || '',
        buy: parseNumber(p.buy),
        sell: parseNumber(p.sell)
      }));

    return {
      shop_name: cfg.shop_name || 'Tiệm Vàng',
      tagline: cfg.tagline || '',
      address: cfg.address || '',
      products,
      fetched_at: new Date()
    };
  }

  /* ---------------- Helpers ---------------- */
  function parseNumber(v) {
    if (v === null || v === undefined) return 0;
    const n = Number(String(v).replace(/[.,\s]/g, ''));
    return isNaN(n) ? 0 : n;
  }

  function formatPrice(n) {
    // n = nghìn đồng/chỉ → format 7850 → "7.850"
    if (!n) return '—';
    return Math.round(n).toLocaleString('vi-VN');
  }

  function formatTime(d) {
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }

  function formatDate(d) {
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  /* ---------------- Toast ---------------- */
  function showToast(message, type = 'success') {
    let t = document.querySelector('.toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = message;
    t.className = `toast toast--${type} show`;
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 2400);
  }

  /* ---------------- Render: TV view ---------------- */
  function renderTV(data, prevData) {
    const root = document.getElementById('tv-root');
    if (!root) return;

    const shopNameEl = root.querySelector('.tv__shop-name');
    const taglineEl  = root.querySelector('.tv__shop-tagline');
    const addressEl  = root.querySelector('.tv__shop-address');
    const rowsEl     = root.querySelector('.tv__rows');
    const updatedEl  = root.querySelector('.tv__footer .updated');

    if (shopNameEl) shopNameEl.textContent = data.shop_name;
    if (taglineEl && data.tagline) {
      const t = escapeHtml(data.tagline);
      taglineEl.innerHTML = `<span class="tv__tagline-inner">${t} &nbsp;◆&nbsp; ${t}</span>`;
    }
    if (addressEl)  addressEl.textContent  = data.address || '';

    rowsEl.innerHTML = '';
    data.products.forEach((p, idx) => {
      const prev = prevData && prevData.products && prevData.products[idx];
      const row = document.createElement('div');
      row.className = 'tv__row';
      row.innerHTML = `
        <div class="tv__product">
          <span class="tv__product-icon">${getProductIcon(p.name)}</span>
          <div class="tv__product-info">
            <div class="tv__product-name">${escapeHtml(p.name)}</div>
          </div>
        </div>
        <div class="tv__price-cell">
          <div class="tv__price tv__price--buy ${prev && prev.buy !== p.buy ? 'flash' : ''}">${formatPrice(p.buy)}</div>
          ${p.unit ? `<span class="tv__product-unit">${escapeHtml(p.unit)}</span>` : ''}
        </div>
        <div class="tv__price-cell">
          <div class="tv__price tv__price--sell ${prev && prev.sell !== p.sell ? 'flash' : ''}">${formatPrice(p.sell)}</div>
          ${p.unit ? `<span class="tv__product-unit">${escapeHtml(p.unit)}</span>` : ''}
        </div>
      `;
      rowsEl.appendChild(row);
    });

    if (updatedEl) updatedEl.textContent = `Cập nhật lúc ${formatTime(data.fetched_at)} ${formatDate(data.fetched_at)}`;
  }

  /* ---------------- Render: Public view ---------------- */
  function renderPublic(data) {
    const root = document.getElementById('public-root');
    if (!root) return;

    const shopNameEl = root.querySelector('.public__shop-name');
    const taglineEl  = root.querySelector('.public__tagline');
    const addressEl  = root.querySelector('.public__address');
    const updatedEl  = root.querySelector('.public__updated');
    const list       = root.querySelector('.public__list');

    if (shopNameEl) shopNameEl.textContent = data.shop_name;
    if (taglineEl)  taglineEl.textContent  = data.tagline;
    if (addressEl)  addressEl.textContent  = data.address || '';
    if (updatedEl)  updatedEl.innerHTML = `<span>Cập nhật ${formatTime(data.fetched_at)} · ${formatDate(data.fetched_at)}</span>`;

    list.innerHTML = '';
    data.products.forEach(p => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card__head">
          <span class="card__icon">${getProductIcon(p.name)}</span>
          <div class="card__head-text">
            <h3 class="card__title">${escapeHtml(p.name)}</h3>
            ${p.unit ? `<div class="card__unit">${escapeHtml(p.unit)}</div>` : ''}
          </div>
        </div>
        <div class="price-row">
          <div class="price-row__cell">
            <div class="price-row__label">Mua vào</div>
            <div class="price-row__value price-row__value--buy">${formatPrice(p.buy)}</div>
          </div>
          <div class="price-row__cell">
            <div class="price-row__label">Bán ra</div>
            <div class="price-row__value price-row__value--sell">${formatPrice(p.sell)}</div>
          </div>
        </div>
      `;
      list.appendChild(card);
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  /* ---------------- Product icons (SVG inline) ---------------- */
  // Đặt viewBox 24×24, stroke gold, no fill — minimalist line-art jewelry
  const ICONS = {
    // Vàng nhẫn — 2 rings interlocking
    ring: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <ellipse cx="12" cy="20" rx="6" ry="6"/>
      <ellipse cx="20" cy="20" rx="6" ry="6"/>
      <path d="M9 9 L12 12 L15 9 L12 6 Z" fill="currentColor" fill-opacity="0.9"/>
      <path d="M17 9 L20 12 L23 9 L20 6 Z" fill="currentColor" fill-opacity="0.6"/>
    </svg>`,
    // Vàng miếng SJC — gold bar 3D
    bar: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M5 13 L9 9 L27 9 L23 13 Z" fill="currentColor" fill-opacity="0.18"/>
      <path d="M5 13 L23 13 L23 23 L5 23 Z" fill="currentColor" fill-opacity="0.32"/>
      <path d="M23 13 L27 9 L27 19 L23 23 Z" fill="currentColor" fill-opacity="0.22"/>
      <line x1="9" y1="17" x2="19" y2="17" stroke-width="0.8" opacity="0.6"/>
      <line x1="9" y1="20" x2="19" y2="20" stroke-width="0.8" opacity="0.4"/>
    </svg>`,
    // Vàng 18K — gem/diamond cut
    gem: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M16 5 L26 13 L16 27 L6 13 Z" fill="currentColor" fill-opacity="0.22"/>
      <path d="M6 13 L26 13" />
      <path d="M11 9 L16 13 L21 9" />
      <path d="M11 13 L16 27 L21 13" stroke-width="1" opacity="0.6"/>
    </svg>`,
    // Bạc — thỏi bạc nằm ngang kiểu ingot chuẩn
    coin: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <!-- mặt trên (hình thang vát) -->
      <path d="M7 13 L11 9 L25 9 L25 13 Z" fill="currentColor" fill-opacity="0.35"/>
      <path d="M7 13 L11 9 L25 9 L25 13 Z"/>
      <!-- thân chính -->
      <rect x="7" y="13" width="18" height="10" rx="0.8" fill="currentColor" fill-opacity="0.18"/>
      <rect x="7" y="13" width="18" height="10" rx="0.8"/>
      <!-- shine line trên mặt trên -->
      <line x1="13" y1="10.5" x2="23" y2="10.5" stroke-width="0.7" opacity="0.55"/>
      <!-- khắc chìm giữa thân -->
      <rect x="10" y="16" width="12" height="4" rx="0.6" stroke-width="0.9" opacity="0.5"/>
      <!-- chữ Ag bên trong -->
      <text x="16" y="19.2" text-anchor="middle" font-size="3.2" font-weight="700"
            font-family="serif" fill="currentColor" stroke="none" opacity="0.75">Ag</text>
    </svg>`
  };

  function getProductIcon(name) {
    const n = String(name || '').toLowerCase();
    // Bỏ dấu tiếng Việt để match keyword
    const noAccent = n
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd');
    if (noAccent.includes('mieng') || noAccent.includes('sjc') || noAccent.includes('thoi'))
      return ICONS.bar;
    if (noAccent.includes('bac') || noAccent.includes('silver'))
      return ICONS.coin;
    if (noAccent.includes('18k') || noAccent.includes('14k') || noAccent.includes('da quy') || noAccent.includes('kim cuong'))
      return ICONS.gem;
    if (noAccent.includes('nhan') || noAccent.includes('99') || noAccent.includes('98') || noAccent.includes('24k'))
      return ICONS.ring;
    return ICONS.ring;  // fallback
  }

  /* ---------------- Bootstrap ---------------- */
  let _last = null;
  let _refreshing = false;

  async function refresh(view, opts = {}) {
    if (_refreshing) return;
    _refreshing = true;
    const btn = document.getElementById('refresh-btn');
    if (btn) btn.classList.add('is-loading');
    try {
      const data = await loadAllData();
      if (view === 'tv') renderTV(data, _last);
      else renderPublic(data);
      _last = data;
      if (opts.toast !== false) showToast('Đã cập nhật giá mới');
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Lỗi tải dữ liệu', 'error');
    } finally {
      _refreshing = false;
      if (btn) btn.classList.remove('is-loading');
    }
  }

  function startAutoRefresh(view) {
    const sec = Number(CFG.AUTO_REFRESH_SECONDS) || 0;
    if (sec > 0) {
      setInterval(() => refresh(view, { toast: false }), sec * 1000);
    }
    // Re-fetch when tab becomes visible
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') refresh(view, { toast: false });
    });
  }

  // Expose
  window.TiemVang = {
    init(view) {
      refresh(view, { toast: false });
      startAutoRefresh(view);
      const btn = document.getElementById('refresh-btn');
      if (btn) btn.addEventListener('click', () => refresh(view));
    }
  };
})();
