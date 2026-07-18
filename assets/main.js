/* ===== 00-core.js ===== */
/* =========================================================================
   Socle JS — espace de noms partagé et interactions de base.
   Les fichiers de src/js/ sont concaténés dans l'ordre alphabétique par
   build.mjs ; celui-ci doit rester le premier (il crée `window.BP`).
   Aucune dépendance externe, aucun framework.
   ========================================================================= */
(function () {
  'use strict';

  var BP = (window.BP = window.BP || {});

  /** Petit utilitaire de sélection, pour éviter de répéter les querySelectorAll. */
  BP.$ = function (sel, root) {
    return (root || document).querySelector(sel);
  };
  BP.$$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  BP.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Menu mobile ---- */
  var toggle = BP.$('.site-nav__toggle');
  var menu = document.getElementById('primary-menu');
  if (toggle && menu) {
    var closeMenu = function (refocus) {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      if (refocus) toggle.focus();
    };
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') closeMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) closeMenu(true);
    });
  }

  /* ---- Ombre du header au défilement ---- */
  var header = BP.$('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- Révélation au défilement ----
     En reduced-motion (ou sans IntersectionObserver) on affiche tout d'emblée :
     le contenu ne doit jamais dépendre d'une animation pour être lisible. */
  var targets = BP.$$(
    '.card, .feature, .step, .mode, .pain-card, .feature-row, .feature-tile, ' +
      '.lifecycle-step, .benefit-card, .platform-app, .price-line, .project-price, .apps__hub'
  );
  if (BP.reducedMotion || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) {
      el.classList.add('is-visible');
    });
  } else {
    targets.forEach(function (el) {
      el.classList.add('reveal');
    });
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    targets.forEach(function (el) {
      io.observe(el);
    });
  }
})();

/* ===== 20-prism.js ===== */
/* =========================================================================
   Allumage du prisme.
   La classe `.is-lit` déclenche les keyframes de la scène (faisceau → prisme →
   dispersion des rayons). En `prefers-reduced-motion`, le CSS fige déjà l'état
   final, donc poser la classe est sans effet visible — on la pose quand même
   pour garder un seul chemin de code.
   ========================================================================= */
(function () {
  'use strict';

  var stage = document.querySelector('.prism-stage');
  if (!stage) return;

  // Double rAF : garantit que le navigateur a peint l'état initial avant que la
  // classe n'arrive, sinon les animations démarrent depuis leur état final.
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      stage.classList.add('is-lit');
    });
  });
})();

/* ===== 30-analytics.js ===== */
/* =========================================================================
   Mesure d'audience — sous consentement préalable.

   ⚠️ Règle non négociable : AUCUN script de mesure n'est chargé, et aucun cookie
   analytique n'est déposé, avant un « Accepter » explicite. L'ancien site
   appelait initAnalytics() sans condition alors qu'un bandeau de consentement
   dormait, non branché, dans le même fichier — et la politique de
   confidentialité promettait l'inverse. C'est corrigé ici ; ne pas réintroduire
   d'appel à loadGA() en dehors de grantConsent().

   `BP.trackEvent()` reste appelable partout : sans consentement, elle ne fait
   rien. Aucun appelant n'a donc à connaître l'état du consentement.
   ========================================================================= */
(function () {
  'use strict';

  var BP = (window.BP = window.BP || {});
  var GA_ID = 'G-1W3KS12KZQ';
  var STORE_KEY = 'bp_cookie_consent';
  var granted = false;

  /* ---- Lecture / écriture du choix (tolérante au localStorage indisponible) ---- */
  function readChoice() {
    try {
      return window.localStorage.getItem(STORE_KEY);
    } catch (e) {
      return null; // navigation privée, stockage bloqué : on redemandera.
    }
  }
  function writeChoice(v) {
    try {
      window.localStorage.setItem(STORE_KEY, v);
    } catch (e) {
      /* sans stockage, le choix ne vaut que pour la session — acceptable. */
    }
  }

  /* ---- Chargement de GA4, uniquement après accord ---- */
  function loadGA() {
    if (granted || !GA_ID || GA_ID.indexOf('__') === 0) return;
    granted = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, {
      anonymize_ip: true,
      cookie_flags: 'SameSite=Lax;Secure',
    });

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
  }

  /* ---- API publique ---- */
  BP.hasConsent = function () {
    return granted;
  };

  BP.trackEvent = function (category, action, label, value) {
    if (!granted || typeof window.gtag !== 'function') return;
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  };

  BP.trackConversion = function (id) {
    BP.trackEvent('Conversion', id, document.title);
  };

  /* ---- Bandeau ---- */
  var banner = document.getElementById('consent-banner');

  function decide(choice) {
    writeChoice(choice);
    if (banner) banner.hidden = true;
    if (choice === 'accepted') {
      loadGA();
      BP.trackEvent('Cookie', 'Consent', 'Accepted');
    }
  }

  var existing = readChoice();
  if (existing === 'accepted') {
    loadGA();
  } else if (existing !== 'declined' && banner) {
    // Ni accepté ni refusé : on demande. Léger différé pour ne pas concurrencer
    // le premier rendu (le bandeau n'est pas du contenu critique).
    window.setTimeout(function () {
      banner.hidden = false;
    }, 900);
  }

  if (banner) {
    banner.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-consent]');
      if (btn) decide(btn.getAttribute('data-consent'));
    });
  }

  /* ---- Suivi de navigation interne ---- */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a');
    if (!link) return;
    var href = link.getAttribute('href') || '';
    if (href.charAt(0) === '#' && href.length > 1) {
      BP.trackEvent('Navigation', 'Anchor', href);
    } else if (/^https?:/.test(href) && link.hostname !== window.location.hostname) {
      BP.trackEvent('Navigation', 'Outbound', link.href);
    }
  });

  /* ---- FAQ ---- */
  BP.$$('.faq__item').forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (item.open) {
        var q = item.querySelector('summary');
        BP.trackEvent('FAQ', 'Open', q ? q.textContent.trim() : '');
      }
    });
  });
})();

/* ===== 35-pricing-calculator.js ===== */
/* =========================================================================
   Simulateur de tarif — page /tarifs/.
   Les montants viennent de `#calc-data`, un JSON dérivé de data/pricing.json
   au build (cf. calculatorSection() dans templates/pricing.mjs) : aucun prix
   n'est recopié à la main ici. No-op sur toute autre page (garde en tête).
   ========================================================================= */
(function () {
  'use strict';

  var root = document.querySelector('.calc');
  var dataEl = document.getElementById('calc-data');
  if (!root || !dataEl) return;

  var cfg = JSON.parse(dataEl.textContent);
  var modeBtns = Array.prototype.slice.call(root.querySelectorAll('[data-calc-mode]'));
  var onlyFields = Array.prototype.slice.call(root.querySelectorAll('[data-calc-only]'));
  var moduleInputs = Array.prototype.slice.call(root.querySelectorAll('.calc__module input'));
  var usersInput = document.getElementById('calc-users');
  var projectsInput = document.getElementById('calc-projects');
  var totalEl = document.getElementById('calc-total');
  var periodEl = document.getElementById('calc-period');
  var breakdownEl = document.getElementById('calc-breakdown');
  var noteEl = document.getElementById('calc-note');

  var mode = 'annuelle';
  var fmt = function (n) {
    return new Intl.NumberFormat('fr-FR').format(Math.round(n));
  };
  var addLine = function (label, amount) {
    var li = document.createElement('li');
    var label_ = document.createElement('span');
    label_.textContent = label;
    var amount_ = document.createElement('b');
    amount_.textContent = fmt(amount) + ' €';
    li.appendChild(label_);
    li.appendChild(amount_);
    breakdownEl.appendChild(li);
  };
  var selectedModules = function () {
    return moduleInputs.filter(function (i) {
      return i.checked && !i.disabled;
    });
  };

  function setMode(next) {
    mode = next;
    modeBtns.forEach(function (b) {
      var active = b.dataset.calcMode === mode;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-selected', String(active));
    });
    onlyFields.forEach(function (f) {
      f.hidden = f.dataset.calcOnly !== mode;
    });
    periodEl.textContent = mode === 'annuelle' ? '/ an' : '/ an (au projet)';
    moduleInputs.forEach(function (input) {
      var eligible = mode === 'annuelle' || input.dataset.projectEligible === 'true';
      var item = input.closest('.calc__module');
      item.classList.toggle('is-disabled', !eligible);
      input.disabled = !eligible;
      if (!eligible) input.checked = false;
    });
    render();
  }

  function render() {
    breakdownEl.innerHTML = '';
    var modules = selectedModules();
    var total = 0;

    if (mode === 'annuelle') {
      var users = Math.max(1, parseInt(usersInput.value, 10) || 1);
      if (modules.length) {
        total += cfg.socle;
        addLine('Socle BatiPrisme + 1er module', cfg.socle);

        var extra = modules.length - 1;
        if (extra > 0) {
          var extraAmount = extra * cfg.moduleFee;
          total += extraAmount;
          addLine(extra + ' module' + (extra > 1 ? 's' : '') + ' complémentaire' + (extra > 1 ? 's' : ''), extraAmount);
        }

        var hasAtlas = modules.some(function (i) { return i.dataset.key === 'atlas'; });
        if (hasAtlas) {
          var atlasAmount = cfg.atlasMonthly * 12;
          total += atlasAmount;
          addLine('Atlas · stockage (0 à 10 Go)', atlasAmount);
        }

        var usersAmount = users * cfg.userFee;
        total += usersAmount;
        addLine(users + ' licence' + (users > 1 ? 's' : '') + ' utilisateur', usersAmount);

        noteEl.textContent = hasAtlas
          ? 'Estimation hors taxes. Le socle de stockage Atlas couvre 0 à 10 Go ; au-delà, un supplément de 25 € HT s’applique par tranche de 5 Go.'
          : 'Estimation hors taxes.';
      } else {
        noteEl.textContent = 'Sélectionnez au moins un module pour estimer le tarif.';
      }
    } else {
      var projects = Math.max(1, parseInt(projectsInput.value, 10) || 1);
      modules.forEach(function (input) {
        var price = cfg.projectPrices[input.dataset.key];
        if (!price) return;
        var amount = price * projects;
        total += amount;
        addLine(input.dataset.name + ' · ' + projects + ' projet' + (projects > 1 ? 's' : ''), amount);
      });
      noteEl.textContent = modules.length
        ? 'Estimation hors taxes, sans socle ni engagement annuel — activation à la durée du projet.'
        : 'Sélectionnez Muto et/ou Atlas pour estimer le tarif au projet.';
    }

    totalEl.textContent = fmt(total);
  }

  modeBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      setMode(b.dataset.calcMode);
    });
  });
  [usersInput, projectsInput].forEach(function (input) {
    if (input) input.addEventListener('input', render);
  });
  moduleInputs.forEach(function (input) {
    input.addEventListener('change', render);
  });

  setMode('annuelle');
})();

/* ===== 40-contact-form.js ===== */
/* =========================================================================
   Formulaire de contact — validation côté client puis envoi à Formspree.
   Porté depuis l'ancien site (js/main.js), qui faisait déjà ça correctement :
   messages d'erreur reliés au champ par aria-describedby, aria-invalid,
   aria-live pour l'annonce, état de chargement sur le bouton.
   ========================================================================= */
(function () {
  'use strict';

  var BP = (window.BP = window.BP || {});
  var form = document.getElementById('contact-form');
  if (!form) return;

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var TEL_RE = /^[+0-9().\s-]{6,20}$/;

  function errorSlot(field) {
    var id = field.getAttribute('aria-describedby');
    return id ? document.getElementById(id) : null;
  }

  function setError(field, message) {
    var slot = errorSlot(field);
    if (slot) slot.textContent = message || '';
    if (message) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
    return !message;
  }

  function validateField(field) {
    var value = (field.value || '').trim();

    if (field.type === 'checkbox') {
      return setError(field, field.checked ? '' : 'Vous devez accepter pour envoyer le formulaire.');
    }
    if (field.required && !value) {
      return setError(field, 'Ce champ est requis.');
    }
    if (field.type === 'email' && value && !EMAIL_RE.test(value)) {
      return setError(field, 'Adresse email invalide.');
    }
    if (field.type === 'tel' && value && !TEL_RE.test(value)) {
      return setError(field, 'Numéro de téléphone invalide.');
    }
    return setError(field, '');
  }

  var fields = BP.$$('input, select, textarea', form).filter(function (f) {
    return f.type !== 'hidden';
  });

  // Validation à la sortie du champ seulement : signaler une erreur pendant que
  // la personne est encore en train de taper est hostile.
  fields.forEach(function (field) {
    field.addEventListener('blur', function () {
      validateField(field);
    });
    field.addEventListener('input', function () {
      if (field.getAttribute('aria-invalid') === 'true') validateField(field);
    });
  });

  function flashError(message) {
    var existing = form.querySelector('.form-error');
    if (existing) existing.remove();
    var box = document.createElement('p');
    box.className = 'form-error';
    box.setAttribute('role', 'alert');
    box.textContent = message;
    form.appendChild(box);
    window.setTimeout(function () {
      box.remove();
    }, 6000);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var firstInvalid = null;
    fields.forEach(function (field) {
      if (!validateField(field) && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    var button = form.querySelector('button[type="submit"]');
    var textEl = button.querySelector('.btn-text');
    var loadEl = button.querySelector('.btn-loading');
    var success = form.querySelector('.form-success');

    button.disabled = true;
    if (textEl) textEl.hidden = true;
    if (loadEl) loadEl.hidden = false;

    var payload = {};
    fields.forEach(function (field) {
      payload[field.name] = field.type === 'checkbox' ? field.checked : field.value.trim();
    });
    var subject = form.querySelector('input[name="_subject"]');
    if (subject) payload._subject = subject.value;
    payload._replyto = payload.email;

    var endpoint = 'https://formspree.io/f/' + form.dataset.formspreeId;

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        form.reset();
        fields.forEach(function (f) {
          setError(f, '');
        });
        if (success) {
          success.hidden = false;
          success.focus && success.focus();
        }
        BP.trackEvent('Lead', 'Form Submit', 'Contact Form');
        BP.trackConversion('contact_form_submission');
      })
      .catch(function () {
        flashError("L'envoi a échoué. Réessayez, ou écrivez-nous directement à contact@batiprisme.fr.");
      })
      .finally(function () {
        button.disabled = false;
        if (textEl) textEl.hidden = false;
        if (loadEl) loadEl.hidden = true;
      });
  });
})();
