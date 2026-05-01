(function () {
  'use strict';

  /* ── 1. PARTICLE MESH ─────────────────────────────────────────── */
  function initParticleMesh() {
    const hero = document.querySelector('.hero, .hero-personalized');
    if (!hero) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;';
    hero.insertBefore(canvas, hero.firstChild);

    const ctx = canvas.getContext('2d');
    let particles = [], raf;

    function resize() {
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
      spawnParticles();
    }

    function spawnParticles() {
      const count = Math.min(55, Math.floor((canvas.width * canvas.height) / 16000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.4 + 0.4,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const DIST = 130;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < DIST) {
            const a = (1 - d / DIST) * 0.18;
            ctx.strokeStyle = `rgba(190,0,0,${a})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
        ctx.fillStyle = `rgba(255,255,255,${0.18 + p.r * 0.08})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      }

      raf = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', resize, { passive: true });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { cancelAnimationFrame(raf); } else { draw(); }
    });
  }

  /* ── 2. HERO HEADLINE WORD REVEAL ─────────────────────────────── */
  function initHeadlineReveal() {
    const headline = document.querySelector('.hero-headline');
    if (!headline) return;

    const words = headline.textContent.trim().split(/\s+/);
    headline.innerHTML = words
      .map(w => `<span class="word-wrap"><span class="word">${w}</span></span>`)
      .join(' ');

    headline.querySelectorAll('.word').forEach((el, i) => {
      el.style.animationDelay = `${280 + i * 68}ms`;
      el.classList.add('word-anim');
    });

    const eyebrow = document.querySelector('.hero-eyebrow');
    const sub = document.querySelector('.hero-subheadline');
    const ctaEls = document.querySelectorAll('.hero-cta, .hero-cta-primary, .hero-ctas');
    const delay = 280 + words.length * 68;

    if (eyebrow) { eyebrow.classList.add('hero-fade-up'); eyebrow.style.animationDelay = '80ms'; }
    if (sub) { sub.classList.add('hero-fade-up'); sub.style.animationDelay = `${delay + 80}ms`; }
    ctaEls.forEach(el => { el.classList.add('hero-fade-up'); el.style.animationDelay = `${delay + 220}ms`; });
  }

  /* ── 3. CURSOR-FOLLOWING GLOW ──────────────────────────────────── */
  function initCursorGlow() {
    const glow = document.querySelector('.hero-glow');
    if (!glow) return;

    let tx = null, ty = null;
    let cx = -100, cy = -100;

    document.addEventListener('mousemove', e => {
      if (tx === null) { cx = e.clientX; cy = e.clientY; }
      tx = e.clientX;
      ty = e.clientY;
    }, { passive: true });

    (function loop() {
      if (tx !== null) {
        cx += (tx - cx) * 0.12;
        cy += (ty - cy) * 0.12;
      }
      glow.style.transform = `translate(${cx - 14}px, ${cy - 14}px)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ── 4. SCROLL PROGRESS BAR ────────────────────────────────────── */
  function initScrollProgress() {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);

    window.addEventListener('scroll', () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    }, { passive: true });
  }

  /* ── 5. NAV SCROLL BEHAVIOR ────────────────────────────────────── */
  function initNav() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    window.addEventListener('scroll', () => {
      nav.classList.toggle('nav--scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  /* ── 6. SCROLL REVEALS ─────────────────────────────────────────── */
  function initScrollReveals() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add('sei-revealed');
        el.querySelectorAll('.stagger-child').forEach((child, i) => {
          setTimeout(() => child.classList.add('sei-revealed'), i * 85);
        });
        io.unobserve(el);
      });
    }, { threshold: 0.07, rootMargin: '0px 0px -48px 0px' });

    document.querySelectorAll('.sei-reveal').forEach(el => io.observe(el));
  }

  /* ── 7. STATS COUNT-UP ─────────────────────────────────────────── */
  function initCountUp() {
    const grid = document.querySelector('.by-numbers-grid');
    if (!grid) return;

    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      grid.querySelectorAll('[data-target]').forEach((el, i) => {
        setTimeout(() => runCount(el), i * 160);
      });
    }, { threshold: 0.25 });

    io.observe(grid);
  }

  function runCount(el) {
    const target = parseFloat(el.dataset.target);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const isDecimal = el.dataset.target.includes('.');
    const useComma = el.dataset.comma === 'true';
    const duration = 1600;
    const start = performance.now();

    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      const val = target * eased;
      let disp;
      if (isDecimal) disp = val.toFixed(1);
      else if (useComma) disp = Math.round(val).toLocaleString();
      else disp = Math.round(val).toString();
      el.textContent = prefix + disp + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ── 8. 3D CARD TILT ───────────────────────────────────────────── */
  function initCardTilt() {
    document.querySelectorAll('.insight-card, .suggested-card, .know-pillar').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - 0.5) * 9;
        const y = ((e.clientY - r.top) / r.height - 0.5) * -9;
        card.style.transition = 'transform 0.08s ease, box-shadow 0.08s ease';
        card.style.transform = `perspective(700px) rotateY(${x}deg) rotateX(${y}deg) translateY(-3px)`;
        card.style.boxShadow = '0 14px 36px rgba(0,0,0,0.13)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1), box-shadow 0.5s ease';
        card.style.transform = '';
        card.style.boxShadow = '';
      });
    });
  }

  /* ── 9. BEFORE / AFTER TOGGLE ──────────────────────────────────── */
  function initBeforeAfterToggle() {
    const toggle = document.querySelector('[data-ba-toggle]');
    if (!toggle) return;

    let generic = false;

    toggle.addEventListener('click', () => {
      generic = !generic;
      toggle.querySelector('.ba-state').textContent = generic ? 'Generic' : 'Personalized';
      toggle.classList.toggle('ba-active', generic);

      document.querySelectorAll('[data-generic]').forEach(el => {
        const to = generic ? el.dataset.generic : el.dataset.personalized;
        if (!to) return;
        el.style.transition = 'opacity 0.22s ease';
        el.style.opacity = '0';
        setTimeout(() => { el.textContent = to; el.style.opacity = '1'; }, 230);
      });

      const suggested = document.querySelector('.suggested');
      if (suggested) {
        suggested.style.transition = 'opacity 0.4s ease';
        suggested.style.opacity = generic ? '0.2' : '1';
        suggested.style.pointerEvents = generic ? 'none' : '';
      }
    });
  }

  /* ── 10. PAGE-IN CASCADE (personalized pages) ──────────────────── */
  function initPageIn() {
    if (!sessionStorage.getItem('sei_morphed')) return;
    sessionStorage.removeItem('sei_morphed');

    const hero = document.querySelector('.hero-personalized');
    if (hero) {
      hero.style.opacity = '0';
      requestAnimationFrame(() => {
        hero.style.transition = 'opacity 0.5s ease 0.1s';
        hero.style.opacity = '1';
      });
    }

    const sections = document.querySelectorAll('.suggested, .spotlight, .insights');
    sections.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      setTimeout(() => {
        el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
        el.style.opacity = '1';
        el.style.transform = '';
      }, 200 + i * 120);
    });
  }

  /* ── 12. MAGNETIC CURSOR ───────────────────────────────────────── */
  function initMagneticCursor() {
    document.querySelectorAll(
      '.hero-cta-primary, .hero-cta, .spotlight-cta, .trusted-cta, .business-audit-cta, .modal-continue, .nav-contact'
    ).forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - 0.5) * 28;
        const y = ((e.clientY - r.top) / r.height - 0.5) * 14;
        el.style.transform = `translate(${x}px, ${y}px) scale(1.06)`;
        el.style.transition = 'transform 0.1s ease';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
        el.style.transition = 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)';
      });
    });
  }

  /* ── 13. SPOTLIGHT CURSOR ──────────────────────────────────────── */
  function initSpotlightCursor() {
    function bgLuminance(el) {
      let node = el;
      while (node) {
        const bg = getComputedStyle(node).backgroundColor;
        if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
          const m = bg.match(/[\d.]+/g);
          if (m && m.length >= 3) return 0.299 * +m[0] + 0.587 * +m[1] + 0.114 * +m[2];
        }
        node = node.parentElement;
      }
      return 255;
    }

    const skipMatchers = ['.hero', '.hero-personalized'];
    const seen = new Set();
    const targets = document.querySelectorAll('section, footer');

    targets.forEach(section => {
      if (seen.has(section)) return;
      seen.add(section);
      if (skipMatchers.some(cls => section.matches(cls))) return;

      const dark = bgLuminance(section) < 128;
      const overlay = document.createElement('div');
      overlay.className = 'spotlight-cursor-overlay';
      overlay.dataset.mode = dark ? 'dark' : 'light';

      const pos = getComputedStyle(section).position;
      if (pos === 'static') section.style.position = 'relative';

      section.appendChild(overlay);

      section.addEventListener('mouseenter', () => overlay.classList.add('sc-active'));
      section.addEventListener('mouseleave', () => overlay.classList.remove('sc-active'));
      section.addEventListener('mousemove', e => {
        const r = section.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        overlay.style.background = dark
          ? `radial-gradient(circle 400px at ${x}px ${y}px, rgba(200,70,0,0.32) 0%, transparent 72%)`
          : `radial-gradient(circle 460px at ${x}px ${y}px, transparent 0%, rgba(0,0,0,0.44) 100%)`;
      }, { passive: true });
    });
  }

  /* ── 14. STICKY SCROLL NARRATIVE ──────────────────────────────── */
  function initStickyScroll() {
    const section = document.querySelector('.know-sei.section');
    if (!section) return;

    section.classList.remove('sei-reveal');
    section.style.opacity = '1';
    section.style.transform = 'none';

    const pillars = Array.from(section.querySelectorAll('.know-pillar'));
    pillars.forEach((p, i) => {
      p.classList.remove('stagger-child', 'sei-revealed');
      const fx = i % 2 === 0 ? -120 : 120;
      const ry = i % 2 === 0 ? 20 : -20;
      p.style.opacity = '0';
      p.style.transform = `translateX(${fx}px) rotateY(${ry}deg) scale(0.92)`;
      p.style.transition = 'none';
      p.dataset.fx = String(fx);
      p.dataset.ry = String(ry);
    });

    const wrap = document.createElement('div');
    wrap.className = 'sticky-scroll-wrap';
    section.parentNode.insertBefore(wrap, section);
    wrap.appendChild(section);
    section.classList.add('sticky-scroll-scene');

    function update() {
      const wRect = wrap.getBoundingClientRect();
      const scrollable = wrap.offsetHeight - section.offsetHeight;
      if (scrollable <= 0) return;
      const progress = Math.max(0, Math.min(1, -wRect.top / scrollable));
      const active = Math.min(pillars.length, Math.floor(progress * (pillars.length + 1)));

      pillars.forEach((p, i) => {
        if (i < active && p.dataset.vis !== '1') {
          p.dataset.vis = '1';
          p.style.transition = `opacity 0.65s cubic-bezier(0.16,1,0.3,1) ${i * 50}ms, transform 0.65s cubic-bezier(0.16,1,0.3,1) ${i * 50}ms`;
          p.style.opacity = '1';
          p.style.transform = 'translateX(0) rotateY(0) scale(1)';
        } else if (i >= active && p.dataset.vis === '1') {
          p.dataset.vis = '0';
          p.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          p.style.opacity = '0';
          p.style.transform = `translateX(${p.dataset.fx}px) rotateY(${p.dataset.ry}deg) scale(0.92)`;
        }
      });
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  }

  /* ── 15. CARD DECK FAN ─────────────────────────────────────────── */
  function initCardDeckFan() {
    document.querySelectorAll('.suggested-grid').forEach(grid => {
      const cards = Array.from(grid.querySelectorAll('.suggested-card'));
      const offsets = [{ x: -70, r: -9 }, { x: 0, r: 0 }, { x: 70, r: 9 }];
      cards.forEach((c, i) => {
        c.classList.remove('stagger-child', 'sei-revealed');
        const off = offsets[i] || { x: 0, r: 0 };
        c.style.opacity = '0';
        c.style.transform = `translateX(${off.x}px) translateY(100px) rotate(${off.r}deg) scale(0.87)`;
        c.style.transition = 'none';
      });

      // Take the section out of sei-reveal so IO doesn't conflict
      const section = grid.closest('section');
      if (section) {
        section.classList.remove('sei-reveal');
        section.style.opacity = '1';
        section.style.transform = 'none';
      }

      const io = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        cards.forEach((c, i) => {
          setTimeout(() => {
            c.style.transition = 'opacity 0.75s cubic-bezier(0.34,1.56,0.64,1), transform 0.75s cubic-bezier(0.34,1.56,0.64,1)';
            c.style.opacity = '1';
            c.style.transform = '';
          }, i * 120);
        });
      }, { threshold: 0.1 });

      io.observe(section || grid.parentElement);
    });
  }

  /* ── 16. SLOT MACHINE ODOMETER ─────────────────────────────────── */
  function initOdometer() {
    const grid = document.querySelector('.by-numbers-grid');
    if (!grid) return;

    const io = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      grid.querySelectorAll('[data-target]').forEach((el, i) => {
        setTimeout(() => spinOdometer(el), i * 200);
      });
    }, { threshold: 0.25 });

    io.observe(grid);
  }

  function spinOdometer(el) {
    const target = parseFloat(el.dataset.target);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const isDecimal = el.dataset.target.includes('.');
    const useComma = el.dataset.comma === 'true';
    const fmt = v => prefix + (isDecimal ? v.toFixed(1) : useComma ? Math.round(v).toLocaleString() : String(Math.round(v))) + suffix;

    const totalDur = 1900, spinDur = 1200;
    const start = performance.now();

    function tick(now) {
      const t = now - start;
      if (t < spinDur) {
        el.textContent = fmt(Math.random() * target);
        requestAnimationFrame(tick);
      } else if (t < totalDur) {
        const p = (t - spinDur) / (totalDur - spinDur);
        el.textContent = fmt(target * (1 - Math.pow(1 - p, 4)));
        requestAnimationFrame(tick);
      } else {
        el.textContent = fmt(target);
      }
    }
    requestAnimationFrame(tick);
  }

  /* ── 17. SPLIT ENTRANCE ────────────────────────────────────────── */
  function initSplitEntrance() {
    document.querySelectorAll('.spotlight').forEach(section => {
      const left = section.querySelector('.spotlight-image');
      const right = section.querySelector('.spotlight-meta');
      if (!left || !right) return;

      section.classList.remove('sei-reveal');
      section.style.opacity = '1';
      section.style.transform = 'none';

      left.classList.add('split-from-left');
      right.classList.add('split-from-right');

      const io = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        setTimeout(() => left.classList.add('split-revealed'), 80);
        setTimeout(() => right.classList.add('split-revealed'), 220);
      }, { threshold: 0.12 });

      io.observe(section);
    });
  }

  /* ── 18. GLITCH TOGGLE ─────────────────────────────────────────── */
  function initGlitchToggle() {
    document.querySelectorAll('[data-ba-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const hero = document.querySelector('.hero, .hero-personalized');
        if (!hero) return;
        hero.classList.remove('glitch-active');
        void hero.offsetWidth;
        hero.classList.add('glitch-active');
        setTimeout(() => hero.classList.remove('glitch-active'), 700);
      });
    });
  }

  /* ── 19. HERO PARALLAX DEPTH ───────────────────────────────────── */
  function initHeroParallax() {
    const hero = document.querySelector('.hero, .hero-personalized');
    if (!hero) return;
    const pattern = hero.querySelector('.hero-bg-pattern');
    const content = hero.querySelector('.hero-content');
    let tx = 0, ty = 0, cx = 0, cy = 0;

    hero.addEventListener('mousemove', e => {
      const r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left - r.width / 2) / r.width;
      ty = (e.clientY - r.top - r.height / 2) / r.height;
    }, { passive: true });
    hero.addEventListener('mouseleave', () => { tx = 0; ty = 0; });

    (function loop() {
      cx += (tx - cx) * 0.055;
      cy += (ty - cy) * 0.055;
      if (pattern) pattern.style.transform = `translate(${cx * 24}px, ${cy * 16}px) scale(1.06)`;
      if (content) content.style.transform = `translate(${cx * -10}px, ${cy * -7}px)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ── INIT ──────────────────────────────────────────────────────── */
  function init() {
    initHeroParallax();
    // initParticleMesh();
    initHeadlineReveal();

    initCursorGlow();
    initScrollProgress();
    initNav();
    // initStickyScroll();
    initCardDeckFan();
    initSplitEntrance();
    initScrollReveals();
    initOdometer();
    initCardTilt();
    initMagneticCursor();
    // initSpotlightCursor();
    initBeforeAfterToggle();
    initGlitchToggle();
    initPageIn();
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();
