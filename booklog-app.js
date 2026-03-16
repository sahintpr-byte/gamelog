function initBooklog(){

const SB_URL='https://dzjmbwyandrkonqdjalk.supabase.co';
const SB_KEY='sb_publishable_oeokT78grwbNQeKo8xtZRA_xJdBkuPD';
const {createClient}=supabase;
const sb=createClient(SB_URL,SB_KEY);
const PAGE_SIZE=30;

let currentUser=null,currentBook=null,currentSort='date',dateSortAsc=false;
let listViewMode='list',currentPage=1;
let authMode='login',friendsTab='following';
let myLists=[],activeListId=null,viewingProfile=null,editingListId=null;

function toast(msg){const el=document.getElementById('toast');el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2800);}
function sc(s){return s<=4?'low':s<=6?'mid':'high';}

/* ── LANG ── */
document.getElementById('langTR').onclick=()=>switchLang('tr');
document.getElementById('langEN').onclick=()=>switchLang('en');
applyLang();

/* ── AUTH ── */
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
  if(!email||!pass){showMsg(t('authErrEmpty'),'error');return;}
  btn.disabled=true;btn.textContent='...';
  if(authMode==='register'){
    const username=document.getElementById('authUsername').value.trim()||email.split('@')[0];
    const {error}=await sb.auth.signUp({email,password:pass,options:{data:{username}}});
    btn.disabled=false;btn.textContent=t('authBtn_register');
    if(error){showMsg(error.message,'error');return;}
    showMsg(t('authOK'),'success');
  } else {
    const {data,error}=await sb.auth.signInWithPassword({email,password:pass});
    btn.disabled=false;btn.textContent=t('authBtn_login');
    if(error){showMsg(t('authErrWrong'),'error');return;}
    currentUser=data.user;showApp();
  }
}
function showMsg(msg,type){const el=document.getElementById(type==='error'?'authError':'authSuccess');el.textContent=msg;el.style.display='block';}

document.getElementById('logoutBtn').onclick=async()=>{
  await sb.auth.signOut();currentUser=null;myLists=[];activeListId=null;
  document.getElementById('appScreen').style.display='none';
  document.getElementById('authScreen').style.display='flex';
};

function showApp(){
  document.getElementById('authScreen').style.display='none';
  document.getElementById('appScreen').style.display='block';
  const name=currentUser.user_metadata?.username||currentUser.email.split('@')[0];
  document.getElementById('userBadge').innerHTML='📖 <strong>'+name+'</strong>';
  initHero();
  // Preload lists so modal list select works immediately from search view
  loadMyListsSilent();
}

async function loadMyListsSilent(){
  const {data}=await sb.from('book_lists_meta').select('*').eq('user_id',currentUser.id).order('created_at');
  if(!data||!data.length){
    const {data:nl}=await sb.from('book_lists_meta').insert({user_id:currentUser.id,name:'Kitaplığım',is_default:true}).select().single();
    myLists=[nl];
  } else { myLists=data; }
  if(!activeListId&&myLists.length) activeListId=myLists[0].id;
}

sb.auth.onAuthStateChange((event,session)=>{
  if(session?.user){currentUser=session.user;if(document.getElementById('authScreen').style.display!=='none')showApp();}
  else if(event==='SIGNED_OUT'){currentUser=null;myLists=[];activeListId=null;document.getElementById('appScreen').style.display='none';document.getElementById('authScreen').style.display='flex';}
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
  if(tabs[v])document.getElementById(tabs[v]).classList.add('active');
  if(v==='mylist')loadMyLists();
  if(v==='friends')loadFriendsTab();
  if(v==='search'){document.getElementById('searchInput').value='';document.getElementById('searchResults').innerHTML='';}
}

/* ── SEARCH ── */
document.getElementById('searchBtn').onclick=searchBooks;
document.getElementById('searchInput').addEventListener('keydown',e=>{if(e.key==='Enter'){closeDropdown();searchBooks();}});
document.getElementById('searchInput').addEventListener('input',debounce(liveSearchBooks,400));
document.getElementById('searchInput').addEventListener('blur',()=>{
  if(!_dropdownClicking) setTimeout(closeDropdown,200);
});
let _dropdownClicking=false;

let _searchTimer=null;
function debounce(fn,ms){return function(...args){clearTimeout(_searchTimer);_searchTimer=setTimeout(()=>fn(...args),ms);};}
function closeDropdown(){const d=document.getElementById('searchDropdown');if(d)d.remove();}

async function liveSearchBooks(){
  const q=document.getElementById('searchInput').value.trim();
  closeDropdown();
  if(q.length<2)return;
  try{
    const r=await fetch('https://openlibrary.org/search.json?q='+encodeURIComponent(q)+'&limit=6&fields=key,title,author_name,first_publish_year,cover_i');
    const data=await r.json();
    if(!data.docs||!data.docs.length)return;
    const inp=document.getElementById('searchInput');
    const rect=inp.getBoundingClientRect();
    const drop=document.createElement('div');
    drop.id='searchDropdown';
    drop.style.cssText='position:fixed;top:'+(rect.bottom+4)+'px;left:'+rect.left+'px;width:'+rect.width+'px;background:var(--surface);border:1px solid var(--border);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.12);z-index:500;overflow:hidden;max-height:320px;overflow-y:auto;';
    data.docs.forEach(doc=>{
      const cover=doc.cover_i?'https://covers.openlibrary.org/b/id/'+doc.cover_i+'-S.jpg':'';
      const author=(doc.author_name||[])[0]||'';
      const year=doc.first_publish_year||'';
      const item=document.createElement('div');
      item.style.cssText='display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;border-bottom:1px solid var(--border);transition:background .15s;';
      item.innerHTML=(cover?'<img src="'+cover+'" style="width:32px;height:46px;object-fit:cover;border-radius:4px;flex-shrink:0">':'<div style="width:32px;height:46px;background:var(--surface2);border-radius:4px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:16px">📖</div>')+
        '<div style="min-width:0"><div style="font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+doc.title+'</div>'+
        '<div style="font-size:12px;color:var(--muted)">'+[author,year].filter(Boolean).join(' · ')+'</div></div>';
      item.onmouseenter=()=>{item.style.background='var(--surface2)';_dropdownClicking=false;};
      item.onmouseleave=()=>{item.style.background='';_dropdownClicking=false;};
      item.onmousedown=()=>{_dropdownClicking=true;};
      item.onclick=(e)=>{
        e.preventDefault();
        _dropdownClicking=false;
        document.getElementById('searchInput').value=doc.title;
        closeDropdown();
        openModalByKey(doc);
      };
      drop.appendChild(item);
    });
    document.body.appendChild(drop);
  }catch(e){}
}

async function searchBooks(){
  const q=document.getElementById('searchInput').value.trim();if(!q)return;
  const res=document.getElementById('searchResults');
  res.innerHTML='<div class="loading"><div class="spinner"></div>'+t('searching')+'</div>';
  try{
    const r=await fetch('https://www.googleapis.com/books/v1/volumes?q='+encodeURIComponent(q)+'&maxResults=20&key=AIzaSyAGDcIi4P_phJ8qH-JP92m6_VZ_d5ZecL4');
    const data=await r.json();
    if(!data.items||!data.items.length){res.innerHTML='<div class="loading">'+t('noResults')+'</div>';return;}
    const {data:added}=await sb.from('book_lists').select('book_id').eq('user_id',currentUser.id);
    const addedIds=new Set((added||[]).map(r=>r.book_id));
    res.innerHTML='<div class="results-label">'+data.items.length+t('resultsLabel')+'</div>';
    const grid=document.createElement('div');grid.className='results-grid';
    data.items.forEach(item=>{
      const info=item.volumeInfo||{};
      const isAdded=addedIds.has(item.id);
      const cover=(info.imageLinks?.thumbnail||info.imageLinks?.smallThumbnail||'').replace('http:','https:');
      const authors=(info.authors||[]).slice(0,2).join(', ')||'—';
      const year=info.publishedDate?info.publishedDate.slice(0,4):'—';
      const rating=info.averageRating;
      const card=document.createElement('div');card.className='book-card';
      card.innerHTML=(cover?'<img class="book-card-cover" src="'+cover+'" alt="" loading="lazy">':'<div class="book-card-cover-placeholder">📖</div>')+
        '<div class="book-card-body">'+
          '<div class="book-card-title">'+info.title+'</div>'+
          '<div class="book-card-author">'+authors+' · '+year+(rating?' · ⭐'+rating:'')+'</div>'+
          '<button class="btn-add'+(isAdded?' added':'')+'">'+( isAdded?t('addedBtn'):t('addBtn'))+'</button>'+
        '</div>';
      if(!isAdded)card.querySelector('.btn-add').onclick=()=>openModal(item);
      grid.appendChild(card);
    });
    res.appendChild(grid);
  }catch(e){res.innerHTML='<div class="loading">'+t('connErr')+'</div>';}
}

/* ── MODAL ── */
document.getElementById('ratingModal').onclick=function(e){if(e.target===this)closeModal();};
document.getElementById('modalClose').onclick=closeModal;
document.getElementById('modalCancel').onclick=closeModal;
document.getElementById('saveBtn').onclick=saveBook;
document.getElementById('scoreSlider').oninput=function(){document.getElementById('scoreDisplay').innerHTML=this.value+'<span>/10</span>';};

async function openModal(doc){
  currentBook=doc;
  const cover=doc.cover_i?'https://covers.openlibrary.org/b/id/'+doc.cover_i+'-L.jpg':'';
  const authors=(doc.author_name||[]).slice(0,2).join(', ')||'';
  const year=doc.first_publish_year||'';
  const pages=doc.number_of_pages_median||0;
  const subject=(doc.subject||[])[0]||'';
  const rating=doc.ratings_average?'⭐ '+doc.ratings_average.toFixed(1)+'/5 ('+(doc.ratings_count||0).toLocaleString()+' oy)':'';
  document.getElementById('modalCover').src=cover;
  document.getElementById('modalTitle').textContent=doc.title||'';
  document.getElementById('modalAuthor').textContent=authors;
  document.getElementById('modalMeta').textContent=[year,pages?pages+' sayfa':'',subject,rating].filter(Boolean).join(' · ');
  document.getElementById('scoreSlider').value=7;
  document.getElementById('scoreDisplay').innerHTML='7<span>/10</span>';
  document.getElementById('notesInput').value='';
  document.getElementById('saveBtn').textContent=t('saveBtn');
  populateListSelect(null);
  document.getElementById('ratingModal').classList.add('open');
}
function closeModal(){document.getElementById('ratingModal').classList.remove('open');currentBook=null;}

function populateListSelect(sel){
  const s=document.getElementById('listSelect');s.innerHTML='';
  myLists.forEach(l=>{
    const o=document.createElement('option');o.value=l.id;o.textContent=l.name;
    if(l.id===(sel||activeListId))o.selected=true;
    s.appendChild(o);
  });
}

async function openModalByKey(doc){
  // doc already has the correct key from dropdown — just fetch ratings and extra fields
  try{
    const ratingsRes = await fetch('https://openlibrary.org'+doc.key+'/ratings.json');
    const ratingsData = await ratingsRes.json();
    const fullDoc = Object.assign({}, doc);
    if(ratingsData.summary){
      fullDoc.ratings_average = ratingsData.summary.average;
      fullDoc.ratings_count = ratingsData.summary.count;
    }
    openModal(fullDoc);
  } catch(e){
    openModal(doc);
  }
}

async function saveBook(){
  if(!currentBook)return;
  const doc=currentBook;
  const score=parseInt(document.getElementById('scoreSlider').value);
  const notes=document.getElementById('notesInput').value.trim();
  const listId=document.getElementById('listSelect').value;
  const bookId=doc.key?doc.key.replace('/works/',''):(doc.book_id||'');
  const cover=doc.cover_i?'https://covers.openlibrary.org/b/id/'+doc.cover_i+'-M.jpg':(doc.book_image||'');
  const authors=(doc.author_name||[]).slice(0,2).join(', ')||(doc.book_author||'');
  const {error}=await sb.from('book_lists').upsert({
    user_id:currentUser.id,book_id:bookId,list_id:listId,
    book_title:doc.title||doc.book_title||'',book_author:authors,
    book_image:cover,published_year:doc.first_publish_year?(doc.first_publish_year+''):(doc.published_year||''),
    categories:doc.subject?doc.subject.slice(0,3):(doc.categories||[]),
    page_count:doc.number_of_pages_median||doc.page_count||0,
    score,notes
  },{onConflict:'user_id,book_id'});
  if(error){toast('Error: '+error.message);return;}
  closeModal();toast('"'+(doc.title||doc.book_title)+t('toastAdded'));
  if(activeListId===listId)renderList(null,currentUser.id,false,activeListId);
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
  const {data}=await sb.from('book_lists_meta').select('*').eq('user_id',currentUser.id).order('created_at');
  if(!data||!data.length){
    const {data:nl}=await sb.from('book_lists_meta').insert({user_id:currentUser.id,name:'Kitaplığım',is_default:true}).select().single();
    myLists=[nl];
  } else {myLists=data;}
  renderListsNav();
  if(activeListId&&myLists.find(l=>l.id===activeListId))selectList(activeListId);
  else if(myLists.length)selectList(myLists[0].id);
}

function renderListsNav(){
  const nav=document.getElementById('listsNav');nav.innerHTML='';
  myLists.forEach(l=>{
    const item=document.createElement('div');
    item.className='list-nav-item'+(activeListId===l.id?' active':'');
    item.innerHTML='<span class="list-nav-name">'+l.name+'</span>'+
      '<div style="display:flex;align-items:center;gap:6px">'+
        '<span class="list-nav-count" id="nc-'+l.id+'">0</span>'+
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
    sb.from('book_lists').select('*',{count:'exact',head:true}).eq('user_id',currentUser.id).eq('list_id',l.id)
      .then(({count})=>{const el=document.getElementById('nc-'+l.id);if(el)el.textContent=count||0;});
  });
}

async function selectList(id){
  activeListId=id;currentPage=1;
  renderListsNav();
  const list=myLists.find(l=>l.id===id);if(!list)return;
  const content=document.getElementById('listContent');
  content.innerHTML=
    '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px">'+
      '<div><div class="list-content-title">'+list.name+'</div>'+(list.description?'<div class="list-content-desc">'+list.description+'</div>':'')+
      '</div>'+
      '<div class="list-stats">'+
        '<div style="text-align:center"><div class="stat-val" id="statTotal">—</div><div class="stat-lbl">'+t('statBooks')+'</div></div>'+
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
          '<button class="view-toggle-btn active" id="viewBtnList" title="Liste">☰</button>'+
          '<button class="view-toggle-btn" id="viewBtnTable" title="Tablo">⊞</button>'+
        '</div>'+
        '<div style="position:relative">'+
          '<button id="exportBtn" class="tool-btn">'+t('exportBtn')+'</button>'+
          '<div class="export-menu" id="exportMenu">'+
            '<div class="export-menu-item" data-fmt="csv">'+t('expCSV')+'</div>'+
            '<div class="export-menu-item" data-fmt="xlsx">'+t('expXLSX')+'</div>'+
            '<div class="export-menu-item" data-fmt="pdf">'+t('expPDF')+'</div>'+
          '</div>'+
        '</div>'+
        '<label class="tool-btn">'+t('importLbl')+'<input type="file" accept=".csv,.xlsx" id="importInput" style="display:none"></label>'+
      '</div>'+
    '</div>'+
    '<div id="paginationTop" class="pagination" style="margin-bottom:16px;margin-top:0"></div>'+
    '<div id="myListItems"></div>';

  document.getElementById('dateSortBtn').onclick=function(){
    dateSortAsc=currentSort==='date'?!dateSortAsc:false;currentSort='date';currentPage=1;
    document.querySelectorAll('.sort-btn').forEach(b=>b.classList.remove('active'));
    this.classList.add('active');document.getElementById('dateSortArrow').textContent=dateSortAsc?'↑':'↓';
    renderList(null,currentUser.id,false,activeListId);
  };
  content.querySelectorAll('.sort-btn[data-sort]').forEach(btn=>{
    btn.onclick=function(){currentSort=this.dataset.sort;currentPage=1;document.querySelectorAll('.sort-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active');renderList(null,currentUser.id,false,activeListId);};
  });
  document.getElementById('viewBtnList').onclick=function(){listViewMode='list';document.getElementById('viewBtnList').classList.add('active');document.getElementById('viewBtnTable').classList.remove('active');renderList(null,currentUser.id,false,activeListId);};
  document.getElementById('viewBtnTable').onclick=function(){listViewMode='table';document.getElementById('viewBtnTable').classList.add('active');document.getElementById('viewBtnList').classList.remove('active');renderList(null,currentUser.id,false,activeListId);};
  document.getElementById('exportBtn').onclick=function(e){
    e.stopPropagation();const m=document.getElementById('exportMenu');
    m.style.display=m.style.display==='block'?'none':'block';
    if(m.style.display==='block')setTimeout(()=>document.addEventListener('click',()=>{m.style.display='none';},{once:true}),10);
  };
  document.getElementById('exportMenu').querySelectorAll('.export-menu-item').forEach(item=>{
    item.onclick=function(e){e.stopPropagation();exportList(this.dataset.fmt);document.getElementById('exportMenu').style.display='none';};
  });
  document.getElementById('importInput').onchange=importList;
  renderList(null,currentUser.id,false,id);
}

function openNewListModal(){editingListId=null;document.getElementById('newListModalTitle').textContent=t('newListTitle');document.getElementById('newListName').value='';document.getElementById('newListDesc').value='';document.getElementById('newListModal').classList.add('open');setTimeout(()=>document.getElementById('newListName').focus(),100);}
function openEditListModal(id){const l=myLists.find(x=>x.id===id);if(!l)return;editingListId=id;document.getElementById('newListModalTitle').textContent=t('editListTitle');document.getElementById('newListName').value=l.name;document.getElementById('newListDesc').value=l.description||'';document.getElementById('newListModal').classList.add('open');setTimeout(()=>document.getElementById('newListName').focus(),100);}
function closeNewListModal(){document.getElementById('newListModal').classList.remove('open');editingListId=null;}

async function saveList(){
  const name=document.getElementById('newListName').value.trim();
  const desc=document.getElementById('newListDesc').value.trim();
  if(!name){toast(t('toastListNameReq'));return;}
  if(editingListId){await sb.from('book_lists_meta').update({name,description:desc}).eq('id',editingListId).eq('user_id',currentUser.id);toast(t('toastListUpdated'));}
  else{await sb.from('book_lists_meta').insert({user_id:currentUser.id,name,description:desc});toast('"'+name+t('toastListCreated'));}
  closeNewListModal();await loadMyLists();
}

async function deleteList(id,name){
  if(!confirm('"'+name+t('confirmListDel')))return;
  await sb.from('book_lists').delete().eq('user_id',currentUser.id).eq('list_id',id);
  await sb.from('book_lists_meta').delete().eq('id',id).eq('user_id',currentUser.id);
  if(activeListId===id)activeListId=null;
  toast('"'+name+t('toastListDeleted'));await loadMyLists();
}

async function renderList(targetEl,userId,readonly,listId,page){
  const el=targetEl||document.getElementById('myListItems');if(!el)return;
  if(page!==undefined)currentPage=page;
  el.innerHTML='<div class="loading"><div class="spinner"></div>'+t('loadingTxt')+'</div>';
  const isPaged=!targetEl;
  let q=sb.from('book_lists').select('*',{count:'exact'}).eq('user_id',userId);
  if(listId)q=q.eq('list_id',listId);
  if(currentSort==='score-desc')q=q.order('score',{ascending:false});
  else if(currentSort==='score-asc')q=q.order('score',{ascending:true});
  else if(currentSort==='name')q=q.order('book_title',{ascending:true});
  else q=q.order('added_at',{ascending:dateSortAsc});
  if(isPaged)q=q.range((currentPage-1)*PAGE_SIZE,currentPage*PAGE_SIZE-1);
  const {data:list,count,error}=await q;
  if(error){el.innerHTML='<div class="loading">Error: '+error.message+'</div>';return;}
  const stEl=document.getElementById('statTotal'),saEl=document.getElementById('statAvg');
  if(stEl){if(isPaged)sb.from('book_lists').select('*',{count:'exact',head:true}).eq('user_id',userId).eq('list_id',listId).then(({count:tc})=>{if(stEl)stEl.textContent=tc||0;});else stEl.textContent=(list||[]).length;}
  if(saEl)saEl.textContent=list&&list.length?(list.reduce((s,b)=>s+b.score,0)/list.length).toFixed(1):'—';
  if(!list||!list.length){el.innerHTML='<div class="empty-state"><div class="empty-icon">📖</div><h3>'+t('listEmptyTitle')+'</h3><p>'+t('listEmptySub')+'</p></div>';return;}
  el.innerHTML='';

  if(listViewMode==='table'&&!readonly){
    const tbl=document.createElement('table');tbl.className='book-table';
    tbl.innerHTML='<thead><tr><th>'+t('tblNum')+'</th><th></th><th>'+t('tblBook')+'</th><th>'+t('tblAuthor')+'</th><th>'+t('tblScore')+'</th><th>'+t('tblYear')+'</th><th>'+t('tblNote')+'</th><th>'+t('tblDate')+'</th><th></th></tr></thead>';
    const tbody=document.createElement('tbody');
    list.forEach((book,idx)=>{
      const date=new Date(book.added_at).toLocaleDateString(t('dateLocale'));
      const num=(currentPage-1)*PAGE_SIZE+idx+1;
      const tr=document.createElement('tr');
      const mcSlug=(book.book_title+' '+book.book_author).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
      tr.innerHTML='<td style="color:var(--muted);font-size:12px">'+num+'</td>'+
        '<td>'+(book.book_image?'<a href="https://www.goodreads.com/search?q='+encodeURIComponent(book.book_title)+'" target="_blank" rel="noopener"><img class="tbl-cover" src="'+book.book_image+'" alt="" loading="lazy" style="transition:opacity .2s" onmouseover="this.style.opacity=.7" onmouseout="this.style.opacity=1"></a>':'📖')+'</td>'+
        '<td style="font-weight:600;font-family:\'Playfair Display\',serif">'+book.book_title+'</td>'+
        '<td style="color:var(--accent2);font-style:italic;font-size:12px">'+book.book_author+'</td>'+
        '<td><span class="tbl-score '+sc(book.score)+'">'+book.score+'<span style="color:var(--muted);font-size:11px">/10</span></span></td>'+
        '<td style="color:var(--muted)">'+book.published_year+'</td>'+
        '<td style="color:var(--muted);font-style:italic;font-size:12px;max-width:150px">'+(book.notes?'"'+book.notes+'"':'')+'</td>'+
        '<td style="color:var(--muted);white-space:nowrap">'+date+'</td>'+
        '<td><div style="display:flex;gap:4px">'+
          '<button class="icon-btn edit-btn">✏️</button>'+
          '<button class="icon-btn del del-btn">🗑</button>'+
        '</div></td>';
      tr.querySelector('.edit-btn').onclick=()=>editBook(book);
      tr.querySelector('.del-btn').onclick=()=>deleteBook(book.book_id,book.book_title);
      tbody.appendChild(tr);
    });
    tbl.appendChild(tbody);el.appendChild(tbl);
  } else {
    list.forEach(book=>{
      const date=new Date(book.added_at).toLocaleDateString(t('dateLocale'));
      const genres=(book.categories||[]).slice(0,2).join(', ')||'—';
      const item=document.createElement('div');item.className='list-item';
      item.innerHTML=
        '<div style="display:grid;grid-template-columns:56px 1fr auto;gap:16px;align-items:start">'+
          (book.book_image?
            '<a href="https://www.goodreads.com/search?q='+encodeURIComponent(book.book_title)+'" target="_blank" rel="noopener"><img class="list-item-cover" src="'+book.book_image+'" alt="" loading="lazy" style="transition:opacity .2s" onmouseover="this.style.opacity=.7" onmouseout="this.style.opacity=1"></a>':
            '<div class="list-item-cover" style="display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:24px">📖</div>')+
          '<div>'+
            '<div class="list-item-title">'+book.book_title+'</div>'+
            '<div class="list-item-author">'+book.book_author+'</div>'+
            '<div class="list-item-meta">'+
              (book.published_year?'<span>'+book.published_year+'</span>':'')+
              (genres!=='—'?'<span>'+genres+'</span>':'')+
              (book.page_count?'<span>'+book.page_count+' sayfa</span>':'')+
              '<span>📅 '+date+'</span>'+
            '</div>'+
            (book.notes?'<div class="list-item-note">'+book.notes+'</div>':'')+
          '</div>'+
          '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;flex-shrink:0">'+
            '<div class="score-badge '+sc(book.score)+'">'+book.score+'<span>/10</span></div>'+
            (!readonly?'<div class="item-actions"><button class="icon-btn edit-btn">✏️</button><button class="icon-btn del del-btn">🗑</button></div>':'')+
          '</div>'+
        '</div>'+
        '<div class="comment-section">'+
          '<button class="comment-toggle">'+t('showComments')+'</button>'+
          '<div class="comment-box">'+
            '<div class="comments-list"></div>'+
            '<div class="comment-input-row">'+
              '<input class="comment-input" placeholder="'+t('commentPH')+'">'+
              '<button class="btn-comment">'+t('commentBtn')+'</button>'+
            '</div>'+
          '</div>'+
        '</div>';
      if(!readonly){item.querySelector('.edit-btn').onclick=()=>editBook(book);item.querySelector('.del-btn').onclick=()=>deleteBook(book.book_id,book.book_title);}
      const ctoggle=item.querySelector('.comment-toggle');
      const cbox=item.querySelector('.comment-box');
      const clist=item.querySelector('.comments-list');
      const cinput=item.querySelector('.comment-input');
      ctoggle.onclick=()=>{cbox.classList.toggle('open');ctoggle.textContent=cbox.classList.contains('open')?t('hideComments'):t('showComments');if(cbox.classList.contains('open'))loadComments(clist,userId,book.book_id);};
      item.querySelector('.btn-comment').onclick=()=>submitComment(cinput,userId,book.book_id,clist);
      cinput.addEventListener('keydown',e=>{if(e.key==='Enter')submitComment(cinput,userId,book.book_id,clist);});
      el.appendChild(item);
    });
  }

  // Pagination
  if(isPaged){
    const total=count||0;
    const totalPages=Math.ceil(total/PAGE_SIZE);
    const buildPag=(container)=>{
      container.innerHTML='';if(totalPages<=1)return;
      const prev=document.createElement('button');prev.className='page-btn';prev.textContent='←';prev.disabled=currentPage===1;
      prev.onclick=()=>renderList(null,userId,readonly,listId,currentPage-1);container.appendChild(prev);
      let pages=[];
      if(totalPages<=7){for(let i=1;i<=totalPages;i++)pages.push(i);}
      else{pages=[1];if(currentPage>3)pages.push('...');for(let i=Math.max(2,currentPage-1);i<=Math.min(totalPages-1,currentPage+1);i++)pages.push(i);if(currentPage<totalPages-2)pages.push('...');pages.push(totalPages);}
      pages.forEach(p=>{
        if(p==='...'){const s=document.createElement('span');s.textContent='…';s.style.cssText='color:var(--muted);padding:0 6px;line-height:36px';container.appendChild(s);return;}
        const btn=document.createElement('button');btn.className='page-btn'+(p===currentPage?' active':'');
        btn.textContent=p;btn.onclick=()=>renderList(null,userId,readonly,listId,p);container.appendChild(btn);
      });
      const next=document.createElement('button');next.className='page-btn';next.textContent='→';next.disabled=currentPage===totalPages;
      next.onclick=()=>renderList(null,userId,readonly,listId,currentPage+1);container.appendChild(next);
      const info=document.createElement('span');info.style.cssText='font-size:12px;color:var(--muted);margin-left:8px';
      info.textContent=((currentPage-1)*PAGE_SIZE+1)+'-'+Math.min(currentPage*PAGE_SIZE,total)+' / '+total;container.appendChild(info);
    };
    const topPag=document.getElementById('paginationTop');if(topPag)buildPag(topPag);
    const botPag=document.createElement('div');botPag.className='pagination';buildPag(botPag);
    if(botPag.children.length)el.appendChild(botPag);
  }
  renderListsNav();
}

function editBook(book){
  currentBook={id:book.book_id,volumeInfo:{title:book.book_title,authors:book.book_author?[book.book_author]:[],publishedDate:book.published_year,pageCount:book.page_count,categories:book.categories,imageLinks:{thumbnail:book.book_image}}};
  document.getElementById('modalCover').src=book.book_image||'';
  document.getElementById('modalTitle').textContent=book.book_title;
  document.getElementById('modalAuthor').textContent=book.book_author||'';
  document.getElementById('modalMeta').textContent=book.published_year||'';
  document.getElementById('scoreSlider').value=book.score;
  document.getElementById('scoreDisplay').innerHTML=book.score+'<span>/10</span>';
  document.getElementById('notesInput').value=book.notes||'';
  document.getElementById('saveBtn').textContent=t('updateBtn');
  populateListSelect(book.list_id);
  document.getElementById('ratingModal').classList.add('open');
}

async function deleteBook(bookId,bookTitle){
  if(!confirm('"'+bookTitle+t('confirmDel')))return;
  await sb.from('book_lists').delete().eq('user_id',currentUser.id).eq('book_id',bookId);
  renderList(null,currentUser.id,false,activeListId);toast(t('toastDeleted'));
}

/* ── COMMENTS ── */
async function loadComments(container,ownerId,bookId){
  container.innerHTML='<div style="font-size:12px;color:var(--muted);padding:4px 0">'+t('loadingTxt')+'</div>';
  const {data}=await sb.from('book_comments').select('*,profiles(username)').eq('book_list_owner_id',ownerId).eq('book_id',bookId).order('created_at');
  if(!data||!data.length){container.innerHTML='<div style="font-size:12px;color:var(--muted);padding:4px 0">'+t('noComments')+'</div>';return;}
  container.innerHTML='';
  data.forEach(c=>{
    const uname=c.profiles?.username||'?';
    const date=new Date(c.created_at).toLocaleDateString(t('dateLocale'));
    const div=document.createElement('div');div.className='comment-item';
    div.innerHTML='<div class="comment-avatar">'+uname[0].toUpperCase()+'</div>'+
      '<div><div class="comment-author">'+uname+' <span class="comment-date">· '+date+'</span></div>'+
      '<div class="comment-text">'+c.content+'</div></div>';
    container.appendChild(div);
  });
}
async function submitComment(input,ownerId,bookId,clist){
  const content=input.value.trim();if(!content)return;
  const {error}=await sb.from('book_comments').insert({user_id:currentUser.id,book_list_owner_id:ownerId,book_id:bookId,content});
  if(error){toast('Error: '+error.message);return;}
  input.value='';await loadComments(clist,ownerId,bookId);
}

/* ── EXPORT / IMPORT ── */
async function exportList(fmt){
  const {data:list}=await sb.from('book_lists').select('*').eq('user_id',currentUser.id).eq('list_id',activeListId).order('added_at',{ascending:false});
  if(!list||!list.length){toast(t('toastEmpty'));return;}
  const listName=myLists.find(l=>l.id===activeListId)?.name||'liste';
  const rows=list.map(b=>({[t('colName')]:b.book_title,[t('colAuthor')]:b.book_author,[t('colScore')]:b.score,[t('colYear')]:b.published_year,[t('colGenres')]:(b.categories||[]).join(', '),[t('colPages')]:b.page_count,[t('colNote')]:b.notes||'',[t('colDate')]:new Date(b.added_at).toLocaleDateString(t('dateLocale'))}));
  if(fmt==='csv'){
    const hdr=Object.keys(rows[0]);
    const csv=[hdr.join(','),...rows.map(r=>hdr.map(h=>'"'+(r[h]||'').toString().replace(/"/g,'""')+'"').join(','))].join('\n');
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}));
    a.download=listName+'.csv';a.click();URL.revokeObjectURL(a.href);toast(t('toastCSV'));
  } else if(fmt==='xlsx'){
    const ws=XLSX.utils.json_to_sheet(rows);const wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,listName.slice(0,31));XLSX.writeFile(wb,listName+'.xlsx');toast(t('toastXLSX'));
  } else if(fmt==='pdf'){
    const win=window.open('','_blank');
    win.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>'+listName+'</title><style>body{font-family:Georgia,serif;padding:24px}h1{font-size:22px;margin-bottom:16px}table{width:100%;border-collapse:collapse;font-size:13px}th{background:#2d5016;color:#fff;text-align:left;padding:8px 10px}td{padding:7px 10px;border-bottom:1px solid #ddd}</style></head><body><h1>📚 '+listName+'</h1><table><thead><tr><th>#</th><th>'+t('colName')+'</th><th>'+t('colAuthor')+'</th><th>'+t('colScore')+'</th><th>'+t('colYear')+'</th><th>'+t('colNote')+'</th></tr></thead><tbody>'+rows.map((r,i)=>'<tr><td>'+(i+1)+'</td><td>'+r[t('colName')]+'</td><td>'+r[t('colAuthor')]+'</td><td>'+r[t('colScore')]+'/10</td><td>'+r[t('colYear')]+'</td><td>'+r[t('colNote')]+'</td></tr>').join('')+'</tbody></table></body></html>');
    win.document.close();setTimeout(()=>win.print(),400);toast(t('toastPDF'));
  }
}

async function importList(event){
  const file=event.target.files[0];if(!file)return;event.target.value='';
  const ext=file.name.split('.').pop().toLowerCase();let rows=[];
  try{
    if(ext==='csv'){
      const text=await file.text();const lines=text.split('\n').filter(l=>l.trim());
      const headers=lines[0].split(',').map(h=>h.replace(/^"|"$/g,'').trim());
      rows=lines.slice(1).map(line=>{
        const vals=[];let cur='',inQ=false;
        for(const ch of line){if(ch==='"'){inQ=!inQ;}else if(ch===','&&!inQ){vals.push(cur.trim());cur='';}else cur+=ch;}
        vals.push(cur.trim());const obj={};headers.forEach((h,i)=>obj[h]=(vals[i]||'').replace(/^"|"$/g,''));return obj;
      });
    } else {
      const buf=await file.arrayBuffer();const wb=XLSX.read(buf,{type:'array'});
      rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:''});
    }
  }catch(e){toast(t('toastFileErr'));return;}
  if(!rows.length){toast(t('toastNoData'));return;}
  const nameKey=Object.keys(rows[0]).find(k=>/kitap|book|name|title/i.test(k));
  const scoreKey=Object.keys(rows[0]).find(k=>/puan|score|rating/i.test(k));
  if(!nameKey){toast(t('toastNoCol'));return;}
  let imported=0,skipped=0;toast(t('toastImporting'));
  for(const row of rows){
    const bookTitle=(row[nameKey]||'').trim();if(!bookTitle)continue;
    const score=Math.min(10,Math.max(1,parseInt(row[scoreKey])||5));
    const noteKey=Object.keys(row).find(k=>/not|note|comment/i.test(k));
    try{
      const r=await fetch('https://www.googleapis.com/books/v1/volumes?q='+encodeURIComponent(bookTitle)+'&maxResults=1&key=AIzaSyAGDcIi4P_phJ8qH-JP92m6_VZ_d5ZecL4');
      const d=await r.json();const item=d.items&&d.items[0];
      if(!item){skipped++;continue;}
      const info=item.volumeInfo||{};
      const cover=(info.imageLinks?.thumbnail||'').replace('http:','https:');
      await sb.from('book_lists').upsert({
        user_id:currentUser.id,book_id:item.id,list_id:activeListId,
        book_title:info.title||bookTitle,book_author:(info.authors||[]).slice(0,2).join(', '),
        book_image:cover,published_year:info.publishedDate?info.publishedDate.slice(0,4):'',
        categories:info.categories||[],page_count:info.pageCount||0,
        score,notes:noteKey?row[noteKey]:''
      },{onConflict:'user_id,book_id'});imported++;
    }catch(e){skipped++;}
  }
  toast(t('toastDone_pre')+imported+t('toastDone_add')+skipped+t('toastDone_skip'));
  renderList(null,currentUser.id,false,activeListId);renderListsNav();
}

/* ── FRIENDS ── */
document.getElementById('userSearchBtn').onclick=searchUsers;
document.getElementById('userSearchInput').addEventListener('keydown',e=>{if(e.key==='Enter')searchUsers();});
document.getElementById('ftFollowing').onclick=()=>switchFriendsTab('following');
document.getElementById('ftFollowers').onclick=()=>switchFriendsTab('followers');
document.getElementById('ftSearch').onclick=()=>switchFriendsTab('search');

async function searchUsers(){
  const q=document.getElementById('userSearchInput').value.trim();if(!q)return;
  switchFriendsTab('search');
  const {data:users}=await sb.from('profiles').select('*').ilike('username','%'+q+'%').neq('id',currentUser.id).limit(20);
  const {data:fRows}=await sb.from('follows').select('following_id').eq('follower_id',currentUser.id);
  renderUserList(users||[],new Set((fRows||[]).map(r=>r.following_id)),document.getElementById('friendsContent'));
}
function switchFriendsTab(tab){
  friendsTab=tab;
  ['following','followers','search'].forEach(t2=>document.getElementById('ft'+t2.charAt(0).toUpperCase()+t2.slice(1)).classList.toggle('active',t2===tab));
  if(tab!=='search')loadFriendsTab();
}
async function loadFriendsTab(){
  const el=document.getElementById('friendsContent');
  el.innerHTML='<div class="loading"><div class="spinner"></div>'+t('loadingTxt')+'</div>';
  if(friendsTab==='following'){
    const {data:rows}=await sb.from('follows').select('following_id').eq('follower_id',currentUser.id);
    const ids=(rows||[]).map(r=>r.following_id);if(!ids.length){renderUserList([],new Set(),el);return;}
    const {data:users}=await sb.from('profiles').select('id,username').in('id',ids);
    renderUserList(users||[],new Set(ids),el);
  } else if(friendsTab==='followers'){
    const {data:rows}=await sb.from('follows').select('follower_id').eq('following_id',currentUser.id);
    const ids=(rows||[]).map(r=>r.follower_id);if(!ids.length){renderUserList([],new Set(),el);return;}
    const {data:users}=await sb.from('profiles').select('id,username').in('id',ids);
    const {data:fRows}=await sb.from('follows').select('following_id').eq('follower_id',currentUser.id);
    renderUserList(users||[],new Set((fRows||[]).map(r=>r.following_id)),el);
  }
}
function renderUserList(users,followingIds,el){
  if(!users.length){el.innerHTML='<div class="empty-state"><div class="empty-icon">👥</div><h3>'+t('notFound')+'</h3></div>';return;}
  el.innerHTML='';
  users.forEach(u=>{
    const isF=followingIds.has(u.id);
    const card=document.createElement('div');card.className='user-card';
    card.innerHTML='<div style="display:flex;align-items:center;gap:12px">'+
      '<div class="user-avatar">'+u.username[0].toUpperCase()+'</div>'+
      '<div class="user-card-name">'+u.username+'</div></div>'+
      '<div style="display:flex;gap:8px">'+
        '<button class="btn-view-list">'+t('viewListBtn')+'</button>'+
        '<button class="btn-follow'+(isF?' following':'')+'">'+( isF?t('followingBtn'):t('followBtn'))+'</button>'+
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
    btn.classList.remove('following');btn.textContent=t('followBtn');toast(username+t('toastUnfollowed'));
  } else {
    await sb.from('follows').insert({follower_id:currentUser.id,following_id:userId});
    btn.classList.add('following');btn.textContent=t('followingBtn');toast(username+t('toastFollowed'));
  }
  if(friendsTab==='following')loadFriendsTab();
}

/* ── PROFILE ── */
async function viewProfile(userId,username){
  viewingProfile={id:userId,username};
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById('profileView').classList.add('active');
  document.getElementById('profileAvatar').textContent=username[0].toUpperCase();
  document.getElementById('profileName').textContent=username;
  document.getElementById('profileStats').textContent=t('loadingTxt');
  const {data:fRow}=await sb.from('follows').select('id').eq('follower_id',currentUser.id).eq('following_id',userId).maybeSingle();
  const isF=!!fRow;
  const pfBtn=document.getElementById('profileFollowBtn');
  pfBtn.textContent=isF?t('followingBtn'):t('followBtn');
  pfBtn.className='btn-follow'+(isF?' following':'');
  pfBtn.onclick=toggleFollowProfile;
  const {data:theirLists}=await sb.from('book_lists_meta').select('*').eq('user_id',userId).order('created_at');
  const {count}=await sb.from('book_lists').select('*',{count:'exact',head:true}).eq('user_id',userId);
  document.getElementById('profileStats').textContent=(count||0)+t('bookCount')+(theirLists||[]).length+t('listCount');
  const tabsEl=document.getElementById('profileListsTabs');tabsEl.innerHTML='';
  (theirLists||[]).forEach((l,i)=>{
    const btn=document.createElement('button');btn.className='profile-list-tab'+(i===0?' active':'');btn.textContent=l.name;
    btn.onclick=()=>{document.querySelectorAll('.profile-list-tab').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderList(document.getElementById('profileListItems'),userId,true,l.id);};
    tabsEl.appendChild(btn);
  });
  if(theirLists&&theirLists.length)renderList(document.getElementById('profileListItems'),userId,true,theirLists[0].id);
}
async function toggleFollowProfile(){
  if(!viewingProfile)return;
  const btn=document.getElementById('profileFollowBtn');const isF=btn.classList.contains('following');
  if(isF){await sb.from('follows').delete().eq('follower_id',currentUser.id).eq('following_id',viewingProfile.id);btn.classList.remove('following');btn.textContent=t('followBtn');toast(viewingProfile.username+t('toastUnfollowed'));}
  else{await sb.from('follows').insert({follower_id:currentUser.id,following_id:viewingProfile.id});btn.classList.add('following');btn.textContent=t('followingBtn');toast(viewingProfile.username+t('toastFollowed'));}
}

/* ── HERO ── */
function initHero(){
  const heroBooks=document.getElementById('heroBooks');if(!heroBooks||heroBooks.children.length>0)return;
  const books=[
    {title:'1984',cover:'https://covers.openlibrary.org/b/id/8743161-M.jpg'},
    {title:'Suç ve Ceza',cover:'https://covers.openlibrary.org/b/id/8231432-M.jpg'},
    {title:'Küçük Prens',cover:'https://covers.openlibrary.org/b/id/8413259-M.jpg'},
    {title:'Dune',cover:'https://covers.openlibrary.org/b/id/8353465-M.jpg'},
  ];
  books.forEach(b=>{
    const div=document.createElement('div');div.className='hero-book';
    div.innerHTML='<img src="'+b.cover+'" alt="'+b.title+'" loading="lazy" style="width:100%;height:100%">';
    heroBooks.appendChild(div);
  });
}

} // end initBooklog
