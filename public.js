// ── PUBLIC.JS ── global scope, no dependencies except RAWG

function showAuthScreen() {
  var p = document.getElementById("publicScreen");
  var a = document.getElementById("authScreen");
  if (p) p.style.display = "none";
  if (a) a.style.display = "flex";
}

// ── TRAILER ──
function openTrailer(game) {
  var ex = document.getElementById("trailerModal");
  if (ex) ex.remove();
  var RAWG = "b1ba1bc900a14e699e5e98788646cf16";
  var steamUrl = "https://store.steampowered.com/search/?term=" + encodeURIComponent(game.name);
  var modal = document.createElement("div");
  modal.id = "trailerModal";
  modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.95);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px";
  modal.innerHTML = '<div style="background:#13131a;border:1px solid #2a2a38;border-radius:16px;overflow:hidden;width:100%;max-width:840px">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-bottom:1px solid #2a2a38">'
    + '<span style="font-weight:600;color:#fff;font-size:14px">&#127916; ' + game.name + '</span>'
    + '<div style="display:flex;align-items:center;gap:10px">'
    + '<a href="' + steamUrl + '" target="_blank" rel="noopener" style="background:#1b2838;color:#66c0f4;text-decoration:none;padding:6px 14px;border-radius:7px;font-weight:600;font-size:12px;border:1px solid #66c0f4">Steam</a>'
    + '<button id="trailerClose" style="background:none;border:none;color:#888;font-size:22px;cursor:pointer;padding:0 6px">&#x2715;</button>'
    + '</div></div>'
    + '<div id="trailerBody" style="min-height:160px;display:flex;align-items:center;justify-content:center;padding:24px;color:#666;font-size:13px">Fragman aranıyor...</div>'
    + '</div>';
  function close() { var f=document.getElementById("trailerFrame"); if(f)f.src="about:blank"; modal.remove(); }
  modal.addEventListener("click", function(e){ if(e.target===modal)close(); });
  document.body.appendChild(modal);
  document.getElementById("trailerClose").addEventListener("click", close);

  function showVideo(url, poster) {
    var b = document.getElementById("trailerBody"); if(!b)return;
    b.style.padding = "0";
    b.innerHTML = '<video id="trailerFrame" controls autoplay playsinline style="width:100%;max-height:500px;display:block;background:#000" poster="'+(poster||'')+'">'
      + '<source src="'+url+'" type="video/mp4"></video>';
  }
  function showYT(videoId) {
    var b = document.getElementById("trailerBody"); if(!b)return;
    b.style.padding = "0";
    b.innerHTML = '<div style="position:relative;width:100%;padding-bottom:56.25%;background:#000">'
      + '<iframe id="trailerFrame" src="https://www.youtube.com/embed/'+videoId+'?autoplay=1&rel=0" '
      + 'style="position:absolute;inset:0;width:100%;height:100%;border:none" '
      + 'allow="autoplay;encrypted-media;fullscreen" allowfullscreen></iframe></div>';
  }
  function searchYT(name) {
    var q = encodeURIComponent(name + " official game trailer");
    var b = document.getElementById("trailerBody"); if(!b)return;
    b.innerHTML = '<div style="color:#666;text-align:center;padding:10px">YouTube aranıyor...</div>';
    fetch("https://inv.nadeko.net/api/v1/search?q="+q+"&type=video&page=1")
      .then(function(r){return r.json();})
      .then(function(items){
        if(items&&items.length>0){ showYT(items[0].videoId); }
        else { var b2=document.getElementById("trailerBody"); if(b2) b2.innerHTML='<p style="color:#666;padding:20px;text-align:center">Video bulunamadı.</p>'; }
      })
      .catch(function(){ var b2=document.getElementById("trailerBody"); if(b2) b2.innerHTML='<p style="color:#666;padding:20px;text-align:center">Video yüklenemedi.</p>'; });
  }
  function tryRawg(slug) {
    fetch("https://api.rawg.io/api/games/"+slug+"/movies?key="+RAWG)
      .then(function(r){return r.json();})
      .then(function(d){
        if(d.results&&d.results.length>0){
          var cl=d.results[0]; var url=(cl.data&&(cl.data.max||cl.data["480"]||cl.data["360"]))||cl.preview;
          if(url){showVideo(url,cl.preview);}else{searchYT(game.name);}
        } else { searchYT(game.name); }
      })
      .catch(function(){ searchYT(game.name); });
  }
  if(game.slug){ tryRawg(game.slug); }
  else {
    fetch("https://api.rawg.io/api/games?key="+RAWG+"&search="+encodeURIComponent(game.name)+"&page_size=1")
      .then(function(r){return r.json();})
      .then(function(sd){ if(sd.results&&sd.results.length>0){tryRawg(sd.results[0].slug);}else{searchYT(game.name);} })
      .catch(function(){ searchYT(game.name); });
  }
}

// ── GAME CARD ──
function buildGameCard(game, idx, onClick) {
  var year = game.released ? game.released.slice(0,4) : "";
  var mc = game.metacritic;
  var mcCol = mc?(mc>=75?"#6fcf6f":mc>=50?"#ffd166":"#ff6b6b"):"";
  var steamUrl = "https://store.steampowered.com/search/?term="+encodeURIComponent(game.name);
  var svg = '<svg width="12" height="12" viewBox="0 0 496 512"><path d="M496 256c0 137-111.2 248-248.4 248-113.8 0-209.7-76.3-239.1-180.4l95.2 39.3c6.4 32.1 34.9 56.4 68.9 56.4 39.2 0 71.9-32.4 70.2-73.5l84.5-60.2c52.1 1.3 95.8-40.9 95.8-93.5 0-51.6-42-93.5-93.7-93.5s-93.7 42-93.7 93.5v1.2L176.6 279c-15.5-.9-30.7 3.4-43.5 12.1L0 235.1C10.2 103.7 122.2 8 248 8c136.9 0 248 111 248 248z" fill="#66c0f4"/></svg>';
  var card = document.createElement("div");
  card.style.cssText = "background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden;cursor:pointer;transition:all .25s;position:relative";
  card.addEventListener("mouseenter",function(){card.style.transform="translateY(-4px)";card.style.borderColor="var(--accent)";var i=card.querySelector("img.cover");if(i)i.style.transform="scale(1.05)";});
  card.addEventListener("mouseleave",function(){card.style.transform="";card.style.borderColor="var(--border)";var i=card.querySelector("img.cover");if(i)i.style.transform="";});
  card.addEventListener("click",function(e){if(!e.target.closest("a"))onClick(game);});
  card.innerHTML = '<div style="position:absolute;top:8px;left:8px;background:rgba(0,0,0,.85);color:#e8ff47;font-family:Bebas Neue,sans-serif;font-size:20px;width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;z-index:2;border:1px solid #e8ff47">'+(idx+1)+'</div>'
    + (game.background_image ? '<div style="width:100%;aspect-ratio:16/9;overflow:hidden"><img class="cover" src="'+game.background_image+'" style="width:100%;height:100%;object-fit:cover;display:block;transition:transform .3s" loading="lazy"></div>' : '<div style="width:100%;aspect-ratio:16/9;background:var(--surface2);display:flex;align-items:center;justify-content:center;font-size:32px">&#127918;</div>')
    + '<div style="padding:12px"><div style="font-size:13px;font-weight:600;margin-bottom:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+game.name+'</div>'
    + '<div style="display:flex;align-items:center;justify-content:space-between"><span style="font-size:11px;color:var(--muted)">'+year+(mc?' <span style="font-weight:700;color:'+mcCol+'">MC '+mc+'</span>':'')+'</span>'
    + '<a href="'+steamUrl+'" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:5px;background:rgba(23,26,33,.9);border:1px solid rgba(102,192,244,.2);text-decoration:none">'+svg+'</a>'
    + '</div></div>';
  return card;
}

// ── TRENDING (RAWG only, no Supabase) ──
async function loadTrendingGames() {
  var el = document.getElementById("trendingGames");
  if (!el) return;
  var RAWG = "b1ba1bc900a14e699e5e98788646cf16";
  var today = new Date();
  var ago = new Date(today - 30*24*60*60*1000);
  var fmt = function(d){return d.toISOString().slice(0,10);};
  try {
    var r = await fetch("https://api.rawg.io/api/games?key="+RAWG+"&dates="+fmt(ago)+","+fmt(today)+"&ordering=-added&page_size=10");
    var data = await r.json();
    if (data.results && data.results.length > 0) {
      el.innerHTML = "";
      data.results.forEach(function(g,i){ el.appendChild(buildGameCard(g,i,openTrailer)); });
    } else {
      el.innerHTML = '<div style="color:var(--muted);grid-column:1/-1;padding:20px;text-align:center">Bu ay çıkan popüler oyun bulunamadı.</div>';
    }
  } catch(e) {
    el.innerHTML = '<div style="color:var(--muted);grid-column:1/-1;padding:20px;text-align:center">Yüklenemedi: '+e.message+'</div>';
  }
}

// ── MOST ADDED (Supabase, polls until ready) ──
function loadMostAdded() {
  var el = document.getElementById("mostAddedGames");
  if (!el) return;
  (function poll(n){
    if (typeof supabase !== "undefined") { _loadMostAdded(el); }
    else if (n > 0) { setTimeout(function(){poll(n-1);}, 300); }
    else { el.innerHTML = '<div style="color:var(--muted);grid-column:1/-1;padding:20px;text-align:center">Bağlantı kurulamadı.</div>'; }
  })(20);
}
async function _loadMostAdded(el) {
  try {
    var sb2 = supabase.createClient("https://dzjmbwyandrkonqdjalk.supabase.co","sb_publishable_oeokT78grwbNQeKo8xtZRA_xJdBkuPD");
    var res = await sb2.from("game_lists").select("game_id,game_name,game_image,score,released");
    var rows = res.data;
    if (!rows || !rows.length) { el.innerHTML = '<div style="color:var(--muted);grid-column:1/-1;padding:20px;text-align:center">Henüz oyun eklenmedi.</div>'; return; }
    var map = {};
    rows.forEach(function(r){ if(!map[r.game_id])map[r.game_id]={name:r.game_name,image:r.game_image,released:r.released,count:0,scores:[]}; map[r.game_id].count++; map[r.game_id].scores.push(r.score); });
    var sorted = Object.values(map).sort(function(a,b){return b.count-a.count;}).slice(0,10);
    el.innerHTML = "";
    sorted.forEach(function(g,idx){
      var avg = (g.scores.reduce(function(s,x){return s+x;},0)/g.scores.length).toFixed(1);
      var card = buildGameCard({name:g.name,background_image:g.image,released:g.released,metacritic:null,slug:null},idx,openTrailer);
      var row = card.querySelector("div:last-child > div:last-child");
      if(row) row.innerHTML = '<span style="font-size:11px;color:var(--muted)">'+g.count+' kullanıcı</span><span style="font-size:13px;font-weight:700;color:#e8ff47">&#9733; '+avg+'</span>';
      el.appendChild(card);
    });
  } catch(e) {
    el.innerHTML = '<div style="color:var(--muted);grid-column:1/-1;padding:20px;text-align:center">Veri yüklenemedi: '+e.message+'</div>';
  }
}

function loadPublicGames() {
  loadTrendingGames();
  loadMostAdded();
}
