(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* hero headline */
  requestAnimationFrame(() => setTimeout(() => $('.hero').classList.add('ready'), 80));

  /* split "movement" headline into words that rise one by one */
  $$('.split').forEach(h => {
    let i = 0;
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(w => {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.append(w); return; }
            const s = document.createElement('span');
            s.className = 'word rv'; s.style.setProperty('--d', (i++ * 0.07) + 's'); s.textContent = w;
            frag.append(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(h);
  });

  /* reveal on scroll */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  $$('.rv,.pop,.stairs').forEach(el => io.observe(el));

  /* count-up stats */
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || '';
    if (reduce) return;
    const t0 = performance.now(), dur = 1400;
    const tick = t => { const p = Math.min(1, (t - t0) / dur), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
      el.textContent = v + suf; if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }), { threshold: 0.6 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* progress bar, nav, parallax */
  const prog = $('#progress'), nav = $('#nav'), par = $$('[data-parallax]');
  const links = $$('.nav ul a'), secs = links.map(a => $(a.getAttribute('href')));
  let ticking = false;
  const onScroll = () => {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    nav.classList.toggle('solid', y > 40);
    if (!reduce) par.forEach(el => {
      const r = el.parentElement.getBoundingClientRect();
      el.style.translate = `0 ${(r.top + r.height / 2 - innerHeight / 2) * -(+el.dataset.parallax)}px`;
    });
    let cur = -1; secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.4) cur = i; });
    links.forEach((a, i) => a.classList.toggle('on', i === cur));
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* 3D tilt on hover */
  if (!reduce && matchMedia('(hover:hover)').matches) {
    $$('.tilt').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        el.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* hats: drag them around, tap to hand off */
  const field = $('#hatField'), done = $('#hatDone');
  if (field) {
    const hats = $$('.hat', field);
    hats.forEach(h => {
      h.dataset.r = h.style.rotate; h.dataset.ox = 0; h.dataset.oy = 0;
      let sx, sy, moved = false, down = false;
      h.addEventListener('pointerdown', e => { down = true; moved = false; sx = e.clientX; sy = e.clientY; h.setPointerCapture(e.pointerId); h.style.zIndex = 5; });
      h.addEventListener('pointermove', e => {
        if (!down) return; const dx = e.clientX - sx, dy = e.clientY - sy;
        if (Math.abs(dx) + Math.abs(dy) > 6) moved = true;
        h.style.translate = `${+h.dataset.ox + dx}px ${+h.dataset.oy + dy}px`;
      });
      h.addEventListener('pointerup', e => {
        if (!down) return; down = false;
        if (moved) { h.dataset.ox = +h.dataset.ox + e.clientX - sx; h.dataset.oy = +h.dataset.oy + e.clientY - sy; return; }
        handOff(h);
      });
      h.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handOff(h); } });
    });
    function handOff(h) {
      h.style.translate = `${reduce ? 0 : 400}px -200px`; h.style.rotate = '25deg'; h.classList.add('gone');
      h.setAttribute('aria-hidden', 'true'); h.tabIndex = -1;
      if (hats.every(x => x.classList.contains('gone'))) setTimeout(() => done.classList.add('show'), 350);
    }
    $('#hatReset').addEventListener('click', () => {
      done.classList.remove('show');
      hats.forEach(h => { h.classList.remove('gone'); h.style.translate = ''; h.style.rotate = h.dataset.r; h.dataset.ox = 0; h.dataset.oy = 0; h.removeAttribute('aria-hidden'); h.tabIndex = 0; });
    });
  }

  /* ripple rings */
  const ringData = {
    external: { t: 'External partners: you, our clients', p: 'We bring real solutions to the problems of our international clients, and help bring out the best in their business.', c: ['Coaches', 'Pastors', 'Founders', 'Clinics', 'Agencies'] },
    internal: { t: 'Internal partners: our team', p: 'Every client partnership lets us equip our people with relationship, leadership and ministry development, plus upskilling.', c: ['Growth Equipping', 'CL Workshop', 'The Vine Collective', 'Catalyst Listen'] },
    church: { t: 'Church partners: the wider ripple', p: 'Raising more disciples and mentors as part of the Great Commission (Matthew 28:16-20), through outreach and missions.', c: ['Outreach days', 'Hopebringers mission', 'Mentorship'] }
  };
  const info = $('#ringInfo'), rings = $$('.ring-btn');
  const showRing = k => {
    const d = ringData[k]; rings.forEach(b => b.classList.toggle('on', b.dataset.ring === k));
    info.innerHTML = `<h3></h3><p></p><div class="chips"></div>`;
    info.querySelector('h3').textContent = d.t; info.querySelector('p').textContent = d.p;
    d.c.forEach(c => { const s = document.createElement('span'); s.className = 'chip'; s.textContent = c; info.querySelector('.chips').append(s); });
  };
  rings.forEach(b => { b.addEventListener('click', e => { e.stopPropagation(); showRing(b.dataset.ring); }); b.addEventListener('mouseenter', () => showRing(b.dataset.ring)); });
  showRing('external');

  /* tabs */
  const tabs = $$('.tab');
  const sel = t => tabs.forEach(x => { const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; $('#' + x.getAttribute('aria-controls')).hidden = !on; });
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => sel(t));
    t.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]; sel(n); n.focus(); } });
  });

  /* orange cursor dot */
  const cur = $('#cursor');
  if (cur && matchMedia('(hover:hover)').matches && !reduce) {
    addEventListener('pointermove', e => { cur.style.opacity = 1; cur.style.left = e.clientX + 'px'; cur.style.top = e.clientY + 'px'; });
    $$('a,button,.tilt').forEach(el => { el.addEventListener('mouseenter', () => cur.classList.add('big')); el.addEventListener('mouseleave', () => cur.classList.remove('big')); });
  }
})();
