(function () {
  const P = window.SEI_Personalization;
  const CMS = window.SEI_CMS;
  const page = document.body.dataset.page;

  if (page === 'home') initHome();
  if (page === 'personalized') initPersonalized();

  /* ─── Homepage Logic ─── */
  function initHome() {
    const segment = P.getSegment();

    if (segment) {
      showWelcomeBar(segment);
    } else {
      setTimeout(showModal, 1400);
    }
  }

  function showWelcomeBar(segment) {
    const bar = document.getElementById('welcome-bar');
    if (!bar) return;
    const meta = P.getSegmentMeta(segment);
    bar.querySelector('[data-segment-label]').textContent = meta ? meta.label : segment;
    bar.querySelector('[data-segment-link]').href = P.getSegmentPage(segment);
    bar.classList.remove('hidden');
    bar.querySelector('[data-dismiss]').addEventListener('click', () => bar.classList.add('hidden'));
  }

  function showModal() {
    const overlay = document.getElementById('personalization-modal');
    if (!overlay) return;
    overlay.classList.remove('hidden');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => overlay.classList.add('visible'));
    });

    const options = overlay.querySelectorAll('.modal-option');
    const continueBtn = overlay.querySelector('.modal-continue');
    let selected = null;

    options.forEach(opt => {
      opt.addEventListener('click', () => {
        options.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        selected = opt.dataset.segment;
        continueBtn.disabled = false;
      });
    });

    continueBtn.addEventListener('click', () => {
      if (!selected) return;
      P.setSegment(selected);
      continueBtn.textContent = 'Personalizing your experience…';
      continueBtn.disabled = true;

      // Flash transition
      const flash = document.createElement('div');
      flash.className = 'page-flash';
      document.body.appendChild(flash);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          flash.classList.add('active');
          sessionStorage.setItem('sei_morphed', '1');
          setTimeout(() => { window.location.href = P.getSegmentPage(selected); }, 380);
        });
      });
    });

    overlay.querySelector('.modal-skip').addEventListener('click', closeModal);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

    function closeModal() {
      overlay.classList.remove('visible');
      setTimeout(() => overlay.classList.add('hidden'), 300);
    }
  }

  /* ─── Personalized Page Logic ─── */
  async function initPersonalized() {
    const segment = document.body.dataset.segment;
    if (!segment) return;

    showCmsBar(segment);
    applyCmsSkeletons();

    try {
      const content = await CMS.fetchContent(segment);
      populateCmsContent(content);
      updateCmsBar(content._meta.fetchMs);
    } catch (e) {
      console.warn('CMS fetch error:', e);
      clearCmsSkeletons();
    }

    initPersonalizeOptions();
    initResetLink();
  }

  function showCmsBar(segment) {
    const bar = document.getElementById('cms-bar');
    if (!bar) return;
    const label = P.getSegmentLabel(segment);
    bar.querySelector('[data-cms-segment]').textContent = label;
    bar.classList.remove('hidden');
    document.body.classList.add('nav-bar-present');
  }

  function updateCmsBar(ms) {
    const el = document.querySelector('.cms-fetch');
    if (el) el.textContent = `Content delivered in ${ms}ms`;
  }

  function applyCmsSkeletons() {
    document.querySelectorAll('[data-cms]').forEach(el => el.classList.add('skeleton'));
  }

  function clearCmsSkeletons() {
    document.querySelectorAll('[data-cms]').forEach(el => el.classList.remove('skeleton'));
  }

  function populateCmsContent(content) {
    document.querySelectorAll('[data-cms]').forEach(el => {
      const key = el.dataset.cms;
      const value = resolvePath(content, key);
      if (value !== undefined && value !== null) {
        el.classList.remove('skeleton');
        el.classList.add('fade-in');
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.value = value;
        } else {
          el.textContent = value;
        }
      } else {
        el.classList.remove('skeleton');
      }
    });
  }

  function resolvePath(obj, path) {
    return path.split('.').reduce((acc, key) => acc?.[key], obj);
  }

  function initPersonalizeOptions() {
    document.querySelectorAll('.personalize-option').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.personalize-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  function initResetLink() {
    const link = document.querySelector('[data-reset-segment]');
    if (!link) return;
    link.addEventListener('click', e => {
      e.preventDefault();
      P.clearSegment();
      window.location.href = '/index.html';
    });
  }
})();
