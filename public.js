// ── PUBLIC PAGE FUNCTIONS ──

function showAuthScreen() {
  var pub = document.getElementById("publicScreen");
  var auth = document.getElementById("authScreen");
  var app = document.getElementById("appScreen");

  if (pub) pub.style.display = "none";
  if (app) app.style.display = "none";
  if (auth) {
    auth.style.display = "flex";
    // inputları temizle
    if(document.getElementById("authEmail")) document.getElementById("authEmail").value = "";
    if(document.getElementById("authPass")) document.getElementById("authPass").value = "";
  }
}

async function loadPublicGames() {
  var mostEl = document.getElementById("most-played-list");
  if (!mostEl) return;

  try {
    // Veri çekme (app.js'deki 'sb' değişkenini kullanır)
    const { data, error } = await sb.from('user_games').select('game_id, game_name, game_image, released, score');
    
    if (error || !data || data.length === 0) {
      mostEl.innerHTML = '<div style="color:var(--muted); padding:20px;">Henüz popüler oyun verisi bulunmuyor.</div>';
      return;
    }

    var map = {};
    data.forEach(function(row) {
      if (!map[row.game_id]) {
        map[row.game_id] = { 
          name: row.game_name, 
          image: row.game_image, 
          released: row.released, 
          count: 0, 
          scores: [] 
        };
      }
      map[row.game_id].count++;
      map[row.game_id].scores.push(row.score);
    });

    var sorted = Object.values(map).sort(function(a,b){ return b.count - a.count; }).slice(0,10);
    
    mostEl.innerHTML = ""; // Yükleniyor yazısını temizle

    sorted.forEach(function(g, idx) {
      var avg = (g.scores.reduce(function(s,x){ return s+x; },0) / g.scores.length).toFixed(1);
      
      // Kart oluşturma
      var card = document.createElement("div");
      card.className = "game-card";
      card.innerHTML = `
        <img src="${g.image}" class="game-img" alt="${g.name}">
        <div class="game-info">
          <div class="game-name">${g.name}</div>
          <div class="game-meta">
            <span>${g.count} Oyuncu</span>
            <span style="color:var(--accent); font-weight:bold;">★ ${avg}</span>
          </div>
        </div>
      `;
      mostEl.appendChild(card);
    });

  } catch (err) {
    console.error("Public load error:", err);
    mostEl.innerHTML = '<div style="color:var(--muted); padding:20px;">Veriler şu an yüklenemiyor.</div>';
  }
}
