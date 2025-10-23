document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ================================================
  // Fade-in on Scroll for Page Sections
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
  // Section View Transitions 
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
  // Hero → Secondary 
  // ================================================
  const hero = document.querySelector('.hero');
  const secondary = document.querySelector('.secondary-landing');
  const topNav = document.querySelector('.top-nav');
  const mainEl = document.querySelector('main');

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
  // Home anchor logic (Top Nav)
  // ================================================
  const homeAnchor = document.querySelector('.top-nav a[href="#home"]');
  const homeLi = homeAnchor ? homeAnchor.closest('li') : null;

  if (homeAnchor) {
    homeAnchor.addEventListener('click', (event) => {
      event.preventDefault();
      hero.classList.remove('move-up');
      secondary.classList.remove('reveal');
      if (topNav) topNav.classList.remove('visible');
      hasScrolled = false;
      isAutoScrolling = false;
      smoothScrollTo(0);
    });
  }

  if (homeLi && window.scrollY <= 5) {
    homeLi.style.display = 'none';
  }

  // ================================================
  // Hero Nav Direct Section Links 
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
          if (topNav) topNav.classList.add('visible');
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
    if (isAutoScrolling) return;

    const scrollY = window.scrollY || window.pageYOffset;
    const mainTop = getMainTop();

    // --- Down: Hero -> Secondary ---
    if (hero && secondary) {
      if (scrollY > 5 && !hasScrolled) {
        hero.classList.add('move-up');
        secondary.classList.add('reveal');
        if (topNav) topNav.classList.add('visible');
        hasScrolled = true;

        holdAtIntroUntil = Date.now() + 250;
        smoothScrollTo(mainTop);
        return;
      }

      // --- Up: Secondary -> Hero ---
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
  // Throttle
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
  window.addEventListener('scroll', throttledScroll, { passive: true });
  onScroll();

  // ================================================
  // Upward intent detection (wheel event)
  // ================================================
  window.addEventListener('wheel', (e) => {
    if (isAutoScrolling || !hasScrolled) return;

    const mainTop = getMainTop();
    const scrollY = window.scrollY || window.pageYOffset;
    const nearIntroTop = Math.abs(scrollY - mainTop) <= 12;

    if (nearIntroTop && e.deltaY < 0) {
      e.preventDefault();
      holdAtIntroUntil = 0;
      hero.classList.remove('move-up');
      secondary.classList.remove('reveal');
      if (topNav) topNav.classList.remove('visible');
      hasScrolled = false;
      smoothScrollTo(0);
    }
  }, { passive: false });

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
  // Hero Nav
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
  // Hero 
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
        modalImage.src = member.querySelector('img').src;
        modalName.textContent = member.dataset.name || '';
        modalRole.textContent = member.dataset.role || '';
        modalJoined.textContent = member.dataset.joined || '';
        modalContact.textContent = member.dataset.contact || '';
        modalBio.textContent = member.dataset.bio || '';
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // prevent scroll while open
      });
    });

    modalClose.addEventListener('click', () => {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
      }
    });


});
