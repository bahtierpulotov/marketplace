(function (window) {
  var API = '/api';

  function getAccess() {
    try { return localStorage.getItem('access'); } catch (e) { return null; }
  }
  function getRefresh() {
    try { return localStorage.getItem('refresh'); } catch (e) { return null; }
  }
  function setTokens(access, refresh) {
    if (access) localStorage.setItem('access', access);
    if (refresh) localStorage.setItem('refresh', refresh);
  }
  function clearTokens() {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
  }

  var dict = {};
  var lang = 'ru';
  /*
   Ҳангом тағйир дар JSON ё сохтори калидҳо инро нав кунед
   ҳамчун версия бо base.html (?v=bozor-assets-…) яксон нигоҳ доред.
   */
  var I18N_ASSET_VER = 'bozor-assets-202605038';

  var UI_FALLBACK_LANG = {
    en: {
      nav: {
        siteAdmin: 'Admin',
      },
      sidebar: {
        menu: 'Menu',
        home: 'Home',
        categories: 'Categories',
        quick: 'Shortcuts',
        tech: 'Tech',
        electronics: 'Electronics',
        homeGarden: 'Home & garden',
        theme: 'Theme',
        premiumTitle: 'Premium account',
        premiumDesc: 'Boost your listings so more buyers notice you.',
        premiumCta: 'See how',
        admin: 'Admin',
        platformContact: 'Contact',
        adminPanelAria: 'Platform contact details',
      },
      trust: {
        title: 'Safe & reliable',
        b1: 'Basic checks help keep misleading listings low',
        b2: 'We protect sensitive account data',
        b3: 'Meet in person or trusted places when paying',
      },
      footer: {
        tagline: "Tajikistan's online marketplace",
        contactLead: 'Contact the platform',
        email: 'Email',
        telegram: 'Telegram',
        whatsapp: 'WhatsApp',
      },
    },
    tj: {
      nav: {
        siteAdmin: 'Идора',
      },
      sidebar: {
        menu: 'Меню',
        home: 'Ҳона',
        categories: 'Категорияҳо',
        quick: 'Шитоб',
        tech: 'Техника',
        electronics: 'Электроника',
        homeGarden: 'Хона ва боғ',
        theme: 'Роҳнамои ранг',
        premiumTitle: 'Аккаунти Premium',
        premiumDesc: 'Эълонҳоро баланд бардоред ва бештар дида шавед.',
        premiumCta: 'Бештар хонед',
        admin: 'Админ',
        platformContact: 'Тамос',
        adminPanelAria: 'Маълумоти тамос бо платформа',
      },
      trust: {
        title: 'Бехатар ва боэътимод',
        b1: 'Эълонҳо дар платформа санҷида мешаванд',
        b2: 'Маълумоти шахсӣ ҳифз мешавад',
        b3: 'Пардохти муҳимро бо эҳтиёт дар ҷойҳои боваринок анҷом диҳед',
      },
      footer: {
        tagline: 'Бозори онлайни Тоҷикистон',
        contactLead: 'Тамос бо соҳиби платформа',
        email: 'Email',
        telegram: 'Telegram',
        whatsapp: 'WhatsApp',
      },
    },
    ru: {
      nav: {
        siteAdmin: 'Панель',
      },
      sidebar: {
        menu: 'Меню',
        home: 'Главная',
        categories: 'Категории',
        quick: 'Быстро',
        tech: 'Техника',
        electronics: 'Электроника',
        homeGarden: 'Дом и сад',
        theme: 'Тема',
        premiumTitle: 'Premium-аккаунт',
        premiumDesc: 'Поднимите объявления и получите больше просмотров.',
        premiumCta: 'Подробнее',
        admin: 'Админ',
        platformContact: 'Связь',
        adminPanelAria: 'Контакты владельца платформы',
      },
      trust: {
        title: 'Безопасно и надёжно',
        b1: 'Объявления модерируются на платформе',
        b2: 'Персональные данные защищаются',
        b3: 'Важные сделки лучше проводить офлайн',
      },
      footer: {
        tagline: 'Онлайн-базар в Таджикистане',
        contactLead: 'Связь с владельцем платформы',
        email: 'Email',
        telegram: 'Telegram',
        whatsapp: 'WhatsApp',
      },
    },
    uz: {
      nav: {
        siteAdmin: 'Boshqaruv',
      },
      sidebar: {
        menu: 'Menyu',
        home: 'Bosh sahifa',
        categories: 'Turkumlar',
        quick: 'Tezkor',
        tech: 'Texnika',
        electronics: 'Elektronika',
        homeGarden: "Uy va bog'i",
        theme: 'Mavzu',
        premiumTitle: 'Premium akkaunt',
        premiumDesc: "E'lonni ko'tarib, ko'proq e'tibor oling.",
        premiumCta: 'Batafsil',
        admin: 'Admin',
        platformContact: 'Aloqa',
        adminPanelAria: 'Platforma bilan aloqa',
      },
      trust: {
        title: 'Xavfsiz va ishonchli',
        b1: "E'lonlar platformada tekshiriladi",
        b2: "Shaxsiy ma'lumotlar himoyalanadi",
        b3: "Muhim to'lovlar ishonchli joylarda uchrashing",
      },
      footer: {
        tagline: "Tojikistonning onlayn bozori",
        contactLead: 'Platforma egasi bilan aloqa',
        email: 'Email',
        telegram: 'Telegram',
        whatsapp: 'WhatsApp',
      },
    },
  };

  function mergeUiBundlesFromFallback(j, langCode) {
    if (!j || typeof j !== 'object') return;
    var fb = UI_FALLBACK_LANG[langCode] || UI_FALLBACK_LANG.en;
    ['sidebar', 'trust', 'footer', 'nav'].forEach(function (key) {
      if (!fb[key]) return;
      var loaded = j[key];
      var cur = loaded && typeof loaded === 'object' ? loaded : {};
      j[key] = Object.assign({}, fb[key], cur);
    });
  }

  function nestedGet(obj, path) {
    var parts = path.split('.');
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return path;
      cur = cur[parts[i]];
    }
    return typeof cur === 'string' ? cur : path;
  }

  function t(key) {
    return nestedGet(dict, key);
  }

  function fetchI18nFile(code) {
    var url =
      '/static/i18n/' + encodeURIComponent(code) + '.json?v=' + I18N_ASSET_VER;
    return fetch(url, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    }).then(function (r) {
      if (!r.ok) throw new Error('i18n ' + code);
      return r.json();
    });
  }

  function loadI18n() {
    try {
      lang = (localStorage.getItem('lang') || 'ru').toLowerCase().trim();
    } catch (e) {
      lang = 'ru';
    }
    return fetchI18nFile(lang)
      .then(function (j) {
        mergeUiBundlesFromFallback(j, lang);
        dict = j;
        document.documentElement.lang = lang;
      })
      .catch(function () {
        return fetchI18nFile('en')
          .then(function (j) {
            mergeUiBundlesFromFallback(j, 'en');
            dict = j;
            document.documentElement.lang = 'en';
          })
          .catch(function () {
            dict = {};
          });
      });
  }

  function setLang(code) {
    localStorage.setItem('lang', code);
    location.reload();
  }

  function initTheme() {
    var dark = localStorage.getItem('theme') === 'dark';
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    return dark;
  }

  function syncThemeIcons(themeName) {
    var darkNow = themeName === 'dark';
    var txt = darkNow ? '☀️' : '🌙';
    var t1 = document.getElementById('theme-toggle-icon');
    if (t1) t1.textContent = txt;
    var t2 = document.getElementById('theme-toggle-icon-sidebar');
    if (t2) t2.textContent = txt;
  }

  function toggleTheme() {
    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next === 'dark' ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', next);
    syncThemeIcons(next);
  }

  function apiFetch(path, options) {
    options = options || {};
    var headers = Object.assign({}, options.headers || {});
    if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    var acc = getAccess();
    if (acc) headers['Authorization'] = 'Bearer ' + acc;
    var opts = Object.assign({}, options, { headers: headers });
    return fetch(API + path, opts).then(function (res) {
      if (res.status !== 401 || options._retry) return res;
      var ref = getRefresh();
      if (!ref) return res;
      return fetch(API + '/token/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: ref }),
      })
        .then(function (r) {
          if (!r.ok) throw new Error('refresh');
          return r.json();
        })
        .then(function (data) {
          localStorage.setItem('access', data.access);
          var h2 = Object.assign({}, options.headers || {}, {
            Authorization: 'Bearer ' + data.access,
          });
          if (!(options.body instanceof FormData) && !h2['Content-Type']) {
            h2['Content-Type'] = 'application/json';
          }
          var o2 = Object.assign({}, options, { headers: h2, _retry: true });
          return fetch(API + path, o2);
        })
        .catch(function () {
          clearTokens();
          window.location.href = '/login/';
          throw new Error('auth');
        });
    });
  }

  function syncLangIndicator() {
    try {
      var lg = localStorage.getItem('lang') || 'ru';
      var el = document.getElementById('mp-lang-indicator');
      if (el) el.textContent = lg.toUpperCase().slice(0, 4);
    } catch (e) {}
  }

  function applyI18nToDom() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (k) el.textContent = t(k.trim());
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-placeholder');
      if (k) el.setAttribute('placeholder', t(k.trim()));
    });
    document.querySelectorAll('[data-i18n-aria-label]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-aria-label');
      if (k) el.setAttribute('aria-label', t(k.trim()));
    });
    syncLangIndicator();
  }

  function fillSidebarQuickCategories() {
    var wrap = document.getElementById('sidebar-quick-cats');
    if (!wrap) return;
    apiFetch('/categories/', { method: 'GET' })
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        wrap.textContent = '';
        var cats = data.categories || [];
        cats.forEach(function (c) {
          var a = document.createElement('a');
          a.className = 'mp-sidebar-link';
          a.href = '/?category=' + encodeURIComponent(c.slug) + '#category-pills';
          a.textContent = (c.icon ? c.icon + ' ' : '') + c.name;
          wrap.appendChild(a);
        });
      })
      .catch(function () {});
  }

  function refreshNavbarUser() {
    var guest = document.getElementById('nav-guest');
    var userEl = document.getElementById('nav-user');
    var guestM = document.getElementById('nav-guest-mobile');
    var userM = document.getElementById('nav-user-mobile');
    var acc = getAccess();
    if (!guest || !userEl) return;
    var sideCh = document.getElementById('sidebar-chats');
    if (!acc) {
        guest.style.display = 'flex';
        userEl.style.display = 'none';
        var adm0 = document.getElementById('nav-django-admin');
        if (adm0) adm0.style.display = 'none';
        if (guestM) guestM.style.display = 'flex';
        if (userM) userM.style.display = 'none';
        if (sideCh) sideCh.style.display = 'none';
        return;
    }
    apiFetch('/user/me/')
      .then(function (r) {
        if (!r.ok) throw new Error('me');
        return r.json();
      })
      .then(function (data) {
        var u = data.user;
        var name = (u.full_name && u.full_name.split(' ')[0]) || 'Profile';
        guest.style.display = 'none';
        userEl.style.display = 'flex';
        if (sideCh) sideCh.style.removeProperty('display');
        var label = document.getElementById('nav-user-label');
        if (label) label.textContent = '👤 ' + name;
        var adm = document.getElementById('nav-django-admin');
        if (adm) {
          if (u.is_staff) {
            adm.style.display = 'inline-flex';
            adm.textContent = t('nav.siteAdmin');
          } else {
            adm.style.display = 'none';
          }
        }
        if (guestM) guestM.style.display = 'none';
        if (userM) userM.style.display = 'flex';
        var lm = document.getElementById('nav-user-label-mobile');
        if (lm) lm.textContent = '👤 ' + t('nav.profile');
      })
      .catch(function () {
        clearTokens();
        guest.style.display = 'flex';
        userEl.style.display = 'none';
        if (guestM) guestM.style.display = 'flex';
        if (userM) userM.style.display = 'none';
        if (sideCh) sideCh.style.display = 'none';
        var adm1 = document.getElementById('nav-django-admin');
        if (adm1) adm1.style.display = 'none';
      });
  }

  function sidebarSetOpen(open) {
    var s = document.getElementById('mp-sidebar');
    var o = document.getElementById('mp-sidebar-overlay');
    var mq = typeof window.matchMedia === 'function' && window.matchMedia('(min-width: 961px)');
    var wide = mq && mq.matches;
    if (!s || !o) return;
    var ham = document.getElementById('nav-hamburger');
    if (wide) {
      s.classList.remove('mp-sidebar--open');
      o.classList.remove('mp-sidebar-overlay--visible');
      o.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (ham) ham.textContent = '☰';
      return;
    }
    if (open) {
      s.classList.add('mp-sidebar--open');
      o.classList.add('mp-sidebar-overlay--visible');
      o.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (ham) ham.textContent = '✕';
    } else {
      s.classList.remove('mp-sidebar--open');
      o.classList.remove('mp-sidebar-overlay--visible');
      o.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (ham) ham.textContent = '☰';
    }
  }

  function bindNavCommon() {
    var ham = document.getElementById('nav-hamburger');
    var overlay = document.getElementById('mp-sidebar-overlay');
    if (ham && overlay) {
      ham.addEventListener('click', function () {
        var s = document.getElementById('mp-sidebar');
        var opening = !(s && s.classList.contains('mp-sidebar--open'));
        sidebarSetOpen(opening);
      });
      overlay.addEventListener('click', function () {
        sidebarSetOpen(false);
      });
    }
    window.addEventListener('resize', function () {
      if (typeof window.matchMedia === 'function' && window.matchMedia('(min-width: 961px)').matches) {
        sidebarSetOpen(false);
      }
    });

    var themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
    var themeSide = document.getElementById('theme-toggle-sidebar');
    if (themeSide) themeSide.addEventListener('click', toggleTheme);
    document.querySelectorAll('[data-lang]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setLang(btn.getAttribute('data-lang'));
      });
    });
    var logout = document.getElementById('nav-logout');
    if (logout) {
      logout.addEventListener('click', function () {
        clearTokens();
        window.location.href = '/';
      });
    }
    var logoutM = document.getElementById('nav-logout-mobile');
    if (logoutM) {
      logoutM.addEventListener('click', function () {
        clearTokens();
        window.location.href = '/';
      });
    }

    var adminToggle = document.getElementById('sidebar-admin-toggle');
    var adminPanel = document.getElementById('sidebar-admin-panel');
    if (adminToggle && adminPanel) {
      adminToggle.addEventListener('click', function () {
        var open = adminPanel.classList.toggle('mp-sidebar-admin-panel--open');
        adminToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
  }

  function requireAuth() {
    if (!getAccess()) {
      window.location.href = '/login/';
      return false;
    }
    return true;
  }

  window.MP = {
    API: API,
    getAccess: getAccess,
    setTokens: setTokens,
    clearTokens: clearTokens,
    apiFetch: apiFetch,
    t: t,
    loadI18n: loadI18n,
    setLang: setLang,
    initTheme: initTheme,
    toggleTheme: toggleTheme,
    applyI18nToDom: applyI18nToDom,
    refreshNavbarUser: refreshNavbarUser,
    bindNavCommon: bindNavCommon,
    requireAuth: requireAuth,
  };

  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    var dark = localStorage.getItem('theme') === 'dark';
    syncThemeIcons(dark ? 'dark' : 'light');
    loadI18n().then(function () {
      applyI18nToDom();
      fillSidebarQuickCategories();
      refreshNavbarUser();
      bindNavCommon();
      var page = document.body.getAttribute('data-page');
      if (window.MP_PAGE_INIT && typeof window.MP_PAGE_INIT[page] === 'function') {
        window.MP_PAGE_INIT[page]();
      }
    });
  });
})(window);
