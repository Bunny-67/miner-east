document.addEventListener('DOMContentLoaded', () => {
  'use strict';

    const ua = navigator.userAgent || '';
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    const isIOS = /iphone|ipad|ipod/i.test(ua);


  // ================================================
  // Fade-in on Scroll for legacy .section
  // ================================================
  const sections = document.querySelectorAll('.section');
  if (sections.length > 0) {
    const appearOptions = {
      threshold: 0.2,
      rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, appearOptions);

    sections.forEach(section => {
      appearOnScroll.observe(section);
    });
  }

  // ================================================
  // Section View Transitions (.view visibility)
  // ================================================
  const views = document.querySelectorAll('.view');
  if (views.length > 0) {
    const viewObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.2 });

    views.forEach(view => viewObserver.observe(view));
  }

  // ================================================
  // Hero / Secondary wiring
  // ================================================
  const hero = document.querySelector('.hero');
  const secondary = document.querySelector('.secondary-landing');
  const topNav = document.querySelector('.top-nav');
  const mainEl = document.querySelector('main');

  const heroNavBar = document.querySelector('.hero-nav');

  const updateHeroNavContrast = () => {
      if (!heroNavBar) return;

      if (window.innerWidth > 800) {
        heroNavBar.classList.remove('hero-nav--on-light');
        return;
      }

      if (hero) {
        const rect = hero.getBoundingClientRect();
        const navHeight = heroNavBar.offsetHeight || 60;

        if (rect.bottom <= navHeight + 8) {
          heroNavBar.classList.add('hero-nav--on-light');
        } else {
          heroNavBar.classList.remove('hero-nav--on-light');
        }
      }
    };

  window.addEventListener('scroll', updateHeroNavContrast, { passive: true });
  window.addEventListener('resize', updateHeroNavContrast);
  updateHeroNavContrast();


  const isMobileWidth = window.matchMedia('(max-width: 800px)').matches;
  const isMobile = isMobileWidth || isIOS;
  const isSafariDesktop = isSafari && !isIOS && !isMobileWidth;

  let hasScrolled = false;
  let isAutoScrolling = false;
  let holdAtIntroUntil = 0;
  const SNAP_TOL = 3;

  const getMainTop = () => (mainEl ? mainEl.offsetTop : window.innerHeight);

  const smoothScrollTo = (y) => {
    isAutoScrolling = true;
    window.scrollTo({ top: y, behavior: 'smooth' });
    const check = () => {
      const cur = window.scrollY || window.pageYOffset;
      if (Math.abs(cur - y) <= SNAP_TOL) {
        isAutoScrolling = false;
        return;
      }
      requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
  };

  // ================================================
  // Home anchor logic 
  // ================================================
  const homeAnchors = document.querySelectorAll('.top-nav a[href="#home"]');

  const goHome = (event) => {
    event?.preventDefault?.();
    hero?.classList.remove('move-up');
    secondary?.classList.remove('reveal');
    topNav?.classList.remove('visible');
    hasScrolled = false;
    isAutoScrolling = false;
    smoothScrollTo(0);
  };

  homeAnchors.forEach(a => a.addEventListener('click', goHome));

  const homeLi =
    document.querySelector('.top-nav .nav-links a[href="#home"]')?.closest('li') || null;

  if (homeLi && (window.scrollY || window.pageYOffset) <= 5) {
    homeLi.style.display = 'none';
  }
  if (isMobile && homeLi) {
    homeLi.style.display = '';
  }

  // ================================================
  // Hero & Top-Nav anchor links 
  // ================================================
  const navLinks = document.querySelectorAll(
    '.hero-nav a[href^="#"]:not(.nav-home), .top-nav a[href^="#"]:not([href="#home"])'
  );

  navLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const targetId = link.getAttribute('href');
      const target = document.querySelector(targetId);
      if (!target) return;

      const scrollY = window.scrollY || window.pageYOffset;
      if (scrollY < window.innerHeight * 0.5 && hero && secondary) {
        hero.classList.add('move-up');
        secondary.classList.add('reveal');
        topNav?.classList.add('visible');
        hasScrolled = true;

        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 350);
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ================================================
  // Scroll Handler Logic 
  // ================================================
  const onScroll = () => {
    if (isMobile || isSafariDesktop) return;
    if (isAutoScrolling) return;

    const scrollY = window.scrollY || window.pageYOffset;
    const mainTop = getMainTop();

    if (hero && secondary) {
      if (scrollY > 5 && !hasScrolled) {
        hero.classList.add('move-up');
        secondary.classList.add('reveal');
        topNav?.classList.add('visible');
        hasScrolled = true;

        holdAtIntroUntil = Date.now() + 250;
        smoothScrollTo(mainTop);
        return;
      }

      if (hasScrolled && scrollY <= 2) {
        hero.classList.remove('move-up');
        secondary.classList.remove('reveal');
        topNav?.classList.remove('visible');
        hasScrolled = false;
        return;
      }

      const nearIntroTop = Math.abs(scrollY - mainTop) <= 12;
      if (hasScrolled && nearIntroTop) {
        if (Date.now() < holdAtIntroUntil) {
          window.scrollTo({ top: mainTop });
          return;
        }
      }
    } else if (topNav) {
      const trigger = window.innerHeight * 0.5;
      if (scrollY > trigger) topNav.classList.add('visible');
      else topNav.classList.remove('visible');
    }

    if (homeLi) {
      homeLi.style.display = scrollY <= 5 ? 'none' : '';
    }
  };

  // ================================================
  // Throttle utility
  // ================================================
  const throttle = (func, limit) => {
    let lastFunc;
    let lastRan;
    return function(...args) {
      const context = this;
      if (!lastRan) {
        func.apply(context, args);
        lastRan = Date.now();
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(function() {
          if ((Date.now() - lastRan) >= limit) {
            func.apply(context, args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    };
  };

  const throttledScroll = throttle(onScroll, 100);

  if (isSafariDesktop) {
    if (hero && secondary) {
      hero.classList.add('move-up');
      secondary.classList.add('reveal');
      topNav?.classList.add('visible');
      hasScrolled = true;
    }
  } else {
    window.addEventListener('scroll', throttledScroll, { passive: true });
    onScroll();

    // ================================================
    // Upward intent detection
    // ================================================
    if (!isMobile) {
      window.addEventListener('wheel', (e) => {
        if (isAutoScrolling) return;

        const mainTop = getMainTop();
        const scrollY = window.scrollY || window.pageYOffset;

        if (hasScrolled && e.deltaY < 0 && scrollY < mainTop * 0.6) {
          e.preventDefault();
          holdAtIntroUntil = 0;
          hero?.classList.remove('move-up');
          secondary?.classList.remove('reveal');
          topNav?.classList.remove('visible');
          hasScrolled = false;
          smoothScrollTo(0);
          return;
        }

        const nearIntroTop = Math.abs(scrollY - mainTop) <= 12;
        if (hasScrolled && nearIntroTop && e.deltaY < 0) {
          e.preventDefault();
          holdAtIntroUntil = 0;
          hero?.classList.remove('move-up');
          secondary?.classList.remove('reveal');
          topNav?.classList.remove('visible');
          hasScrolled = false;
          smoothScrollTo(0);
        }
      }, { passive: false });
    }
  }

  // ================================================
  // Cinematic View Transitions Between Sections
  // ================================================
  const allSections = document.querySelectorAll('main > section');
  if (allSections.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active-view');
        } else {
          entry.target.classList.remove('active-view');
        }
      });
    }, { threshold: 0.5 });
    allSections.forEach(section => observer.observe(section));
  }

  // ================================================
  // Hero Nav shortcut to Team (Meet the Team)
  // ================================================
  const heroHome = document.querySelector('.hero-nav a.nav-home');
  const introSection = document.querySelector('#intro');
  if (heroHome && introSection) {
    heroHome.addEventListener('click', (event) => {
      event.preventDefault();
      introSection.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // ================================================
  // Quick #services smooth-scroll hooks
  // ================================================
  document.querySelectorAll('a[href="#services"]').forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const target = document.querySelector('#services');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ================================================
  // Team Member Modal Logic
  // ================================================
  const teamMembers = document.querySelectorAll('.team-member');
  const modal = document.getElementById('teamModal');
  const modalImage = document.getElementById('modalImage');
  const modalName = document.getElementById('modalName');
  const modalRole = document.getElementById('modalRole');
  const modalJoined = document.getElementById('modalJoined');
  const modalContact = document.getElementById('modalContact');
  const modalBio = document.getElementById('modalBio');
  const modalClose = document.querySelector('.team-modal-close');

  teamMembers.forEach(member => {
    member.addEventListener('click', () => {
      const img = member.querySelector('img');
      if (img) modalImage.src = img.src;
      modalName.textContent = member.dataset.name || '';
      modalRole.textContent = member.dataset.role || '';
      modalJoined.textContent = member.dataset.joined || '';
      modalContact.textContent = member.dataset.contact || '';
      modalBio.textContent = member.dataset.bio || '';
      modal.classList.add('show');
      document.body.style.overflow = 'hidden'; 
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', () => {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
      }
    });
  }

  // ================================================
  // Make top-left nav logo go Home 
  // ================================================
  const topLogo = document.querySelector('.top-nav .nav-logo');
  if (topLogo) {
    topLogo.style.cursor = 'pointer';
    topLogo.addEventListener('click', (e) => {
      if (topLogo.tagName.toLowerCase() === 'a') e.preventDefault();
      hero?.classList.remove('move-up');
      secondary?.classList.remove('reveal');
      topNav?.classList.remove('visible');
      hasScrolled = false;
      isAutoScrolling = false;
      smoothScrollTo(0);
    });
  }

    // ================================================
    // Nav Toggle
    // ================================================
      const navToggle = document.querySelector('.top-nav .nav-toggle');
      const topNavLinks = document.querySelector('.top-nav .nav-links');

      if (navToggle && topNavLinks) {
        navToggle.addEventListener('click', () => {
          const isOpen = navToggle.classList.toggle('is-open');
          navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
          topNavLinks.classList.toggle('open', isOpen);
        });

        topNavLinks.querySelectorAll('a').forEach(a => {
          a.addEventListener('click', () => {
            if (window.innerWidth <= 800) {
              navToggle.classList.remove('is-open');
              navToggle.setAttribute('aria-expanded', 'false');
              topNavLinks.classList.remove('open');
            }
          });
        });
      }

      // ================================================
      // Services "word cloud" -> History 
      // ================================================
      const cloudItems = document.querySelectorAll('.values-list li');
      const historyEl = document.querySelector('#history');
      if (cloudItems.length && historyEl) {
        const goHistory = (evt) => {
          evt?.preventDefault?.();
          historyEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };

        cloudItems.forEach(li => {
          li.setAttribute('tabindex', '0');
          li.addEventListener('click', goHistory);
          li.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') goHistory(e);
          });
        });
      }

    // ================================================
    // Assignments: filter controls 
    // ================================================
    const filterBar = document.querySelector('.assignments-filter');
    const filterButtons = document.querySelectorAll('.assignments-filter .filter-btn');
    const assignmentCards = document.querySelectorAll('.assignments-grid .assignment-card');

    if (filterBar && filterButtons.length && assignmentCards.length) {
      const applyFilter = (status) => {
        assignmentCards.forEach(card => {
          const s = card.getAttribute('data-status');
          const show = (status === 'all') || (s === status);
          card.classList.toggle('is-hidden', !show);
        });
      };

      filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          filterButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          filterButtons.forEach(b => b.setAttribute('aria-selected', b === btn ? 'true' : 'false'));

          applyFilter(btn.getAttribute('data-filter') || 'all');
        });
      });

      applyFilter('all');
    }

  // ================================================
  // Assignments: Marquee 
  // ================================================
  const sourceWrap = document.querySelector('.assignments-source');
  const marquee = document.querySelector('.assignments-marquee');
  const rows = marquee ? marquee.querySelectorAll('.marquee-row .marquee-track') : [];
  const toggleBtn = document.querySelector('.view-static-btn');
  const staticPanel = document.querySelector('.assignments-static');
  const staticStrip = staticPanel ? staticPanel.querySelector('.static-strip') : null;
  const staticPrev = staticPanel ? staticPanel.querySelector('.static-prev') : null;
  const staticNext = staticPanel ? staticPanel.querySelector('.static-next') : null;
  const staticClose = staticPanel ? staticPanel.querySelector('.static-close') : null;
  const pageIndicator = staticPanel ? staticPanel.querySelector('.static-page-indicator') : null;

  const gatherCards = () => {
    const active = document.querySelector('.assignments-filter .filter-btn.active');
    const status = active ? (active.getAttribute('data-filter') || 'all') : 'all';
    const all = sourceWrap ? Array.from(sourceWrap.querySelectorAll('.assignment-card')) : [];
    return status === 'all' ? all : all.filter(c => (c.getAttribute('data-status') || '') === status);
  };

  const buildMarquee = () => {
    if (!rows.length) return;
    rows.forEach(track => (track.innerHTML = ''));
    const cards = gatherCards();
    if (!cards.length) return;

    const buckets = [[], [], []];
    cards.forEach((card, i) => buckets[i % 3].push(card));

    buckets.forEach((bucket, idx) => {
      const track = rows[idx];
      const frag = document.createDocumentFragment();
      bucket.forEach(c => frag.appendChild(c.cloneNode(true)));
      bucket.forEach(c => frag.appendChild(c.cloneNode(true))); // duplicate for -50% loop
      track.appendChild(frag);

      const rowEl = track.closest('.marquee-row');
      const sp = rowEl ? parseInt(rowEl.getAttribute('data-speed'), 10) : 40;
      track.style.animationDuration = `${isFinite(sp) ? sp : 40}s`;
    });
  };

  let staticState = { page: 0, pages: 0 };
  const buildStatic = () => {
    if (!staticStrip) return;
    staticStrip.innerHTML = '';
    const cards = gatherCards().map(c => c.cloneNode(true));
    const perPage = (window.matchMedia && window.matchMedia('(max-width: 800px)').matches)
      ? 3
      : 9;
    const pages = Math.max(1, Math.ceil(cards.length / perPage));
    staticState.page = 0;
    staticState.pages = pages;

    for (let p = 0; p < pages; p++) {
      const pageEl = document.createElement('div');
      pageEl.className = 'static-page';
      const slice = cards.slice(p * perPage, p * perPage + perPage);
      slice.forEach(card => pageEl.appendChild(card));
      staticStrip.appendChild(pageEl);
    }
    updateStaticUI();
  };

  const updateStaticUI = () => {
    if (!staticStrip) return;
    staticStrip.style.transform = `translateX(-${staticState.page * 100}%)`;
    if (pageIndicator) pageIndicator.textContent = `${staticState.page + 1} / ${staticState.pages}`;
  };

  const gotoPage = (p) => {
    staticState.page = (p + staticState.pages) % staticState.pages;
    updateStaticUI();
  };

  const openStatic = () => {
    if (!staticPanel || !marquee || !toggleBtn) return;
    marquee.hidden = true;
    staticPanel.hidden = false;
    buildStatic();
    toggleBtn.textContent = 'Close Static View';
    toggleBtn.setAttribute('aria-pressed', 'true');
    toggleBtn.classList.add('is-open');
    toggleBtn.style.display = 'none';
  };

  const openMarquee = () => {
    if (!staticPanel || !marquee || !toggleBtn) return;
    staticPanel.hidden = true;
    marquee.hidden = false;
    buildMarquee();
    toggleBtn.textContent = 'Open Static View';
    toggleBtn.setAttribute('aria-pressed', 'false');
    toggleBtn.classList.remove('is-open');
    toggleBtn.style.display = 'inline-block';
  };

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (toggleBtn.classList.contains('is-open')) openMarquee();
      else openStatic();
    });
  }

  if (staticClose) staticClose.addEventListener('click', openMarquee);

  if (staticPrev) staticPrev.addEventListener('click', () => gotoPage(staticState.page - 1));
  if (staticNext) staticNext.addEventListener('click', () => gotoPage(staticState.page + 1));

  const filterBtns = document.querySelectorAll('.assignments-filter .filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterBtns.forEach(b => b.setAttribute('aria-selected', b === btn ? 'true' : 'false'));
      if (staticPanel && !staticPanel.hidden) buildStatic();
      else buildMarquee();
    });
  });

  if (window.matchMedia && window.matchMedia('(max-width: 800px)').matches) {
    if (staticPanel) {
      staticPanel.hidden = false;
      if (marquee) marquee.hidden = true;
      buildStatic();
    }
  } else {
    openMarquee();
  }


    const mobViewport = document.querySelector('.assignments-mobile-viewport');
    const mobUp = document.querySelector('.assignments-scroll-up');
    const mobDown = document.querySelector('.assignments-scroll-down');

    if (mobViewport && mobUp && mobDown) {
      const scrollStep = 200;
      mobUp.addEventListener('click', () => {
        mobViewport.scrollBy({ top: -scrollStep, behavior: 'smooth' });
      });
      mobDown.addEventListener('click', () => {
        mobViewport.scrollBy({ top: scrollStep, behavior: 'smooth' });
      });
    }

});