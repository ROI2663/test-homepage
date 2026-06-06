// Hamburger menu
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');

function closeMenu() {
  nav.classList.remove('open');
  hamburger.classList.remove('open');
}

hamburger.addEventListener('click', (e) => {
  e.stopPropagation();
  nav.classList.toggle('open');
  hamburger.classList.toggle('open');
});

// Close nav on link click (mobile)
nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Close nav when clicking outside (on the overlay backdrop)
document.addEventListener('click', (e) => {
  if (nav.classList.contains('open') && !nav.contains(e.target) && e.target !== hamburger) {
    closeMenu();
  }
});

// Header scroll style
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
  header.style.background = window.scrollY > 40
    ? 'rgba(10,14,26,0.97)'
    : 'rgba(10,14,26,0.9)';
});

// Counter animation for metrics
const counters = document.querySelectorAll('.metrics__num');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    observer.unobserve(entry.target);
    const el = entry.target;
    const small = el.querySelector('small');
    const suffix = small ? small.textContent : '';
    const raw = el.textContent.replace(suffix, '').trim();
    const target = parseFloat(raw);
    const isDecimal = raw.includes('.');
    let start = 0;
    const duration = 1200;
    const step = timestamp => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const val = isDecimal
        ? (target * progress).toFixed(1)
        : Math.floor(target * progress);
      el.textContent = val;
      if (small) el.appendChild(small);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}, { threshold: 0.5 });

counters.forEach(c => observer.observe(c));

// Fade-in on scroll
const fadeEls = document.querySelectorAll('.card, .reason, .case-card, .voice-card');
const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

fadeEls.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  fadeObserver.observe(el);
});
