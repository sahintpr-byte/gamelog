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
    var video = document.getElementById("trailerFrame");
    if(video) video.addEventListener("error", function(){ searchYT(game.name); });
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
    var YT_KEY = "AIzaSyC8N43du5BdPiXeomeRE-E6NWwfm_tx2XQ";
    fetch("https://www.googleapis.com/youtube/v3/search?part=snippet&q="+q+"&type=video&maxResults=1&key="+YT_KEY)
      .then(function(r){return r.json();})
      .then(function(data){
        var item = data.items && data.items[0];
        if(item && item.id && item.id.videoId){ showYT(item.id.videoId); }
        else { showYoutubeSearch(name); }
      })
      .catch(function(){ showYoutubeSearch(name); });
  }
  function showYoutubeSearch(name) {
    var b = document.getElementById("trailerBody"); if(!b)return;
    var q = encodeURIComponent(name + " official game trailer");
    b.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:32px;text-align:center">'
      + '<div style="color:#999;font-size:13px">Video otomatik yüklenemedi.</div>'
      + '<a href="https://www.youtube.com/results?search_query='+q+'" target="_blank" rel="noopener" style="background:#ff0000;color:#fff;padding:10px 18px;border-radius:7px;text-decoration:none;font-weight:600;font-size:13px">▶ YouTube’da Ara</a></div>';
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

// Keep the ranking button usable even if the app navigation is initialized late.
function openTopGamesView() {
  document.querySelectorAll(".view").forEach(function(view){ view.classList.remove("active"); });
  document.querySelectorAll(".tab-btn").forEach(function(button){ button.classList.remove("active"); });
  var view = document.getElementById("topGamesView");
  var button = document.getElementById("topGamesBtn");
  if (view) view.classList.add("active");
  if (button) button.classList.add("active");
  if (typeof loadTopPCGames === "function") loadTopPCGames();
}
function openBottomGamesView() {
  document.querySelectorAll(".view").forEach(function(view){ view.classList.remove("active"); });
  document.querySelectorAll(".tab-btn").forEach(function(button){ button.classList.remove("active"); });
  var view = document.getElementById("bottomGamesView");
  var button = document.getElementById("bottomGamesBtn");
  if (view) view.classList.add("active");
  if (button) button.classList.add("active");
  if (typeof loadBottomPCGames === "function") loadBottomPCGames();
}
function openNewsView() {
  document.querySelectorAll(".view").forEach(function(view){ view.classList.remove("active"); });
  document.querySelectorAll(".tab-btn").forEach(function(button){ button.classList.remove("active"); });
  var view = document.getElementById("newsView");
  var button = document.getElementById("newsBtn");
  if (view) view.classList.add("active");
  if (button) button.classList.add("active");
  if (typeof loadGameNews === "function") loadGameNews();
}

// ── TOP 250 PC GAMES (Metacritic scores via RAWG) ──
var topPCGamesLoaded = false;
function topGameKey(name) {
  return String(name || "").toLowerCase()
    .replace(/\s*[:\-–—]?\s*(update|remastered|definitive edition|complete edition|enhanced edition|game of the year edition|goty edition|director's cut|redux)\s*$/i, "")
    .replace(/[^a-z0-9]+/g, " ").trim();
}
async function loadTopPCGames() {
  var el = document.getElementById("topGamesGrid");
  if (!el || topPCGamesLoaded) return;
  var meta = document.getElementById("topGamesMeta");
  var RAWG = "b1ba1bc900a14e699e5e98788646cf16";
  el.innerHTML = '<div class="loading" style="grid-column:1/-1">Top 250 liste yükleniyor...</div>';
  if (meta) meta.textContent = "Metacritic skorları getiriliyor...";
  try {
    var requests = [];
    for (var page=1; page<=10; page++) {
      requests.push(fetch("https://api.rawg.io/api/games?key="+RAWG+"&platforms=4&ordering=-metacritic&page_size=40&page="+page)
        .then(function(r){ if(!r.ok) throw new Error("RAWG API "+r.status); return r.json(); }));
    }
    var pages = await Promise.all(requests);
    var games = [];
    pages.forEach(function(data){ if(data.results) games = games.concat(data.results); });
    games = games.filter(function(g){ return g.metacritic; }).sort(function(a,b){ return b.metacritic-a.metacritic; });
    var seen = {};
    games = games.filter(function(g){
      var key = topGameKey(g.name);
      if (!key || seen[key]) return false;
      seen[key] = true;
      return true;
    }).slice(0,250);
    if (!games.length) throw new Error("Liste boş");
    el.innerHTML = "";
    games.forEach(function(g,i){ el.appendChild(buildGameCard(g,i,openTrailer)); });
    topPCGamesLoaded = true;
    if (meta) meta.textContent = games.length+" oyun · Metacritic";
  } catch (e) {
    el.innerHTML = '<div style="color:var(--muted);grid-column:1/-1;padding:24px;text-align:center">Top 250 listesi şu anda yüklenemedi. Lütfen sayfayı yenileyin.</div>';
    if (meta) meta.textContent = "Veri alınamadı";
  }
}

var bottomPCGamesLoaded = false;
async function loadBottomPCGames() {
  var el = document.getElementById("bottomGamesGrid");
  if (!el || bottomPCGamesLoaded) return;
  var meta = document.getElementById("bottomGamesMeta");
  var RAWG = "b1ba1bc900a14e699e5e98788646cf16";
  el.innerHTML = '<div class="loading" style="grid-column:1/-1">Bottom 250 liste yükleniyor...</div>';
  if (meta) meta.textContent = "Metacritic skorları getiriliyor...";
  try {
    var requests = [];
    for (var page=1; page<=10; page++) {
      requests.push(fetch("https://api.rawg.io/api/games?key="+RAWG+"&platforms=4&metacritic=1,69&ordering=metacritic&page_size=40&page="+page)
        .then(function(r){ if(!r.ok) throw new Error("RAWG API "+r.status); return r.json(); }));
    }
    var pages = await Promise.all(requests);
    var games = [];
    pages.forEach(function(data){ if(data.results) games = games.concat(data.results); });
    games = games.filter(function(g){ return g.metacritic; }).sort(function(a,b){ return a.metacritic-b.metacritic; });
    var seen = {};
    games = games.filter(function(g){
      var key = topGameKey(g.name);
      if (!key || seen[key]) return false;
      seen[key] = true;
      return true;
    }).slice(0,250);
    if (!games.length) throw new Error("Liste boş");
    el.innerHTML = "";
    games.forEach(function(g,i){ el.appendChild(buildGameCard(g,i,openTrailer)); });
    bottomPCGamesLoaded = true;
    if (meta) meta.textContent = games.length+" oyun · Metacritic";
  } catch (e) {
    el.innerHTML = '<div style="color:var(--muted);grid-column:1/-1;padding:24px;text-align:center">Bottom 250 listesi şu anda yüklenemedi. Lütfen sayfayı yenileyin.</div>';
    if (meta) meta.textContent = "Veri alınamadı";
  }
}

// ── GAME NEWS (RSS feeds + Turkish translation) ──
var gameNewsLoaded = false;
var newsTranslationBlocked = false;
var GAME_NEWS_FEEDS = [
  {name:"PC Gamer", url:"https://www.pcgamer.com/feeds/tag/games/", limit:15},
  {name:"IGN", url:"https://www.ign.com/rss/articles/feed", limit:5},
  {name:"GameSpot", url:"https://www.gamespot.com/feeds/game-news/", limit:5}
];
function newsText(value) {
  var div = document.createElement("div");
  div.innerHTML = value || "";
  return (div.textContent || div.innerText || "").replace(/\s+/g," ").trim();
}
function newsHtml(value) {
  return String(value || "").replace(/[&<>\"']/g, function(ch){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]; });
}
function newsUrl(value) {
  return /^https?:\/\//i.test(String(value || "")) ? String(value) : "#";
}
async function translateNewsText(value) {
  var text = newsText(value).slice(0,700);
  if (!text) return "";
  if (newsTranslationBlocked) return text;
  try {
    var target = localStorage.getItem("qwerst-lang") || "tr";
    var url = "https://api.mymemory.translated.net/get?q="+encodeURIComponent(text)+"&langpair=en|"+encodeURIComponent(target);
    var response = await fetch(url);
    var data = await response.json();
    var translated = data.responseData && data.responseData.translatedText;
    var warning = String(translated || data.responseDetails || "").toUpperCase();
    if (!translated || /MYMEMORY|AVAILABLE FREE TRANSLATIONS|TRANSLATED.NET/.test(warning)) {
      newsTranslationBlocked = true;
      return text;
    }
    return translated;
  } catch (e) { return text; }
}
async function loadGameNews() {
  var el = document.getElementById("newsGrid");
  if (!el || gameNewsLoaded) return;
  var status = document.getElementById("newsStatus");
  el.innerHTML = '<div class="loading" style="grid-column:1/-1">'+(window.qwerstText?window.qwerstText('newsLoading'):'Oyun haberleri yükleniyor...')+'</div>';
  try {
    var feeds = await Promise.all(GAME_NEWS_FEEDS.map(function(feed){
      var url = "https://api.rss2json.com/v1/api.json?rss_url="+encodeURIComponent(feed.url);
      return fetch(url).then(function(r){return r.json();}).then(function(data){
        return (data.items||[]).slice(0,feed.limit).map(function(item){ return {source:feed.name,title:item.title,description:item.description,link:item.link,date:item.pubDate,image:item.thumbnail||(item.enclosure&&item.enclosure.link)}; });
      }).catch(function(){ return []; });
    }));
    var items = (feeds[0]||[]).concat(feeds.slice(1).reduce(function(all, list){ return all.concat(list); },[])).slice(0,15);
    if (!items.length) throw new Error("Haber bulunamadı");
    if (status) status.textContent = items.length+" haber · PC Gamer öncelikli";
    el.innerHTML = "";
    for (var i=0; i<items.length; i++) {
      var item = items[i];
      var translatedTitle = await translateNewsText(item.title);
      var translatedSummary = await translateNewsText(item.description);
      var card = document.createElement("article");
      card.className = "news-card";
      card.innerHTML = (item.image && newsUrl(item.image) !== "#" ? '<img src="'+newsHtml(item.image)+'" alt="" loading="lazy">' : '')
        + '<div class="news-card-body"><div class="news-source">'+newsHtml(item.source)+'</div>'
        + '<h2>'+newsHtml(translatedTitle)+'</h2><p>'+newsHtml(translatedSummary)+'</p>'
        + '<div class="news-card-footer"><span>'+new Date(item.date||Date.now()).toLocaleDateString()+'</span><a href="'+newsHtml(newsUrl(item.link))+'" target="_blank" rel="noopener">'+(window.qwerstText?window.qwerstText('goNews'):'Habere git →')+'</a></div></div>';
      el.appendChild(card);
    }
    gameNewsLoaded = true;
  } catch (e) {
    if (status) status.textContent = "Haberler alınamadı";
    el.innerHTML = '<div style="color:var(--muted);grid-column:1/-1;padding:24px;text-align:center">Haberler şu anda yüklenemedi. Lütfen sayfayı yenileyin.</div>';
  }
}

// ── RECOMMENDATIONS ──
var recommendationCache = {};
var PURE_HORROR_NAMES = [
  'resident evil 2','resident evil 3','resident evil 4','resident evil 7','resident evil village',
  'outlast','outlast 2','visage','madison','phasmophobia','signalis','amnesia','layers of fear',
  'the mortuary assistant','tormented souls','the dark pictures','little nightmares','fatal frame',
  'until dawn','still wakes the deep','mouthwashing','crow country','world of horror',
  'alone in the dark','silent hill 2'
];
var RECOMMENDATIONS = {
  'best-2026': {
    title:"2026'NIN EN İYİ OYUNLARI",
    subtitle:'Bu yıl çıkan, en yüksek puanlı oyunlar.',
    query:'dates=2026-01-01,2026-12-31&ordering=-rating'
  },
  'best-horror': {
    title:'EN İYİ KORKU OYUNLARI',
    subtitle:'Korku türünün en çok öne çıkan oyunları.',
    query:'ordering=-rating',
    filterPureHorror:true,
    pages:12
  },
  'upcoming-2027': {
    title:"2027'DE ÇIKMASI BEKLENEN OYUNLAR",
    subtitle:'2027 çıkış tarihine sahip, merakla beklenen yapımlar.',
    query:'dates=2027-01-01,2027-12-31&ordering=-added'
  },
  'gamespot-horror-wishlist': {
    title:'STEAM İSTEK LİSTESİNE EKLENMESİ GEREKEN 14 KORKU OYUNU',
    subtitle:'GameSpot’un Horror Game Awards showcase seçkisinden, Türkçe özetlerle.',
    staticList:true
  }
};
var GAMESPOT_HORROR_WISHLIST = [
  {name:'Confronted',url:'https://store.steampowered.com/app/2882610/Confronted/',description:'Amnesia: The Dark Descent havasını temel inşa mekanikleriyle birleştiren korku oyunu. Oyun çıktı ve denemek isteyenler için ücretsiz demosu bulunuyor.'},
  {name:'Signal Veil',url:'https://store.steampowered.com/app/4528010/Signal_Veil/',description:'Terk edilmiş okulunu araştıran bir genç, kapaklı telefonunu hem silah hem de bulmaca çözme aracı olarak kullanıyor. Silent Hill esintili psikolojik korku.'},
  {name:'The Road of Dust and Sorrow',url:'https://store.steampowered.com/app/3895110/The_Road_of_Dust_and_Sorrow/',description:'Klasiklerden ilham alan 2D piksel korku oyunu. Oyuncu, ölülerle dolu bir dünyada kızını korumaya çalışıyor.'},
  {name:'The Pines',url:'https://store.steampowered.com/app/4271520/The_Pines/',description:'Seçimlerin hikâyeyi etkilediği üçüncü şahıs korku RPG’si. Yeni bir stüdyodan gelen iddialı ve takip edilmeye değer bir yapım.'},
  {name:'Sombras: Negative Frames',url:'https://store.steampowered.com/app/4553370/SOMBRAS_negative_frames/',description:'Japon-İspanyol bir öğrencinin memleketinin karanlık bir yansımasında kaybolduğu, korkudan çok atmosfer ve keşfe odaklanan gizemli bir macera.'},
  {name:'Nightmare House',url:'https://store.steampowered.com/app/2744430/Nightmare_House/',description:'Half-Life 2 moduyla tanınan Nightmare House’un, baştan geliştirilen bağımsız sürümü. Klasik bir korku deneyimini modern bir oyun olarak yeniden sunuyor.'},
  {name:'I Shall Name The Dead',url:'https://store.steampowered.com/app/4881350/I_SHALL_NAME_THE_DEAD/',description:'Mezarlığı mesai saatleri dışında keşfetmeyi konu alan, mavi ve turuncu renkleriyle öne çıkan stilize bir korku-macera.'},
  {name:'Human.exe',url:'https://store.steampowered.com/app/4016270/Humanexe/',description:'Bir yapay zekânın etik ikilemlerini ve dünya görüşünü şekillendirdiğiniz felsefi bir korku oyunu. Verdiğiniz kararlar sonuçları değiştiriyor.'},
  {name:'Sparrow',url:'https://store.steampowered.com/app/2983920/SPARROW/',description:'Kayıp yavrularını arayan bir kuşu yönettiğiniz sıra dışı bir korku fikri. Basit görünen bu hikâye, alışılmadık atmosferiyle merak uyandırıyor.'},
  {name:'Solace Creek',url:'https://store.steampowered.com/app/3004130/Solace_Creek/',description:'Rüya gibi fragmanı, PSX tarzı görselleri ve tekinsiz ama huzur verici atmosferiyle öne çıkan bağımsız korku deneyimi.'},
  {name:'Mayfly',url:'https://store.steampowered.com/app/4057470/Mayfly/',description:'İngiltere’de bir teknede uyanan ve kayıp eşini ararken sürekli değişen bir gerçekliğe sürüklenen karakterin psikolojik korku hikâyesi.'},
  {name:'Echograph',url:'https://store.steampowered.com/app/3460960/Echograph/',description:'Fatal Frame serisinden ilham alan yapımda, hayaletleri kamerayla görüntüleyerek ve fotoğraf çekerek ilerliyorsunuz.'},
  {name:'Shutter Story',url:'https://store.steampowered.com/app/3798860/Shutter_Story/',description:'Fotoğrafları inceleyerek paranormal izleri bulduğunuz, Sinister benzeri fikriyle dikkat çeken atmosferik bir korku oyunu.'},
  {name:'Dead of Darkness 2',url:'https://strangesignals-co-dot-yamm-track.appspot.com/2lHOiMPpgD5MYj',description:'Retro anime ara sahneleri ve klasik hayatta kalma-korku yaklaşımıyla gelen devam oyunu. Serinin ilk oyununu da radarınıza alabilirsiniz.'}
];
function openRecommendationsView(type) {
  document.querySelectorAll('.view').forEach(function(view){ view.classList.remove('active'); });
  document.querySelectorAll('.tab-btn').forEach(function(button){ button.classList.remove('active'); });
  var view=document.getElementById('recommendationsView');
  if(view) view.classList.add('active');
  loadRecommendationList(type);
}
async function loadRecommendationList(type) {
  var config=RECOMMENDATIONS[type]||RECOMMENDATIONS['best-2026'];
  var RAWG_KEY="b1ba1bc900a14e699e5e98788646cf16";
  var grid=document.getElementById('recommendationGrid');
  var title=document.getElementById('recommendationTitle');
  var subtitle=document.getElementById('recommendationSubtitle');
  var meta=document.getElementById('recommendationMeta');
  if(!grid) return;
  title.textContent=config.title;
  subtitle.textContent=config.subtitle;
  if(config.staticList){
    renderGamespotHorrorWishlist(meta);
    return;
  }
  if(recommendationCache[type]){
    renderRecommendationGames(recommendationCache[type],meta);
    return;
  }
  grid.innerHTML='<div class=\"loading\" style=\"grid-column:1/-1\">Liste yükleniyor...</div>';
  if(meta) meta.textContent='RAWG verileri getiriliyor...';
  try {
    var requests=[];
    for(var page=1;page<=(config.pages||1);page++){
      var url='https://api.rawg.io/api/games?key='+RAWG_KEY+'&platforms=4&'+config.query+'&page_size=40&page='+page;
      requests.push(fetch(url).then(function(response){if(!response.ok) throw new Error('RAWG API '+response.status);return response.json();}));
    }
    var pages=await Promise.all(requests);
    var allGames=[];
    pages.forEach(function(data){allGames=allGames.concat(data.results||[]);});
    if(config.filterPureHorror){
      var candidateRequests=PURE_HORROR_NAMES.map(function(candidate){
        var searchUrl='https://api.rawg.io/api/games?key='+RAWG_KEY+'&platforms=4&search='+encodeURIComponent(candidate)+'&search_precise=true&page_size=1';
        return fetch(searchUrl).then(function(response){return response.ok?response.json():{results:[]};}).catch(function(){return {results:[]};});
      });
      var candidatePages=await Promise.all(candidateRequests);
      candidatePages.forEach(function(data){
        var candidateGame=(data.results||[])[0];
        if(candidateGame){candidateGame.__curatedHorror=true; allGames.push(candidateGame);}
      });
    }
    var seenGames={};
    var games=allGames.filter(function(game){
      if(!game.name) return false;
      if(config.filterPureHorror){
        var released=game.released?new Date(game.released):null;
        return game.__curatedHorror && released && released>=new Date('2016-01-01');
      }
      return true;
    }).filter(function(game){
      if(seenGames[game.id]) return false;
      seenGames[game.id]=true;
      return true;
    }).sort(function(a,b){return (b.rating||0)-(a.rating||0);}).slice(0,24);
    if(!games.length) throw new Error('Liste boş');
    recommendationCache[type]=games;
    renderRecommendationGames(games,meta);
  } catch(e) {
    grid.innerHTML='<div style=\"color:var(--muted);grid-column:1/-1;padding:24px;text-align:center\">Bu tavsiye listesi şu anda yüklenemedi. Lütfen tekrar deneyin.</div>';
    if(meta) meta.textContent='Veri alınamadı';
  }
}
function renderRecommendationGames(games,meta) {
  var grid=document.getElementById('recommendationGrid');
  grid.className='';
  grid.innerHTML='';
  games.forEach(function(game,index){ grid.appendChild(buildGameCard(game,index,openTrailer)); });
  if(meta) meta.textContent=games.length+' oyun · RAWG / Metacritic';
}
function renderGamespotHorrorWishlist(meta) {
  var grid=document.getElementById('recommendationGrid');
  if(!grid) return;
  grid.className='recommendation-article-grid';
  grid.innerHTML=GAMESPOT_HORROR_WISHLIST.map(function(game,index){
    return '<article class="recommendation-article-card"><div class="recommendation-article-number">'+String(index+1).padStart(2,'0')+'</div><h3>'+game.name+'</h3><p>'+game.description+'</p><a class="btn-secondary recommendation-steam-link" href="'+game.url+'" target="_blank" rel="noopener">Steam’de incele →</a></article>';
  }).join('')+'<div class="recommendation-source">Kaynak: <a href="https://www.gamespot.com/articles/14-new-horror-games-it-would-be-terrifying-not-to-wishlist-on-steam/" target="_blank" rel="noopener">GameSpot – 14 Horror Games It Would Be Terrifying Not To Wishlist</a></div>';
  if(meta) meta.textContent='14 oyun · GameSpot seçkisi';
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
