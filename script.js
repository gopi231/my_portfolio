// =========================================================
// Kojja Gopi — Portfolio interactivity
// =========================================================

document.getElementById('year').textContent = new Date().getFullYear();

/* ---------------------------------------------------------
   Theme toggle (dark default, persisted in-memory + attr)
--------------------------------------------------------- */
(function themeToggle() {
  const root = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  let theme = 'dark';

  // Respect OS preference on first load, dark still wins as the brand default
  // only if the user hasn't got a stored choice (kept in a plain JS var here,
  // since this is a static single-page site with no backend/session store).
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  if (prefersLight) theme = 'light';

  applyTheme(theme);

  toggle.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(theme);
  });

  function applyTheme(t) {
    if (t === 'light') {
      root.setAttribute('data-theme', 'light');
      toggle.setAttribute('aria-label', 'Switch to dark theme');
      toggle.setAttribute('aria-pressed', 'true');
    } else {
      root.removeAttribute('data-theme');
      toggle.setAttribute('aria-label', 'Switch to light theme');
      toggle.setAttribute('aria-pressed', 'false');
    }
  }
})();

/* ---------------------------------------------------------
   Mobile nav burger
--------------------------------------------------------- */
(function mobileNav() {
  const burger = document.getElementById('nav-burger');
  const nav = document.getElementById('main-nav');

  burger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* ---------------------------------------------------------
   Smooth scrolling for in-page nav links
   (CSS scroll-behavior handles most of this already;
   this adds an offset for the sticky header + focus mgmt)
--------------------------------------------------------- */
(function smoothScroll() {
  const header = document.querySelector('.site-header');
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const headerHeight = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 12;
      window.scrollTo({ top, behavior: 'smooth' });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
})();

/* ---------------------------------------------------------
   Hero typing animation
--------------------------------------------------------- */
(function typingEffect() {
  const el = document.getElementById('typed-role');
  if (!el) return;

  const roles = [
    'MERN Stack Developer',
    'Next.js Developer',
    'PHP & Django Builder',
    'Full-Stack Freelancer'
  ];

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    el.textContent = roles[0];
    return;
  }

  let roleIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const TYPE_SPEED = 65;
  const DELETE_SPEED = 35;
  const HOLD_TIME = 1400;

  function tick() {
    const current = roles[roleIndex];

    if (!deleting) {
      charIndex++;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        deleting = true;
        return setTimeout(tick, HOLD_TIME);
      }
      return setTimeout(tick, TYPE_SPEED);
    } else {
      charIndex--;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        return setTimeout(tick, 300);
      }
      return setTimeout(tick, DELETE_SPEED);
    }
  }

  setTimeout(tick, TYPE_SPEED);
})();

/* ---------------------------------------------------------
   Tech stack filtering
--------------------------------------------------------- */
(function stackFilter() {
  const buttons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.stack-card');
  const emptyState = document.getElementById('stack-empty');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.dataset.filter;
      let visibleCount = 0;

      cards.forEach(card => {
        const matches = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('is-hidden', !matches);
        if (matches) visibleCount++;
      });

      emptyState.hidden = visibleCount !== 0;
    });
  });
})();

/* ---------------------------------------------------------
   Contact form validation
--------------------------------------------------------- */
(function contactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const status = document.getElementById('form-status');

  const fields = {
    name: {
      input: document.getElementById('field-name'),
      error: document.getElementById('error-name'),
      validate: (v) => v.trim().length >= 2,
      message: 'Please enter your name (at least 2 characters).'
    },
    email: {
      input: document.getElementById('field-email'),
      error: document.getElementById('error-email'),
      validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      message: 'Please enter a valid email address.'
    },
    projectType: {
      input: document.getElementById('field-type'),
      error: document.getElementById('error-type'),
      validate: (v) => v !== '',
      message: 'Please select a project type.'
    },
    message: {
      input: document.getElementById('field-message'),
      error: document.getElementById('error-message'),
      validate: (v) => v.trim().length >= 10,
      message: 'Tell me a little more — at least 10 characters.'
    }
  };

  Object.values(fields).forEach(field => {
    field.input.addEventListener('blur', () => validateField(field));
    field.input.addEventListener('input', () => {
      if (field.input.closest('.form-field').classList.contains('has-error')) {
        validateField(field);
      }
    });
  });

  function validateField(field) {
    const valid = field.validate(field.input.value);
    const wrapper = field.input.closest('.form-field');
    wrapper.classList.toggle('has-error', !valid);
    field.error.textContent = valid ? '' : field.message;
    return valid;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let allValid = true;
    Object.values(fields).forEach(field => {
      if (!validateField(field)) allValid = false;
    });

    if (!allValid) {
      status.textContent = 'Please fix the highlighted fields.';
      status.className = 'form-status error';
      return;
    }

    // No backend is wired up yet — this simulates a successful send so the
    // interaction is complete. Replace with a real fetch() call to your
    // email/API endpoint when you connect one.
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    setTimeout(() => {
      status.textContent = `Thanks — I'll reply to ${fields.email.input.value.trim()} soon.`;
      status.className = 'form-status success';
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send message';
    }, 700);
  });
})();
