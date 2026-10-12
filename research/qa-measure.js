(() => {
  const norm = s => (s || '').replace(/\s+/g, ' ').trim();

  // Badge: smallest element whose text equals/includes «Демо-концепт»
  let badge = null;
  const all = document.querySelectorAll('body *');
  for (const el of all) {
    const t = norm(el.textContent);
    if (t.includes('Демо-концепт')) {
      if (!badge || el.querySelectorAll('*').length < badge.querySelectorAll('*').length) {
        badge = el;
      }
    }
  }

  // Header link «Узнать дату»
  let btn = null;
  const headerLinks = document.querySelectorAll('header a, header button');
  for (const a of headerLinks) {
    if (norm(a.textContent).includes('Узнать дату')) { btn = a; break; }
  }

  const rect = el => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { left: +r.left.toFixed(2), top: +r.top.toFixed(2), width: +r.width.toFixed(2), height: +r.height.toFixed(2), right: +r.right.toFixed(2), bottom: +r.bottom.toFixed(2) };
  };

  const inter = (a, b) => {
    if (!a || !b) return null;
    const x = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
    const y = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    return Math.round(x * y * 100) / 100;
  };

  const h1 = document.querySelector('h1');
  const h1r = rect(h1);

  return {
    innerWidth: window.innerWidth,
    badgeText: badge ? norm(badge.textContent).slice(0, 60) : null,
    badgeTag: badge ? badge.tagName + '.' + (badge.className || '') : null,
    btnTag: btn ? btn.tagName + '.' + (btn.className || '') : null,
    badge: rect(badge),
    btn: rect(btn),
    overlap: inter(rect(badge), rect(btn)),
    h1Text: h1 ? h1.textContent : null,
    h1Rect: h1r,
    h1RightOk: h1r ? (h1r.right <= window.innerWidth) : null,
    h1Height: h1r ? h1r.height : null,
    innerHeight: window.innerHeight
  };
})()
