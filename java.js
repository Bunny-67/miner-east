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
  // Section View Transitions (Services → Assignments → History → Contact)
  // ================================================
  const views = document.querySelectorAll('.view');

  if (views.length > 0) {
    const viewObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.2
    });

    views.forEach(view => viewObserver.observe(view));
  }

  
  // ================================================
  // Hero → Secondary Landing Transition + Nav Reveal
  // ================================================
  const hero = document.querySelector('.hero');
  const secondary = document.querySelector('.secondary-landing');
  const topNav = document.querySelector('.top-nav');

  let hasScrolled = false;

  // Find the "Home" anchor and parent list item
  const homeAnchor = document.querySelector('.top-nav a[href="#home"]') || document.querySelector('a[href="#home"]');
  const homeLi = homeAnchor ? homeAnchor.closest('li') : null;

  // Smooth scroll to top when clicking "Home"
  if (homeAnchor) {
    homeAnchor.addEventListener('click', (event) => {
      event.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }

  // Hide Home link if at top on page load
  if (homeLi && window.scrollY <= 5) {
    homeLi.style.display = 'none';
  }

  // ================================================
  // Scroll Handler Logic
  // ================================================
const onScroll = () => {
    const scrollY = window.scrollY || window.pageYOffset;

    // Hero -> Secondary Transition
    if (hero && secondary) {
      if (scrollY > 5 && !hasScrolled) {
        hero.classList.add('move-up');
        secondary.classList.add('reveal');
        if (topNav) topNav.classList.add('visible');
        hasScrolled = true;
        setTimeout(() => {
      window.scrollTo({
          top: window.innerHeight,
          behavior: 'smooth'
        });
      }, 300);
      } else if (scrollY <= 0 && hasScrolled) {
        hero.classList.remove('move-up');
        secondary.classList.remove('reveal');
        if (topNav) topNav.classList.remove('visible');
        hasScrolled = false;
      }
    } else if (topNav) {
      // Fallback behavior
      const trigger = window.innerHeight * 0.5;
      if (scrollY > trigger) topNav.classList.add('visible');
      else topNav.classList.remove('visible');
    }

    // Hide/show Home link visibility
    if (homeLi) {
      if (scrollY <= 5) {
        homeLi.style.display = 'none';
      } else {
        homeLi.style.display = '';
      }
    }
  };

  // ================================================
  // Throttle Function
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

  // Attach throttled scroll handler (runs 100ms max)
  const throttledScroll = throttle(onScroll, 100);
  window.addEventListener('scroll', throttledScroll, { passive: true });

  // Initial run
  onScroll();

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
    }, {
      threshold: 0.5
    });

    allSections.forEach(section => observer.observe(section));
  }


});