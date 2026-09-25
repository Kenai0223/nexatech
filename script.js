/**
 * NexaTech Global Software Solutions - Interactive Features & Animations
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Toast Notification Helper
  const toast = document.getElementById('toastNotice');
  const toastMessage = document.getElementById('toastMessage');
  let toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    if (toastMessage) toastMessage.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  // 2. Sticky Header Scroll State & Progress Bar
  const stickyHeader = document.getElementById('stickyHeroHeader');
  const scrollProgress = document.getElementById('scrollProgress');
  const backToTopBtn = document.getElementById('backToTopBtn');

  function handleScroll() {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

    // Progress bar width
    if (scrollProgress) {
      scrollProgress.style.width = `${progress}%`;
    }

    // Sticky Header Glassmorphism boost
    if (stickyHeader) {
      if (scrollY > 20) {
        stickyHeader.classList.add('scrolled');
      } else {
        stickyHeader.classList.remove('scrolled');
      }
    }

    // Back to Top button visibility
    if (backToTopBtn) {
      if (scrollY > 300) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Initial invocation

  // 3. Mobile Navigation Drawer Toggle
  const navToggleBtn = document.getElementById('navToggleBtn');
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');

  if (navToggleBtn && mobileNavDrawer) {
    navToggleBtn.addEventListener('click', () => {
      const isOpen = navToggleBtn.classList.toggle('open');
      mobileNavDrawer.classList.toggle('open', isOpen);
      navToggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close drawer when a link is clicked
    const mobileLinks = mobileNavDrawer.querySelectorAll('.mobile-nav-link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        navToggleBtn.classList.remove('open');
        mobileNavDrawer.classList.remove('open');
        navToggleBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 4. Smooth Scroll for Navigation Links
  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  // 5. Active Section Spy for Navigation Links
  const sections = [
    { id: 'hero', element: document.getElementById('hero') },
    { id: 'goal', element: document.getElementById('goal') },
    { id: 'about', element: document.getElementById('about') },
    { id: 'roles', element: document.getElementById('roles') },
    { id: 'faq', element: document.getElementById('faq') },
    { id: 'contact', element: document.getElementById('contact') }
  ].filter(sec => sec.element !== null);

  const desktopNavItems = document.querySelectorAll('.sticky-nav-links .nav-link');
  const mobileNavItems = document.querySelectorAll('.mobile-nav-drawer .mobile-nav-link');

  function updateActiveNav(activeId) {
    desktopNavItems.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${activeId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    mobileNavItems.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${activeId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // IntersectionObserver for Section Spying
  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        updateActiveNav(entry.target.id);
      }
    });
  }, {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  });

  sections.forEach(sec => spyObserver.observe(sec.element));

  // 6. Scroll Reveal Observer for Cards
  const revealCards = document.querySelectorAll('.reveal-card');
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        cardObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  revealCards.forEach(card => cardObserver.observe(card));

  // 7. Interactive Copy to Clipboard
  const copyElements = document.querySelectorAll('[data-copy]');
  copyElements.forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => {
      const textToCopy = el.getAttribute('data-copy');
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`Copied "${textToCopy}" to clipboard!`);
        }).catch(() => {
          showToast(`Selected: ${textToCopy}`);
        });
      }
    });
  });

  // 8. Interactive FAQ Cards
  const faqCards = document.querySelectorAll('.faq-card');
  faqCards.forEach((card, index) => {
    card.addEventListener('click', () => {
      faqCards.forEach(c => c.style.borderColor = '#dbeafe');
      card.style.borderColor = '#38bdf8';
      const question = card.querySelector('.faq-question')?.textContent?.trim() || `FAQ ${index + 1}`;
      showToast(`Selected: "${question}"`);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  // 9. World Map Pulse Nodes Animation
  const mapNodes = document.querySelectorAll('.map-pulse-node');
  let step = 0;
  setInterval(() => {
    if (mapNodes.length === 0) return;
    step = (step + 1) % mapNodes.length;
    mapNodes.forEach((node, i) => {
      if (i === step) {
        node.setAttribute('r', '5.5');
        node.setAttribute('fill', '#00f2fe');
        node.style.filter = 'drop-shadow(0 0 6px #00f2fe)';
      } else {
        node.setAttribute('r', '3.5');
        node.setAttribute('fill', '#0284c7');
        node.style.filter = 'none';
      }
    });
  }, 1200);
});
