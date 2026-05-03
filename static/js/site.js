(function () {
  var MP = window.MP;

  function el(html) {
    var t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstChild;
  }

  function money(n) {
    return Number(n).toLocaleString();
  }

  /* Иконкаҳои векторӣ барои метадодаи саҳифаи маҳсулот */
  function pdMetaSvgEye() {
    return (
      '<svg class="pd-meta-svg" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>'
    );
  }
  function pdMetaSvgHeart() {
    return (
      '<svg class="pd-meta-svg" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2Z"/></svg>'
    );
  }
  function pdMetaSvgMapPin() {
    return (
      '<svg class="pd-meta-svg" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>'
    );
  }
  function pdMetaSvgTag() {
    return (
      '<svg class="pd-meta-svg" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0l6.58-6.58a1 1 0 0 0 0-1.41L12 2Z"/><circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none"/></svg>'
    );
  }
  function pdMetaSvgClock() {
    return (
      '<svg class="pd-meta-svg" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
    );
  }

  function pdLikeSvg(filled) {
    if (filled) {
      return (
        '<svg class="pd-like-svg pd-like-svg--filled" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2Z"/></svg>'
      );
    }
    return (
      '<svg class="pd-like-svg" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2Z"/></svg>'
    );
  }

  function mpUserInitials(name) {
    if (!name || !String(name).trim()) return '?';
    var parts = String(name).trim().split(/\s+/);
    if (parts.length >= 2) {
      var a = parts[0][0] || '';
      var b = parts[1][0] || '';
      return (a + b).toUpperCase();
    }
    return String(name).slice(0, 2).toUpperCase();
  }

  function formatChatListTime(iso) {
    if (!iso) return '';
    try {
      var d = new Date(iso);
      var now = new Date();
      if (d.toDateString() === now.toDateString()) {
        return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      }
      var y = d.getFullYear();
      var ny = now.getFullYear();
      var opts = { day: '2-digit', month: 'short' };
      if (y !== ny) opts.year = 'numeric';
      return d.toLocaleDateString(undefined, opts);
    } catch (e) {
      return '';
    }
  }

  function formatMsgTime(iso) {
    if (!iso) return '';
    try {
      var d = new Date(iso);
      return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  }

  function chatsEmptyIconSvg() {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
    );
  }

  function chatRowChevronSvg() {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>'
    );
  }

  function inboxAvatarHtml(u) {
    var name = (u && u.full_name) || '';
    var url = u && u.avatar;
    if (url) {
      return (
        '<div class="chat-row__avatar chat-row__avatar--img"><img src="' +
        escapeHtml2(url) +
        '" alt="" /></div>'
      );
    }
    return '<div class="chat-row__avatar">' + escapeHtml2(mpUserInitials(name)) + '</div>';
  }

  function catPillStyle(active) {
    return (
      'background:' +
      (active ? 'var(--primary)' : 'var(--bg2)') +
      ';color:' +
      (active ? '#fff' : 'var(--text)') +
      ';border:1px solid ' +
      (active ? 'var(--primary)' : 'var(--border)') +
      ';border-radius:99px;padding:7px 16px;font-size:13px;font-weight:500;cursor:pointer;white-space:nowrap;transition:all 0.15s;'
    );
  }

  function initHome() {
    var params = new URLSearchParams(location.search);
    var catFromUrl = params.get('category');
    var filters = { sort: 'newest', page: 1 };
    if (catFromUrl) filters.category = catFromUrl;
    var products = [];
    var total = 0;
    var pages = 1;
    var loading = false;
    var searchInput = document.getElementById('home-search');
    var grid = document.getElementById('product-grid');
    var catsEl = document.getElementById('category-pills');
    var countEl = document.getElementById('home-result-count');
    var loadMoreBtn = document.getElementById('home-load-more');
    var emptyEl = document.getElementById('home-empty');
    var loadingEl = document.getElementById('home-loading');

    function buildCard(p) {
      var img = p.images && p.images[0];
      var primary = p.images && p.images.find(function (i) { return i.is_primary; });
      if (primary) img = primary;
      var imgHtml = img
        ? '<img src="' +
          img.url +
          '" alt="" style="width:100%;height:100%;object-fit:cover"/>'
        : '<span style="font-size:48px">📦</span>';
      var loc =
        p.location && p.location.name
          ? '<p class="product-card__loc"><span class="product-card__loc-inner">' +
            pdMetaSvgMapPin() +
            '<span>' +
            escapeHtml(p.location.name) +
            '</span></span></p>'
          : '';
      var cat = p.category
        ? '<span class="product-card__cat"><span class="product-card__cat-inner">' +
          pdMetaSvgTag() +
          '<span>' +
          escapeHtml(p.category.name) +
          '</span></span></span>'
        : '';
      return (
        '<a class="product-card-link" href="/product/' +
        p.id +
        '/"><div class="product-card"><div class="product-card__thumb">' +
        imgHtml +
        '</div><div class="product-card__body"><p class="product-card__title">' +
        escapeHtml(p.title) +
        '</p><p class="product-card__price">' +
        money(p.price) +
        ' ' +
        MP.t('common.currency') +
        '</p>' +
        loc +
        '<div class="product-card__meta"><span class="product-card__meta-item">' +
        pdMetaSvgEye() +
        '<span>' +
        p.views_count +
        '</span></span><span class="product-card__meta-item">' +
        pdMetaSvgHeart() +
        '<span>' +
        p.likes_count +
        '</span></span>' +
        cat +
        '</div></div></div></a>'
      );
    }

    function escapeHtml(s) {
      if (!s) return '';
      return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function renderGrid() {
      if (!grid) return;
      grid.innerHTML = products.map(buildCard).join('');
      if (countEl) countEl.textContent = total + ' listings found';
      if (emptyEl) emptyEl.style.display = products.length ? 'none' : 'block';
      if (loadingEl) loadingEl.style.display = loading && products.length === 0 ? 'block' : 'none';
      if (loadMoreBtn) {
        loadMoreBtn.style.display = (filters.page || 1) < pages && products.length ? 'inline-block' : 'none';
        loadMoreBtn.disabled = loading;
      }
    }

    function loadProducts(reset) {
      if (reset) {
        filters.page = 1;
        products = [];
      }
      loading = true;
      renderGrid();
      var q = new URLSearchParams();
      if (filters.q) q.set('q', filters.q);
      if (filters.category) q.set('category', filters.category);
      if (filters.min_price) q.set('min_price', filters.min_price);
      if (filters.max_price) q.set('max_price', filters.max_price);
      if (filters.location) q.set('location', filters.location);
      if (filters.sort) q.set('sort', filters.sort);
      q.set('page', String(filters.page || 1));
      MP.apiFetch('/products/?' + q.toString(), { method: 'GET' })
        .then(function (r) {
          return r.json();
        })
        .then(function (data) {
          total = data.total;
          pages = data.pages;
          if ((filters.page || 1) > 1) products = products.concat(data.products);
          else products = data.products;
        })
        .catch(function () {})
        .finally(function () {
          loading = false;
          renderGrid();
        });
    }

    /* ── Locations: select dropdown пур кунед ── */
    MP.apiFetch('/locations/', { method: 'GET' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var locEl = document.getElementById('home-location');
        if (!locEl) return;
        var locs = data.locations || [];
        locEl.innerHTML = '<option value="">— Ҳама ҷойҳо —</option>' +
          locs.map(function (l) {
            return '<option value="' + l.id + '">' + l.name + (l.region ? ' (' + l.region + ')' : '') + '</option>';
          }).join('');
        locEl.addEventListener('change', function () {
          filters.location = locEl.value || undefined;
          loadProducts(true);
        });
      })
      .catch(function () {});

    MP.apiFetch('/categories/', { method: 'GET' })
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        if (!catsEl) return;
        var allBtn =
          '<button type="button" data-cat="" style="' +
          catPillStyle(!filters.category) +
          '">🏠 ' +
          MP.t('home.allCategories') +
          '</button>';
        var rest = (data.categories || [])
          .map(function (c) {
            return (
              '<button type="button" data-cat="' +
              escapeHtml(c.slug) +
              '" style="' +
              catPillStyle(filters.category === c.slug) +
              '">' +
              c.icon +
              ' ' +
              escapeHtml(c.name) +
              '</button>'
            );
          })
          .join('');
        catsEl.innerHTML = allBtn + rest;
        catsEl.querySelectorAll('button[data-cat]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            filters.category = btn.getAttribute('data-cat') || undefined;
            catsEl.querySelectorAll('button[data-cat]').forEach(function (b) {
              b.setAttribute('style', catPillStyle(b.getAttribute('data-cat') === (filters.category || '')));
            });
            loadProducts(true);
          });
        });
      })
      .catch(function () {});

    loadProducts(true);

    document.getElementById('home-search-btn') &&
      document.getElementById('home-search-btn').addEventListener('click', function () {
        filters.q = (searchInput && searchInput.value) || '';
        loadProducts(true);
      });
    searchInput &&
      searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          filters.q = searchInput.value || '';
          loadProducts(true);
        }
      });

    ['home-min-price', 'home-max-price'].forEach(function (id) {
      var node = document.getElementById(id);
      if (!node) return;
      node.addEventListener('blur', function () {
        if (id === 'home-min-price') filters.min_price = node.value || undefined;
        if (id === 'home-max-price') filters.max_price = node.value || undefined;
        loadProducts(true);
      });
    });
    var sortEl = document.getElementById('home-sort');
    if (sortEl) {
      sortEl.addEventListener('change', function () {
        filters.sort = sortEl.value;
        loadProducts(true);
      });
    }
    document.getElementById('home-clear-filters') &&
      document.getElementById('home-clear-filters').addEventListener('click', function () {
        filters = { sort: 'newest', page: 1 };
        if (searchInput) searchInput.value = '';
        var mn = document.getElementById('home-min-price');
        var mx = document.getElementById('home-max-price');
        var loc = document.getElementById('home-location');
        if (mn) mn.value = '';
        if (mx) mx.value = '';
        if (loc) { loc.value = ''; }
        if (sortEl) sortEl.value = 'newest';
        loadProducts(true);
      });

    loadMoreBtn &&
      loadMoreBtn.addEventListener('click', function () {
        filters.page = (filters.page || 1) + 1;
        loadProducts(false);
      });
  }

  function initLogin() {
    var email = document.getElementById('login-email');
    var pass = document.getElementById('login-password');
    var err = document.getElementById('login-error');
    var btn = document.getElementById('login-submit');
    function go() {
      err.style.display = 'none';
      MP.apiFetch('/login/', {
        method: 'POST',
        body: JSON.stringify({ email: email.value, password: pass.value }),
      })
        .then(function (r) {
          return r.json().then(function (j) {
            return { ok: r.ok, j: j };
          });
        })
        .then(function (_ref) {
          if (!_ref.ok) {
            err.textContent = _ref.j.error || MP.t('common.error');
            err.style.display = 'block';
            return;
          }
          MP.setTokens(_ref.j.access, _ref.j.refresh);
          window.location.href = '/';
        })
        .catch(function () {
          err.textContent = MP.t('common.error');
          err.style.display = 'block';
        });
    }
    btn && btn.addEventListener('click', go);
    pass && pass.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') go();
    });
  }

  function initRegister() {
    var err = document.getElementById('reg-error');
    var btn = document.getElementById('reg-submit');
    btn &&
      btn.addEventListener('click', function () {
        err.style.display = 'none';
        var full_name = document.getElementById('reg-fullname').value;
        var email = document.getElementById('reg-email').value;
        var password = document.getElementById('reg-password').value;
        var confirm = document.getElementById('reg-confirm').value;
        if (!email || !password || !full_name) {
          err.textContent = 'Ҳамаи майдонҳо лозиманд';
          err.style.display = 'block';
          return;
        }
        if (password !== confirm) {
          err.textContent = 'Паролҳо мувофиқат намекунанд';
          err.style.display = 'block';
          return;
        }
        if (password.length < 8) {
          err.textContent = 'Парол ҳадди аққал 8 аломат бошад';
          err.style.display = 'block';
          return;
        }
        MP.apiFetch('/register/', {
          method: 'POST',
          body: JSON.stringify({
            email: email,
            password: password,
            full_name: full_name,
          }),
        })
          .then(function (r) {
            return r.json().then(function (j) {
              return { ok: r.ok, j: j };
            });
          })
          .then(function (_ref2) {
            if (!_ref2.ok) {
              err.textContent = _ref2.j.error || MP.t('common.error');
              err.style.display = 'block';
              return;
            }
            var phone = document.getElementById('reg-phone').value;
            if (phone) localStorage.setItem('reg_phone', phone);
            window.location.href = '/verify/?email=' + encodeURIComponent(email);
          })
          .catch(function () {
            err.textContent = MP.t('common.error');
            err.style.display = 'block';
          });
      });
  }

  function initVerify() {
    var params = new URLSearchParams(location.search);
    var email = params.get('email') || '';
    document.getElementById('verify-email-display').textContent = email;
    var err = document.getElementById('verify-error');
    var ok = document.getElementById('verify-resent');
    var btn = document.getElementById('verify-submit');
    var code = document.getElementById('verify-code');
    code &&
      code.addEventListener('input', function () {
        code.value = code.value.replace(/\D/g, '').slice(0, 6);
      });
    btn &&
      btn.addEventListener('click', function () {
        err.style.display = 'none';
        if (code.value.length !== 6) {
          err.textContent = 'Enter the 6-digit code';
          err.style.display = 'block';
          return;
        }
        MP.apiFetch('/verify-email/', {
          method: 'POST',
          body: JSON.stringify({ email: email, code: code.value }),
        })
          .then(function (r) {
            return r.json().then(function (j) {
              return { ok: r.ok, j: j };
            });
          })
          .then(function (_ref3) {
            if (!_ref3.ok) {
              err.textContent = _ref3.j.error || 'Invalid code';
              err.style.display = 'block';
              return;
            }
            MP.setTokens(_ref3.j.access, _ref3.j.refresh);
            window.location.href = '/';
          });
      });
    document.getElementById('verify-resend') &&
      document.getElementById('verify-resend').addEventListener('click', function () {
        MP.apiFetch('/resend-verification/', {
          method: 'POST',
          body: JSON.stringify({ email: email }),
        }).then(function () {
          ok.style.display = 'block';
        });
      });
  }

  function initForgot() {
    var step = 'email';
    var err = document.getElementById('fp-error');
    var succ = document.getElementById('fp-success');
    var email = document.getElementById('fp-email');
    var code = document.getElementById('fp-code');
    var np = document.getElementById('fp-newpass');
    document.getElementById('fp-send') &&
      document.getElementById('fp-send').addEventListener('click', function () {
        err.style.display = 'none';
        MP.apiFetch('/forgot-password/', {
          method: 'POST',
          body: JSON.stringify({ email: email.value }),
        })
          .then(function () {
            step = 'reset';
            document.getElementById('fp-step-email').style.display = 'none';
            document.getElementById('fp-step-reset').style.display = 'block';
            succ.textContent = 'Code sent! Check your email.';
            succ.style.display = 'block';
          })
          .catch(function () {
            err.textContent = MP.t('common.error');
            err.style.display = 'block';
          });
      });
    document.getElementById('fp-reset') &&
      document.getElementById('fp-reset').addEventListener('click', function () {
        err.style.display = 'none';
        succ.style.display = 'none';
        MP.apiFetch('/reset-password/', {
          method: 'POST',
          body: JSON.stringify({
            email: email.value,
            code: code.value,
            new_password: np.value,
          }),
        })
          .then(function (r) {
            return r.json().then(function (j) {
              return { ok: r.ok, j: j };
            });
          })
          .then(function (_ref4) {
            if (!_ref4.ok) {
              err.textContent = _ref4.j.error || MP.t('common.error');
              err.style.display = 'block';
              return;
            }
            succ.textContent = 'Password reset successfully!';
            succ.style.display = 'block';
            setTimeout(function () {
              window.location.href = '/login/';
            }, 1500);
          });
      });
  }

  function initRestore() {
    var err = document.getElementById('restore-error');
    document.getElementById('restore-submit') &&
      document.getElementById('restore-submit').addEventListener('click', function () {
        err.style.display = 'none';
        MP.apiFetch('/user/restore/', {
          method: 'POST',
          body: JSON.stringify({
            email: document.getElementById('restore-email').value,
            password: document.getElementById('restore-password').value,
          }),
        })
          .then(function (r) {
            return r.json().then(function (j) {
              return { ok: r.ok, j: j };
            });
          })
          .then(function (_ref5) {
            if (!_ref5.ok) {
              err.textContent = _ref5.j.error || 'Could not restore account';
              err.style.display = 'block';
              return;
            }
            MP.setTokens(_ref5.j.access, _ref5.j.refresh);
            window.location.href = '/';
          });
      });
  }

  function initProfile() {
    if (!MP.requireAuth()) return;
    var tab = 'listings';
    var products = [];
    var user = null;

    function renderTabs() {
      ['listings', 'edit', 'settings'].forEach(function (k) {
        var b = document.getElementById('tab-' + k);
        if (!b) return;
        var on = tab === k;
        b.style.background = on ? 'var(--bg2)' : 'transparent';
        b.style.color = on ? 'var(--primary)' : 'var(--text2)';
        b.style.fontWeight = on ? '700' : '500';
        b.style.boxShadow = on ? '0 2px 8px rgba(0,0,0,0.1)' : 'none';
      });
      document.getElementById('profile-pane-listings').style.display = tab === 'listings' ? 'block' : 'none';
      document.getElementById('profile-pane-edit').style.display = tab === 'edit' ? 'block' : 'none';
      document.getElementById('profile-pane-settings').style.display = tab === 'settings' ? 'block' : 'none';
    }

    MP.apiFetch('/user/me/')
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        user = data.user;
        document.getElementById('pf-name').textContent = user.full_name || user.email.split('@')[0];
        document.getElementById('pf-email').textContent = user.email;
        document.getElementById('pf-phone').textContent = user.phone || '';
        document.getElementById('pf-phone-row').style.display = user.phone ? 'block' : 'none';
        document.getElementById('pf-date').textContent = new Date(user.created_at).toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        var av = document.getElementById('pf-avatar');
        if (user.avatar) av.innerHTML = '<img src="' + user.avatar + '" style="width:100%;height:100%;object-fit:cover" alt=""/>';
        else {
          var ini = user.full_name
            ? user.full_name
                .split(' ')
                .map(function (w) {
                  return w[0];
                })
                .join('')
                .toUpperCase()
                .slice(0, 2)
            : user.email[0].toUpperCase();
          av.textContent = ini;
        }
        document.getElementById('edit-fullname').value = user.full_name || '';
        document.getElementById('edit-phone').value = user.phone || '';
        document.getElementById('edit-email').value = user.email;
      });

    MP.apiFetch('/user/me/products/')
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        products = data.products || [];
        document.getElementById('pf-count').textContent = String(products.length);
        var grid = document.getElementById('profile-products');
        if (!products.length) {
          grid.innerHTML = document.getElementById('profile-empty-template').innerHTML;
          return;
        }
        grid.innerHTML = products
          .map(function (p) {
            var img = p.images && p.images[0];
            var primary = p.images && p.images.find(function (i) {
              return i.is_primary;
            });
            if (primary) img = primary;
            var imgHtml = img
              ? '<img src="' + img.url + '" alt="" style="width:100%;height:100%;object-fit:cover"/>'
              : '<span style="font-size:48px">📦</span>';
            return (
              '<a class="product-card-link" href="/product/' +
              p.id +
              '/"><div class="product-card"><div style="width:100%;height:190px;background:var(--bg3);display:flex;align-items:center;justify-content:center;overflow:hidden">' +
              imgHtml +
              '</div><div style="padding:12px"><p style="margin:0;font-size:14px;font-weight:600">' +
              p.title +
              '</p><p style="margin:6px 0 0;font-size:17px;font-weight:800;color:var(--primary)">' +
              money(p.price) +
              ' ' +
              MP.t('common.currency') +
              '</p></div></div></a>'
            );
          })
          .join('');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns =
        'repeat(auto-fill, minmax(min(178px, 100%), 1fr))';
        grid.style.gap = '16px';
      });

    document.getElementById('tab-listings').onclick = function () {
      tab = 'listings';
      renderTabs();
    };
    document.getElementById('tab-edit').onclick = function () {
      tab = 'edit';
      renderTabs();
    };
    document.getElementById('tab-settings').onclick = function () {
      tab = 'settings';
      renderTabs();
    };
    renderTabs();

    document.getElementById('edit-save').onclick = function () {
      var msg = document.getElementById('edit-msg');
      msg.style.display = 'none';
      MP.apiFetch('/user/me/', {
        method: 'PUT',
        body: JSON.stringify({
          full_name: document.getElementById('edit-fullname').value,
          phone: document.getElementById('edit-phone').value,
        }),
      })
        .then(function (r) {
          return r.json().then(function (j) {
            return { ok: r.ok, j: j };
          });
        })
        .then(function (_ref6) {
          msg.style.display = 'block';
          msg.style.background = _ref6.ok ? '#f0fdf4' : '#fef2f2';
          msg.style.borderColor = _ref6.ok ? '#86efac' : '#fca5a5';
          msg.style.color = _ref6.ok ? '#16a34a' : '#dc2626';
          msg.textContent = _ref6.ok ? '✅ Маълумот нигоҳ дошта шуд!' : '❌ Хато';
        });
    };

    document.getElementById('pf-deactivate').onclick = function () {
      if (!confirm(MP.t('profile.deactivateConfirm'))) return;
      MP.apiFetch('/user/deactivate/', { method: 'POST', body: '{}' }).then(function () {
        MP.clearTokens();
        window.location.href = '/';
      });
    };
    document.getElementById('pf-delete').onclick = function () {
      if (!confirm(MP.t('profile.deleteConfirm'))) return;
      MP.apiFetch('/user/delete/', { method: 'POST', body: '{}' }).then(function () {
        MP.clearTokens();
        window.location.href = '/';
      });
    };
  }

  function initCreateProduct() {
    if (!MP.requireAuth()) return;
    var cats = [];
    var locs = [];
    Promise.all([
      MP.apiFetch('/categories/').then(function (r) {
        return r.json();
      }),
      MP.apiFetch('/locations/').then(function (r) {
        return r.json();
      }),
    ]).then(function (arr) {
      cats = arr[0].categories || [];
      locs = arr[1].locations || [];
      var cs = document.getElementById('cr-category');
      var ls = document.getElementById('cr-location');
      cs.innerHTML = '<option value="">' + MP.t('create.category') + '</option>' + cats.map(function (c) {
        return '<option value="' + c.id + '">' + c.icon + ' ' + c.name + '</option>';
      }).join('');
      ls.innerHTML = '<option value="">' + MP.t('create.location') + '</option>' + locs.map(function (l) {
        return '<option value="' + l.id + '">' + l.name + '</option>';
      }).join('');
    });

    document.getElementById('cr-submit').onclick = function () {
      var err = document.getElementById('cr-error');
      err.style.display = 'none';
      var title = document.getElementById('cr-title').value;
      var description = document.getElementById('cr-desc').value;
      var price = document.getElementById('cr-price').value;
      if (!title || !description || !price) {
        err.textContent = 'Унвон, тавсиф ва нарх лозиманд';
        err.style.display = 'block';
        return;
      }
      var body = {
        title: title,
        description: description,
        price: parseFloat(price),
        category_id: document.getElementById('cr-category').value || undefined,
        location_id: document.getElementById('cr-location').value || undefined,
      };
      MP.apiFetch('/products/', { method: 'POST', body: JSON.stringify(body) })
        .then(function (r) {
          return r.json().then(function (j) {
            return { ok: r.ok, j: j };
          });
        })
        .then(function (_ref7) {
          if (!_ref7.ok) {
            err.textContent = _ref7.j.error || MP.t('common.error');
            err.style.display = 'block';
            return;
          }
          var pid = _ref7.j.id;
          var files = document.getElementById('cr-files').files;
          if (files && files.length) {
            var fd = new FormData();
            for (var i = 0; i < files.length; i++) fd.append('images', files[i]);
            return MP.apiFetch('/products/' + pid + '/images/', { method: 'POST', body: fd }).then(function () {
              window.location.href = '/product/' + pid + '/';
            });
          }
          window.location.href = '/product/' + pid + '/';
        });
    };
  }

  function initProductDetail() {
    var id = document.body.getAttribute('data-product-id');
    var root = document.getElementById('pd-root');
    var state = { p: null, user: null };

    function redraw() {
      if (!state.p) return;
      root.innerHTML = renderProductDetail(state.p, state.user, id);
      var imgs = state.p.images || [];
      root.querySelectorAll('.pd-thumb').forEach(function (t) {
        t.addEventListener('click', function () {
          var idx = parseInt(t.getAttribute('data-idx'), 10);
          var mi = document.getElementById('pd-main-img');
          if (mi && imgs[idx]) {
            mi.src = imgs[idx].url;
            var ctr = document.getElementById('pd-ctr');
            if (ctr) ctr.textContent = String(idx + 1);
          }
          root.querySelectorAll('.pd-thumb').forEach(function (th) {
            th.style.border = '2px solid var(--border)';
          });
          t.style.border = '3px solid var(--primary)';
        });
      });
      var likeBtn = document.getElementById('pd-like');
      if (likeBtn) {
        likeBtn.addEventListener('click', function () {
          MP.apiFetch('/products/' + id + '/like/', { method: 'POST', body: '{}' })
            .then(function (r) {
              return r.json();
            })
            .then(function (d) {
              state.p.liked_by_me = d.liked;
              state.p.likes_count = d.likes_count;
              redraw();
            });
        });
      }
      var del = document.getElementById('pd-delete');
      if (del) {
        del.addEventListener('click', function () {
          if (!confirm(MP.t('product.deleteConfirm'))) return;
          MP.apiFetch('/products/' + id + '/', { method: 'DELETE' }).then(function () {
            window.location.href = '/';
          });
        });
      }
      initAiWidget(id);
    }

    MP.apiFetch('/products/' + id + '/')
      .then(function (r) {
        if (!r.ok) throw new Error('nf');
        return r.json();
      })
      .then(function (data) {
        state.p = data.product;
        return MP.apiFetch('/user/me/')
          .then(function (r) {
            return r.ok ? r.json() : { user: null };
          })
          .catch(function () {
            return { user: null };
          });
      })
      .then(function (me) {
        state.user = me.user;
        redraw();
      })
      .catch(function () {
        root.innerHTML =
          '<div style="text-align:center;padding:80px;color:var(--text3)"><div style="font-size:64px;margin-bottom:16px">🔍</div><p style="font-size:18px;margin-bottom:16px">Маҳсулот ёфт нашуд</p><a href="/" style="color:var(--primary);font-weight:600">← Ба хона</a></div>';
      });
  }

  function renderProductDetail(p, user, id) {
    var isOwner = user && String(user.id) === String(p.owner.id);
    var images = p.images || [];
    var loc = p.location;
    var cat = p.category;
    var thumbs =
      images.length > 1
        ? '<div style="display:flex;gap:8px;margin-bottom:24px;overflow-x:auto;padding-bottom:4px">' +
          images
            .map(function (img, i) {
              return (
                '<div class="pd-thumb" data-idx="' +
                i +
                '" style="width:72px;height:72px;flex-shrink:0;border-radius:10px;overflow:hidden;cursor:pointer;border:2px solid var(--border)"><img src="' +
                img.url +
                '" alt="" style="width:100%;height:100%;object-fit:cover"/></div>'
              );
            })
            .join('') +
          '</div>'
        : '';
    var mainImg = images[0]
      ? '<img id="pd-main-img" src="' + images[0].url + '" style="width:100%;height:100%;object-fit:cover" alt=""/>'
      : '<span style="font-size:80px">📦</span>';
    var ownerActions = isOwner
      ? '<div style="background:var(--bg2);border-radius:16px;border:1px solid var(--border);padding:16px;margin-bottom:16px;display:flex;flex-wrap:wrap;gap:10px;align-items:center"><span style="font-size:13px;color:var(--text2);flex:1;min-width:160px">🔧 Шумо соҳиби ин эълон ҳастед</span><a href="/chats/?product=' +
        encodeURIComponent(id) +
        '" style="padding:9px 16px;border-radius:9px;border:1px solid var(--border);background:var(--primary-light);text-decoration:none;color:var(--primary-text);font-size:13px;font-weight:700">💬 ' +
        escapeHtml2(MP.t('chats.withBuyers')) +
        '</a><a href="/product/' +
        id +
        '/edit/" style="padding:9px 18px;border-radius:9px;border:1px solid var(--border);background:var(--bg3);text-decoration:none;color:var(--text);font-size:13px;font-weight:600">✏️ ' +
        MP.t('product.edit') +
        '</a><button type="button" id="pd-delete" style="padding:9px 18px;border-radius:9px;border:1px solid #fca5a5;background:#fef2f2;color:#dc2626;font-size:13px;font-weight:600;cursor:pointer">🗑 ' +
        MP.t('product.delete') +
        '</button></div>'
      : '';
    var likeBlock =
      user && !isOwner
        ? '<button type="button" id="pd-like" class="pd-like-btn" style="width:100%;padding:13px;border-radius:12px;margin-bottom:12px;border:2px solid ' +
          (p.liked_by_me ? '#ef4444' : 'var(--border)') +
          ';background:' +
          (p.liked_by_me ? '#fef2f2' : 'var(--bg3)') +
          ';color:' +
          (p.liked_by_me ? '#ef4444' : 'var(--text2)') +
          ';font-weight:700;font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px">' +
          pdLikeSvg(!!p.liked_by_me) +
          '<span>' +
          (p.liked_by_me ? MP.t('product.unlike') : MP.t('product.like')) +
          '</span></button>'
        : '';
    var auth = user
      ? ''
      : '<div style="margin-top:16px;padding:14px;background:var(--bg3);border-radius:12px;border:1px solid var(--border);text-align:center"><p style="margin:0 0 10px;font-size:13px;color:var(--text2)">Барои тамос ва лайк ворид шавед</p><a href="/login/" style="display:inline-block;padding:9px 24px;background:var(--primary);color:#fff;border-radius:9px;text-decoration:none;font-size:14px;font-weight:600">Воридшавӣ</a></div>';
    var chat =
      user && !isOwner
        ? '<a href="/chat/' +
          id +
          '/" style="display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:13px;border-radius:12px;background:var(--bg3);border:1px solid var(--border);color:var(--text);text-decoration:none;font-weight:600;font-size:15px;box-sizing:border-box">✉️ Паём фиристодан</a>'
        : '';
    var sellerContact = '';
    if (!isOwner) {
      if (p.owner.phone) {
        var rawPhone = String(p.owner.phone).trim();
        var telBody = rawPhone.replace(/^tel:/i, '').trim();
        var waDigits = telBody.replace(/\D/g, '');
        var wtLine = MP.t('product.whatsPrefill');
        if (p.title) {
          wtLine +=
            ': «' +
            String(p.title).slice(0, 140).replace(/\s+/g, ' ').trim() +
            '»';
        }
        var waHref =
          waDigits.length > 0 ? 'https://wa.me/' + waDigits + '?text=' + encodeURIComponent(wtLine) : '';
        sellerContact +=
          '<div style="margin-bottom:16px;padding:14px;border-radius:14px;border:1px solid var(--border);background:var(--bg3);box-sizing:border-box">' +
          '<p style="margin:0 0 8px;font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.07em">' +
          escapeHtml2(MP.t('product.phone')) +
          '</p>' +
          '<a href="tel:' +
          encodeURIComponent(telBody) +
          '" style="display:block;font-size:18px;font-weight:800;color:var(--primary-text);letter-spacing:.02em;text-decoration:none;margin-bottom:12px;line-height:1.35;word-break:break-word">' +
          escapeHtml2(rawPhone) +
          '</a>' +
          (waHref
            ? '<a href="' +
              waHref +
              '" target="_blank" rel="noopener noreferrer" style="display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:12px 14px;border-radius:12px;background:#128c7e;color:#fff;text-decoration:none;font-weight:700;font-size:15px;box-sizing:border-box;background-image:linear-gradient(180deg,#25d366 0%,#128c7e 100%);box-shadow:0 4px 14px rgba(37,211,102,0.35)">💬 ' +
              escapeHtml2(MP.t('product.whatsapp')) +
              '</a>'
            : '') +
          '</div>';
      } else {
        sellerContact +=
          '<p style="margin:0 0 14px;font-size:13px;color:var(--text3);line-height:1.5">' +
          escapeHtml2(MP.t('product.noPhoneSeller')) +
          '</p>';
      }
    }
    var avatar = p.owner.avatar
      ? '<img src="' + p.owner.avatar + '" alt="" style="width:100%;height:100%;object-fit:cover"/>'
      : (p.owner.full_name && p.owner.full_name[0] ? p.owner.full_name[0].toUpperCase() : '?');
    return (
      '<div style="max-width:1100px;margin:0 auto;padding:24px 16px"><div style="display:flex;align-items:center;gap:8px;margin-bottom:20px;font-size:13px"><a href="/" style="color:var(--primary);text-decoration:none">Хона</a><span style="color:var(--text3)">›</span>' +
      (cat
        ? '<a href="/?category=' +
          cat.slug +
          '" class="pd-breadcrumb-cat" style="color:var(--primary);text-decoration:none;display:inline-flex;align-items:center;gap:6px">' +
          pdMetaSvgTag() +
          '<span>' +
          escapeHtml2(cat.name) +
          '</span></a><span style="color:var(--text3)">›</span>'
        : '') +
      '<span style="color:var(--text2);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' +
      p.title +
      '</span></div><div class="product-detail-grid"><div><div style="width:100%;height:420px;background:var(--bg3);border-radius:20px;overflow:hidden;display:flex;align-items:center;justify-content:center;margin-bottom:12px;border:1px solid var(--border);position:relative">' +
      mainImg +
      (images.length > 1
        ? '<div style="position:absolute;bottom:14px;right:14px;background:rgba(0,0,0,0.55);color:#fff;padding:4px 10px;border-radius:99px;font-size:12px;font-weight:600"><span id="pd-ctr">1</span> / ' +
          images.length +
          '</div>'
        : '') +
      '</div>' +
      thumbs +
      '<div style="background:var(--bg2);border-radius:16px;border:1px solid var(--border);padding:24px;margin-bottom:16px"><h1 style="margin:0 0 12px;font-size:24px;font-weight:800;color:var(--text);line-height:1.3">' +
      p.title +
      '</h1><div class="pd-meta-row">' +
      '<span class="pd-meta-pill">' +
      pdMetaSvgEye() +
      '<span>' +
      p.views_count +
      ' ' +
      MP.t('product.views') +
      '</span></span><span class="pd-meta-pill">' +
      pdMetaSvgHeart() +
      '<span>' +
      p.likes_count +
      ' ' +
      MP.t('product.likes') +
      '</span></span>' +
      (loc && loc.name
        ? '<span class="pd-meta-pill">' + pdMetaSvgMapPin() + '<span>' + escapeHtml2(loc.name) + '</span></span>'
        : '') +
      (cat
        ? '<span class="pd-meta-pill pd-meta-pill--cat">' +
          pdMetaSvgTag() +
          '<span>' +
          escapeHtml2(cat.name) +
          '</span></span>'
        : '') +
      '<span class="pd-meta-pill pd-meta-pill--date">' +
      pdMetaSvgClock() +
      '<span>' +
      new Date(p.created_at).toLocaleDateString('ru-RU') +
      '</span></span></div><div style="background:var(--bg3);border-radius:12px;padding:16px;color:var(--text);font-size:15px;line-height:1.7;white-space:pre-wrap">' +
      escapeHtml2(p.description) +
      '</div></div>' +
      ownerActions +
      '<div id="ai-widget-wrap"></div></div><div><div class="product-detail-sidebar" style="background:var(--bg2);border:1px solid var(--border);border-radius:20px;padding:24px;position:sticky;top:76px"><div style="background:linear-gradient(135deg,var(--primary-light),var(--bg3));border-radius:14px;padding:18px 20px;margin-bottom:20px;border:1px solid var(--border)"><p style="margin:0 0 2px;font-size:13px;color:var(--text2)">Нарх</p><p style="margin:0;font-size:34px;font-weight:900;color:var(--primary)">' +
      money(p.price) +
      '<span style="font-size:16px;font-weight:600;margin-left:6px">' +
      MP.t('common.currency') +
      '</span></p></div>' +
      likeBlock +
      '<div style="height:1px;background:var(--border);margin:20px 0"></div><p style="margin:0 0 12px;font-size:12px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:0.05em">' +
      MP.t('product.postedBy') +
      '</p><a href="/user/' +
      p.owner.id +
      '/" style="text-decoration:none"><div style="display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;border:1px solid var(--border);margin-bottom:16px;background:var(--bg3)"><div style="width:44px;height:44px;border-radius:50%;background:var(--primary-light);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;color:var(--primary-text);overflow:hidden;flex-shrink:0">' +
      avatar +
      '</div><div><p style="margin:0;font-weight:700;color:var(--text);font-size:15px">' +
      (p.owner.full_name || 'Фурӯшанда') +
      '</p><p style="margin:2px 0 0;font-size:12px;color:var(--primary)">Профилро бинед →</p></div></div></a>' +
      sellerContact +
      chat +
      auth +
      '</div></div></div></div>'
    );
  }

  function escapeHtml2(s) {
    if (!s) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function initAiWidget(productId) {
    var wrap = document.getElementById('ai-widget-wrap');
    if (!wrap) return;
    if (!MP.getAccess()) {
      wrap.innerHTML =
        '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:20px;padding:20px;margin-top:20px"><div style="display:flex;align-items:center;gap:10px;margin-bottom:16px"><div style="width:38px;height:38px;border-radius:50%;background:var(--primary-light);display:flex;align-items:center;justify-content:center;font-size:20px;border:1px solid var(--border)">🤖</div><div><p style="margin:0;font-weight:700;font-size:15px">AI Ёрдамчи</p><p style="margin:0;font-size:12px;color:var(--text3)">Бо маҳсулот шинос шавед</p></div></div><div style="background:var(--bg3);border-radius:14px;padding:20px;text-align:center;border:1px dashed var(--border)"><p style="margin:0 0 12px;font-size:14px;color:var(--text2)">🔒 Барои AI ёрдамчи ворид шавед</p><a href="/login/" style="display:inline-block;padding:9px 24px;background:var(--primary);color:#fff;border-radius:9px;text-decoration:none;font-size:14px;font-weight:600">Воридшавӣ</a></div></div>';
      return;
    }
    wrap.innerHTML =
      '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:20px;padding:20px;margin-top:20px"><div style="display:flex;align-items:center;gap:10px;margin-bottom:16px"><div style="width:38px;height:38px;border-radius:50%;background:var(--primary-light);display:flex;align-items:center;justify-content:center;font-size:20px;border:1px solid var(--border)">🤖</div><div style="flex:1"><p style="margin:0;font-weight:700;font-size:15px">' +
      MP.t('ai.title') +
      '</p><p style="margin:0;font-size:12px;color:var(--text3)">Groq AI • онлайн</p></div><button type="button" id="ai-clear" style="background:none;border:1px solid var(--border);border-radius:8px;padding:5px 10px;color:var(--text3);font-size:12px;cursor:pointer">🗑 ' +
      MP.t('ai.clear') +
      '</button></div><div id="ai-msgs" style="height:320px;overflow-y:auto;background:var(--bg3);border-radius:14px;border:1px solid var(--border);padding:14px;margin-bottom:12px;display:flex;flex-direction:column;gap:10px"></div><div style="display:flex;gap:8px"><input id="ai-input" placeholder="' +
      MP.t('ai.placeholder') +
      '" style="flex:1;padding:11px 16px;border-radius:12px;border:1px solid var(--border);font-size:14px;outline:none;background:var(--bg);color:var(--text)"/><button type="button" id="ai-send" style="background:var(--primary);color:#fff;border:1px solid var(--border);border-radius:12px;padding:11px 20px;font-size:14px;font-weight:700;cursor:pointer">➤</button></div></div>';

    var msgs = [];
    function renderMsgs() {
      var box = document.getElementById('ai-msgs');
      if (!box) return;
      if (!msgs.length) {
        box.innerHTML =
          '<div style="margin:auto 0"><div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:16px"><div style="width:32px;height:32px;border-radius:50%;background:var(--primary-light);display:flex;align-items:center;justify-content:center;font-size:16px;border:1px solid var(--border)">🤖</div><div style="background:var(--bg2);border-radius:14px 14px 14px 4px;padding:12px 14px;border:1px solid var(--border);font-size:14px;color:var(--text);max-width:85%">Салом! Ман AI ёрдамчи ҳастам.</div></div><p style="font-size:12px;color:var(--text3);margin-bottom:8px;padding-left:42px">Пешниҳодҳо:</p><div style="display:flex;flex-wrap:wrap;gap:6px;padding-left:42px"><button type="button" class="ai-sug" style="background:var(--primary-light);color:var(--primary-text);border:1px solid var(--border);border-radius:99px;padding:6px 14px;font-size:13px;cursor:pointer">' +
          MP.t('ai.suggestions.price') +
          '</button><button type="button" class="ai-sug" style="background:var(--primary-light);color:var(--primary-text);border:1px solid var(--border);border-radius:99px;padding:6px 14px;font-size:13px;cursor:pointer">' +
          MP.t('ai.suggestions.compare') +
          '</button></div></div>';
        box.querySelectorAll('.ai-sug').forEach(function (b) {
          b.onclick = function () {
            sendAi(b.textContent);
          };
        });
        return;
      }
      box.innerHTML = msgs
        .map(function (m) {
          var u = m.role === 'user';
          return (
            '<div style="display:flex;flex-direction:' +
            (u ? 'row-reverse' : 'row') +
            ';align-items:flex-end;gap:8px"><div style="max-width:78%;padding:10px 14px;border-radius:' +
            (u ? '16px 16px 4px 16px' : '16px 16px 16px 4px') +
            ';background:' +
            (u ? 'var(--primary)' : 'var(--bg2)') +
            ';color:' +
            (u ? '#fff' : 'var(--text)') +
            ';font-size:14px;line-height:1.55;border:' +
            (u ? 'none' : '1px solid var(--border)') +
            ';white-space:pre-wrap">' +
            escapeHtml2(m.content) +
            '</div></div>'
          );
        })
        .join('');
      box.scrollTop = box.scrollHeight;
    }

    function sendAi(text) {
      text = (text || '').trim();
      if (!text) return;
      MP.apiFetch('/ai/chat/' + productId + '/', {
        method: 'POST',
        body: JSON.stringify({ message: text }),
      })
        .then(function (r) {
          return r.json();
        })
        .then(function (d) {
          msgs.push(d.user_message, d.ai_response);
          renderMsgs();
        });
    }

    MP.apiFetch('/ai/chat/' + productId + '/', { method: 'GET' })
      .then(function (r) {
        return r.json();
      })
      .then(function (d) {
        msgs = d.messages || [];
        renderMsgs();
      })
      .catch(function () {
        renderMsgs();
      });

    document.getElementById('ai-send').onclick = function () {
      var inp = document.getElementById('ai-input');
      sendAi(inp.value);
      inp.value = '';
    };
    document.getElementById('ai-clear').onclick = function () {
      if (!confirm('Таърихи чатро тоза кунед?')) return;
      MP.apiFetch('/ai/history/' + productId + '/', { method: 'DELETE' }).then(function () {
        msgs = [];
        renderMsgs();
      });
    };
  }

  function initEditProduct() {
    if (!MP.requireAuth()) return;
    var id = document.body.getAttribute('data-product-id');
    Promise.all([
      MP.apiFetch('/products/' + id + '/').then(function (r) {
        return r.json();
      }),
      MP.apiFetch('/categories/').then(function (r) {
        return r.json();
      }),
      MP.apiFetch('/locations/').then(function (r) {
        return r.json();
      }),
      MP.apiFetch('/user/me/').then(function (r) {
        return r.json();
      }),
    ]).then(function (arr) {
      var p = arr[0].product;
      if (String(arr[3].user.id) !== String(p.owner.id)) {
        window.location.href = '/';
        return;
      }
      document.getElementById('ed-title').value = p.title;
      document.getElementById('ed-desc').value = p.description;
      document.getElementById('ed-price').value = p.price;
      var cats = arr[1].categories || [];
      var locs = arr[2].locations || [];
      var cs = document.getElementById('ed-category');
      var ls = document.getElementById('ed-location');
      cs.innerHTML =
        '<option value="">—</option>' +
        cats
          .map(function (c) {
            return '<option value="' + c.id + '"' + (p.category && String(p.category.id) === String(c.id) ? ' selected' : '') + '>' + c.icon + ' ' + c.name + '</option>';
          })
          .join('');
      ls.innerHTML =
        '<option value="">—</option>' +
        locs
          .map(function (l) {
            return (
              '<option value="' +
              l.id +
              '"' +
              (p.location && p.location.id === l.id ? ' selected' : '') +
              '>' +
              l.name +
              '</option>'
            );
          })
          .join('');
      document.getElementById('ed-submit').onclick = function () {
        MP.apiFetch('/products/' + id + '/', {
          method: 'PUT',
          body: JSON.stringify({
            title: document.getElementById('ed-title').value,
            description: document.getElementById('ed-desc').value,
            price: document.getElementById('ed-price').value,
            category_id: cs.value || null,
            location_id: ls.value || null,
          }),
        }).then(function () {
          var files = document.getElementById('ed-files').files;
          if (files && files.length) {
            var fd = new FormData();
            for (var i = 0; i < files.length; i++) fd.append('images', files[i]);
            return MP.apiFetch('/products/' + id + '/images/', { method: 'POST', body: fd });
          }
        }).then(function () {
          window.location.href = '/product/' + id + '/';
        });
      };
    });
  }

  function initDirectChat() {
    if (!MP.requireAuth()) return;
    var id = document.body.getAttribute('data-product-id');
    var qp = new URLSearchParams(window.location.search);
    var buyerParam = qp.get('buyer');
    function chatUrl() {
      var u = '/chat/' + id + '/';
      if (buyerParam) u += '?buyer=' + encodeURIComponent(buyerParam);
      return u;
    }

    var back = document.getElementById('dc-back');
    if (back) back.href = '/product/' + id + '/';
    var box = document.getElementById('dc-msgs');
    var inp = document.getElementById('dc-input');
    var sendBtn = document.getElementById('dc-send');

    function render(msgs, meta) {
      if (meta) {
        var ou = meta.other_user || {};
        var titleEl = document.getElementById('dc-title');
        var subEl = document.getElementById('dc-sub');
        var av = document.getElementById('dc-avatar');
        if (titleEl) titleEl.textContent = ou.full_name ? ou.full_name : '…';
        if (subEl) subEl.textContent = meta.product && meta.product.title ? meta.product.title : '';
        if (av) {
          if (ou.avatar) {
            av.innerHTML = '<img src="' + escapeHtml2(ou.avatar) + '" alt="" />';
            av.className = 'dc-peer__avatar dc-peer__avatar--img';
          } else {
            av.innerHTML = '';
            av.textContent = mpUserInitials(ou.full_name || '');
            av.className = 'dc-peer__avatar';
          }
        }
      }
      box.innerHTML = (msgs || [])
        .map(function (m) {
          var mine = m.is_mine;
          var t = formatMsgTime(m.timestamp);
          return (
            '<div class="dc-msg-row' +
            (mine ? ' dc-msg-row--mine' : '') +
            '"><div class="dc-bubble' +
            (mine ? ' dc-bubble--mine' : ' dc-bubble--other') +
            '"><span class="dc-bubble__text">' +
            escapeHtml2(m.content) +
            '</span>' +
            (t
              ? '<time class="dc-bubble__time" datetime="' +
                escapeHtml2(m.timestamp) +
                '">' +
                escapeHtml2(t) +
                '</time>'
              : '') +
            '</div></div>'
          );
        })
        .join('');
      box.scrollTop = box.scrollHeight;
    }

    MP.apiFetch(chatUrl()).then(function (r) {
      return r.json().catch(function () {
        return {};
      }).then(function (d) {
        return { ok: r.ok, d: d };
      });
    }).then(function (res) {
      if (!res.ok || (res.d && res.d.error)) {
        var key = res.d && res.d.error;
        var msg =
          key === 'buyer_required'
            ? MP.t('chats.buyerRequired')
            : MP.t('common.error');
        box.innerHTML =
          '<div class="dc-error">' +
          escapeHtml2(msg) +
          '<br><a href="/chats/">' +
          escapeHtml2(MP.t('chats.goInbox')) +
          '</a></div>';
        if (inp) inp.disabled = true;
        if (sendBtn) sendBtn.disabled = true;
        return;
      }
      var state = res.d;

      render(state.messages, {
        product: state.product,
        other_user: state.other_user,
      });

      function postMessage() {
        var t = inp.value.trim();
        if (!t) return;
        inp.value = '';
        MP.apiFetch(chatUrl(), {
          method: 'POST',
          body: JSON.stringify({ content: t }),
        })
          .then(function (r) {
            return r.json().catch(function () {
              return {};
            }).then(function (m) {
              return { ok: r.ok, m: m };
            });
          })
          .then(function (rx) {
            if (!rx.ok || (rx.m && rx.m.error)) return;
            state.messages.push(rx.m);
            render(state.messages, {
              product: state.product,
              other_user: state.other_user,
            });
          });
      }

      sendBtn.onclick = postMessage;
      inp.onkeydown = function (ev) {
        if (ev.key === 'Enter' && !ev.shiftKey) {
          ev.preventDefault();
          postMessage();
        }
      };
    }).catch(function () {
      box.innerHTML =
        '<div class="dc-error">' + escapeHtml2(MP.t('common.error')) + '</div>';
      if (sendBtn) sendBtn.disabled = true;
      if (inp) inp.disabled = true;
    });
  }

  function initChatsInbox() {
    if (!MP.requireAuth()) return;
    var root = document.getElementById('chats-root');
    if (!root) return;
    var filterPid = new URLSearchParams(location.search).get('product');

    MP.apiFetch('/chats/')
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        var chats = data.chats || [];
        if (filterPid) {
          chats = chats.filter(function (c) {
            return String(c.product_id) === String(filterPid);
          });
        }
        if (!chats.length) {
          root.innerHTML =
            '<div class="chats-empty">' +
            '<div class="chats-empty__icon">' +
            chatsEmptyIconSvg() +
            '</div><p class="chats-empty__text">' +
            escapeHtml2(MP.t('chats.empty')) +
            '</p></div>';
          return;
        }
        root.innerHTML = chats
          .map(function (c) {
            var href =
              c.role === 'seller'
                ? '/chat/' + c.product_id + '/?buyer=' + encodeURIComponent(c.buyer_id)
                : '/chat/' + c.product_id + '/';
            var unread = c.unread || 0;
            var unreadHtml =
              unread > 0
                ? '<span class="chat-row__unread">' + (unread > 99 ? '99+' : String(unread)) + '</span>'
                : '';
            var roleLabel =
              c.role === 'seller' ? MP.t('chats.asSeller') : MP.t('chats.asBuyer');
            var displayName =
              c.other_user && c.other_user.full_name ? c.other_user.full_name : '…';
            return (
              '<a class="chat-row" href="' +
              href +
              '">' +
              inboxAvatarHtml(c.other_user) +
              '<div class="chat-row__body">' +
              '<div class="chat-row__top">' +
              '<span class="chat-row__name">' +
              escapeHtml2(displayName) +
              '</span>' +
              unreadHtml +
              '<span class="chat-row__time">' +
              escapeHtml2(formatChatListTime(c.updated_at)) +
              '</span></div>' +
              '<div class="chat-row__mid">' +
              '<span class="chat-row__product">' +
              escapeHtml2(c.product_title || '') +
              '</span>' +
              '<span class="chat-row__role chat-row__role--' +
              escapeHtml2(c.role) +
              '">' +
              escapeHtml2(roleLabel) +
              '</span></div>' +
              '<p class="chat-row__preview">' +
              escapeHtml2(c.last_message || '—') +
              '</p></div>' +
              '<span class="chat-row__chevron">' +
              chatRowChevronSvg() +
              '</span></a>'
            );
          })
          .join('');
      })
      .catch(function () {
        root.innerHTML =
          '<p style="color:#ef4444;text-align:center">' +
          escapeHtml2(MP.t('common.error')) +
          '</p>';
      });
  }

  function initPublicProfile() {
    var uid = document.body.getAttribute('data-public-user-id');
    MP.apiFetch('/user/' + uid + '/')
      .then(function (r) {
        if (!r.ok) throw new Error('nf');
        return r.json();
      })
      .then(function (d) {
        var u = d.user;
        document.getElementById('pub-name').textContent = u.full_name || 'Корбар';
        document.getElementById('pub-email').textContent = u.email;
        var av = document.getElementById('pub-avatar');
        if (u.avatar) av.innerHTML = '<img src="' + u.avatar + '" style="width:100%;height:100%;object-fit:cover" alt=""/>';
        else
          av.textContent = u.full_name
            ? u.full_name
                .split(' ')
                .map(function (w) {
                  return w[0];
                })
                .join('')
                .toUpperCase()
                .slice(0, 2)
            : u.email[0].toUpperCase();
        return MP.apiFetch('/products/?page=1').then(function (r) {
          return r.json();
        }).then(function (pd) {
          var list = (pd.products || []).filter(function (p) {
            return String(p.owner.id) === String(uid);
          });
          document.getElementById('pub-count').textContent = String(list.length);
          var grid = document.getElementById('pub-products');
          grid.innerHTML = list
            .map(function (p) {
              var img = p.images && p.images[0];
              var imgHtml = img
                ? '<img src="' + img.url + '" style="width:100%;height:100%;object-fit:cover"/>'
                : '<span style="font-size:48px">📦</span>';
              return (
                '<a class="product-card-link" href="/product/' +
                p.id +
                '/"><div class="product-card"><div style="width:100%;height:190px;background:var(--bg3);display:flex;align-items:center;justify-content:center;overflow:hidden">' +
                imgHtml +
                '</div><div style="padding:12px"><p style="margin:0;font-weight:600">' +
                p.title +
                '</p><p style="margin:6px 0 0;font-weight:800;color:var(--primary)">' +
                money(p.price) +
                '</p></div></div></a>'
              );
            })
            .join('');
          grid.style.display = 'grid';
          grid.style.gridTemplateColumns =
        'repeat(auto-fill, minmax(min(178px, 100%), 1fr))';
          grid.style.gap = '16px';
        });
      })
      .catch(function () {
        document.getElementById('pub-root').innerHTML =
          '<div style="text-align:center;padding:80px"><p style="font-size:52px;margin:0 0 12px">👤</p><p style="color:var(--text2)">Корбар ёфт нашуд</p><a href="/" style="color:var(--primary)">← Ба хона</a></div>';
      });
  }

  window.MP_PAGE_INIT = {
    home: initHome,
    login: initLogin,
    register: initRegister,
    verify: initVerify,
    forgot_password: initForgot,
    restore: initRestore,
    profile: initProfile,
    create_product: initCreateProduct,
    product_detail: initProductDetail,
    edit_product: initEditProduct,
    direct_chat: initDirectChat,
    chats: initChatsInbox,
    public_profile: initPublicProfile,
    not_found: function () {},
  };
})();