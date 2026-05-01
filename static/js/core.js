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

  function loadI18n() {
    try {
      lang = localStorage.getItem('lang') || 'ru';
    } catch (e) {
      lang = 'ru';
    }
    return fetch('/static/i18n/' + lang + '.json')
      .then(function (r) { return r.json(); })
      .then(function (j) {
        dict = j;
        document.documentElement.lang = lang;
      })
      .catch(function () {
        return fetch('/static/i18n/en.json')
          .then(function (r) { return r.json(); })
          .then(function (j) { dict = j; });
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

  function toggleTheme() {
    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next === 'dark' ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', next);
    var btn = document.getElementById('theme-toggle-icon');
    if (btn) btn.textContent = next === 'dark' ? '☀️' : '🌙';
    var btn2 = document.getElementById('theme-toggle-icon-mobile');
    if (btn2) btn2.textContent = next === 'dark' ? '☀️ Light mode' : '🌙 Dark mode';
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

  function applyI18nToDom() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (k) el.textContent = t(k);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-placeholder');
      if (k) el.setAttribute('placeholder', t(k));
    });
  }

  function refreshNavbarUser() {
    var guest = document.getElementById('nav-guest');
    var userEl = document.getElementById('nav-user');
    var guestM = document.getElementById('nav-guest-mobile');
    var userM = document.getElementById('nav-user-mobile');
    var acc = getAccess();
    if (!guest || !userEl) return;
    if (!acc) {
      guest.style.display = 'flex';
      userEl.style.display = 'none';
      if (guestM) guestM.style.display = 'flex';
      if (userM) userM.style.display = 'none';
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
        var label = document.getElementById('nav-user-label');
        if (label) label.textContent = '👤 ' + name;
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
      });
  }

  function bindNavCommon() {
    var themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
    var themeBtnM = document.getElementById('theme-toggle-mobile');
    if (themeBtnM) themeBtnM.addEventListener('click', toggleTheme);
    var ham = document.getElementById('nav-hamburger');
    var mobile = document.getElementById('nav-mobile-menu');
    if (ham && mobile) {
      ham.addEventListener('click', function () {
        var open = mobile.style.display === 'flex';
        mobile.style.display = open ? 'none' : 'flex';
        mobile.style.flexDirection = open ? '' : 'column';
        ham.textContent = open ? '☰' : '✕';
      });
    }
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
    var ti = document.getElementById('theme-toggle-icon');
    if (ti) ti.textContent = dark ? '☀️' : '🌙';
    var ti2 = document.getElementById('theme-toggle-icon-mobile');
    if (ti2) ti2.textContent = dark ? '☀️ Light mode' : '🌙 Dark mode';
    loadI18n().then(function () {
      applyI18nToDom();
      refreshNavbarUser();
      bindNavCommon();
      var page = document.body.getAttribute('data-page');
      if (window.MP_PAGE_INIT && typeof window.MP_PAGE_INIT[page] === 'function') {
        window.MP_PAGE_INIT[page]();
      }
    });
  });
})(window);
