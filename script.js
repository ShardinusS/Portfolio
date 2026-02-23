/* =====================================================
   KENZO METGY PORTFOLIO - SCRIPT
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ── Remove no-js flag ──
  document.documentElement.classList.remove('no-js');

  // ── Initialize Lucide Icons ──
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // ── Global: reduced motion preference (reactive) ──
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  reducedMotionQuery.addEventListener('change', (e) => {
    if (e.matches) {
      document.querySelectorAll('.reveal-item').forEach(el => {
        el.classList.add('revealed');
      });
    }
  });
  
  // ── Custom Cursor ──
  let cursor = document.querySelector('.cursor-follow');
  
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && cursor) {
    document.body.classList.add('js-custom-cursor');

    let cursorX = 0, cursorY = 0, rafId = null;
    document.addEventListener('mousemove', (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      cursor.style.opacity = '1';
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          cursor.style.left = cursorX + 'px';
          cursor.style.top = cursorY + 'px';
          rafId = null;
        });
      }
    }, { passive: true });

    // Hide cursor when mouse leaves the window
    document.addEventListener('mouseleave', () => {
      cursor.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursor.style.opacity = '1';
    });

    // Grow cursor on interactive elements (delegation for dynamic elements)
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('a, button, [role="button"]')) {
        cursor.style.width = '32px';
        cursor.style.height = '32px';
      }
    }, { passive: true });
    document.addEventListener('mouseout', (e) => {
      const interactive = e.target.closest('a, button, [role="button"]');
      if (interactive && !interactive.contains(e.relatedTarget)) {
        cursor.style.width = '12px';
        cursor.style.height = '12px';
      }
    }, { passive: true });
  } else if (cursor) {
    cursor.remove();
    cursor = null;
  }

  // ── Mobile Hamburger Menu ──
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');

  if (menuToggle && nav) {
    const navLinksMenu = nav.querySelectorAll('.nav-link');
    const navFocusable = nav.querySelectorAll('a[href], button, [tabindex]:not([tabindex="-1"])');
    const firstFocusable = navFocusable[0];
    const lastFocusable = navFocusable[navFocusable.length - 1];

    const closeMenu = (restoreFocus = true) => {
      nav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Ouvrir le menu');
      document.body.classList.remove('menu-open');
      if (restoreFocus) menuToggle.focus();
    };

    const openMenu = () => {
      nav.classList.add('open');
      menuToggle.setAttribute('aria-expanded', 'true');
      menuToggle.setAttribute('aria-label', 'Fermer le menu');
      document.body.classList.add('menu-open');
      if (firstFocusable) firstFocusable.focus();
    };

    menuToggle.addEventListener('click', () => {
      nav.classList.contains('open') ? closeMenu() : openMenu();
    });

    // Close menu when a nav link is clicked
    navLinksMenu.forEach(link => {
      link.addEventListener('click', () => closeMenu());
    });

    // Close on click outside (on the overlay background)
    nav.addEventListener('click', (e) => {
      if (e.target === nav) closeMenu();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        closeMenu();
      }
    });

    // Focus trap: cycle Tab within nav + menuToggle when open
    nav.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab' || !nav.classList.contains('open')) return;
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          menuToggle.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          menuToggle.focus();
        }
      }
    });

    // Include menuToggle in focus trap when menu is open
    menuToggle.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab' || !nav.classList.contains('open')) return;
      e.preventDefault();
      if (e.shiftKey) {
        lastFocusable.focus();
      } else {
        firstFocusable.focus();
      }
    });

    // Close menu if window resized past mobile breakpoint
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth >= 900 && nav.classList.contains('open')) {
          closeMenu(false);
        }
      }, 100);
    });
  }

  // ── Active Navigation on Scroll ──
  const sections = document.querySelectorAll('section[id], footer[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const observerOptions = {
    threshold: 0.15,
    rootMargin: "-20% 0px -30% 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    let best = null;
    entries.forEach(entry => {
      if (entry.isIntersecting && (!best || entry.intersectionRatio > best.intersectionRatio)) {
        best = entry;
      }
    });
    if (best) {
      navLinks.forEach(link => link.classList.remove('active'));
      const id = best.target.getAttribute('id');
      const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
      if (activeLink) activeLink.classList.add('active');
    }
  }, observerOptions);

  sections.forEach(section => observer.observe(section));

  // ── Smooth Scroll for Anchor Links ──
  document.querySelectorAll('a[href^="#"]:not([download])').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        targetSection.scrollIntoView({
        behavior: reducedMotionQuery.matches ? 'auto' : 'smooth'
        });
      }
    });
  });

  // ── Dynamic Copyright Year ──
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ── Copy Email to Clipboard ──
  const copyBtn = document.querySelector('.copy-email-btn');
  if (copyBtn) {
    let copyTimeoutId;
    copyBtn.addEventListener('click', () => {
      const email = copyBtn.dataset.email;
      if (!email) return;
      const tooltip = copyBtn.querySelector('.copy-tooltip');
      if (copyTimeoutId) clearTimeout(copyTimeoutId);
      const showTooltip = (msg) => {
        if (!tooltip) return;
        tooltip.textContent = msg;
        tooltip.classList.add('show');
        copyTimeoutId = setTimeout(() => {
          tooltip.classList.remove('show');
        }, 1500);
      };

      if (navigator.clipboard) {
        navigator.clipboard.writeText(email)
          .then(() => showTooltip('Copié !'))
          .catch(() => showTooltip('Erreur'));
      } else {
        const tmp = document.createElement('textarea');
        tmp.value = email;
        tmp.style.position = 'fixed';
        tmp.style.opacity = '0';
        document.body.appendChild(tmp);
        tmp.select();
        try {
          document.execCommand('copy');
          showTooltip('Copié !');
        } catch {
          showTooltip('Erreur');
        }
        document.body.removeChild(tmp);
      }
    });
  }

  // ── AJAX Contact Form ──
  const contactForm = document.querySelector('.contact-form');
  if (contactForm && contactForm.getAttribute('action')) {
    function handleFormSubmit(e) {
      e.preventDefault();
      const btn = contactForm.querySelector('.form-submit');
      const btnSpan = btn ? btn.querySelector('span') : null;
      if (!btn || !btnSpan) return;
      const originalText = btnSpan.textContent;
      btnSpan.textContent = 'Envoi...';
      btn.disabled = true;

      fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      }).then(res => {
        if (res.ok) {
          btnSpan.textContent = 'Envoy\u00e9 \u2713';
          contactForm.reset();
          setTimeout(() => {
            btnSpan.textContent = originalText;
            btn.disabled = false;
          }, 3000);
        } else if (res.status === 403) {
          contactForm.removeEventListener('submit', handleFormSubmit);
          btnSpan.textContent = originalText;
          btn.disabled = false;
          contactForm.submit();
        } else {
          throw new Error('error');
        }
      }).catch(() => {
        btnSpan.textContent = 'Échec, réessaie';
        btn.disabled = false;
        setTimeout(() => {
          btnSpan.textContent = originalText;
        }, 3000);
      });
    }
    contactForm.addEventListener('submit', handleFormSubmit);
  }

  // ── Image Lightbox ──
  let activeLightbox = null;

  document.querySelectorAll('.project-thumb[data-lightbox]').forEach(preview => {
    const img = preview.querySelector('.project-thumb-img');
    if (!img) return;

    const openLightbox = () => {
      if (activeLightbox) return;
      const trigger = preview;
      const lb = document.createElement('div');
      lb.className = 'lightbox';
      lb.setAttribute('role', 'dialog');
      lb.setAttribute('aria-modal', 'true');
      lb.setAttribute('aria-label', img.alt || 'Image agrandie');

      const lbImg = document.createElement('img');
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbImg.className = 'lightbox-img';

      const closeBtn = document.createElement('button');
      closeBtn.className = 'lightbox-close';
      closeBtn.setAttribute('aria-label', 'Fermer');
      closeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

      const caption = document.createElement('span');
      caption.className = 'lightbox-caption';
      caption.textContent = img.alt || '';

      lb.appendChild(lbImg);
      lb.appendChild(closeBtn);
      lb.appendChild(caption);
      document.body.appendChild(lb);
      document.body.style.overflow = 'hidden';
      if (cursor) cursor.style.visibility = 'hidden';
      activeLightbox = lb;

      // Double rAF to trigger CSS transition
      requestAnimationFrame(() => requestAnimationFrame(() => lb.classList.add('lb-open')));
      closeBtn.focus();

      let isClosing = false;

      const closeLightbox = () => {
        if (isClosing) return;
        isClosing = true;
        lb.classList.remove('lb-open');
        document.removeEventListener('keydown', onKey);
        setTimeout(() => {
          lb.remove();
          document.body.style.overflow = '';
          if (cursor) cursor.style.visibility = '';
          activeLightbox = null;
          if (trigger) trigger.focus();
        }, 320);
      };

      const onKey = (e) => {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'Tab') { e.preventDefault(); closeBtn.focus(); }
      };

      closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeLightbox(); });
      lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });
      document.addEventListener('keydown', onKey);
    };

    preview.addEventListener('click', openLightbox);
    preview.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(); }
    });
  });

  // ── Staggered Reveal Animations on Scroll ──
  const revealElements = document.querySelectorAll(
    '.skill-card, .project-card, .timeline-item, .text-col, .contact-card, .contact-item, .section-label, .big-text'
  );

  if (reducedMotionQuery.matches) {
    revealElements.forEach(el => {
      el.classList.remove('reveal-item');
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const parent = entry.target.parentElement;
          const staggerClass = entry.target.dataset.stagger || entry.target.tagName;
          const siblings = parent ? Array.from(parent.children).filter(
            el => (el.dataset.stagger || el.tagName) === staggerClass
          ) : [];
          const idx = siblings.indexOf(entry.target);
          const delay = idx >= 0 ? idx * 100 : 0;

          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, delay);

          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    revealElements.forEach(el => {
      el.classList.add('reveal-item');
      revealObserver.observe(el);
    });
  }

  // ── ShardCards Logo 3D Tilt ──
  const scCard = document.querySelector('.sc-logo-card');
  if (scCard && !reducedMotionQuery.matches) {
    const maxTilt = 8;
    let tiltRafId = null;

    scCard.addEventListener('mouseenter', () => {
      scCard.style.transition = 'transform 0.15s ease-out, box-shadow 0.4s ease';
    });

    scCard.addEventListener('mousemove', (e) => {
      if (tiltRafId) return;
      tiltRafId = requestAnimationFrame(() => {
        const rect = scCard.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const rotateY = (x - 0.5) * maxTilt * 2;
        const rotateX = (0.5 - y) * maxTilt * 2;
        scCard.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        tiltRafId = null;
      });
    }, { passive: true });

    scCard.addEventListener('mouseleave', () => {
      if (tiltRafId) { cancelAnimationFrame(tiltRafId); tiltRafId = null; }
      scCard.style.transition = 'transform 0.4s ease, box-shadow 0.4s ease';
      scCard.style.transform = '';
    });
  }

});
