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


  /* program quiz */
  const qbody = $('#qbody'), qbar = $('#qbar');
  if (qbody) {
    const Q = [
      { q: 'Which sounds most like you?', o: [['I know business owners who could use help', 'aff'], ['I lead an audience or community', 'amb'], ['I run an agency or service business', 'wl']] },
      { q: 'How involved do you want to be?', o: [['Share now and then, when it fits', 'aff'], ['Show up regularly with content and intros', 'amb'], ['Sell the services to my own clients', 'wl']] },
      { q: 'What matters most to you?', o: [['Easy extra income, no commitments', 'aff'], ['Higher rewards and more visibility', 'amb'], ['A new revenue line under my brand', 'wl']] }
    ];
    const R = {
      aff: { n: 'Affiliate Partner', w: 'Free, flexible and open to anyone. Share your code whenever it fits and earn 5% on every successful referral.', href: 'https://www.thecatalystvs.com/refer-a-friend', cta: 'Apply as an Affiliate', tab: 't-aff' },
      amb: { n: 'Catalyst Ambassador', w: 'You have a voice people trust. Ambassadors earn higher rewards and get featured, audited and equipped to lead.', href: 'https://docs.google.com/forms/d/e/1FAIpQLSf81odENFKxGEZjPmLGqKKY2QKVPVxz9rUWSTjCRYC-iqVfIg/viewform', cta: 'Apply as an Ambassador', tab: 't-amb' },
      wl: { n: 'White Label Partner', w: 'Offer VA services under your own brand. We fulfill behind the scenes, and your clients stay yours.', href: 'https://calendly.com/partners-thecatalystvs/30min', cta: 'Book a White Label call', tab: 't-wl' }
    };
    let step = 0, picks = [];
    const render = () => {
      qbar.style.width = (step / Q.length * 100) + '%';
      if (step < Q.length) {
        const d = Q[step];
        qbody.innerHTML = `<div class="qanim"><div class="qstep">QUESTION ${step + 1} OF ${Q.length}</div><h3 class="qq"></h3><div class="qopts"></div>${step ? '<button class="qback" type="button">← Back</button>' : ''}</div>`;
        qbody.querySelector('.qq').textContent = d.q;
        d.o.forEach(([t, k]) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'qopt'; b.textContent = t; b.onclick = () => { picks[step] = k; step++; render(); }; qbody.querySelector('.qopts').append(b); });
        const back = qbody.querySelector('.qback'); if (back) back.onclick = () => { step--; render(); };
      } else {
        const c = { aff: 0, amb: 0, wl: 0 }; picks.forEach(k => c[k]++);
        const win = ['amb', 'aff', 'wl'].reduce((a, b) => c[b] > c[a] ? b : a, picks[0]);
        const r = R[win];
        qbody.innerHTML = `<div class="qanim qres"><div class="qstep">YOUR BEST FIT</div><h3 class="o"></h3><p></p><div class="row"><a class="btn btn-o" target="_blank" rel="noopener"></a><button class="btn btn-line" type="button" data-see>See the details</button></div><button class="qback" type="button" data-again>Start over</button></div>`;
        qbody.querySelector('h3').textContent = r.n; qbody.querySelector('p').textContent = r.w;
        const a = qbody.querySelector('a'); a.href = r.href; a.textContent = r.cta + ' →';
        qbody.querySelector('[data-see]').onclick = () => { const t = $('#' + r.tab); t.click(); $('#programs').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); };
        qbody.querySelector('[data-again]').onclick = () => { step = 0; picks = []; render(); };
      }
    };
    render();
  }

  /* earnings estimator */
  const pkg = $('#pkg'), refs = $('#refs');
  if (pkg) {
    const fmt = n => '$' + Math.round(n).toLocaleString('en-US');
    const calc = () => {
      const v = +pkg.value, n = +refs.value;
      $('#pkgOut').textContent = fmt(v); $('#refsOut').textContent = n;
      $('#affOut').textContent = fmt(v * n * 0.05);
      $('#ambOut').textContent = fmt(v * n * 0.05) + '–' + fmt(v * n * 0.10);
    };
    pkg.addEventListener('input', calc); refs.addEventListener('input', calc); calc();
  }

  /* orange cursor dot */
  const cur = $('#cursor');
  if (cur && matchMedia('(hover:hover)').matches && !reduce) {
    addEventListener('pointermove', e => { cur.style.opacity = 1; cur.style.left = e.clientX + 'px'; cur.style.top = e.clientY + 'px'; });
    $$('a,button,.tilt').forEach(el => { el.addEventListener('mouseenter', () => cur.classList.add('big')); el.addEventListener('mouseleave', () => cur.classList.remove('big')); });
  }
})();
