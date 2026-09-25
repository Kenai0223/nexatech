/**
 * NexaTech Global Software Solutions - Brilliant Interactive Engine & Particles
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. Toast Notification Helper
  // =========================================================================
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

  // =========================================================================
  // 2. Interactive Constellation Particles & Shooting Stars in Hero
  // =========================================================================
  const canvas = document.getElementById('heroParticles');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = canvas.parentElement.clientWidth);
    let height = (canvas.height = canvas.parentElement.clientHeight);

    window.addEventListener('resize', () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    });

    // Particle nodes
    const particles = [];
    const particleCount = Math.min(Math.floor(width / 22), 40);

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.25
      });
    }

    // Shooting stars array
    const shootingStars = [];

    function spawnShootingStar() {
      if (shootingStars.length < 2) {
        shootingStars.push({
          x: Math.random() * width * 0.8,
          y: Math.random() * height * 0.4,
          length: Math.random() * 80 + 50,
          speed: Math.random() * 7 + 8,
          dx: 1,
          dy: 0.5,
          opacity: 1
        });
      }
      setTimeout(spawnShootingStar, Math.random() * 4500 + 3500);
    }
    setTimeout(spawnShootingStar, 2000);

    let mouseX = -1000;
    let mouseY = -1000;

    canvas.parentElement.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });

    canvas.parentElement.addEventListener('mouseleave', () => {
      mouseX = -1000;
      mouseY = -1000;
    });

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);

      // Render & update particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Subtle mouse repulsion
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 90) {
          const force = (90 - dist) / 90;
          p.x += (dx / dist) * force * 1.6;
          p.y += (dy / dist) * force * 1.6;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha})`;
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist2 = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist2 < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(2, 132, 199, ${(1 - dist2 / 110) * 0.18})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Render & update shooting stars
      for (let s = shootingStars.length - 1; s >= 0; s--) {
        const star = shootingStars[s];
        star.x += star.speed * star.dx;
        star.y += star.speed * star.dy;
        star.opacity -= 0.02;

        const tailX = star.x - star.length * star.dx * 0.6;
        const tailY = star.y - star.length * star.dy * 0.6;

        const grad = ctx.createLinearGradient(tailX, tailY, star.x, star.y);
        grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
        grad.addColorStop(0.8, `rgba(56, 189, 248, ${star.opacity * 0.7})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${star.opacity})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(star.x, star.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8;
        ctx.stroke();

        if (star.opacity <= 0 || star.x > width + 100 || star.y > height + 100) {
          shootingStars.splice(s, 1);
        }
      }

      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  // =========================================================================
  // 3. Real-time Live Global Clocks
  // =========================================================================
  function updateGlobalClocks() {
    const now = new Date();

    const formatTime = (timeZone, withSeconds = false) => {
      return new Intl.DateTimeFormat('en-GB', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        second: withSeconds ? '2-digit' : undefined,
        hour12: false
      }).format(now);
    };

    const sgtEl = document.querySelector('#clockSGT .clock-val');
    const lonEl = document.querySelector('#clockLON .clock-val');
    const nycEl = document.querySelector('#clockNYC .clock-val');
    const tyoEl = document.querySelector('#clockTYO .clock-val');

    if (sgtEl) sgtEl.textContent = `${formatTime('Asia/Singapore', true)} SGT`;
    if (lonEl) lonEl.textContent = `${formatTime('Europe/London')} GMT`;
    if (nycEl) nycEl.textContent = `${formatTime('America/New_York')} EST`;
    if (tyoEl) tyoEl.textContent = `${formatTime('Asia/Tokyo')} JST`;
  }

  updateGlobalClocks();
  setInterval(updateGlobalClocks, 1000);

  // =========================================================================
  // 4. Interactive 3D Tilt & Specular Spotlight on Cards
  // =========================================================================
  const tiltCards = document.querySelectorAll('.interactive-tilt');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // =========================================================================
  // 5. World Map City Pin Hover Tooltips
  // =========================================================================
  const cityGroups = document.querySelectorAll('.map-city-group');
  const mapTooltip = document.getElementById('mapTooltip');
  const mapWrap = document.querySelector('.world-map-wrap');

  if (mapTooltip && mapWrap) {
    cityGroups.forEach(group => {
      group.addEventListener('mouseenter', () => {
        const cityName = group.getAttribute('data-city');
        const status = group.getAttribute('data-status');
        const latency = group.getAttribute('data-latency');

        mapTooltip.querySelector('.tooltip-city').textContent = cityName;
        mapTooltip.querySelector('.tooltip-status').textContent = `${status} • Latency: ${latency}`;

        const circle = group.querySelector('.map-pulse-node');
        if (circle) {
          const cx = parseFloat(circle.getAttribute('cx'));
          const cy = parseFloat(circle.getAttribute('cy'));
          const wrapWidth = mapWrap.clientWidth;
          const wrapHeight = mapWrap.clientHeight;

          const posX = (cx / 520) * wrapWidth;
          const posY = (cy / 220) * wrapHeight;

          mapTooltip.style.left = `${posX}px`;
          mapTooltip.style.top = `${posY}px`;
          mapTooltip.style.display = 'flex';
        }
      });

      group.addEventListener('mouseleave', () => {
        mapTooltip.style.display = 'none';
      });
    });
  }

  // =========================================================================
  // 6. Rotating Partner Testimonial Slider
  // =========================================================================
  const testimonialSlider = document.getElementById('testimonialSlider');
  const slides = document.querySelectorAll('.testimonial-slide');
  const dotBtns = document.querySelectorAll('.slider-dots .dot-btn');
  const testiPrevBtn = document.getElementById('testiPrevBtn');
  const testiNextBtn = document.getElementById('testiNextBtn');

  if (testimonialSlider && slides.length > 0) {
    let currentSlide = 0;
    const totalSlides = slides.length;
    let autoPlayTimer = null;

    function goToSlide(index) {
      if (index < 0) {
        currentSlide = totalSlides - 1;
      } else if (index >= totalSlides) {
        currentSlide = 0;
      } else {
        currentSlide = index;
      }

      slides.forEach((slide, idx) => {
        if (idx === currentSlide) {
          slide.classList.add('active');
        } else {
          slide.classList.remove('active');
        }
      });

      dotBtns.forEach((dot, idx) => {
        if (idx === currentSlide) {
          dot.classList.add('active');
          dot.setAttribute('aria-current', 'true');
        } else {
          dot.classList.remove('active');
          dot.removeAttribute('aria-current');
        }
      });
    }

    function nextSlide() {
      goToSlide(currentSlide + 1);
    }

    function prevSlide() {
      goToSlide(currentSlide - 1);
    }

    if (testiNextBtn) {
      testiNextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoPlay();
      });
    }

    if (testiPrevBtn) {
      testiPrevBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoPlay();
      });
    }

    dotBtns.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        goToSlide(idx);
        resetAutoPlay();
      });
    });

    function startAutoPlay() {
      stopAutoPlay();
      autoPlayTimer = setInterval(nextSlide, 5500);
    }

    function stopAutoPlay() {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    }

    function resetAutoPlay() {
      stopAutoPlay();
      startAutoPlay();
    }

    testimonialSlider.addEventListener('mouseenter', stopAutoPlay);
    testimonialSlider.addEventListener('mouseleave', startAutoPlay);

    // Touch swipe gesture support for mobile devices
    let touchStartX = 0;
    let touchEndX = 0;

    testimonialSlider.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoPlay();
    }, { passive: true });

    testimonialSlider.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const swipeDistance = touchEndX - touchStartX;
      if (swipeDistance < -45) {
        nextSlide();
      } else if (swipeDistance > 45) {
        prevSlide();
      }
      startAutoPlay();
    }, { passive: true });

    startAutoPlay();
  }

  // =========================================================================
  // 7. Interactive FAQ Search & Category Filter
  // =========================================================================
  const filterPills = document.querySelectorAll('.filter-pill');
  const faqCards = document.querySelectorAll('.faq-card');
  const searchInput = document.getElementById('faqSearchInput');
  const searchClear = document.getElementById('faqSearchClear');
  const faqNoResults = document.getElementById('faqNoResults');
  const resetFaqBtn = document.getElementById('resetFaqBtn');

  let activeCategory = 'all';
  let searchQuery = '';

  function applyFaqFilters() {
    let visibleCount = 0;

    faqCards.forEach(card => {
      const category = card.getAttribute('data-category');
      const question = card.querySelector('.faq-question')?.textContent?.toLowerCase() || '';
      const answer = card.querySelector('.faq-answer')?.textContent?.toLowerCase() || '';

      const matchesCat = (activeCategory === 'all' || category === activeCategory);
      const matchesSearch = !searchQuery || question.includes(searchQuery) || answer.includes(searchQuery);

      if (matchesCat && matchesSearch) {
        card.classList.remove('filtered-out');
        visibleCount++;
      } else {
        card.classList.add('filtered-out');
      }
    });

    if (faqNoResults) {
      faqNoResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => {
        p.classList.remove('active');
        p.setAttribute('aria-selected', 'false');
      });
      pill.classList.add('active');
      pill.setAttribute('aria-selected', 'true');
      activeCategory = pill.getAttribute('data-category') || 'all';
      applyFaqFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      if (searchClear) searchClear.style.display = searchQuery ? 'block' : 'none';
      applyFaqFilters();
    });
  }

  if (searchClear) {
    searchClear.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchQuery = '';
        searchClear.style.display = 'none';
        applyFaqFilters();
        searchInput.focus();
      }
    });
  }

  if (resetFaqBtn) {
    resetFaqBtn.addEventListener('click', () => {
      activeCategory = 'all';
      searchQuery = '';
      if (searchInput) searchInput.value = '';
      if (searchClear) searchClear.style.display = 'none';
      filterPills.forEach(p => {
        p.classList.toggle('active', p.getAttribute('data-category') === 'all');
      });
      applyFaqFilters();
    });
  }

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

  // =========================================================================
  // 7. Interactive Partner Inquiry Modal
  // =========================================================================
  const contactModal = document.getElementById('contactModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const openModalBtns = document.querySelectorAll('.open-modal-btn');
  const partnerForm = document.getElementById('partnerForm');
  const modalSuccessScreen = document.getElementById('modalSuccessScreen');
  const modalDismissBtn = document.getElementById('modalDismissBtn');
  const modalSubmitBtn = document.getElementById('modalSubmitBtn');

  function openModal() {
    if (!contactModal) return;
    contactModal.classList.add('active');
    contactModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const firstInput = contactModal.querySelector('input');
    if (firstInput) setTimeout(() => firstInput.focus(), 100);
  }

  function closeModal() {
    if (!contactModal) return;
    contactModal.classList.remove('active');
    contactModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalDismissBtn) modalDismissBtn.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && contactModal && contactModal.classList.contains('active')) {
      closeModal();
    }
  });

  if (partnerForm) {
    partnerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('partnerName')?.value || 'Partner';

      if (modalSubmitBtn) {
        modalSubmitBtn.innerHTML = `
          <svg class="animate-spin" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10"></path>
          </svg>
          <span>Processing Application...</span>
        `;
        modalSubmitBtn.disabled = true;
      }

      setTimeout(() => {
        if (partnerForm) partnerForm.style.display = 'none';
        if (modalSuccessScreen) modalSuccessScreen.style.display = 'flex';
        showToast(`Welcome, ${name}! Your partner inquiry is submitted.`);
      }, 1000);
    });
  }

  // =========================================================================
  // 8. Interactive Role Checklist Items
  // =========================================================================
  const checklistItems = document.querySelectorAll('.role-checklist-item');
  checklistItems.forEach(item => {
    item.addEventListener('click', () => {
      const badge = item.querySelector('.check-badge');
      if (badge) {
        badge.style.transform = 'scale(1.3) rotate(360deg)';
        badge.style.backgroundColor = '#10b981';
        setTimeout(() => {
          badge.style.transform = '';
          badge.style.backgroundColor = '#0284c7';
        }, 500);
      }
      const text = item.querySelector('span:last-child')?.textContent || 'Task';
      showToast(`Verified step: "${text}"`);
    });
  });

  // =========================================================================
  // 9. Sticky Header, Scroll Spy & Smooth Scroll Handlers
  // =========================================================================
  const stickyHeader = document.getElementById('stickyHeroHeader');
  const scrollProgress = document.getElementById('scrollProgress');
  const backToTopBtn = document.getElementById('backToTopBtn');

  function handleScroll() {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

    if (scrollProgress) scrollProgress.style.width = `${progress}%`;

    if (stickyHeader) {
      if (scrollY > 20) {
        stickyHeader.classList.add('scrolled');
      } else {
        stickyHeader.classList.remove('scrolled');
      }
    }

    if (backToTopBtn) {
      if (scrollY > 300) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Mobile Drawer Toggle
  const navToggleBtn = document.getElementById('navToggleBtn');
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');

  if (navToggleBtn && mobileNavDrawer) {
    navToggleBtn.addEventListener('click', () => {
      const isOpen = navToggleBtn.classList.toggle('open');
      mobileNavDrawer.classList.toggle('open', isOpen);
      navToggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    const mobileLinks = mobileNavDrawer.querySelectorAll('.mobile-nav-link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        navToggleBtn.classList.remove('open');
        mobileNavDrawer.classList.remove('open');
        navToggleBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Smooth Scroll for Navigation Links
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

  // Section Spying with IntersectionObserver
  const sections = [
    { id: 'hero', element: document.getElementById('hero') },
    { id: 'goal', element: document.getElementById('goal') },
    { id: 'about', element: document.getElementById('about') },
    { id: 'roles', element: document.getElementById('roles') },
    { id: 'testimonials', element: document.getElementById('testimonials') },
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

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        updateActiveNav(entry.target.id);
      }
    });
  }, {
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  });

  sections.forEach(sec => spyObserver.observe(sec.element));

  // Scroll Reveal Observer for Cards
  const revealCards = document.querySelectorAll('.reveal-card');
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        cardObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -30px 0px'
  });

  revealCards.forEach(card => cardObserver.observe(card));

  // Copy to Clipboard Elements
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
});
