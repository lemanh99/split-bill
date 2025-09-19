;(function () {
  const getConfig = () => {
    const cfg = (window.AUTH_CONFIG || {});
    
    // Get domain from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const domain = urlParams.get('domain');
    
    let apiBase;
    if (domain) {
      // If domain parameter exists, use it
      apiBase = `http://${domain}`;
    } else {
      // Fallback to config or current origin
      apiBase = cfg.API_BASE || (window.location.origin);
    }
    
    return {
      API_BASE: apiBase,
      CALLBACK_URL: cfg.CALLBACK_URL || encodeURIComponent(window.location.origin)
    };
  };

  // Token helpers
  function getAccessToken() { return localStorage.getItem('access_token'); }
  function getRefreshToken() { return localStorage.getItem('refresh_token'); }
  function setTokens(accessToken, refreshToken) {
    if (accessToken) localStorage.setItem('access_token', accessToken);
    if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
  }
  function clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  async function refreshAccessToken() {
    const { API_BASE } = getConfig();
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;
    try {
      const response = await fetch(`${API_BASE}/api/auth/refresh-token?refresh_token=${refreshToken}`, {
        method: 'GET', headers: { 'accept': 'application/json' }
      });
      if (!response.ok) return null;
      const json = await response.json();
      const token = json?.data;
      if (token?.access_token) {
        setTokens(token.access_token, token.refresh_token);
        return token.access_token;
      }
    } catch (e) { console.error('Token refresh failed:', e); }
    return null;
  }

  async function fetchUserInfo() {
    const { API_BASE } = getConfig();
    let accessToken = getAccessToken();
    if (!accessToken) return null;
    try {
      let resp = await fetch(`${API_BASE}/api/auth/me`, {
        method: 'GET', headers: { 'accept': 'application/json', 'Authorization': `Bearer ${accessToken}` }
      });
      if (resp.status === 401) {
        const newToken = await refreshAccessToken();
        if (!newToken) { clearTokens(); return null; }
        resp = await fetch(`${API_BASE}/api/auth/me`, {
          method: 'GET', headers: { 'accept': 'application/json', 'Authorization': `Bearer ${newToken}` }
        });
      }
      if (!resp.ok) return null;
      const data = await resp.json();
      return data?.data || null;
    } catch (e) { console.error('Failed to fetch user info:', e); return null; }
  }

  function updateUIForUser(user) {
    const loginBtn = document.getElementById('login-btn');
    const mobileLoginBtn = document.getElementById('mobile-login-btn');
    if (loginBtn) loginBtn.style.display = 'none';
    if (mobileLoginBtn) mobileLoginBtn.style.display = 'none';

    // Desktop user menu
    const userMenu = document.getElementById('user-menu');
    if (userMenu) {
      userMenu.style.display = 'flex';
      const userName = userMenu.querySelector('#user-name');
      const userAvatar = userMenu.querySelector('#user-avatar');
      if (userName) userName.textContent = user?.profile?.full_name || user?.email || '';
      if (userAvatar && user?.profile?.avatar) { userAvatar.src = user.profile.avatar; userAvatar.style.display = 'block'; }
    }

    // Mobile user section in dropdown menu
    const mobileUserSection = document.getElementById('mobile-user-section');
    if (mobileUserSection) {
      mobileUserSection.style.display = 'block';
      const mobileMenuUserName = mobileUserSection.querySelector('#mobile-menu-user-name');
      const mobileMenuUserAvatar = mobileUserSection.querySelector('#mobile-menu-user-avatar');
      if (mobileMenuUserName) mobileMenuUserName.textContent = user?.profile?.full_name || user?.email || '';
      if (mobileMenuUserAvatar && user?.profile?.avatar) { 
        mobileMenuUserAvatar.src = user.profile.avatar; 
        mobileMenuUserAvatar.style.display = 'block'; 
      }
    }
  }

  function updateUIForGuest() {
    const loginBtn = document.getElementById('login-btn');
    const mobileLoginBtn = document.getElementById('mobile-login-btn');
    if (loginBtn) loginBtn.style.display = 'block';
    if (mobileLoginBtn) mobileLoginBtn.style.display = 'block';
    
    // Hide desktop user menu
    const userMenu = document.getElementById('user-menu');
    if (userMenu) userMenu.style.display = 'none';
    
    // Hide mobile user section in dropdown menu
    const mobileUserSection = document.getElementById('mobile-user-section');
    if (mobileUserSection) mobileUserSection.style.display = 'none';
  }

  function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return { code: params.get('code'), state: params.get('state'), redirect_uri: params.get('redirect_uri') };
  }

  async function exchangeTokenWithQuery() {
    const { API_BASE, CALLBACK_URL } = getConfig();
    try {
      const qs = window.location.search || '';
      if (!qs) return false;
      const sep = qs.includes('?') ? '&' : '?';
      const url = `${API_BASE}/api/auth/google-sign-in/token${qs}${sep}redirect_uri=${CALLBACK_URL}`;
      const resp = await fetch(url, { method: 'GET', headers: { 'accept': 'application/json' } });
      if (!resp.ok) throw new Error('Token exchange failed');
      const data = await resp.json();
      const token = data?.data;
      if (token?.access_token) localStorage.setItem('access_token', token.access_token);
      if (token?.refresh_token) localStorage.setItem('refresh_token', token.refresh_token);
      window.location.href = '/';
      return true;
    } catch (e) {
      console.error(e);
      const statusEl = document.getElementById('status');
      if (statusEl) statusEl.textContent = 'Login failed. Please try again.';
      window.location.href = '/';
      return false;
    }
  }

  async function initAuth() {
    // Initial state based on tokens
    const user = await fetchUserInfo();
    if (user) updateUIForUser(user); else updateUIForGuest();

    // Handle OAuth redirect
    const { code, state } = getQueryParams();
    if (code && state) {
      const statusEl = document.getElementById('status');
      if (statusEl) statusEl.textContent = 'Completing sign-in...';
      await exchangeTokenWithQuery();
      const newUser = await fetchUserInfo();
      if (newUser) updateUIForUser(newUser);
    }

    // Wire events
    const userMenuBtn = document.getElementById('user-menu-btn');
    const userDropdown = document.getElementById('user-dropdown');
    if (userMenuBtn && userDropdown) {
      userMenuBtn.addEventListener('click', function (e) {
        e.stopPropagation(); userDropdown.classList.toggle('hidden');
      });
      document.addEventListener('click', function () { userDropdown.classList.add('hidden'); });
    }
    const loginBtn = document.getElementById('login-btn');
    const mobileLoginBtn = document.getElementById('mobile-login-btn');
    if (loginBtn) loginBtn.addEventListener('click', function () { window.location.href = '/login'; });
    if (mobileLoginBtn) mobileLoginBtn.addEventListener('click', function () { window.location.href = '/login'; });
  }

  async function logout() {
    const { API_BASE } = getConfig();
    const accessToken = getAccessToken();
    if (accessToken) {
      try {
        await fetch(`${API_BASE}/api/auth/sign-out`, { method: 'POST', headers: { 'accept': 'application/json', 'Authorization': `Bearer ${accessToken}` } });
      } catch (e) { console.error('Logout request failed:', e); }
    }
    clearTokens();
    updateUIForGuest();
    window.location.href = '/';
  }

  // Public API
  window.Auth = { initAuth, logout, fetchUserInfo };
  // Backward compatibility for inline onclick="logout()"
  window.logout = logout;
})();


