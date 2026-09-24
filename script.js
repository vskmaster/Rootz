(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- MOBILE NAV ---------- */
  var navToggle = document.querySelector('.nav-toggle');
  var mainNav = document.querySelector('.main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var open = mainNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- PLEDGE COUNTER (localStorage, deterministic base + real pledges) ---------- */
  var COUNT_KEY = 'roots_pledge_count';
  var PLEDGES_KEY = 'roots_pledges';

  function todaySeedBase() {
    // deterministic-ish "community" number so it feels alive without a backend
    var d = new Date();
    var seed = d.getFullYear() * 372 + (d.getMonth() + 1) * 31 + d.getDate();
    return 480 + (seed % 260);
  }

  function getPledgeCount() {
    var stored = localStorage.getItem(COUNT_KEY);
    if (stored) return parseInt(stored, 10);
    var base = todaySeedBase();
    localStorage.setItem(COUNT_KEY, String(base));
    return base;
  }

  function setPledgeCount(n) {
    localStorage.setItem(COUNT_KEY, String(n));
    var el = document.getElementById('pledgeCount');
    if (el) animateNumber(el, parseInt(el.textContent, 10) || 0, n, 800);
  }

  function animateNumber(el, from, to, duration) {
    if (prefersReducedMotion) { el.textContent = to; return; }
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(from + (to - from) * eased);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var el = document.getElementById('pledgeCount');
    if (el) animateNumber(el, 0, getPledgeCount(), 1200);
  });

  /* ---------- SCROLL-TRIGGERED STAT COUNTERS ---------- */
  var statNumbers = document.querySelectorAll('.stat-number');
  if ('IntersectionObserver' in window && statNumbers.length) {
    var statObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var target = parseInt(el.getAttribute('data-target'), 10);
          var suffix = el.getAttribute('data-suffix') || '';
          animateStat(el, target, suffix);
          statObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    statNumbers.forEach(function (el) { statObserver.observe(el); });
  } else {
    statNumbers.forEach(function (el) {
      el.textContent = el.getAttribute('data-target') + (el.getAttribute('data-suffix') || '');
    });
  }

  function animateStat(el, target, suffix) {
    if (prefersReducedMotion) { el.textContent = target + suffix; return; }
    var start = null;
    var duration = 1400;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- GENERIC SCROLL REVEAL ---------- */
  var revealTargets = document.querySelectorAll(
    '.stat-card, .flip-card, .myth-item, .help-card, .pledge-card-wrap, .pledge-copy'
  );
  revealTargets.forEach(function (el) { el.classList.add('reveal'); });
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- FLIP CARDS ---------- */
  document.querySelectorAll('.flip-card').forEach(function (card) {
    function toggle() {
      var flipped = card.classList.toggle('is-flipped');
      card.setAttribute('aria-pressed', String(flipped));
    }
    card.addEventListener('click', toggle);
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });

  /* ---------- MYTH VS FACT TOGGLES (pure CSS :has, JS just keeps ARIA in sync) ---------- */
  document.querySelectorAll('.myth-toggle').forEach(function (input) {
    input.addEventListener('change', function () {
      var panel = document.getElementById(input.getAttribute('aria-describedby'));
      if (panel) panel.setAttribute('aria-hidden', String(!input.checked));
    });
  });

  /* ---------- PLEDGE FORM ---------- */
  var pledgeForm = document.getElementById('pledgeForm');
  var pledgeThanks = document.getElementById('pledgeThanks');
  var pledgeReset = document.getElementById('pledgeReset');

  function showFieldError(input, message) {
    var errorEl = document.getElementById(input.id + '-error');
    if (errorEl) errorEl.textContent = message;
    input.classList.toggle('invalid', !!message);
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function validatePledge() {
    var valid = true;
    var name = document.getElementById('pledgeName');
    var reason = document.getElementById('pledgeReason');
    var confirm = document.getElementById('pledgeConfirm');

    if (!name.value.trim() || name.value.trim().length < 2) {
      showFieldError(name, 'Please share your first name (2+ letters).');
      valid = false;
    } else { showFieldError(name, ''); }

    if (!reason.value.trim() || reason.value.trim().length < 3) {
      showFieldError(reason, 'Tell us what you\u2019re growing toward.');
      valid = false;
    } else { showFieldError(reason, ''); }

    if (!confirm.checked) {
      showFieldError(confirm, 'Please confirm your pledge to continue.');
      valid = false;
    } else { showFieldError(confirm, ''); }

    return valid;
  }

  if (pledgeForm) {
    pledgeForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validatePledge()) return;

      var name = document.getElementById('pledgeName').value.trim();
      var reason = document.getElementById('pledgeReason').value.trim();

      var pledges = JSON.parse(localStorage.getItem(PLEDGES_KEY) || '[]');
      pledges.push({ name: name, reason: reason, date: new Date().toISOString() });
      localStorage.setItem(PLEDGES_KEY, JSON.stringify(pledges));

      setPledgeCount(getPledgeCount() + 1);

      document.getElementById('thanksName').textContent = name;
      document.getElementById('thanksMessage').textContent =
        'Your pledge to grow toward "' + reason + '" is planted. Come back any time to remember why.';

      pledgeForm.hidden = true;
      pledgeThanks.hidden = false;
      pledgeThanks.focus && pledgeThanks.setAttribute('tabindex', '-1');
      pledgeThanks.focus();
    });
  }

  if (pledgeReset) {
    pledgeReset.addEventListener('click', function () {
      pledgeForm.reset();
      pledgeForm.hidden = false;
      pledgeThanks.hidden = true;
      document.getElementById('pledgeName').focus();
    });
  }

  /* ---------- FIND HELP FILTER TABS ---------- */
  var helpTabs = document.querySelectorAll('.help-tab');
  var helpCards = document.querySelectorAll('.help-card');
  var helpEmpty = document.getElementById('helpEmpty');

  function activateTab(tab) {
    helpTabs.forEach(function (t) {
      var active = t === tab;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', String(active));
      t.tabIndex = active ? 0 : -1;
    });
    var filter = tab.getAttribute('data-filter');
    var visibleCount = 0;
    helpCards.forEach(function (card) {
      var match = filter === 'all' || card.getAttribute('data-type') === filter;
      card.hidden = !match;
      if (match) visibleCount++;
    });
    if (helpEmpty) helpEmpty.hidden = visibleCount !== 0;
  }

  helpTabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { activateTab(tab); });
    tab.addEventListener('keydown', function (e) {
      var idx = i;
      if (e.key === 'ArrowRight') idx = (i + 1) % helpTabs.length;
      else if (e.key === 'ArrowLeft') idx = (i - 1 + helpTabs.length) % helpTabs.length;
      else return;
      e.preventDefault();
      helpTabs[idx].focus();
      activateTab(helpTabs[idx]);
    });
  });

  /* ---------- STORIES CAROUSEL ---------- */
  var track = document.getElementById('carouselTrack');
  var slides = track ? Array.prototype.slice.call(track.children) : [];
  var dotsWrap = document.getElementById('carouselDots');
  var prevBtn = document.getElementById('carouselPrev');
  var nextBtn = document.getElementById('carouselNext');
  var pauseBtn = document.getElementById('carouselPause');
  var current = 0;
  var autoTimer = null;
  var isPaused = prefersReducedMotion;

  if (track && slides.length) {
    slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Go to story ' + (i + 1));
      dot.addEventListener('click', function () { goTo(i); restartAuto(); });
      dotsWrap.appendChild(dot);
    });

    function render() {
      track.style.transform = 'translateX(' + (-current * 100) + '%)';
      Array.prototype.forEach.call(dotsWrap.children, function (dot, i) {
        dot.classList.toggle('is-active', i === current);
        dot.setAttribute('aria-selected', String(i === current));
      });
    }

    function goTo(i) {
      current = (i + slides.length) % slides.length;
      render();
    }

    function startAuto() {
      if (isPaused) return;
      autoTimer = setInterval(function () { goTo(current + 1); }, 6000);
    }
    function stopAuto() { if (autoTimer) clearInterval(autoTimer); }
    function restartAuto() { stopAuto(); startAuto(); }

    prevBtn.addEventListener('click', function () { goTo(current - 1); restartAuto(); });
    nextBtn.addEventListener('click', function () { goTo(current + 1); restartAuto(); });

    pauseBtn.addEventListener('click', function () {
      isPaused = !isPaused;
      pauseBtn.setAttribute('aria-pressed', String(isPaused));
      pauseBtn.setAttribute('aria-label', isPaused ? 'Resume automatic rotation' : 'Pause automatic rotation');
      if (isPaused) stopAuto(); else restartAuto();
    });

    track.closest('.carousel').addEventListener('mouseenter', stopAuto);
    track.closest('.carousel').addEventListener('mouseleave', function () { if (!isPaused) startAuto(); });

    // basic swipe support
    var touchStartX = null;
    track.addEventListener('touchstart', function (e) { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', function (e) {
      if (touchStartX === null) return;
      var dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) { goTo(current + (dx < 0 ? 1 : -1)); restartAuto(); }
      touchStartX = null;
    });

    render();
    pauseBtn.setAttribute('aria-pressed', String(isPaused));
    if (isPaused) {
      pauseBtn.setAttribute('aria-label', 'Resume automatic rotation');
    } else {
      startAuto();
    }
  }

  /* ---------- SIGNUP FORM ---------- */
  var signupForm = document.getElementById('signupForm');
  var signupThanks = document.getElementById('signupThanks');

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  if (signupForm) {
    signupForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = document.getElementById('signupEmail');
      var role = document.getElementById('signupRole');
      var valid = true;

      if (!isValidEmail(email.value.trim())) {
        showFieldError(email, 'Please enter a valid email address.');
        valid = false;
      } else { showFieldError(email, ''); }

      if (!role.value) {
        showFieldError(role, 'Please choose one.');
        valid = false;
      } else { showFieldError(role, ''); }

      if (!valid) return;

      signupForm.hidden = true;
      signupThanks.hidden = false;
    });
  }

  /* ---------- WEB SHARE ---------- */
  var shareBtn = document.getElementById('shareBtn');
  var shareFallback = document.getElementById('shareFallback');
  if (shareBtn) {
    shareBtn.addEventListener('click', function () {
      var shareData = {
        title: 'Roots — Choose What Grows You',
        text: 'A drug-free life isn\u2019t a straight line \u2014 it\u2019s something you grow. Check out Roots.',
        url: window.location.href
      };
      if (navigator.share) {
        navigator.share(shareData).catch(function () { /* user cancelled, no-op */ });
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(shareData.url).then(function () {
          shareFallback.hidden = false;
          setTimeout(function () { shareFallback.hidden = true; }, 3000);
        });
      } else {
        window.prompt('Copy this link to share Roots:', shareData.url);
      }
    });
  }

  /* ---------- FOOTER NEWSLETTER ---------- */
  var footerForm = document.getElementById('footerForm');
  if (footerForm) {
    footerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = document.getElementById('footerEmail');
      var errorEl = document.getElementById('footerEmail-error');
      var successEl = document.getElementById('footerSuccess');

      if (!isValidEmail(email.value.trim())) {
        errorEl.textContent = 'Please enter a valid email address.';
        email.classList.add('invalid');
        successEl.hidden = true;
        return;
      }
      errorEl.textContent = '';
      email.classList.remove('invalid');
      successEl.hidden = false;
      footerForm.reset();
    });
  }

})();
