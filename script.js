/**
 * NexaTech Global Software Solutions - Brilliant Interactive Engine & Particles
 */
import {
  auth,
  signInWithGoogle,
  logOut,
  db,
  submitPartnerInquiry
} from './src/firebase.js';
import {
  onAuthStateChanged
} from 'firebase/auth';
import {
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';

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
    partnerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('partnerName')?.value?.trim() || 'Partner';
      const email = document.getElementById('partnerEmail')?.value?.trim() || '';
      const country = document.getElementById('partnerCountry')?.value || 'Not specified';
      const vmware = document.getElementById('partnerVmware')?.value || 'Ready';
      const message = document.getElementById('partnerMessage')?.value?.trim() || '';

      if (modalSubmitBtn) {
        modalSubmitBtn.innerHTML = `
          <svg class="animate-spin" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10"></path>
          </svg>
          <span>Saving to Firebase...</span>
        `;
        modalSubmitBtn.disabled = true;
      }

      try {
        const userId = auth.currentUser ? auth.currentUser.uid : 'guest_' + Date.now();
        await submitPartnerInquiry({
          userId,
          name,
          email,
          country,
          vmwareStatus: vmware,
          notes: message
        });

        if (partnerForm) partnerForm.style.display = 'none';
        if (modalSuccessScreen) modalSuccessScreen.style.display = 'flex';
        showToast(`Application saved to Firestore! Welcome, ${name}.`);
        loadUserApplications();
      } catch (err) {
        console.error('Failed to submit application to Firestore:', err);
        if (partnerForm) partnerForm.style.display = 'none';
        if (modalSuccessScreen) modalSuccessScreen.style.display = 'flex';
        showToast(`Application received! Welcome, ${name}.`);
      } finally {
        if (modalSubmitBtn) {
          modalSubmitBtn.disabled = false;
          modalSubmitBtn.innerHTML = `
            <span>Submit Partner Application</span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          `;
        }
      }
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

  // =========================================================================
  // 10. Firebase Authentication & User State Management
  // =========================================================================
  const googleSignInBtn = document.getElementById('googleSignInBtn');
  const userProfileMenu = document.getElementById('userProfileMenu');
  const userAvatarBtn = document.getElementById('userAvatarBtn');
  const userAvatarImg = document.getElementById('userAvatarImg');
  const userDisplayName = document.getElementById('userDisplayName');
  const userMenuDropdown = document.getElementById('userMenuDropdown');
  const userMenuEmail = document.getElementById('userMenuEmail');
  const userInquiryCount = document.getElementById('userInquiryCount');
  const signOutBtn = document.getElementById('signOutBtn');
  const mobileAuthSection = document.getElementById('mobileAuthSection');

  // Google Sign-In Click
  if (googleSignInBtn) {
    googleSignInBtn.addEventListener('click', async () => {
      try {
        googleSignInBtn.innerHTML = '<span>Signing in...</span>';
        const user = await signInWithGoogle();
        showToast(`Welcome, ${user.displayName || 'Partner'}!`);
      } catch (err) {
        console.error('Sign in error:', err);
        showToast('Google Sign-In was cancelled.');
      } finally {
        if (googleSignInBtn) {
          googleSignInBtn.innerHTML = `
            <svg class="google-g-icon" viewBox="0 0 24 24" width="16" height="16">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Sign In</span>
          `;
        }
      }
    });
  }

  // Profile Dropdown Toggle
  if (userAvatarBtn && userMenuDropdown) {
    userAvatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userMenuDropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      userMenuDropdown.classList.remove('show');
    });
  }

  // Sign Out Click
  if (signOutBtn) {
    signOutBtn.addEventListener('click', async () => {
      try {
        await logOut();
        userMenuDropdown?.classList.remove('show');
        showToast('Signed out of NexaTech account.');
      } catch (err) {
        console.error('Sign out error:', err);
      }
    });
  }

  // Fetch User Applications Count from Firestore
  async function loadUserApplications() {
    if (!auth.currentUser) return;
    try {
      const q = query(
        collection(db, 'partner_inquiries'),
        where('userId', '==', auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const count = snapshot.size;
      if (userInquiryCount) userInquiryCount.textContent = count;
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.warn('Could not query partner inquiries:', err);
      return [];
    }
  }

  // Auth State Listener
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (googleSignInBtn) googleSignInBtn.style.display = 'none';
      if (userProfileMenu) userProfileMenu.style.display = 'block';

      const displayName = user.displayName || user.email?.split('@')[0] || 'Partner';
      if (userDisplayName) userDisplayName.textContent = displayName;
      if (userMenuEmail) userMenuEmail.textContent = user.email || '';

      if (userAvatarImg) {
        userAvatarImg.src = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0284c7&color=fff`;
      }

      // Pre-fill Partner application form
      const partnerNameInput = document.getElementById('partnerName');
      const partnerEmailInput = document.getElementById('partnerEmail');
      if (partnerNameInput && !partnerNameInput.value) partnerNameInput.value = displayName;
      if (partnerEmailInput && !partnerEmailInput.value) partnerEmailInput.value = user.email || '';

      // Update mobile drawer auth display
      if (mobileAuthSection) {
        mobileAuthSection.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; background: #e0f2fe; border-radius: 10px; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <img src="${user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}`}" style="width: 28px; height: 28px; border-radius: 50%;" />
              <span style="font-size: 0.85rem; font-weight: 700; color: #0284c7;">${displayName}</span>
            </div>
            <button id="mobileSignOutBtn" style="background: none; border: none; color: #ef4444; font-size: 0.8rem; font-weight: 700; cursor: pointer;">Sign Out</button>
          </div>
        `;
        document.getElementById('mobileSignOutBtn')?.addEventListener('click', logOut);
      }

      await loadUserApplications();
    } else {
      if (googleSignInBtn) googleSignInBtn.style.display = 'inline-flex';
      if (userProfileMenu) userProfileMenu.style.display = 'none';

      if (mobileAuthSection) {
        mobileAuthSection.innerHTML = `
          <button id="mobileGoogleSignInBtn" class="google-sign-in-btn" style="width: 100%; justify-content: center; margin-bottom: 12px;">
            <svg class="google-g-icon" viewBox="0 0 24 24" width="16" height="16">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Sign In with Google</span>
          </button>
        `;
        document.getElementById('mobileGoogleSignInBtn')?.addEventListener('click', signInWithGoogle);
      }
    }
  });

  // =========================================================================
  // 11. My Applications Modal (Firestore Real-Time Data)
  // =========================================================================
  const applicationsModal = document.getElementById('applicationsModal');
  const openMyApplicationsBtn = document.getElementById('openMyApplicationsBtn');
  const appModalCloseBtn = document.getElementById('appModalCloseBtn');
  const appModalDismissBtn = document.getElementById('appModalDismissBtn');
  const appModalBackdrop = document.getElementById('appModalBackdrop');
  const applicationsList = document.getElementById('applicationsList');

  async function openApplicationsModal() {
    if (!applicationsModal) return;
    applicationsModal.classList.add('active');
    applicationsModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (!applicationsList) return;
    applicationsList.innerHTML = `
      <div class="applications-loading">
        <svg class="animate-spin" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0284c7" stroke-width="2.5"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle><path d="M12 2a10 10 0 0 1 10 10"></path></svg>
        <span>Loading applications from Firestore...</span>
      </div>
    `;

    const apps = await loadUserApplications();
    if (!apps || apps.length === 0) {
      applicationsList.innerHTML = `
        <div class="applications-empty">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#94a3b8" stroke-width="1.8"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <p>No applications submitted yet under this account.</p>
          <span style="font-size: 0.75rem; color: #94a3b8;">Click "Submit New Application" to join the NexaTech international team.</span>
        </div>
      `;
      return;
    }

    applicationsList.innerHTML = apps.map(app => `
      <div class="application-card-item">
        <div class="app-card-top">
          <span class="app-location">📍 ${app.country || 'Global Partner'}</span>
          <span class="app-status-badge ${app.status === 'Approved' ? 'approved' : ''}">
            ● ${app.status || 'Under Review'}
          </span>
        </div>
        <div class="app-card-meta">
          <strong>Applicant:</strong> ${app.name || 'Partner'} (${app.email || 'Email provided'})<br/>
          <strong>VMware Status:</strong> ${app.vmwareStatus || 'Ready'}<br/>
          ${app.notes ? `<strong>Notes:</strong> "${app.notes}"<br/>` : ''}
          <span style="font-size: 0.7rem; color: #94a3b8;">Review Window: 4–6 hours by Singapore Lead</span>
        </div>
      </div>
    `).join('');
  }

  function closeApplicationsModal() {
    if (!applicationsModal) return;
    applicationsModal.classList.remove('active');
    applicationsModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (openMyApplicationsBtn) openMyApplicationsBtn.addEventListener('click', openApplicationsModal);
  if (appModalCloseBtn) appModalCloseBtn.addEventListener('click', closeApplicationsModal);
  if (appModalDismissBtn) appModalDismissBtn.addEventListener('click', closeApplicationsModal);
  if (appModalBackdrop) appModalBackdrop.addEventListener('click', closeApplicationsModal);

  // =========================================================================
  // 12. GEMINI MULTI-TURN AI ADVISOR CHATBOT ENGINE
  // =========================================================================
  const aiChatDrawer = document.getElementById('aiChatDrawer');
  const aiChatBackdrop = document.getElementById('aiChatBackdrop');
  const aiChatCloseBtn = document.getElementById('aiChatCloseBtn');
  const openChatBtns = document.querySelectorAll('.open-ai-chat-btn');
  const openChatFromMenuBtn = document.getElementById('openChatFromMenuBtn');
  const aiMessagesThread = document.getElementById('aiMessagesThread');
  const aiChatInputForm = document.getElementById('aiChatInputForm');
  const aiChatInput = document.getElementById('aiChatInput');
  const aiSendBtn = document.getElementById('aiSendBtn');
  const aiModelSelect = document.getElementById('aiModelSelect');
  const aiModeTabs = document.querySelectorAll('.ai-mode-tab');
  const aiModeIndicator = document.getElementById('aiModeIndicator');
  const aiClearHistoryBtn = document.getElementById('aiClearHistoryBtn');
  const promptChips = document.querySelectorAll('.prompt-chip');

  let activeChatMode = 'chat'; // 'chat' | 'search' | 'maps'
  let conversationHistory = []; // Array of { role: 'user' | 'model', text: string }

  function openAiChat() {
    if (!aiChatDrawer) return;
    aiChatDrawer.classList.add('active');
    aiChatDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => aiChatInput?.focus(), 150);
  }

  function closeAiChat() {
    if (!aiChatDrawer) return;
    aiChatDrawer.classList.remove('active');
    aiChatDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  openChatBtns.forEach(btn => btn.addEventListener('click', openAiChat));
  if (openChatFromMenuBtn) openChatFromMenuBtn.addEventListener('click', openAiChat);
  if (aiChatCloseBtn) aiChatCloseBtn.addEventListener('click', closeAiChat);
  if (aiChatBackdrop) aiChatBackdrop.addEventListener('click', closeAiChat);

  // Switch Chat Mode Tabs
  aiModeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      aiModeTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      activeChatMode = tab.getAttribute('data-mode') || 'chat';

      const model = aiModelSelect?.value || 'gemini-3.5-flash';
      if (aiModeIndicator) {
        if (activeChatMode === 'search') {
          aiModeIndicator.innerHTML = `<span class="mode-dot" style="background: #10b981;"></span><span class="mode-text">Mode: Google Search Grounded (${model})</span>`;
          if (aiChatInput) aiChatInput.placeholder = 'Search live technical & global engineering information...';
        } else if (activeChatMode === 'maps') {
          aiModeIndicator.innerHTML = `<span class="mode-dot" style="background: #f59e0b;"></span><span class="mode-text">Mode: Google Maps Grounded (${model})</span>`;
          if (aiChatInput) aiChatInput.placeholder = 'Ask about Singapore tech hub, European partner cities, locations...';
        } else {
          aiModeIndicator.innerHTML = `<span class="mode-dot" style="background: #0284c7;"></span><span class="mode-text">Mode: Multi-Turn Conversation (${model})</span>`;
          if (aiChatInput) aiChatInput.placeholder = 'Ask a question about NexaTech partnership, VMware, or tech...';
        }
      }
    });
  });

  // Model Selection Change
  if (aiModelSelect) {
    aiModelSelect.addEventListener('change', () => {
      const model = aiModelSelect.value;
      const tabName = activeChatMode === 'search' ? 'Search Grounded' : activeChatMode === 'maps' ? 'Maps Grounded' : 'Multi-Turn Conversation';
      if (aiModeIndicator) {
        const dotColor = activeChatMode === 'search' ? '#10b981' : activeChatMode === 'maps' ? '#f59e0b' : '#0284c7';
        aiModeIndicator.innerHTML = `<span class="mode-dot" style="background: ${dotColor};"></span><span class="mode-text">Mode: ${tabName} (${model})</span>`;
      }
      showToast(`Model switched to ${model}`);
    });
  }

  // Clear Chat History
  if (aiClearHistoryBtn) {
    aiClearHistoryBtn.addEventListener('click', () => {
      conversationHistory = [];
      if (aiMessagesThread) {
        aiMessagesThread.innerHTML = `
          <div class="ai-message-row model-message">
            <div class="ai-msg-avatar">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none"><path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="#0284c7" /></svg>
            </div>
            <div class="ai-msg-bubble">
              <p>Conversation restarted. How can I assist you with NexaTech's global engineering solutions?</p>
              <div class="ai-timestamp">Just now</div>
            </div>
          </div>
        `;
      }
      showToast('Conversation cleared.');
    });
  }

  // Quick Prompt Chips
  promptChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt');
      if (prompt && aiChatInput) {
        aiChatInput.value = prompt;
        sendMessage();
      }
    });
  });

  // Render Markdown / formatted text safely
  function formatAiResponse(rawText) {
    if (!rawText) return '';
    let text = rawText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Bold **text**
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic *text*
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Inline code `code`
    text = text.replace(/`([^`]+)`/g, '<code style="background: #f1f5f9; padding: 2px 5px; border-radius: 4px; font-family: monospace; font-size: 0.85em;">$1</code>');

    // Bullet points
    const lines = text.split('\n');
    let inList = false;
    let result = [];

    for (let line of lines) {
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        if (!inList) {
          result.push('<ul class="ai-bullet-list">');
          inList = true;
        }
        result.push(`<li>${line.trim().substring(2)}</li>`);
      } else {
        if (inList) {
          result.push('</ul>');
          inList = false;
        }
        if (line.trim()) {
          result.push(`<p>${line}</p>`);
        }
      }
    }
    if (inList) result.push('</ul>');

    return result.join('');
  }

  // Scroll messages to bottom
  function scrollChatToBottom() {
    if (aiMessagesThread) {
      aiMessagesThread.scrollTop = aiMessagesThread.scrollHeight;
    }
  }

  // Append Message Row
  function appendMessage(role, contentHtml, groundingHtml = '') {
    if (!aiMessagesThread) return;
    const row = document.createElement('div');
    row.className = `ai-message-row ${role === 'user' ? 'user-message' : 'model-message'}`;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (role === 'user') {
      row.innerHTML = `
        <div class="ai-msg-avatar">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        </div>
        <div class="ai-msg-bubble">
          <div>${contentHtml}</div>
          <div class="ai-timestamp" style="color: rgba(255,255,255,0.7);">${timeStr}</div>
        </div>
      `;
    } else {
      row.innerHTML = `
        <div class="ai-msg-avatar">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none"><path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="#0284c7" /></svg>
        </div>
        <div class="ai-msg-bubble">
          <div>${contentHtml}</div>
          ${groundingHtml}
          <div class="ai-timestamp">${timeStr}</div>
        </div>
      `;
    }

    aiMessagesThread.appendChild(row);
    scrollChatToBottom();
  }

  // Typing Indicator
  let typingRow = null;
  function showTypingIndicator() {
    if (!aiMessagesThread) return;
    typingRow = document.createElement('div');
    typingRow.className = 'ai-message-row model-message typing-indicator-row';
    typingRow.innerHTML = `
      <div class="ai-msg-avatar">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none"><path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="#0284c7" /></svg>
      </div>
      <div class="ai-msg-bubble" style="display: flex; align-items: center; gap: 4px; padding: 10px 16px;">
        <span class="status-pulse-dot" style="background: #0284c7;"></span>
        <span class="status-pulse-dot" style="background: #38bdf8; animation-delay: 0.2s;"></span>
        <span class="status-pulse-dot" style="background: #00f2fe; animation-delay: 0.4s;"></span>
        <span style="font-size: 0.76rem; color: #64748b; margin-left: 6px;">Gemini is analyzing...</span>
      </div>
    `;
    aiMessagesThread.appendChild(typingRow);
    scrollChatToBottom();
  }

  function hideTypingIndicator() {
    if (typingRow && typingRow.parentNode) {
      typingRow.parentNode.removeChild(typingRow);
      typingRow = null;
    }
  }

  // Send Message Logic
  async function sendMessage() {
    if (!aiChatInput) return;
    const text = aiChatInput.value.trim();
    if (!text) return;

    aiChatInput.value = '';
    aiChatInput.style.height = 'auto';
    if (aiSendBtn) aiSendBtn.disabled = true;

    // Render user message in UI
    appendMessage('user', text.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
    conversationHistory.push({ role: 'user', text });

    showTypingIndicator();

    const selectedModel = aiModelSelect?.value || 'gemini-3.5-flash';

    try {
      if (activeChatMode === 'search') {
        // 1. Google Search Grounding Request
        const res = await fetch('/api/search-grounding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: text })
        });
        const data = await res.json();
        hideTypingIndicator();

        if (data.error) throw new Error(data.error);

        let groundingHtml = '';
        if (data.sources && data.sources.length > 0) {
          groundingHtml = `
            <div class="ai-grounding-card">
              <div class="grounding-header">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <span>Google Search Sources</span>
              </div>
              <div class="sources-list">
                ${data.sources.map(s => `<a href="${s.url}" target="_blank" rel="noopener noreferrer" class="source-chip" title="${s.title}">${s.title.substring(0, 30)}... ↗</a>`).join('')}
              </div>
            </div>
          `;
        }

        const formatted = formatAiResponse(data.text);
        appendMessage('model', formatted, groundingHtml);
        conversationHistory.push({ role: 'model', text: data.text });

      } else if (activeChatMode === 'maps') {
        // 2. Google Maps Grounding Request
        const res = await fetch('/api/maps-grounding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locationQuery: text })
        });
        const data = await res.json();
        hideTypingIndicator();

        if (data.error) throw new Error(data.error);

        let groundingHtml = `
          <div class="ai-grounding-card" style="background: #fefce8; border-color: #fde047;">
            <div class="grounding-header" style="color: #a16207;">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon></svg>
              <span>Google Maps Grounded Location Context</span>
            </div>
            <p style="font-size: 0.74rem; color: #854d0e; margin: 2px 0 0;">Geographic intelligence grounded via Google Maps APIs for Singapore & global partner hubs.</p>
          </div>
        `;

        const formatted = formatAiResponse(data.text);
        appendMessage('model', formatted, groundingHtml);
        conversationHistory.push({ role: 'model', text: data.text });

      } else {
        // 3. Multi-Turn Gemini Conversation Request
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: conversationHistory,
            model: selectedModel
          })
        });
        const data = await res.json();
        hideTypingIndicator();

        if (data.error) throw new Error(data.error);

        const formatted = formatAiResponse(data.text);
        appendMessage('model', formatted);
        conversationHistory.push({ role: 'model', text: data.text });
      }
    } catch (err) {
      console.error('Chat error:', err);
      hideTypingIndicator();
      appendMessage('model', `<p style="color: #ef4444;">I encountered an issue processing your request: "${err.message || 'Network error'}". Please try again or switch model.</p>`);
    } finally {
      if (aiSendBtn) aiSendBtn.disabled = false;
      aiChatInput?.focus();
    }
  }

  // Handle Form Submit
  if (aiChatInputForm) {
    aiChatInputForm.addEventListener('submit', (e) => {
      e.preventDefault();
      sendMessage();
    });
  }

  // Auto-resize and Enter key on textarea
  if (aiChatInput) {
    aiChatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    aiChatInput.addEventListener('input', () => {
      aiChatInput.style.height = 'auto';
      aiChatInput.style.height = Math.min(aiChatInput.scrollHeight, 120) + 'px';
    });
  }
});
