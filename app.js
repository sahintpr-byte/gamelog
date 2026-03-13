/* ── CONFIG & INIT ── */
const SB_URL = 'https://dzjmbwyandrkonqdjalk.supabase.co';
const SB_KEY = 'sb_publishable_oeokT78grwbNQeKo8xtZRA_xJdBkuPD';
const RAWG   = 'b1ba1bc900a14e699e5e98788646cf16';

const { createClient } = supabase;
const sb = createClient(SB_URL, SB_KEY);

const PAGE_SIZE = 30;
let currentUser = null, currentGame = null, currentSort = 'date', dateSortAsc = false;
let listViewMode = 'list', currentPage = 1;
let authMode = 'login', friendsTab = 'following';
let myLists = [], activeListId = null, viewingProfile = null, editingListId = null;

/* ── UI HELPERS ── */
function toast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.style.opacity = "1";
  setTimeout(() => t.style.opacity = "0", 2800);
}

function sc(s) { return s <= 4 ? 'low' : s <= 6 ? 'mid' : 'high'; }

/* ── SESSION & SCREEN MANAGEMENT ── */

// Bu fonksiyon oyun.html tarafından veya manuel girişlerde çağrılır
function showApp(userFromBoot) {
  if (userFromBoot) currentUser = userFromBoot;
  
  const pub = document.getElementById("publicScreen");
  const auth = document.getElementById("authScreen");
  const app = document.getElementById("appScreen");

  // Çakışmaları önlemek için diğer tüm ekranları gizle
  if (pub) pub.style.display = "none";
  if (auth) auth.style.display = "none";
  
  if (app) {
    app.style.display = "block";
    app.classList.remove("hidden");
  }

  // Verileri yükle ve dili uygula
  loadMyLists();
  initHero();
  if (typeof applyLang === "function") applyLang();
}

async function handleLogout() {
  await sb.auth.signOut();
  localStorage.removeItem('isLoggedIn');
  location.reload(); // En temiz çıkış yöntemi sayfayı yenilemektir
}

/* ── AUTHENTICATION ── */
function setAuthMode(mode) {
  authMode = mode;
  const tabLogin = document.getElementById('tabLogin');
  const tabReg = document.getElementById('tabRegister');
  const userInp = document.getElementById('authUsername');
  const btn = document.getElementById('authBtn');

  if (mode === 'login') {
    tabLogin.classList.add('active');
    tabReg.classList.remove('active');
    userInp.classList.add('hidden');
    btn.textContent = 'Giriş Yap';
  } else {
    tabReg.classList.add('active');
    tabLogin.classList.remove('active');
    userInp.classList.remove('hidden');
    btn.textContent = 'Kayıt Ol';
  }
}

async function handleAuth() {
  const email = document.getElementById('authEmail').value;
  const pass = document.getElementById('authPass').value;
  const user = document.getElementById('authUsername').value;

  if (!email || !pass) return toast("E-posta ve şifre gerekli.");

  if (authMode === 'login') {
    const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
    if (error) return toast("Giriş hatası: " + error.message);
    currentUser = data.user;
    showApp();
  } else {
    if (!user) return toast("Kullanıcı adı gerekli.");
    const { data, error } = await sb.auth.signUp({ 
      email, 
      password: pass, 
      options: { data: { username: user } } 
    });
    if (error) return toast("Kayıt hatası: " + error.message);
    toast("Kayıt başarılı! Lütfen e-postanı doğrula.");
  }
}

/* ── SEARCH & RAWG API ── */
async function searchGames() {
  const query = document.getElementById('searchInput').value;
  if (!query) return;
  
  const resDiv = document.getElementById('searchResults');
  resDiv.innerHTML = '<div style="padding:20px; color:var(--muted)">Aranıyor...</div>';

  try {
    const response = await fetch(`https://api.rawg.io/api/games?key=${RAWG}&search=${encodeURIComponent(query)}&page_size=${PAGE_SIZE}`);
    const data = await response.json();
    
    resDiv.innerHTML = "";
    if (!data.results || data.results.length === 0) {
      resDiv.innerHTML = "Sonuç bulunamadı.";
      return;
    }

    data.results.forEach((game, idx) => {
      const card = buildGameCard(game, idx, () => openGameModal(game));
      resDiv.appendChild(card);
    });
  } catch (e) {
    resDiv.innerHTML = "Bir hata oluştu.";
  }
}

/* ── GAME CARDS & MODALS ── */
function buildGameCard(game, index, onClick) {
  const div = document.createElement('div');
  div.className = 'game-card';
  div.onclick = onClick;
  
  const img = game.background_image || 'https://via.placeholder.com/400x225?text=No+Image';
  const name = game.name || 'Bilinmeyen Oyun';
  const year = game.released ? game.released.split('-')[0] : '-';

  div.innerHTML = `
    <img src="${img}" class="game-img" alt="${name}" loading="lazy">
    <div class="game-info">
      <div class="game-name">${name}</div>
      <div class="game-meta">
        <span>${year}</span>
        ${game.metacritic ? `<span style="color:var(--accent)">★ ${game.metacritic}</span>` : ''}
      </div>
    </div>
  `;
  return div;
}

/* ── LIST MANAGEMENT ── */
async function loadMyLists() {
  if (!currentUser) return;
  const { data, error } = await sb.from('user_games').select('*').eq('user_id', currentUser.id);
  if (error) return console.error(error);
  myLists = data || [];
  renderMyLists();
}

function renderMyLists() {
  const container = document.getElementById('myListsContainer');
  if (!container) return;
  
  if (myLists.length === 0) {
    container.innerHTML = '<div style="padding:40px; text-align:center; color:var(--muted)">Henüz listenizde oyun yok.</div>';
    return;
  }

  container.innerHTML = `<h2 class="section-title">Kitaplığım (${myLists.length})</h2>`;
  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
  grid.style.gap = '20px';

  myLists.forEach(item => {
    const fakeGame = { name: item.game_name, background_image: item.game_image, released: item.released };
    const card = buildGameCard(fakeGame, 0, () => {});
    grid.appendChild(card);
  });
  container.appendChild(grid);
}

/* ── TABS ── */
function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  
  const target = document.getElementById('tab-' + tabId);
  if (target) target.classList.remove('hidden');
  
  // Menü ikonunu aktif et
  const links = document.querySelectorAll('.nav-link');
  if (tabId === 'search') links[0].classList.add('active');
  if (tabId === 'mylist') links[1].classList.add('active');
  if (tabId === 'friends') links[2].classList.add('active');
}

/* ── HERO DECORATION ── */
function initHero() {
  const left = document.getElementById('heroLeft');
  const right = document.getElementById('heroRight');
  if (!left || !right || left.children.length > 0) return;

  const games = [
    {img:'https://cdn.akamai.steamstatic.com/steam/apps/220/header.jpg'},
    {img:'https://cdn.akamai.steamstatic.com/steam/apps/203160/header.jpg'},
    {img:'https://cdn.akamai.steamstatic.com/steam/apps/377160/header.jpg'}
  ];

  games.forEach(g => {
    const img = document.createElement('img');
    img.src = g.img;
    img.style.width = "100%";
    img.style.borderRadius = "8px";
    img.style.marginBottom = "10px";
    left.appendChild(img.cloneNode());
    right.appendChild(img.cloneNode());
  });
}

// Global scope'a açılması gereken fonksiyonlar
window.initApp = () => console.log("App ready");
window.showApp = showApp;
window.handleLogout = handleLogout;
window.handleAuth = handleAuth;
window.setAuthMode = setAuthMode;
window.searchGames = searchGames;
window.showTab = showTab;
