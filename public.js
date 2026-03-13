// ── PUBLIC PAGE FUNCTIONS ── (global scope)

function showAuthScreen() {
  var pub = document.getElementById("publicScreen");
  var auth = document.getElementById("authScreen");
  if (pub) pub.style.display = "none";
  if (auth) auth.style.display = "flex";
}

// ── TRAILER MODAL ──
function openTrailer(game) {
  var existing = document.getElementById("trailerModal");
  if (existing) existing.remove();

  var RAWG_KEY = "b1ba1bc900a14e699e5e98788646cf16";
  var steamUrl = "https://store.steampowered.com/search/?term=" + encodeURIComponent(game.name);
  var slug = game.slug || null;

  var modal = document.createElement("div");
  modal.id = "trailerModal";
  modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.95);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px";

  modal.innerHTML = [
    '<div style="background:#13131a;border:1px solid #2a2a38;border-radius:16px;overflow:hidden;width:100%;max-width:840px">',
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-bottom:1px solid #2a2a38">',
        '<span style="font-weight:600;color:#fff;font-size:14px">&#127916; ' + game.name + '</span>',
        '<div style="display:flex;align-items:center;gap:10px">',
          '<a href="' + steamUrl + '" target="_blank" rel="noopener" style="background:#1b2838;color:#66c0f4;text-decoration:none;padding:6px 14px;border-radius:7px;font-weight:600;font-size:12px;border:1px solid #66c0f4">Steam</a>',
          '<button id="trailerClose" style="background:none;border:none;color:#888;font-size:22px;cursor:pointer;padding:0 6px">&#x2715;</button>',
        '</div>',
      '</div>',
      '<div id="trailerBody" style="min-height:160px;display:flex;align-items:center;justify-content:center;padding:24px;color:#666;font-size:13px">',
        '<div>Fragman aran&#305;yor...</div>',
      '</div>',
    '</div>'
  ].join('');

  function closeModal() {
    var frame = document.getElementById("trailerFrame");
    if (frame) frame.src = "about:blank";
    modal.remove();
  }
  modal.addEventListener("click", function(e) { if (e.target === modal) closeModal(); });
  document.body.appendChild(modal);
  document.getElementById("trailerClose").addEventListener("click", closeModal);

  // Try RAWG movies, fallback to YouTube embed search
  function tryRawgMovies(gameSlug) {
    return fetch("https://api.rawg.io/api/games/" + gameSlug + "/movies?key=" + RAWG_KEY)
      .then(function(r) { return r.json(); });
  }

  function showVideo(mp4Url, posterUrl) {
    var body = document.getElementById("trailerBody");
    if (!body) return;
    body.style.padding = "0";
    body.innerHTML = [
      '<video id="trailerFrame" controls autoplay playsinline',
        ' style="width:100%;max-height:500px;display:block;background:#000"',
        ' poster="' + (posterUrl || '') + '">',
        '<source src="' + mp4Url + '" type="video/mp4">',
      '</video>'
    ].join('');
  }

  function showYoutube() {
    var body = document.getElementById("trailerBody");
    if (!body) return;
    var q = encodeURIComponent(game.name + " official game trailer");
    body.innerHTML = '<div style="color:#666;text-align:center;padding:20px">Video aranıyor...</div>';
    // Use Invidious public API - open source YouTube frontend, no key needed
    fetch("https://inv.nadeko.net/api/v1/search?q=" + q + "&type=video&page=1")
      .then(function(r) { return r.json(); })
      .then(function(items) {
        if (!document.getElementById("trailerBody")) return;
        if (items && items.length > 0) {
          var videoId = items[0].videoId;
          body.style.padding = "0";
          body.innerHTML = [
            '<div style="position:relative;width:100%;padding-bottom:56.25%;background:#000">',
              '<iframe id="trailerFrame"',
                ' src="https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0&modestbranding=1"',
                ' style="position:absolute;inset:0;width:100%;height:100%;border:none"',
                ' allow="autoplay;encrypted-media;fullscreen" allowfullscreen>',
              '</iframe>',
            '</div>'
          ].join('');
        } else {
          // Last resort: open YouTube search in new tab
          body.innerHTML = '<div style="padding:24px;text-align:center"><p style="color:#888;margin-bottom:16px">Video ID bulunamadı.</p><a href="https://www.youtube.com/results?search_query=' + q + '" target="_blank" style="background:#ff0000;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:700">YouTube'da Ara</a></div>';
        }
      })
      .catch(function() {
        var b2 = document.getElementById("trailerBody");
        var q2 = encodeURIComponent(game.name + " official game trailer");
        if (b2) b2.innerHTML = '<div style="padding:24px;text-align:center"><a href="https://www.youtube.com/results?search_query=' + q2 + '" target="_blank" style="background:#ff0000;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:700">YouTube'da Ara</a></div>';
      });
  }

  function processMovies(data) {
    if (data && data.results && data.results.length > 0) {
      var clip = data.results[0];
      var url = null;
      if (clip.data) {
        url = clip.data.max || clip.data["480"] || clip.data["360"] || null;
      }
      if (!url && clip.preview) url = clip.preview;
      if (url) { showVideo(url, clip.preview); return; }
    }
    // No RAWG video - use YouTube
    showYoutube();
  }

  var p;
  if (slug) {
    p = tryRawgMovies(slug).then(processMovies).catch(showYoutube);
  } else {
    p = fetch("https://api.rawg.io/api/games?key=" + RAWG_KEY + "&search=" + encodeURIComponent(game.name) + "&page_size=1")
      .then(function(r) { return r.json(); })
      .then(function(sd) {
        if (sd.results && sd.results.length > 0) {
          return tryRawgMovies(sd.results[0].slug);
        }
        return { results: [] };
      })
      .then(processMovies)
      .catch(showYoutube);
  }
}

// ── GAME CARD ──
function buildGameCard(game, idx, onClick) {
  var year = game.released ? game.released.slice(0, 4) : "";
  var mc = game.metacritic;
  var mcColor = mc ? (mc >= 75 ? "#6fcf6f" : mc >= 50 ? "#ffd166" : "#ff6b6b") : "";
  var steamUrl = "https://store.steampowered.com/search/?term=" + encodeURIComponent(game.name);
  var steamSvg = '<svg width="12" height="12" viewBox="0 0 496 512"><path d="M496 256c0 137-111.2 248-248.4 248-113.8 0-209.7-76.3-239.1-180.4l95.2 39.3c6.4 32.1 34.9 56.4 68.9 56.4 39.2 0 71.9-32.4 70.2-73.5l84.5-60.2c52.1 1.3 95.8-40.9 95.8-93.5 0-51.6-42-93.5-93.7-93.5s-93.7 42-93.7 93.5v1.2L176.6 279c-15.5-.9-30.7 3.4-43.5 12.1L0 235.1C10.2 103.7 122.2 8 248 8c136.9 0 248 111 248 248z" fill="#66c0f4"/></svg>';

  var card = document.createElement("div");
  card.style.cssText = "background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden;cursor:pointer;transition:all .25s;position:relative";
  card.addEventListener("mouseenter", function() {
    card.style.transform = "translateY(-4px)"; card.style.borderColor = "var(--accent)";
    var img = card.querySelector("img.cover"); if (img) img.style.transform = "scale(1.05)";
  });
  card.addEventListener("mouseleave", function() {
    card.style.transform = ""; card.style.borderColor = "var(--border)";
    var img = card.querySelector("img.cover"); if (img) img.style.transform = "";
  });
  card.addEventListener("click", function(e) {
    if (!e.target.closest("a")) onClick(game);
  });

  card.innerHTML = [
    '<div style="position:absolute;top:8px;left:8px;background:rgba(0,0,0,.85);color:#e8ff47;font-family:Bebas Neue,sans-serif;font-size:20px;width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;z-index:2;border:1px solid #e8ff47">' + (idx+1) + '</div>',
    game.background_image
      ? '<div style="width:100%;aspect-ratio:16/9;overflow:hidden"><img class="cover" src="' + game.background_image + '" style="width:100%;height:100%;object-fit:cover;display:block;transition:transform .3s" loading="lazy"></div>'
      : '<div style="width:100%;aspect-ratio:16/9;background:var(--surface2);display:flex;align-items:center;justify-content:center;font-size:32px">&#127918;</div>',
    '<div style="padding:12px">',
      '<div style="font-size:13px;font-weight:600;margin-bottom:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + game.name + '</div>',
      '<div style="display:flex;align-items:center;justify-content:space-between">',
        '<span style="font-size:11px;color:var(--muted)">' + year + (mc ? ' <span style="font-weight:700;color:' + mcColor + '">MC ' + mc + '</span>' : '') + '</span>',
        '<a href="' + steamUrl + '" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:5px;background:rgba(23,26,33,.9);border:1px solid rgba(102,192,244,.2);text-decoration:none">' + steamSvg + '</a>',
      '</div>',
    '</div>'
  ].join('');

  return card;
}

// ── LOAD PUBLIC GAMES ──
async function loadPublicGames() {
  var RAWG = "b1ba1bc900a14e699e5e98788646cf16";
  var today = new Date();
  var monthAgo = new Date(today - 30*24*60*60*1000);
  var fmt = function(d) { return d.toISOString().slice(0,10); };

  var trendEl = document.getElementById("trendingGames");
  if (trendEl) {
    try {
      var r = await fetch("https://api.rawg.io/api/games?key=" + RAWG + "&dates=" + fmt(monthAgo) + "," + fmt(today) + "&ordering=-added&page_size=10");
      var data = await r.json();
      if (data.results && data.results.length > 0) {
        trendEl.innerHTML = "";
        data.results.forEach(function(game, idx) { trendEl.appendChild(buildGameCard(game, idx, openTrailer)); });
      } else {
        trendEl.innerHTML = '<div style="color:var(--muted);grid-column:1/-1;padding:20px;text-align:center">Bu ay henüz veri yok.</div>';
      }
    } catch(e) {
      trendEl.innerHTML = '<div style="color:var(--muted);grid-column:1/-1;padding:20px;text-align:center">Yüklenemedi.</div>';
    }
  }

  var mostEl = document.getElementById("mostAddedGames");
  if (mostEl) {
    try {
      var SB_URL = "https://dzjmbwyandrkonqdjalk.supabase.co";
      var SB_KEY = "sb_publishable_oeokT78grwbNQeKo8xtZRA_xJdBkuPD";
      var sbPub = supabase.createClient(SB_URL, SB_KEY);
      var result = await sbPub.from("game_lists").select("game_id,game_name,game_image,score,released");
      var rows = result.data;
      if (rows && rows.length > 0) {
        var map = {};
        rows.forEach(function(row) {
          if (!map[row.game_id]) map[row.game_id] = { name: row.game_name, image: row.game_image, released: row.released, count: 0, scores: [] };
          map[row.game_id].count++;
          map[row.game_id].scores.push(row.score);
        });
        var sorted = Object.values(map).sort(function(a,b){ return b.count - a.count; }).slice(0,10);
        mostEl.innerHTML = "";
        sorted.forEach(function(g, idx) {
          var avg = (g.scores.reduce(function(s,x){ return s+x; },0) / g.scores.length).toFixed(1);
          var fakeGame = { name: g.name, background_image: g.image, released: g.released, metacritic: null, slug: null };
          var card = buildGameCard(fakeGame, idx, openTrailer);
          var lastRow = card.querySelector("div:last-child > div:last-child");
          if (lastRow) lastRow.innerHTML = '<span style="font-size:11px;color:var(--muted)">' + g.count + ' kullanici</span><span style="font-size:13px;font-weight:700;color:#e8ff47">&#9733; ' + avg + '</span>';
          mostEl.appendChild(card);
        });
      } else {
        mostEl.innerHTML = '<div style="color:var(--muted);grid-column:1/-1;padding:20px;text-align:center">Henüz oyun eklenmedi.</div>';
      }
    } catch(e) {
      mostEl.innerHTML = '<div style="color:var(--muted);grid-column:1/-1;padding:20px;text-align:center">Veri yüklenemedi.</div>';
    }
  }
}
