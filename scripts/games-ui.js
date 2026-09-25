// ================= UNIFIED AUTH & PROFILE LOGIC =================
    function openAuthModal(tab) {
      const modal = document.getElementById('authModal');
      if (!modal) return;
      const raw = localStorage.getItem('tdv_ecosystem_session_v1');
      let activeSession = null;
      if (raw) {
        try { activeSession = JSON.parse(raw); } catch (e) {}
      }

      const loggedInView = document.getElementById('authLoggedInView');
      const guestView = document.getElementById('authGuestView');

      if (activeSession && (activeSession.username || activeSession.fullName)) {
        if (loggedInView) loggedInView.classList.remove('hidden');
        if (guestView) guestView.classList.add('hidden');
        const nameEl = document.getElementById('authModalFullName');
        const userEl = document.getElementById('authModalUsername');
        const avatarEl = document.getElementById('authModalAvatar');
        const roleEl = document.getElementById('authModalRoleBadge');
        if (nameEl) nameEl.textContent = activeSession.fullName || activeSession.username;
        if (userEl) userEl.textContent = '@' + (activeSession.username || 'user');
        if (avatarEl) avatarEl.textContent = activeSession.avatar || '👤';
        if (roleEl) roleEl.textContent = activeSession.schoolClass || (activeSession.grade ? activeSession.grade + 'A' : 'Profil');
      } else {
        if (loggedInView) loggedInView.classList.add('hidden');
        if (guestView) guestView.classList.remove('hidden');
        switchAuthTab(tab || 'login');
      }

      if (typeof modal.showModal === 'function') {
        modal.showModal();
      } else {
        modal.setAttribute('open', '');
      }
      if (window.lucide) lucide.createIcons();
    }
    window.openAuthModal = openAuthModal;

    function closeAuthModal() {
      const modal = document.getElementById('authModal');
      if (!modal) return;
      if (typeof modal.close === 'function') {
        modal.close();
      } else {
        modal.removeAttribute('open');
      }
      const fb = document.getElementById('authFeedback');
      if (fb) {
        fb.className = 'hidden p-3 rounded-xl text-xs font-medium border';
        fb.textContent = '';
      }
    }
    window.closeAuthModal = closeAuthModal;

    function switchAuthTab(tab) {
      const loggedInView = document.getElementById('authLoggedInView');
      const guestView = document.getElementById('authGuestView');
      if (loggedInView) loggedInView.classList.add('hidden');
      if (guestView) guestView.classList.remove('hidden');

      const loginBtn = document.getElementById('authTabLoginBtn');
      const regBtn = document.getElementById('authTabRegisterBtn');
      const loginForm = document.getElementById('authLoginForm');
      const regForm = document.getElementById('authRegisterForm');
      const fb = document.getElementById('authFeedback');
      if (fb) fb.classList.add('hidden');

      if (tab === 'register') {
        if (loginBtn) {
          loginBtn.className = 'py-2 rounded-xl transition text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white cursor-pointer';
        }
        if (regBtn) {
          regBtn.className = 'py-2 rounded-xl transition bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs cursor-pointer';
        }
        if (loginForm) loginForm.classList.add('hidden');
        if (regForm) regForm.classList.remove('hidden');
      } else {
        if (loginBtn) {
          loginBtn.className = 'py-2 rounded-xl transition bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs cursor-pointer';
        }
        if (regBtn) {
          regBtn.className = 'py-2 rounded-xl transition text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white cursor-pointer';
        }
        if (loginForm) loginForm.classList.remove('hidden');
        if (regForm) regForm.classList.add('hidden');
      }
      if (window.lucide) lucide.createIcons();
    }
    window.switchAuthTab = switchAuthTab;

    function quickFillLogin(username, pin) {
      switchAuthTab('login');
      const u = document.getElementById('loginInputUsername');
      const p = document.getElementById('loginInputPin');
      if (u) u.value = username;
      if (p) p.value = pin;
    }
    window.quickFillLogin = quickFillLogin;

    function getRegisteredEcosystemUsers() {
      const DEFAULT_USERS = [
        { userId: 'u_orxan', username: 'orxan', fullName: 'Orxan Əliyev', schoolClass: '10A', grade: 10, pin: '1000', role: 'student', avatar: '👨‍🎓' },
        { userId: 'u_elvin', username: 'elvin_coach', fullName: 'Elvin Müəllim', schoolClass: 'Məşqçi', grade: 0, pin: '2026', role: 'coach', avatar: '⚽' },
        { userId: 'u_admin', username: 'admin', fullName: 'TDV İnzibatçı', schoolClass: 'Rəhbərlik', grade: 0, pin: 'admin2026', role: 'admin', avatar: '🛡️' }
      ];
      try {
        const raw = localStorage.getItem('tdv_registered_users_v1');
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list) && list.length > 0) return list;
        }
      } catch (e) {}
      try {
        localStorage.setItem('tdv_registered_users_v1', JSON.stringify(DEFAULT_USERS));
      } catch (e) {}
      return DEFAULT_USERS;
    }

    function dispatchSSOBrokerState(session, users) {
      try {
        const BROKER_URL = 'https://tdv-community-hubs.vercel.app/sso-broker.html';
        let iframe = document.getElementById('tdv_sso_broker_bridge');
        if (!iframe) {
          iframe = document.createElement('iframe');
          iframe.id = 'tdv_sso_broker_bridge';
          iframe.src = BROKER_URL;
          iframe.style.display = 'none';
          iframe.setAttribute('aria-hidden', 'true');
          iframe.onload = function() {
            try {
              iframe.contentWindow.postMessage({ type: 'TDV_SSO_SET', session: session, users: users }, '*');
            } catch (err) {}
          };
          document.body.appendChild(iframe);
        } else {
          iframe.contentWindow.postMessage({ type: 'TDV_SSO_SET', session: session, users: users }, '*');
        }
      } catch (e) {}
    }

    function showAuthFeedback(msg, isSuccess) {
      const fb = document.getElementById('authFeedback');
      if (!fb) return;
      fb.classList.remove('hidden');
      if (isSuccess) {
        fb.className = 'p-3 rounded-xl text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-center';
      } else {
        fb.className = 'p-3 rounded-xl text-xs font-semibold bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-center';
      }
      fb.textContent = msg;
    }

    function handleAuthLoginSubmit(e) {
      if (e && e.preventDefault) e.preventDefault();
      const userIn = (document.getElementById('loginInputUsername')?.value || '').trim();
      const pinIn = (document.getElementById('loginInputPin')?.value || '').trim();
      if (!userIn) {
        showAuthFeedback('Zəhmət olmasa istifadəçi adı daxil edin.', false);
        return;
      }

      const users = getRegisteredEcosystemUsers();
      const matched = users.find(u =>
        (u.username && u.username.toLowerCase() === userIn.toLowerCase()) ||
        (u.fullName && u.fullName.toLowerCase() === userIn.toLowerCase())
      );

      if (!matched) {
        showAuthFeedback("⚠️ '" + userIn + "' istifadəçi adı qeydiyyatda tapılmadı! Zəhmət olmasa 'Qeydiyyat' sekmesindən yeni vahid profil açın.", false);
        return;
      }

      if (matched.pin && String(matched.pin).trim() !== '') {
        if (!pinIn || pinIn !== String(matched.pin).trim()) {
          showAuthFeedback('❌ Daxil edilən PIN kod və ya şifrə yanlışdır!', false);
          return;
        }
      }

      const session = {
        userId: matched.userId || 'usr_' + Date.now().toString(36),
        username: matched.username,
        fullName: matched.fullName || matched.username,
        role: matched.role || (matched.schoolClass === 'Məşqçi' ? 'coach' : 'student'),
        schoolClass: matched.schoolClass || '10A',
        grade: matched.grade || 10,
        avatar: matched.avatar || '🎓',
        token: 'tdv_sec_' + Math.random().toString(36).slice(2) + Date.now().toString(36),
        createdAt: Date.now(),
        expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000)
      };

      localStorage.setItem('tdv_ecosystem_session_v1', JSON.stringify(session));
      dispatchSSOBrokerState(session, users);
      showAuthFeedback('✓ Uğurla daxil oldunuz! Ekosistem sinxronlaşdırılır...', true);
      setTimeout(() => {
        closeAuthModal();
        if (typeof renderUserSessionBadge === 'function') renderUserSessionBadge();
        if (typeof decorateEcosystemLinks === 'function') decorateEcosystemLinks();
      }, 500);
    }
    window.handleAuthLoginSubmit = handleAuthLoginSubmit;

    function handleAuthRegisterSubmit(e) {
      if (e && e.preventDefault) e.preventDefault();
      const fullName = (document.getElementById('regInputFullName')?.value || '').trim();
      const username = (document.getElementById('regInputUsername')?.value || '').trim();
      const schoolClass = document.getElementById('regInputClass')?.value || '10A';
      const avatar = document.getElementById('regInputAvatar')?.value || '🎓';
      const pin = (document.getElementById('regInputPin')?.value || '').trim();
      const confirmPin = (document.getElementById('regInputConfirmPin')?.value || '').trim();

      if (!fullName) {
        showAuthFeedback('Zəhmət olmasa ad və soyadınızı daxil edin.', false);
        return;
      }
      if (!username) {
        showAuthFeedback('Zəhmət olmasa istifadəçi adı seçin.', false);
        return;
      }
      if (pin && confirmPin && pin !== confirmPin) {
        showAuthFeedback('Daxil edilən şifrələr bir-birinə uyğun gəlmir.', false);
        return;
      }

      const users = getRegisteredEcosystemUsers();
      const exists = users.some(u => u.username && u.username.toLowerCase() === username.toLowerCase());
      if (exists) {
        showAuthFeedback("⚠️ '" + username + "' istifadəçi adı artıq tutulub! Zəhmət olmasa başqa ad seçin.", false);
        return;
      }

      const parsedGrade = parseInt(schoolClass) || 10;
      const newUser = {
        userId: 'usr_' + Date.now().toString(36),
        fullName: fullName,
        username: username,
        schoolClass: schoolClass,
        grade: parsedGrade,
        role: schoolClass === 'Məşqçi' ? 'coach' : schoolClass === 'Müəllim' ? 'teacher' : 'student',
        avatar: avatar,
        pin: pin,
        createdAt: Date.now()
      };

      users.push(newUser);
      localStorage.setItem('tdv_registered_users_v1', JSON.stringify(users));

      const session = {
        userId: newUser.userId,
        username: newUser.username,
        fullName: newUser.fullName,
        role: newUser.role,
        schoolClass: newUser.schoolClass,
        grade: newUser.grade,
        avatar: newUser.avatar,
        token: 'tdv_sec_' + Math.random().toString(36).slice(2) + Date.now().toString(36),
        createdAt: Date.now(),
        expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000)
      };

      localStorage.setItem('tdv_ecosystem_session_v1', JSON.stringify(session));
      dispatchSSOBrokerState(session, users);
      showAuthFeedback('✨ Vahid profiliniz uğurla yaradıldı! Giriş edilir...', true);
      setTimeout(() => {
        closeAuthModal();
        if (typeof renderUserSessionBadge === 'function') renderUserSessionBadge();
        if (typeof decorateEcosystemLinks === 'function') decorateEcosystemLinks();
      }, 500);
    }
    window.handleAuthRegisterSubmit = handleAuthRegisterSubmit;

    function logoutEcosystemUser() {
      localStorage.removeItem('tdv_ecosystem_session_v1');
      dispatchSSOBrokerState(null, getRegisteredEcosystemUsers());
      showAuthFeedback('Çıxış edildi.', true);
      setTimeout(() => {
        closeAuthModal();
        if (typeof renderUserSessionBadge === 'function') renderUserSessionBadge();
        if (typeof decorateEcosystemLinks === 'function') decorateEcosystemLinks();
      }, 400);
    }
    window.logoutEcosystemUser = logoutEcosystemUser;

    // Quick Room Code Join for TDV Mafia
    function joinMafiaByCode(e) {
      if (e && e.preventDefault) e.preventDefault();
      const input = document.getElementById('mafiaRoomInput');
      const code = (input ? input.value : '').trim().toUpperCase();
      if (!code) return;
      let targetUrl = 'https://tdv-mafia.vercel.app/lobby/' + encodeURIComponent(code);
      try {
        const raw = localStorage.getItem('tdv_ecosystem_session_v1');
        if (raw) {
          const sess = JSON.parse(raw);
          if (sess && (sess.username || sess.fullName)) {
            const ticket = btoa(unescape(encodeURIComponent(JSON.stringify(sess))));
            targetUrl += '?sso_ticket=' + encodeURIComponent(ticket);
          }
        }
      } catch (err) {}
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
    window.joinMafiaByCode = joinMafiaByCode;

    function renderUserSessionBadge() {
      try {
        const raw = localStorage.getItem('tdv_ecosystem_session_v1');
        const loginBtn = document.getElementById('tdvLoginBtn');
        const badge = document.getElementById('tdvUserBadgeContainer');
        const nameEl = document.getElementById('tdvUserName');
        const avatarEl = document.getElementById('tdvUserAvatar');
        const roleEl = document.getElementById('tdvUserRoleBadge');

        if (!raw) {
          if (badge) { badge.classList.add('hidden'); badge.classList.remove('inline-flex'); }
          if (loginBtn) { loginBtn.classList.remove('hidden'); loginBtn.classList.add('inline-flex'); }
          return;
        }

        const sess = JSON.parse(raw);
        if (!sess || (!sess.username && !sess.fullName)) {
          if (badge) { badge.classList.add('hidden'); badge.classList.remove('inline-flex'); }
          if (loginBtn) { loginBtn.classList.remove('hidden'); loginBtn.classList.add('inline-flex'); }
          return;
        }

        // Ghost check against registered users
        const users = getRegisteredEcosystemUsers();
        const valid = users.some(u => u && u.username && u.username.toLowerCase() === sess.username?.toLowerCase());
        if (!valid) {
          localStorage.removeItem('tdv_ecosystem_session_v1');
          if (badge) { badge.classList.add('hidden'); badge.classList.remove('inline-flex'); }
          if (loginBtn) { loginBtn.classList.remove('hidden'); loginBtn.classList.add('inline-flex'); }
          return;
        }

        if (nameEl) nameEl.textContent = sess.fullName || sess.username;
        if (avatarEl) avatarEl.textContent = sess.avatar || '👤';
        if (roleEl) roleEl.textContent = sess.schoolClass || (sess.grade ? sess.grade + 'A' : 'Profil');
        if (loginBtn) { loginBtn.classList.add('hidden'); loginBtn.classList.remove('inline-flex'); }
        if (badge) { badge.classList.remove('hidden'); badge.classList.add('inline-flex'); }
      } catch (err) {}
    }
    window.renderUserSessionBadge = renderUserSessionBadge;

    (function initTDVEcosystemSSO() {
      const BROKER_URL = 'https://tdv-community-hubs.vercel.app/sso-broker.html';
      const ECO_DOMAINS = [
        'school-minifootball-tournament.vercel.app',
        'tdv-e-school.vercel.app',
        'tdv-games.vercel.app',
        'tdv-mafia.vercel.app',
        'tdv-community-hubs.vercel.app'
      ];

      // 1. Extract sso_ticket from URL parameter if arrived from another portal
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const ticket = urlParams.get('sso_ticket');
        if (ticket) {
          const sessionData = JSON.parse(decodeURIComponent(escape(atob(ticket))));
          if (sessionData && (sessionData.username || sessionData.fullName)) {
            localStorage.setItem('tdv_ecosystem_session_v1', JSON.stringify(sessionData));
            urlParams.delete('sso_ticket');
            const cleanSearch = urlParams.toString();
            const cleanUrl = window.location.pathname + (cleanSearch ? '?' + cleanSearch : '') + window.location.hash;
            window.history.replaceState({}, document.title, cleanUrl);
          }
        }
      } catch (err) {
        console.warn('[SSO] Ticket parse error:', err);
      }

      // 2. Decorate all outbound links pointing to TDV ecosystem domains
      function decorateEcosystemLinks() {
        try {
          const raw = localStorage.getItem('tdv_ecosystem_session_v1');
          if (!raw) return;
          const session = JSON.parse(raw);
          if (!session || (!session.username && !session.fullName)) return;
          const ticket = btoa(unescape(encodeURIComponent(JSON.stringify(session))));

          document.querySelectorAll('a[href]').forEach(link => {
            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
            const isEco = ECO_DOMAINS.some(domain => href.includes(domain));
            if (isEco && !href.includes('sso_ticket=')) {
              const sep = href.includes('?') ? '&' : '?';
              link.setAttribute('href', `${href}${sep}sso_ticket=${encodeURIComponent(ticket)}`);
            }
          });
        } catch (e) {
          console.warn('[SSO] Link decoration error:', e);
        }
      }
      window.decorateEcosystemLinks = decorateEcosystemLinks;

      // 3. Background broker sync
      function syncFromBroker() {
        if (window.location.pathname.endsWith('sso-broker.html')) return;
        try {
          const iframe = document.createElement('iframe');
          iframe.src = BROKER_URL;
          iframe.style.display = 'none';
          iframe.setAttribute('aria-hidden', 'true');
          iframe.setAttribute('tabindex', '-1');

          window.addEventListener('message', function onBrokerMsg(e) {
            if (!e.data || e.data.type !== 'TDV_SSO_STATE') return;
            if (e.data.users && Array.isArray(e.data.users)) {
              try {
                const existing = JSON.parse(localStorage.getItem('tdv_registered_users_v1') || '[]');
                const map = new Map();
                existing.forEach(u => u && u.username && map.set(u.username.toLowerCase(), u));
                e.data.users.forEach(u => u && u.username && map.set(u.username.toLowerCase(), u));
                localStorage.setItem('tdv_registered_users_v1', JSON.stringify(Array.from(map.values())));
              } catch {}
            }
            if (e.data.session) {
              const currentRaw = localStorage.getItem('tdv_ecosystem_session_v1');
              let shouldUpdate = false;
              if (!currentRaw) {
                shouldUpdate = true;
              } else {
                try {
                  const currentObj = JSON.parse(currentRaw);
                  const users = e.data.users || [];
                  const currentValid = users.some(u => u && u.username && u.username.toLowerCase() === currentObj.username?.toLowerCase());
                  if (!currentValid) {
                    shouldUpdate = true;
                  } else if (currentObj.username !== e.data.session.username) {
                    if (e.data.session.createdAt && (!currentObj.createdAt || e.data.session.createdAt >= currentObj.createdAt)) {
                      shouldUpdate = true;
                    }
                  }
                } catch(err) {
                  shouldUpdate = true;
                }
              }

              if (shouldUpdate) {
                localStorage.setItem('tdv_ecosystem_session_v1', JSON.stringify(e.data.session));
                renderUserSessionBadge();
                decorateEcosystemLinks();
              }
            } else {
              const currentRaw = localStorage.getItem('tdv_ecosystem_session_v1');
              if (currentRaw && e.data.users) {
                try {
                  const currentObj = JSON.parse(currentRaw);
                  const exists = e.data.users.some(u => u && u.username && u.username.toLowerCase() === currentObj.username?.toLowerCase());
                  if (!exists) {
                    localStorage.removeItem('tdv_ecosystem_session_v1');
                    renderUserSessionBadge();
                  }
                } catch(err) {}
              }
            }
          });

          iframe.onload = function() {
            try {
              iframe.contentWindow.postMessage({ type: 'TDV_SSO_GET' }, '*');
            } catch {}
          };
          document.body.appendChild(iframe);
        } catch {}
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          renderUserSessionBadge();
          decorateEcosystemLinks();
          syncFromBroker();
        });
      } else {
        renderUserSessionBadge();
        decorateEcosystemLinks();
        syncFromBroker();
      }
    })();

