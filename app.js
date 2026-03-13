function initApp() {

const SB_URL = 'https://dzjmbwyandrkonqdjalk.supabase.co';
const SB_KEY = 'sb_publishable_oeokT78grwbNQeKo8xtZRA_xJdBkuPD';
const RAWG   = 'b1ba1bc900a14e699e5e98788646cf16';

const { createClient } = supabase;
const sb = createClient(SB_URL, SB_KEY);

const PAGE_SIZE = 30;
let currentUser=null, currentGame=null, currentSort='date', dateSortAsc=false;
let listViewMode='list', currentPage=1;

// Auto-login: check existing session immediately
(async function checkSession() {
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (session && session.user) {
      currentUser = session.user;
      showApp();
    }
  } catch(e) {}
})();
let authMode='login', friendsTab='following';
let myLists=[], activeListId=null, viewingProfile=null, editingListId=null;

function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2800);}
function sc(s){return s<=4?'low':s<=6?'mid':'high';}
function mcUrl(name){return 'https://www.metacritic.com/game/'+name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'/';}

/* ── AUTH ── */
document.getElementById('langTR').onclick=()=>switchLang('tr');
document.getElementById('langEN').onclick=()=>switchLang('en');
applyLang();

document.getElementById('loginTab').onclick=()=>setAuthMode('login');
document.getElementById('registerTab').onclick=()=>setAuthMode('register');
document.getElementById('authBtn').onclick=doAuth;
document.getElementById('authEmail').addEventListener('keydown',e=>{if(e.key==='Enter')doAuth();});
document.getElementById('authPassword').addEventListener('keydown',e=>{if(e.key==='Enter')doAuth();});

function setAuthMode(mode){
  authMode=mode;
  document.getElementById('loginTab').classList.toggle('active',mode==='login');
  document.getElementById('registerTab').classList.toggle('active',mode==='register');
  document.getElementById('authBtn').textContent=mode==='login'?t('authBtn_login'):t('authBtn_register');
  document.getElementById('usernameField').style.display=mode==='register'?'block':'none';
  document.getElementById('authError').style.display='none';
  document.getElementById('authSuccess').style.display='none';
}

async function doAuth(){
  const email=document.getElementById('authEmail').value.trim();
  const pass=document.getElementById('authPassword').value;
  const btn=document.getElementById('authBtn');
  document.getElementById('authError').style.display='none';
  document.getElementById('authSuccess').style.display='none';
  if(!email||!pass){showMsg(t('authErr_empty'),'error');return;}
  btn.disabled=true; btn.textContent='...';
  if(authMode==='register'){
    const username=document.getElementById('authUsername').value.trim()||email.split('@')[0];
    const {error}=await sb.auth.signUp({email,password:pass,options:{data:{username}}});
    btn.disabled=false; btn.textContent='Kayıt Ol';
    if(error){showMsg(error.message,'error');return;}
    showMsg(t('authSuccess'),'success');
  } else {
    const {data,error}=await sb.auth.signInWithPassword({email,password:pass});
    btn.disabled=false; btn.textContent='Giriş Yap';
    if(error){showMsg(t('authErr_wrong'),'error');return;}
    currentUser=data.user; showApp();
  }
}

function showMsg(msg,type){
  const el=document.getElementById(type==='error'?'authError':'authSuccess');
  el.textContent=msg; el.style.display='block';
}

document.getElementById('logoutBtn').onclick=async()=>{
  await sb.auth.signOut();
  currentUser=null; myLists=[]; activeListId=null;
  document.getElementById('appScreen').style.display='none';
  document.getElementById('authScreen').style.display='flex';
};

function showApp(){
  document.getElementById('authScreen').style.display='none';
  document.getElementById('publicScreen').style.display='none';
  document.getElementById('appScreen').style.display='block';
  const name=currentUser.user_metadata?.username||currentUser.email.split('@')[0];
  document.getElementById('userBadge').innerHTML='👤 <strong>'+name+'</strong>';
  initHero();
  // Preload lists so modal list select works immediately from search view
  loadMyListsSilent();
}

async function loadMyListsSilent(){
  const {data}=await sb.from('lists').select('*').eq('user_id',currentUser.id).order('created_at');
  if(!data||!data.length){
    const {data:nl}=await sb.from('lists').insert({user_id:currentUser.id,name:'Listem',is_default:true}).select().single();
    myLists=[nl];
  } else { myLists=data; }
  if(!activeListId&&myLists.length) activeListId=myLists[0].id;
}

sb.auth.onAuthStateChange((event,session)=>{
  if(session?.user){
    currentUser=session.user;
    showApp();
  } else if(event==='SIGNED_OUT'){
    currentUser=null; myLists=[]; activeListId=null;
    document.getElementById('appScreen').style.display='none';
    document.getElementById('authScreen').style.display='none';
    document.getElementById('publicScreen').style.display='block';
  }
});

/* ── NAV ── */
document.getElementById('logoBtn').onclick=()=>switchView('search');
document.getElementById('tabSearch').onclick=()=>switchView('search');
document.getElementById('tabMylist').onclick=()=>switchView('mylist');
document.getElementById('tabFriends').onclick=()=>switchView('friends');
document.getElementById('backBtn').onclick=()=>switchView('friends');

function switchView(v){
  document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(x=>x.classList.remove('active'));
  const views={search:'searchView',mylist:'mylistView',friends:'friendsView',profile:'profileView'};
  const tabs={search:'tabSearch',mylist:'tabMylist',friends:'tabFriends'};
  document.getElementById(views[v]).classList.add('active');
  if(tabs[v]) document.getElementById(tabs[v]).classList.add('active');
  if(v==='mylist') loadMyLists();
  if(v==='friends') loadFriendsTab();
  if(v==='search'){
    document.getElementById('searchInput').value='';
    document.getElementById('searchResults').innerHTML='';
  }
}

/* ── SEARCH ── */
document.getElementById('searchBtn').onclick=searchGames;
document.getElementById('searchInput').addEventListener('keydown',e=>{if(e.key==='Enter'){closeDropdown();searchGames();}});
document.getElementById('searchInput').addEventListener('input',debounce(liveSearchGames,400));
document.getElementById('searchInput').addEventListener('blur',()=>setTimeout(closeDropdown,200));

let _searchTimer=null;
function debounce(fn,ms){return function(...args){clearTimeout(_searchTimer);_searchTimer=setTimeout(()=>fn(...args),ms);};}
function closeDropdown(){const d=document.getElementById('searchDropdown');if(d)d.remove();}

async function liveSearchGames(){
  const q=document.getElementById('searchInput').value.trim();
  closeDropdown();
  if(q.length<2)return;
  try{
    const r=await fetch('https://api.rawg.io/api/games?key='+RAWG+'&search='+encodeURIComponent(q)+'&page_size=6&search_precise=true');
    const data=await r.json();
    if(!data.results||!data.results.length)return;
    const inp=document.getElementById('searchInput');
    const rect=inp.getBoundingClientRect();
    const drop=document.createElement('div');
    drop.id='searchDropdown';
    drop.style.cssText='position:fixed;top:'+(rect.bottom+window.scrollY+4)+'px;left:'+rect.left+'px;width:'+rect.width+'px;background:var(--surface);border:1px solid var(--border);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.15);z-index:500;overflow:hidden;max-height:320px;overflow-y:auto;';
    data.results.forEach(game=>{
      const year=game.released?game.released.slice(0,4):'';
      const item=document.createElement('div');
      item.style.cssText='display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;border-bottom:1px solid var(--border);transition:background .15s;';
      item.innerHTML=(game.background_image?'<img src="'+game.background_image+'" style="width:48px;height:28px;object-fit:cover;border-radius:4px;flex-shrink:0">':'<div style="width:48px;height:28px;background:var(--surface2);border-radius:4px;flex-shrink:0;display:flex;align-items:center;justify-content:center">🎮</div>')+
        '<div style="min-width:0"><div style="font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+game.name+'</div>'+
        '<div style="font-size:12px;color:var(--muted)">'+year+'</div></div>';
      item.onmouseenter=()=>item.style.background='var(--surface2)';
      item.onmouseleave=()=>item.style.background='';
      item.onmousedown=()=>{
        document.getElementById('searchInput').value=game.name;
        closeDropdown();
        searchGames();
      };
      drop.appendChild(item);
    });
    document.body.appendChild(drop);
  }catch(e){}
}

async function searchGames(){
  const q=document.getElementById('searchInput').value.trim(); if(!q) return;
  const res=document.getElementById('searchResults');
  res.innerHTML='<div class="loading"><div class="spinner"></div>'+t('searching')+'</div>';
  try{
    const r=await fetch('https://api.rawg.io/api/games?key='+RAWG+'&search='+encodeURIComponent(q)+'&page_size=20&search_precise=true');
    const data=await r.json();
    const ql=q.toLowerCase();
    const results=(data.results||[]).sort((a,b)=>{
      const an=a.name.toLowerCase(),bn=b.name.toLowerCase();
      if(an===ql&&bn!==ql)return -1; if(bn===ql&&an!==ql)return 1;
      const words=ql.split(' ').filter(Boolean);
      const sm=g=>words.filter(w=>g.toLowerCase().includes(w)).length;
      if(sm(a.name)!==sm(b.name))return sm(b.name)-sm(a.name);
      return((b.ratings_count||0)*(b.metacritic||(b.rating*20)||0))-((a.ratings_count||0)*(a.metacritic||(a.rating*20)||0));
    });
    renderResults(results);
  }catch(e){res.innerHTML='<div class="loading">'+t('connErr')+'</div>';}
}

async function renderResults(games){
  const res=document.getElementById('searchResults');
  if(!games.length){res.innerHTML='<div class="loading">'+t('noResults')+'</div>';return;}
  const {data:added}=await sb.from('game_lists').select('game_id').eq('user_id',currentUser.id);
  const addedIds=new Set((added||[]).map(r=>r.game_id));
  res.innerHTML='<div class="results-label">'+games.length+t('resultsLabel')+'</div>';
  const grid=document.createElement('div'); grid.className='results-grid';
  games.forEach(game=>{
    const isAdded=addedIds.has(game.id);
    const year=game.released?game.released.slice(0,4):'—';
    const rating=game.metacritic||(game.rating?Math.round(game.rating*20):null);
    const rc=rating?(rating>=75?'#6fcf6f':rating>=50?'#ffd166':'#ff6b6b'):'';
    const genres=(game.genres||[]).slice(0,2).map(x=>x.name).join(', ')||'—';
    const slug=game.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    const card=document.createElement('div'); card.className='game-card';
    card.innerHTML=(game.background_image?
      '<a href="https://www.metacritic.com/game/'+slug+'/" target="_blank" rel="noopener" style="display:block"><img class="game-card-img" src="'+game.background_image+'" alt="" loading="lazy"></a>':
      '<div class="game-card-img-placeholder">🎮</div>')+
      '<div class="game-card-body">'+
        '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:6px;margin-bottom:2px">'+
          '<div class="game-card-title" style="margin-bottom:0">'+game.name+'</div>'+
          '<a href="https://store.steampowered.com/search/?term='+encodeURIComponent(game.name)+'" target="_blank" rel="noopener" title="Steam’de Ara" class="steam-link" onclick="event.stopPropagation()"><svg width="12" height="12" viewBox="0 0 496 512" xmlns="http://www.w3.org/2000/svg"><path d="M496 256c0 137-111.2 248-248.4 248-113.8 0-209.7-76.3-239.1-180.4l95.2 39.3c6.4 32.1 34.9 56.4 68.9 56.4 39.2 0 71.9-32.4 70.2-73.5l84.5-60.2c52.1 1.3 95.8-40.9 95.8-93.5 0-51.6-42-93.5-93.7-93.5s-93.7 42-93.7 93.5v1.2L176.6 279c-15.5-.9-30.7 3.4-43.5 12.1L0 235.1C10.2 103.7 122.2 8 248 8c136.9 0 248 111 248 248z" fill="#66c0f4"/></svg></a>'+
        '</div>'+
        '<div class="game-card-meta"><span>'+year+' · '+genres+'</span>'+(rating?'<span style="font-size:12px;font-weight:600;color:'+rc+'">'+rating+'</span>':'')+'</div>'+
        '<button class="btn-add'+(isAdded?' added':'')+'">'+(isAdded?t('addedBtn'):t('addBtn'))+'</button>'+
      '</div>';
    const addBtn=card.querySelector('.btn-add');
    if(!isAdded) addBtn.onclick=()=>openModal(game);
    grid.appendChild(card);
  });
  res.appendChild(grid);
}

/* ── MODAL ── */
document.getElementById('ratingModal').onclick=function(e){if(e.target===this)closeModal();};
document.getElementById('modalClose').onclick=closeModal;
document.getElementById('modalCancel').onclick=closeModal;
document.getElementById('saveBtn').onclick=saveGame;
document.getElementById('scoreSlider').oninput=function(){document.getElementById('scoreDisplay').innerHTML=this.value+'<span>/10</span>';};

function openModal(game){
  currentGame=game;
  document.getElementById('modalImg').src=game.background_image||'';
  document.getElementById('modalTitle').textContent=game.name;
  document.getElementById('modalMeta').innerHTML=(game.released?game.released.slice(0,4):'—')+' · '+((game.genres||[]).map(x=>x.name).join(', ')||'—');
  document.getElementById('scoreSlider').value=7;
  document.getElementById('scoreDisplay').innerHTML='7<span>/10</span>';
  document.getElementById('notesInput').value='';
  document.getElementById('saveBtn').textContent=t('saveBtn');
  populateListSelect(null);
  document.getElementById('ratingModal').classList.add('open');
}
function closeModal(){document.getElementById('ratingModal').classList.remove('open');currentGame=null;}

function populateListSelect(sel){
  const s=document.getElementById('listSelect'); s.innerHTML='';
  myLists.forEach(l=>{
    const o=document.createElement('option');
    o.value=l.id; o.textContent=l.name;
    if(l.id===(sel||activeListId)) o.selected=true;
    s.appendChild(o);
  });
}

async function saveGame(){
  if(!currentGame) return;
  const score=parseInt(document.getElementById('scoreSlider').value);
  const notes=document.getElementById('notesInput').value.trim();
  const listId=document.getElementById('listSelect').value;
  const {error}=await sb.from('game_lists').upsert({
    user_id:currentUser.id,game_id:currentGame.id,list_id:listId,
    game_name:currentGame.name,game_image:currentGame.background_image||'',
    released:currentGame.released||'',
    genres:(currentGame.genres||[]).map(x=>x.name),
    platforms:(currentGame.platforms||[]).slice(0,3).map(x=>x.platform.name),
    score,notes
  },{onConflict:'user_id,game_id'});
  if(error){toast('Error: '+error.message);return;}
  const btn=document.querySelector('#addbtn-'+currentGame.id);
  if(btn){btn.className='btn-add added';btn.textContent='✓ Listede';btn.onclick=null;}
  closeModal(); toast('"'+currentGame.name+t('toastAdded'));
  if(activeListId===listId) renderList(null,currentUser.id,false,activeListId);
  renderListsNav();
}

/* ── MY LISTS ── */
document.getElementById('newListBtn').onclick=openNewListModal;
document.getElementById('newListModalClose').onclick=closeNewListModal;
document.getElementById('newListCancel').onclick=closeNewListModal;
document.getElementById('newListModal').onclick=function(e){if(e.target===this)closeNewListModal();};
document.getElementById('newListSave').onclick=saveList;
document.getElementById('newListName').addEventListener('keydown',e=>{if(e.key==='Enter')saveList();});

async function loadMyLists(){
  const {data}=await sb.from('lists').select('*').eq('user_id',currentUser.id).order('created_at');
  if(!data||!data.length){
    const {data:nl}=await sb.from('lists').insert({user_id:currentUser.id,name:'Listem',is_default:true}).select().single();
    myLists=[nl];
  } else { myLists=data; }
  renderListsNav();
  if(activeListId&&myLists.find(l=>l.id===activeListId)) selectList(activeListId);
  else if(myLists.length) selectList(myLists[0].id);
}

function renderListsNav(){
  const nav=document.getElementById('listsNav'); nav.innerHTML='';
  myLists.forEach(l=>{
    const item=document.createElement('div');
    item.className='list-nav-item'+(activeListId===l.id?' active':'');
    item.innerHTML='<span class="list-nav-name">'+l.name+'</span>'+
      '<div style="display:flex;align-items:center;gap:6px">'+
        '<span class="list-nav-count" id="nc-'+l.id+'"></span>'+
        '<div class="list-nav-actions">'+
          '<button class="list-nav-btn" data-edit="'+l.id+'">✏️</button>'+
          (!l.is_default?'<button class="list-nav-btn del" data-del="'+l.id+'">🗑</button>':'')+
        '</div>'+
      '</div>';
    item.addEventListener('click',function(e){
      if(e.target.dataset.edit){openEditListModal(e.target.dataset.edit);return;}
      if(e.target.dataset.del){deleteList(e.target.dataset.del,l.name);return;}
      selectList(l.id);
    });
    nav.appendChild(item);
    sb.from('game_lists').select('*',{count:'exact',head:true}).eq('user_id',currentUser.id).eq('list_id',l.id)
      .then(({count})=>{const el=document.getElementById('nc-'+l.id);if(el)el.textContent=count||0;});
  });
}

async function selectList(id){
  activeListId=id; currentPage=1;
  renderListsNav();
  const list=myLists.find(l=>l.id===id); if(!list) return;
  const content=document.getElementById('listContent');
  content.innerHTML=
    '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px">'+
      '<div>'+
        '<div class="list-content-title">'+list.name.toUpperCase()+'</div>'+
        (list.description?'<div class="list-content-desc">'+list.description+'</div>':'')+
      '</div>'+
      '<div class="list-stats">'+
        '<div style="text-align:center"><div class="stat-val" id="statTotal">—</div><div class="stat-lbl">'+t('statGames')+'</div></div>'+
        '<div style="text-align:center"><div class="stat-val" id="statAvg">—</div><div class="stat-lbl">'+t('statAvg')+'</div></div>'+
      '</div>'+
    '</div>'+
    '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:16px">'+
      '<div class="list-sort">'+
        '<button class="sort-btn active" id="dateSortBtn">'+t('sortDate')+' <span id="dateSortArrow">↓</span></button>'+
        '<button class="sort-btn" data-sort="score-desc">'+t('sortHigh')+'</button>'+
        '<button class="sort-btn" data-sort="score-asc">'+t('sortLow')+'</button>'+
        '<button class="sort-btn" data-sort="name">'+t('sortName')+'</button>'+
      '</div>'+
      '<div style="display:flex;gap:8px;align-items:center">'+
        '<div class="view-toggle">'+
          '<button class="view-toggle-btn active" id="viewBtnList" title="'+t('viewList')+'">☰</button>'+
          '<button class="view-toggle-btn" id="viewBtnTable" title="'+t('viewTable')+'">⊞</button>'+
        '</div>'+
        '<div style="position:relative">'+
          '<button id="exportBtn" class="tool-btn">'+t('exportBtn')+'</button>'+
          '<div class="export-menu" id="exportMenu">'+
            '<div class="export-menu-item" data-fmt="csv">'+t('exportCSV')+'</div>'+
            '<div class="export-menu-item" data-fmt="xlsx">'+t('exportXLSX')+'</div>'+
            '<div class="export-menu-item" data-fmt="pdf">'+t('exportPDF')+'</div>'+
          '</div>'+
        '</div>'+
        '<label class="tool-btn">'+t('importLbl')+'<input type="file" accept=".csv,.xlsx" id="importInput" style="display:none"></label>'+
      '</div>'+
    '</div>'+
    '<div id="paginationTop" class="pagination" style="margin-bottom:16px;margin-top:0"></div>'+
    '<div id="myListItems"></div>';

  document.getElementById('dateSortBtn').onclick=function(){
    dateSortAsc=currentSort==='date'?!dateSortAsc:false;
    currentSort='date'; currentPage=1;
    document.querySelectorAll('.sort-btn').forEach(b=>b.classList.remove('active'));
    this.classList.add('active');
    document.getElementById('dateSortArrow').textContent=dateSortAsc?'↑':'↓';
    renderList(null,currentUser.id,false,activeListId);
  };
  content.querySelectorAll('.sort-btn[data-sort]').forEach(btn=>{
    btn.onclick=function(){
      currentSort=this.dataset.sort; currentPage=1;
      document.querySelectorAll('.sort-btn').forEach(b=>b.classList.remove('active'));
      this.classList.add('active');
      renderList(null,currentUser.id,false,activeListId);
    };
  });
  document.getElementById('viewBtnList').onclick=function(){
    listViewMode='list';
    document.getElementById('viewBtnList').classList.add('active');
    document.getElementById('viewBtnTable').classList.remove('active');
    renderList(null,currentUser.id,false,activeListId);
  };
  document.getElementById('viewBtnTable').onclick=function(){
    listViewMode='table';
    document.getElementById('viewBtnTable').classList.add('active');
    document.getElementById('viewBtnList').classList.remove('active');
    renderList(null,currentUser.id,false,activeListId);
  };
  document.getElementById('exportBtn').onclick=function(e){
    e.stopPropagation();
    const m=document.getElementById('exportMenu');
    m.style.display=m.style.display==='block'?'none':'block';
    if(m.style.display==='block') setTimeout(()=>document.addEventListener('click',()=>{m.style.display='none';},{once:true}),10);
  };
  document.getElementById('exportMenu').querySelectorAll('.export-menu-item').forEach(item=>{
    item.onclick=function(e){e.stopPropagation();exportList(this.dataset.fmt);document.getElementById('exportMenu').style.display='none';};
  });
  document.getElementById('importInput').onchange=importList;
  renderList(null,currentUser.id,false,id);
}

function openNewListModal(){
  editingListId=null;
  document.getElementById('newListModalTitle').textContent=t('newListTitle');
  document.getElementById('newListName').value='';
  document.getElementById('newListDesc').value='';
  document.getElementById('newListModal').classList.add('open');
  setTimeout(()=>document.getElementById('newListName').focus(),100);
}
function openEditListModal(id){
  const l=myLists.find(x=>x.id===id); if(!l) return;
  editingListId=id;
  document.getElementById('newListModalTitle').textContent=t('editListTitle');
  document.getElementById('newListName').value=l.name;
  document.getElementById('newListDesc').value=l.description||'';
  document.getElementById('newListModal').classList.add('open');
  setTimeout(()=>document.getElementById('newListName').focus(),100);
}
function closeNewListModal(){document.getElementById('newListModal').classList.remove('open');editingListId=null;}

async function saveList(){
  const name=document.getElementById('newListName').value.trim();
  const desc=document.getElementById('newListDesc').value.trim();
  if(!name){toast(t('toastListNameReq'));return;}
  if(editingListId){
    await sb.from('lists').update({name,description:desc}).eq('id',editingListId).eq('user_id',currentUser.id);
    toast(t('toastListUpdated'));
  } else {
    await sb.from('lists').insert({user_id:currentUser.id,name,description:desc});
    toast('"'+name+'"'+t('toastListCreated'));
  }
  closeNewListModal(); await loadMyLists();
}

async function deleteList(id,name){
  if(!confirm('"'+name+'"'+t('confirmListDel'))) return;
  await sb.from('game_lists').delete().eq('user_id',currentUser.id).eq('list_id',id);
  await sb.from('lists').delete().eq('id',id).eq('user_id',currentUser.id);
  if(activeListId===id) activeListId=null;
  toast('"'+name+'"'+t('toastListDeleted'));
  await loadMyLists();
}

async function renderList(targetEl,userId,readonly,listId,page){
  const el=targetEl||document.getElementById('myListItems'); if(!el) return;
  if(page!==undefined) currentPage=page;
  el.innerHTML='<div class="loading"><div class="spinner"></div>'+t('loadingTxt')+'</div>';
  const isPaged=!targetEl;
  let q=sb.from('game_lists').select('*',{count:'exact'}).eq('user_id',userId);
  if(listId) q=q.eq('list_id',listId);
  if(currentSort==='score-desc') q=q.order('score',{ascending:false});
  else if(currentSort==='score-asc') q=q.order('score',{ascending:true});
  else if(currentSort==='name') q=q.order('game_name',{ascending:true});
  else q=q.order('added_at',{ascending:dateSortAsc});
  if(isPaged) q=q.range((currentPage-1)*PAGE_SIZE,currentPage*PAGE_SIZE-1);
  const {data:list,count,error}=await q;
  if(error){el.innerHTML='<div class="loading">Error: '+error.message+'</div>';return;}
  const stEl=document.getElementById('statTotal'),saEl=document.getElementById('statAvg');
  if(stEl){
    if(isPaged) sb.from('game_lists').select('*',{count:'exact',head:true}).eq('user_id',userId).eq('list_id',listId).then(({count:tc})=>{if(stEl)stEl.textContent=tc||0;});
    else stEl.textContent=(list||[]).length;
  }
  if(saEl) saEl.textContent=list&&list.length?(list.reduce((s,g)=>s+g.score,0)/list.length).toFixed(1):'—';
  if(!list||!list.length){el.innerHTML='<div class="empty-state"><div class="empty-icon">🎮</div><h3>'+t('listEmptyTitle')+'</h3><p>'+t('listEmptySub')+'</p></div>';return;}
  el.innerHTML='';

  if(listViewMode==='table'&&!readonly){
    const tbl=document.createElement('table'); tbl.className='game-table';
    tbl.innerHTML='<thead><tr><th>'+t('tblNum')+'</th><th></th><th>'+t('tblGame')+'</th><th>'+t('tblScore')+'</th><th>'+t('tblYear')+'</th><th>'+t('tblGenre')+'</th><th>'+t('tblNote')+'</th><th>'+t('tblDate')+'</th><th></th></tr></thead>';
    const tbody=document.createElement('tbody');
    list.forEach((game,idx)=>{
      const year=game.released?game.released.slice(0,4):'—';
      const genres=(game.genres||[]).slice(0,2).join(', ')||'—';
      const date=new Date(game.added_at).toLocaleDateString(t('dateLocale'));
      const num=(currentPage-1)*PAGE_SIZE+idx+1;
      const tr=document.createElement('tr');
      tr.innerHTML='<td style="color:var(--muted);font-size:12px">'+num+'</td>'+
        '<td>'+(game.game_image?'<a href="'+mcUrl(game.game_name)+'" target="_blank" rel="noopener"><img class="tbl-img" src="'+game.game_image+'" alt="" loading="lazy" style="transition:opacity .2s" onmouseover="this.style.opacity=.7" onmouseout="this.style.opacity=1"></a>':'🎮')+'</td>'+
        '<td><div style="display:flex;align-items:center;gap:8px"><span style="font-weight:600">'+game.game_name+'</span><a href="https://store.steampowered.com/search/?term='+encodeURIComponent(game.game_name)+'" target="_blank" rel="noopener" title="Steam’de Ara" class="steam-link"><svg width="11" height="11" viewBox="0 0 496 512" xmlns="http://www.w3.org/2000/svg"><path d="M496 256c0 137-111.2 248-248.4 248-113.8 0-209.7-76.3-239.1-180.4l95.2 39.3c6.4 32.1 34.9 56.4 68.9 56.4 39.2 0 71.9-32.4 70.2-73.5l84.5-60.2c52.1 1.3 95.8-40.9 95.8-93.5 0-51.6-42-93.5-93.7-93.5s-93.7 42-93.7 93.5v1.2L176.6 279c-15.5-.9-30.7 3.4-43.5 12.1L0 235.1C10.2 103.7 122.2 8 248 8c136.9 0 248 111 248 248z" fill="#66c0f4"/></svg></a></div></td>'+
        '<td><span class="tbl-score '+sc(game.score)+'">'+game.score+'<span style="color:var(--muted);font-size:11px">/10</span></span></td>'+
        '<td style="color:var(--muted)">'+year+'</td>'+
        '<td style="color:var(--muted)">'+genres+'</td>'+
        '<td style="color:var(--muted);font-style:italic;font-size:12px">'+(game.notes?'"'+game.notes+'"':'')+'</td>'+
        '<td style="color:var(--muted);white-space:nowrap">'+date+'</td>'+
        '<td><div style="display:flex;gap:4px">'+
          '<button class="icon-btn edit-btn">✏️</button>'+
          '<button class="icon-btn del del-btn">🗑</button>'+
        '</div></td>';
      tr.querySelector('.edit-btn').onclick=()=>editGame(game);
      tr.querySelector('.del-btn').onclick=()=>deleteGame(game.game_id,game.game_name);
      tbody.appendChild(tr);
    });
    tbl.appendChild(tbody); el.appendChild(tbl);
  } else {
    list.forEach(game=>{
      const year=game.released?game.released.slice(0,4):'—';
      const genres=(game.genres||[]).slice(0,2).join(', ')||'—';
      const date=new Date(game.added_at).toLocaleDateString(t('dateLocale'));
      const item=document.createElement('div'); item.className='list-item';
      item.innerHTML=
        '<div style="display:grid;grid-template-columns:80px 1fr auto;gap:16px;align-items:center">'+
          (game.game_image?'<a href="'+mcUrl(game.game_name)+'" target="_blank" rel="noopener" style="display:block"><img class="list-item-img" src="'+game.game_image+'" alt="" loading="lazy" style="transition:opacity .2s" onmouseover="this.style.opacity=.7" onmouseout="this.style.opacity=1"></a>':'<div class="list-item-img" style="display:flex;align-items:center;justify-content:center;color:#444;font-size:24px">🎮</div>')+
          '<div>'+
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">'+
              '<div class="list-item-title" style="margin-bottom:0">'+game.game_name+'</div>'+
              '<a href="https://store.steampowered.com/search/?term='+encodeURIComponent(game.game_name)+'" target="_blank" rel="noopener" title="Steam’de Ara" class="steam-link"><svg width="12" height="12" viewBox="0 0 496 512" xmlns="http://www.w3.org/2000/svg"><path d="M496 256c0 137-111.2 248-248.4 248-113.8 0-209.7-76.3-239.1-180.4l95.2 39.3c6.4 32.1 34.9 56.4 68.9 56.4 39.2 0 71.9-32.4 70.2-73.5l84.5-60.2c52.1 1.3 95.8-40.9 95.8-93.5 0-51.6-42-93.5-93.7-93.5s-93.7 42-93.7 93.5v1.2L176.6 279c-15.5-.9-30.7 3.4-43.5 12.1L0 235.1C10.2 103.7 122.2 8 248 8c136.9 0 248 111 248 248z" fill="#66c0f4"/></svg></a>'+
            '</div>'+
            '<div class="list-item-meta"><span>'+year+'</span><span>'+genres+'</span><span>📅 '+date+'</span></div>'+
            (game.notes?'<div class="list-item-note">"'+game.notes+'"</div>':'')+
          '</div>'+
          '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;flex-shrink:0">'+
            '<div class="score-badge '+sc(game.score)+'">'+game.score+'<span>/10</span></div>'+
            (!readonly?'<div class="item-actions"><button class="icon-btn edit-btn">✏️</button><button class="icon-btn del del-btn">🗑</button></div>':'')+
          '</div>'+
        '</div>'+
        '<div class="comment-section">'+
          '<button class="comment-toggle">'+t('showComments')+'</button>'+
          '<div class="comment-box">'+
            '<div class="comments-list"></div>'+
            '<div class="comment-input-row">'+
              '<input class="comment-input" placeholder="'+t('commentPlaceholder')+'">'+
              '<button class="btn-comment">'+t('commentBtn')+'</button>'+
            '</div>'+
          '</div>'+
        '</div>';
      if(!readonly){
        item.querySelector('.edit-btn').onclick=()=>editGame(game);
        item.querySelector('.del-btn').onclick=()=>deleteGame(game.game_id,game.game_name);
      }
      const ctoggle=item.querySelector('.comment-toggle');
      const cbox=item.querySelector('.comment-box');
      const clist=item.querySelector('.comments-list');
      const cinput=item.querySelector('.comment-input');
      ctoggle.onclick=()=>{
        cbox.classList.toggle('open');
        ctoggle.textContent=cbox.classList.contains('open')?t('hideComments'):t('showComments');
        if(cbox.classList.contains('open')) loadComments(clist,userId,game.game_id);
      };
      item.querySelector('.btn-comment').onclick=()=>submitComment(cinput,userId,game.game_id,clist);
      cinput.addEventListener('keydown',e=>{if(e.key==='Enter')submitComment(cinput,userId,game.game_id,clist);});
      el.appendChild(item);
    });
  }

  // Pagination
  if(isPaged){
    const total=count||0;
    const totalPages=Math.ceil(total/PAGE_SIZE);
    const buildPag=(container)=>{
      container.innerHTML='';
      if(totalPages<=1) return;
      const prev=document.createElement('button'); prev.className='page-btn'; prev.textContent='←'; prev.disabled=currentPage===1;
      prev.onclick=()=>renderList(null,userId,readonly,listId,currentPage-1);
      container.appendChild(prev);
      let pages=[];
      if(totalPages<=7){for(let i=1;i<=totalPages;i++)pages.push(i);}
      else{
        pages=[1];
        if(currentPage>3)pages.push('...');
        for(let i=Math.max(2,currentPage-1);i<=Math.min(totalPages-1,currentPage+1);i++)pages.push(i);
        if(currentPage<totalPages-2)pages.push('...');
        pages.push(totalPages);
      }
      pages.forEach(p=>{
        if(p==='...'){const s=document.createElement('span');s.textContent='…';s.style.cssText='color:var(--muted);padding:0 6px;line-height:34px';container.appendChild(s);return;}
        const btn=document.createElement('button'); btn.className='page-btn'+(p===currentPage?' active':'');
        btn.textContent=p; btn.onclick=()=>renderList(null,userId,readonly,listId,p);
        container.appendChild(btn);
      });
      const next=document.createElement('button'); next.className='page-btn'; next.textContent='→'; next.disabled=currentPage===totalPages;
      next.onclick=()=>renderList(null,userId,readonly,listId,currentPage+1);
      container.appendChild(next);
      const info=document.createElement('span'); info.style.cssText='font-size:12px;color:var(--muted);margin-left:8px';
      info.textContent=((currentPage-1)*PAGE_SIZE+1)+'-'+Math.min(currentPage*PAGE_SIZE,total)+' / '+total;
      container.appendChild(info);
    };
    // Top pagination
    const topPag=document.getElementById('paginationTop');
    if(topPag) buildPag(topPag);
    // Bottom pagination
    const botPag=document.createElement('div'); botPag.className='pagination';
    buildPag(botPag);
    if(botPag.children.length) el.appendChild(botPag);
  }
  renderListsNav();
}

function editGame(game){
  currentGame={id:game.game_id,name:game.game_name,background_image:game.game_image,released:game.released,
    genres:(game.genres||[]).map(n=>({name:n})),platforms:(game.platforms||[]).map(n=>({platform:{name:n}}))};
  document.getElementById('modalImg').src=game.game_image||'';
  document.getElementById('modalTitle').textContent=game.game_name;
  document.getElementById('modalMeta').textContent=game.released?game.released.slice(0,4):'';
  document.getElementById('scoreSlider').value=game.score;
  document.getElementById('scoreDisplay').innerHTML=game.score+'<span>/10</span>';
  document.getElementById('notesInput').value=game.notes||'';
  document.getElementById('saveBtn').textContent=t('updateBtn');
  populateListSelect(game.list_id);
  document.getElementById('ratingModal').classList.add('open');
}
async function deleteGame(gameId,gameName){
  if(!confirm('"'+gameName+'"'+t('confirmDel'))) return;
  await sb.from('game_lists').delete().eq('user_id',currentUser.id).eq('game_id',gameId);
  renderList(null,currentUser.id,false,activeListId);
  toast(t('toastDeleted'));
}

/* ── COMMENTS ── */
async function loadComments(container,ownerId,gameId){
  container.innerHTML='<div style="font-size:12px;color:var(--muted);padding:4px 0">'+t('loadingTxt')+'</div>';
  const {data}=await sb.from('comments').select('*,profiles(username)').eq('game_list_owner_id',ownerId).eq('game_id',gameId).order('created_at');
  if(!data||!data.length){container.innerHTML='<div style="font-size:12px;color:var(--muted);padding:4px 0">'+t('noComments')+'</div>';return;}
  container.innerHTML='';
  data.forEach(c=>{
    const uname=c.profiles?.username||'?';
    const date=new Date(c.created_at).toLocaleDateString('tr-TR');
    const div=document.createElement('div'); div.className='comment-item';
    div.innerHTML='<div class="comment-avatar">'+uname[0].toUpperCase()+'</div>'+
      '<div><div class="comment-author">'+uname+' <span class="comment-date">· '+date+'</span></div>'+
      '<div class="comment-text">'+c.content+'</div></div>';
    container.appendChild(div);
  });
}
async function submitComment(input,ownerId,gameId,clist){
  const content=input.value.trim(); if(!content) return;
  const {error}=await sb.from('comments').insert({user_id:currentUser.id,game_list_owner_id:ownerId,game_id:gameId,content});
  if(error){toast('Error: '+error.message);return;}
  input.value=''; await loadComments(clist,ownerId,gameId);
}

/* ── EXPORT / IMPORT ── */
async function exportList(fmt){
  const {data:list}=await sb.from('game_lists').select('*').eq('user_id',currentUser.id).eq('list_id',activeListId).order('added_at',{ascending:false});
  if(!list||!list.length){toast('Liste boş.');return;}
  const listName=myLists.find(l=>l.id===activeListId)?.name||'liste';
  const rows=list.map(g=>({[t('colName')]:g.game_name,[t('colScore')]:g.score,[t('colYear')]:g.released?g.released.slice(0,4):'',[t('colGenres')]:(g.genres||[]).join(', '),[t('colPlatform')]:(g.platforms||[]).join(', '),[t('colNote')]:g.notes||'',[t('colDate')]:new Date(g.added_at).toLocaleDateString(t('dateLocale'))}));
  if(fmt==='csv'){
    const hdr=Object.keys(rows[0]);
    const csv=[hdr.join(','),...rows.map(r=>hdr.map(h=>'"'+(r[h]||'').toString().replace(/"/g,'""')+'"').join(','))].join('\n');
    const a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}));
    a.download=listName+'.csv'; a.click(); URL.revokeObjectURL(a.href);
    toast(t('toastCSV'));
  } else if(fmt==='xlsx'){
    const ws=XLSX.utils.json_to_sheet(rows);
    const wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,listName.slice(0,31));
    XLSX.writeFile(wb,listName+'.xlsx');
    toast(t('toastXLSX'));
  } else if(fmt==='pdf'){
    const win=window.open('','_blank');
    win.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>'+listName+'</title><style>body{font-family:Arial,sans-serif;padding:24px}h1{font-size:22px;margin-bottom:16px}table{width:100%;border-collapse:collapse;font-size:13px}th{background:#1a1a2e;color:#fff;text-align:left;padding:8px 10px}td{padding:7px 10px;border-bottom:1px solid #ddd}</style></head><body><h1>🎮 '+listName+'</h1><table><thead><tr><th>#</th><th>Oyun</th><th>Puan</th><th>Yıl</th><th>Not</th></tr></thead><tbody>'+rows.map((r,i)=>'<tr><td>'+(i+1)+'</td><td>'+r[t('colName')]+'</td><td>'+r[t('colScore')]+'/10</td><td>'+r[t('colYear')]+'</td><td>'+r[t('colNote')]+'</td></tr>').join('')+'</tbody></table></body></html>');
    win.document.close(); setTimeout(()=>win.print(),400);
    toast(t('toastPDF'));
  }
}

async function importList(event){
  const file=event.target.files[0]; if(!file) return;
  event.target.value='';
  const ext=file.name.split('.').pop().toLowerCase();
  let rows=[];
  try{
    if(ext==='csv'){
      const text=await file.text();
      const lines=text.split('\n').filter(l=>l.trim());
      const headers=lines[0].split(',').map(h=>h.replace(/^"|"$/g,'').trim());
      rows=lines.slice(1).map(line=>{
        const vals=[]; let cur='',inQ=false;
        for(const ch of line){if(ch==='"'){inQ=!inQ;}else if(ch===','&&!inQ){vals.push(cur.trim());cur='';}else cur+=ch;}
        vals.push(cur.trim());
        const obj={}; headers.forEach((h,i)=>obj[h]=(vals[i]||'').replace(/^"|"$/g,''));
        return obj;
      });
    } else {
      const buf=await file.arrayBuffer();
      const wb=XLSX.read(buf,{type:'array'});
      rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:''});
    }
  }catch(e){toast(t('toastFileErr'));return;}
  if(!rows.length){toast(t('toastNoData'));return;}
  const nameKey=Object.keys(rows[0]).find(k=>/oyun|name|game/i.test(k));
  const scoreKey=Object.keys(rows[0]).find(k=>/puan|score|rating/i.test(k));
  if(!nameKey){toast(t('toastNoCol'));return;}
  let imported=0,skipped=0;
  toast(t('toastImporting'));
  for(const row of rows){
    const gameName=(row[nameKey]||'').trim(); if(!gameName) continue;
    const score=Math.min(10,Math.max(1,parseInt(row[scoreKey])||5));
    const noteKey=Object.keys(row).find(k=>/not|note|comment/i.test(k));
    try{
      const r=await fetch('https://api.rawg.io/api/games?key='+RAWG+'&search='+encodeURIComponent(gameName)+'&page_size=1&search_precise=true');
      const d=await r.json();
      const game=d.results&&d.results[0];
      if(!game){skipped++;continue;}
      await sb.from('game_lists').upsert({
        user_id:currentUser.id,game_id:game.id,list_id:activeListId,
        game_name:game.name,game_image:game.background_image||'',
        released:game.released||'',
        genres:(game.genres||[]).map(x=>x.name),
        platforms:(game.platforms||[]).slice(0,3).map(x=>x.platform.name),
        score,notes:noteKey?row[noteKey]:''
      },{onConflict:'user_id,game_id'});
      imported++;
    }catch(e){skipped++;}
  }
  toast(t('toastImportDone_pre')+imported+t('toastImportDone_added')+skipped+t('toastImportDone_skipped'));
  renderList(null,currentUser.id,false,activeListId);
  renderListsNav();
}

/* ── FRIENDS ── */
document.getElementById('userSearchBtn').onclick=searchUsers;
document.getElementById('userSearchInput').addEventListener('keydown',e=>{if(e.key==='Enter')searchUsers();});
document.getElementById('ftFollowing').onclick=()=>switchFriendsTab('following');
document.getElementById('ftFollowers').onclick=()=>switchFriendsTab('followers');
document.getElementById('ftSearch').onclick=()=>switchFriendsTab('search');

async function searchUsers(){
  const q=document.getElementById('userSearchInput').value.trim(); if(!q) return;
  switchFriendsTab('search');
  const {data:users}=await sb.from('profiles').select('*').ilike('username','%'+q+'%').neq('id',currentUser.id).limit(20);
  const {data:fRows}=await sb.from('follows').select('following_id').eq('follower_id',currentUser.id);
  renderUserList(users||[],new Set((fRows||[]).map(r=>r.following_id)),document.getElementById('friendsContent'));
}
function switchFriendsTab(tab){
  friendsTab=tab;
  ['following','followers','search'].forEach(t=>document.getElementById('ft'+t.charAt(0).toUpperCase()+t.slice(1)).classList.toggle('active',t===tab));
  if(tab!=='search') loadFriendsTab();
}
async function loadFriendsTab(){
  const el=document.getElementById('friendsContent');
  el.innerHTML='<div class="loading"><div class="spinner"></div>'+t('loadingTxt')+'</div>';
  if(friendsTab==='following'){
    // Get IDs first, then fetch profiles separately
    const {data:rows}=await sb.from('follows').select('following_id').eq('follower_id',currentUser.id);
    const ids=(rows||[]).map(r=>r.following_id);
    if(!ids.length){renderUserList([],new Set(),el);return;}
    const {data:users}=await sb.from('profiles').select('id,username').in('id',ids);
    renderUserList(users||[],new Set(ids),el);
  } else if(friendsTab==='followers'){
    const {data:rows}=await sb.from('follows').select('follower_id').eq('following_id',currentUser.id);
    const ids=(rows||[]).map(r=>r.follower_id);
    if(!ids.length){renderUserList([],new Set(),el);return;}
    const {data:users}=await sb.from('profiles').select('id,username').in('id',ids);
    const {data:fRows}=await sb.from('follows').select('following_id').eq('follower_id',currentUser.id);
    renderUserList(users||[],new Set((fRows||[]).map(r=>r.following_id)),el);
  }
}
function renderUserList(users,followingIds,el){
  if(!users.length){el.innerHTML='<div class="empty-state"><div class="empty-icon">👥</div><h3>'+t('userNotFound')+'</h3></div>';return;}
  el.innerHTML='';
  users.forEach(u=>{
    const isF=followingIds.has(u.id);
    const card=document.createElement('div'); card.className='user-card';
    card.innerHTML='<div style="display:flex;align-items:center;gap:12px">'+
      '<div class="user-avatar">'+u.username[0].toUpperCase()+'</div>'+
      '<div class="user-card-name">'+u.username+'</div></div>'+
      '<div style="display:flex;gap:8px">'+
        '<button class="btn-view-list">'+t('viewListBtn')+'</button>'+
        '<button class="btn-follow'+(isF?' following':'')+'">'+(isF?t('followingBtn'):t('followBtn'))+'</button>'+
      '</div>';
    card.querySelector('.btn-view-list').onclick=()=>viewProfile(u.id,u.username);
    const fbtn=card.querySelector('.btn-follow');
    fbtn.onclick=()=>toggleFollow(u.id,u.username,fbtn);
    el.appendChild(card);
  });
}
async function toggleFollow(userId,username,btn){
  const isF=btn.classList.contains('following');
  if(isF){
    await sb.from('follows').delete().eq('follower_id',currentUser.id).eq('following_id',userId);
    btn.classList.remove('following'); btn.textContent=t('followBtn');
    toast(username+t('toastUnfollowed'));
  } else {
    await sb.from('follows').insert({follower_id:currentUser.id,following_id:userId});
    btn.classList.add('following'); btn.textContent=t('followingBtn');
    toast(username+t('toastFollowed'));
  }
  // Refresh following tab if currently viewing it
  if(friendsTab==='following') loadFriendsTab();
}

/* ── PROFILE ── */
async function viewProfile(userId,username){
  viewingProfile={id:userId,username};
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById('profileView').classList.add('active');
  document.getElementById('profileAvatar').textContent=username[0].toUpperCase();
  document.getElementById('profileName').textContent=username.toUpperCase();
  document.getElementById('profileStats').textContent='Yükleniyor...';
  const {data:fRow}=await sb.from('follows').select('id').eq('follower_id',currentUser.id).eq('following_id',userId).maybeSingle();
  const isF=!!fRow;
  const pfBtn=document.getElementById('profileFollowBtn');
  pfBtn.textContent=isF?t('followingBtn'):t('followBtn');
  pfBtn.className='btn-follow'+(isF?' following':'');
  pfBtn.onclick=toggleFollowProfile;
  const {data:theirLists}=await sb.from('lists').select('*').eq('user_id',userId).order('created_at');
  const {count}=await sb.from('game_lists').select('*',{count:'exact',head:true}).eq('user_id',userId);
  document.getElementById('profileStats').textContent=(count||0)+t('oyunCount')+(theirLists||[]).length+t('listeCount');
  const tabsEl=document.getElementById('profileListsTabs'); tabsEl.innerHTML='';
  (theirLists||[]).forEach((l,i)=>{
    const btn=document.createElement('button');
    btn.className='profile-list-tab'+(i===0?' active':'');
    btn.textContent=l.name;
    btn.onclick=()=>{
      document.querySelectorAll('.profile-list-tab').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      renderList(document.getElementById('profileListItems'),userId,true,l.id);
    };
    tabsEl.appendChild(btn);
  });
  if(theirLists&&theirLists.length) renderList(document.getElementById('profileListItems'),userId,true,theirLists[0].id);
}
async function toggleFollowProfile(){
  if(!viewingProfile) return;
  const btn=document.getElementById('profileFollowBtn');
  const isF=btn.classList.contains('following');
  if(isF){
    await sb.from('follows').delete().eq('follower_id',currentUser.id).eq('following_id',viewingProfile.id);
    btn.classList.remove('following'); btn.textContent=t('followBtn');
    toast(viewingProfile.username+' takipten çıkarıldı.');
  } else {
    await sb.from('follows').insert({follower_id:currentUser.id,following_id:viewingProfile.id});
    btn.classList.add('following'); btn.textContent=t('followingBtn');
    toast(viewingProfile.username+' takip edildi!');
  }
}

/* ── HERO ── */
function initHero(){
  const left=document.getElementById('heroLeft'),right=document.getElementById('heroRight');
  if(!left||left.children.length>0) return;
  const lc=[{name:'Half-Life 2',img:'https://cdn.akamai.steamstatic.com/steam/apps/220/header.jpg'},{name:'Tomb Raider',img:'https://cdn.akamai.steamstatic.com/steam/apps/203160/header.jpg'},{name:'Wolfenstein',img:'https://cdn.akamai.steamstatic.com/steam/apps/612880/header.jpg'}];
  const rc=[{name:'Fallout 4',img:'https://cdn.akamai.steamstatic.com/steam/apps/377160/header.jpg'},{name:'Skyrim',img:'https://cdn.akamai.steamstatic.com/steam/apps/489830/header.jpg'},{name:'Oblivion',img:'https://cdn.akamai.steamstatic.com/steam/apps/22330/header.jpg'}];
  const mk=c=>{const d=document.createElement('div');d.className='scattered-card';d.innerHTML='<img src="'+c.img+'" alt="'+c.name+'" loading="lazy"><div class="sc-label">'+c.name+'</div>';return d;};
  lc.forEach(c=>left.appendChild(mk(c)));
  rc.forEach(c=>right.appendChild(mk(c)));
}

}
