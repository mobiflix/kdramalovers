// ============================================
//   MOBIFLIX AUTH — BYPASSED (NO LOGIN)
//   Login removed — direct access to homepage
// ============================================

// ✅ Laging "logged in"
function isLoggedIn() {
  return true;
}

// ✅ No-op login (kung may tumawag man)
function login(username, password) {
  return true;
}

// ✅ No-op logout — walang cache clearing, walang redirect
function logout() {
  console.log('[MobiFlix] Auth bypassed — no logout needed');
}

// ✅ Itago ang login screen kung meron man
function showLoginScreen() {
  const screen = document.getElementById('login-screen');
  if (screen) screen.style.display = 'none';
  document.body.classList.remove('locked');
  const app = document.getElementById('app-content');
  if (app) app.style.display = '';
}

// ✅ Ipakita ang app content at i-hide ang login screen
function hideLoginScreen() {
  const screen = document.getElementById('login-screen');
  if (screen) screen.style.display = 'none';
  document.body.classList.remove('locked');
  const app = document.getElementById('app-content');
  if (app) app.style.display = '';

  // ✅ I-trigger ang snow effect kung meron
  setTimeout(function() {
    if (typeof createSnow === 'function') {
      if (!document.getElementById('snow-container')) {
        createSnow();
      }
    }
  }, 300);
}

// ✅ Walang confirm dialog — walang gagawin
function handleLogout() {
  // Bypassed — walang logout
}

// ✅ Sa load, laging itago ang login screen at ipakita ang app
document.addEventListener('DOMContentLoaded', function() {
  hideLoginScreen();

  // Kung may login form man sa HTML, i-disable na lang
  const form = document.getElementById('login-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      hideLoginScreen();
    });
  }
});

// ✅ Walang session expiry interval — tinanggal para walang alert
