const SB_URL = 'https://dzjmbwyandrkonqdjalk.supabase.co';
const SB_KEY = 'sb_publishable_oeokT78grwbNQeKo8xtZRA_xJdBkuPD';
const RAWG   = 'b1ba1bc900a14e699e5e98788646cf16';

const { createClient } = supabase;
const sb = createClient(SB_URL, SB_KEY);

let currentUser = null;
let authMode = 'login';

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.style.opacity = "1";
  setTimeout(() => t.style.opacity = "0", 2800);
}

function showApp(user) {
  if(user) currentUser = user;
  document.getElementById("authScreen").style.display = "none";
  document.getElementById("appScreen").style.display = "block";
  loadMyLists();
}

async function handleLogout() {
  await sb.auth.signOut();
  location.reload();
}

function setAuthMode(mode) {
  authMode = mode;
  document.getElementById('authUsername').classList.toggle('hidden', mode === 'login');
  document.getElementById('tabLogin').classList.toggle('active', mode === 'login');
  document.getElementById('tabRegister').classList.toggle('active', mode === 'register');
  document.getElementById('authBtn').textContent = mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol';
}

async function handleAuth() {
  const email = document.getElementById('authEmail').value;
  const pass = document.getElementById('authPass').value;
  const user = document.getElementById('authUsername').value;

  if (authMode === 'login') {
    const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
    if (error) return toast("Hata: " + error.message);
    showApp(data.user);
  } else {
    const { data, error } = await sb.auth.signUp({ email, password: pass, options: { data: { username: user } } });
    if (error) return toast("Hata: " + error.message);
    toast("Kayıt başarılı! E-postanı onayla.");
  }
}

async function searchGames() {
  const query = document.getElementById('searchInput').value;
  const resDiv = document.getElementById('searchResults');
  resDiv.innerHTML = "Aranıyor...";
  
  const res = await fetch(`https://api.rawg.io/api/games?key=${RAWG}&search=${query}&page_size=20`);
  const data = await res.json();
  
  resDiv.innerHTML = "";
  data.results.forEach(game => {
    const div = document.createElement('div');
    div.className = 'game-card';
    div.innerHTML = `<img src="${game.background_image}" class="game-img"><div class="game-info"><div>${game.name}</div><button onclick="addGame('${game.id}','${game.name.replace(/'/g,"")}','${game.background_image}')" style="font-size:10px; cursor:pointer;">+ Listeye Ekle</button></div>`;
    resDiv.appendChild(div);
  });
}

async function addGame(id, name, img) {
  const { error } = await sb.from('user_games').insert({ 
    user_id: currentUser.id, 
    game_id: id, 
    game_name: name, 
    game_image: img 
  });
  if (error) toast("Hata: " + error.message);
  else { toast("Eklendi!"); loadMyLists(); }
}

async function loadMyLists() {
  const { data } = await sb.from('user_games').select('*').eq('user_id', currentUser.id);
  const cont = document.getElementById('myListsContainer');
  cont.innerHTML = "";
  (data || []).forEach(item => {
    const div = document.createElement('div');
    div.className = 'game-card';
    div.innerHTML = `<img src="${item.game_image}" class="game-img"><div class="game-info">${item.game_name}</div>`;
    cont.appendChild(div);
  });
}

function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.getElementById('tab-' + tabId).classList.remove('hidden');
}
