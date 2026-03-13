const LANG = {
  tr: {
    loginTab:'Giriş Yap', registerTab:'Kayıt Ol', authBtn_login:'Giriş Yap', authBtn_register:'Kayıt Ol',
    authSub:'Oyun listeni oluştur, takip et.',
    emailLabel:'E-posta', passLabel:'Şifre', usernameLabel:'Kullanıcı Adı',
    emailPlaceholder:'ornek@mail.com', usernamePlaceholder:'oyunsever42',
    authErr_empty:'E-posta ve şifre gerekli.', authErr_wrong:'E-posta veya şifre hatalı.',
    authSuccess:'Kayıt başarılı! E-postanı doğrula, ardından giriş yap.',
    logoSub:'oyun listem',
    tabSearch:'🔍 Ara', tabMylist:'📋 Listelerim', tabFriends:'👥 Arkadaşlar', logoutBtn:'Çıkış',
    heroH1:'OYUN <em>BUL,</em><br>LİSTEYE <em>EKLE</em>',
    heroSub:'Milyonlarca oyun arasından ara, puanla, takip et.',
    searchPlaceholder:'Oyun adı ara...', searchBtn:'Ara',
    resultsLabel:' SONUÇ BULUNDU', noResults:'Sonuç bulunamadı.', searching:'Aranıyor...', connErr:'Bağlantı hatası.',
    addBtn:'+ Ekle', addedBtn:'✓ Listede',
    scoreLbl:'PUAN VER', listLbl:'LİSTE SEÇ', noteLbl:'NOT (opsiyonel)',
    notePlaceholder:'Bu oyun hakkında düşüncelerini yaz...',
    cancelBtn:'İptal', saveBtn:'Listeye Ekle ✓', updateBtn:'Güncelle ✓',
    listsSidebarTitle:'LİSTELER', newListBtn:'+ Yeni',
    emptyListTitle:'LİSTE SEÇ', emptyListSub:'Soldan bir liste seç.',
    listEmptyTitle:'HENÜZ BOŞ', listEmptySub:'Arama yapıp oyun ekleyebilirsin.',
    statGames:'Oyun', statAvg:'Ort.',
    sortDate:'📅 Eklenme', sortHigh:'⬆ En Yüksek', sortLow:'⬇ En Düşük', sortName:'🔤 İsim',
    exportBtn:'⬇ Dışa Aktar', importLbl:'⬆ İçe Aktar',
    exportCSV:'📄 CSV', exportXLSX:'📊 Excel', exportPDF:'📋 PDF',
    tblNum:'#', tblImg:'', tblGame:'Oyun', tblScore:'Puan', tblYear:'Yıl', tblGenre:'Türler', tblNote:'Not', tblDate:'Eklenme',
    newListTitle:'Yeni Liste', editListTitle:'Listeyi Düzenle',
    listNameLbl:'Liste Adı', listDescLbl:'Açıklama (opsiyonel)',
    listNamePlaceholder:'ör: Oynamak İstediklerim', listDescPlaceholder:'Kısa bir açıklama...',
    saveListBtn:'Kaydet', cancelListBtn:'İptal',
    friendsTitle:'ARKADAŞLAR', userSearchPlaceholder:'Kullanıcı adı ara...',
    ftFollowing:'Takip Ettiklerim', ftFollowers:'Takipçilerim', ftSearch:'Arama Sonuçları',
    viewListBtn:'📋 Listeyi Gör', followBtn:'+ Takip Et', followingBtn:'✓ Takip Ediliyor',
    userNotFound:'BULUNAMADI',
    backBtn:'← Geri', loadingTxt:'Yükleniyor...',
    showComments:'💬 Yorumları göster', hideComments:'💬 Yorumları gizle',
    noComments:'Henüz yorum yok.', commentPlaceholder:'Yorum yaz...', commentBtn:'Gönder',
    toastAdded:'" listeye eklendi!', toastDeleted:'Oyun listeden silindi.',
    toastListCreated:'" listesi oluşturuldu!', toastListUpdated:'Liste güncellendi.',
    toastListDeleted:' silindi.', toastFollowed:' takip edildi!', toastUnfollowed:' takipten çıkarıldı.',
    toastEmpty:'Liste boş.', toastImporting:'İçe aktarılıyor...',
    toastImportDone_pre:'Tamamlandı: ', toastImportDone_added:' eklendi, ', toastImportDone_skipped:' atlandı.',
    toastFileErr:'Dosya okunamadı.', toastNoData:'Dosyada veri yok.', toastNoCol:'"Oyun Adı" sütunu bulunamadı.',
    toastListNameReq:'Liste adı gerekli.',
    toastCSV:'CSV indirildi!', toastXLSX:'Excel indirildi!', toastPDF:'PDF için yazdır penceresini kullan.',
    confirmDel:'" listeden silinsin mi?', confirmListDel:'" listesi ve içindeki tüm oyunlar silinsin mi?',
    colName:'Oyun Adı', colScore:'Puan', colYear:'Yıl', colGenres:'Türler', colPlatform:'Platform', colNote:'Not', colDate:'Eklenme',
    footer:'',
    oyunCount:' oyun · ', listeCount:' liste',
    dateLocale:'tr-TR',
  },
  en: {
    loginTab:'Log In', registerTab:'Sign Up', authBtn_login:'Log In', authBtn_register:'Sign Up',
    authSub:'Build your game list, follow others.',
    emailLabel:'Email', passLabel:'Password', usernameLabel:'Username',
    emailPlaceholder:'example@mail.com', usernamePlaceholder:'gamer42',
    authErr_empty:'Email and password are required.', authErr_wrong:'Incorrect email or password.',
    authSuccess:'Registration successful! Verify your email, then log in.',
    logoSub:'my game list',
    tabSearch:'🔍 Search', tabMylist:'📋 My Lists', tabFriends:'👥 Friends', logoutBtn:'Logout',
    heroH1:'FIND <em>GAMES,</em><br>BUILD <em>LISTS</em>',
    heroSub:'Search millions of games, rate them, and track your collection.',
    searchPlaceholder:'Search game title...', searchBtn:'Search',
    resultsLabel:' RESULTS FOUND', noResults:'No results found.', searching:'Searching...', connErr:'Connection error.',
    addBtn:'+ Add', addedBtn:'✓ In List',
    scoreLbl:'RATE', listLbl:'SELECT LIST', noteLbl:'NOTE (optional)',
    notePlaceholder:'Write your thoughts about this game...',
    cancelBtn:'Cancel', saveBtn:'Add to List ✓', updateBtn:'Update ✓',
    listsSidebarTitle:'LISTS', newListBtn:'+ New',
    emptyListTitle:'SELECT LIST', emptyListSub:'Choose a list on the left.',
    listEmptyTitle:'EMPTY', listEmptySub:'Search and add games to this list.',
    statGames:'Games', statAvg:'Avg.',
    sortDate:'📅 Date Added', sortHigh:'⬆ Highest', sortLow:'⬇ Lowest', sortName:'🔤 Name',
    exportBtn:'⬇ Export', importLbl:'⬆ Import',
    exportCSV:'📄 CSV', exportXLSX:'📊 Excel', exportPDF:'📋 PDF',
    tblNum:'#', tblImg:'', tblGame:'Game', tblScore:'Score', tblYear:'Year', tblGenre:'Genres', tblNote:'Note', tblDate:'Added',
    newListTitle:'New List', editListTitle:'Edit List',
    listNameLbl:'List Name', listDescLbl:'Description (optional)',
    listNamePlaceholder:'e.g. Want to Play', listDescPlaceholder:'Short description...',
    saveListBtn:'Save', cancelListBtn:'Cancel',
    friendsTitle:'FRIENDS', userSearchPlaceholder:'Search by username...',
    ftFollowing:'Following', ftFollowers:'Followers', ftSearch:'Search Results',
    viewListBtn:'📋 View List', followBtn:'+ Follow', followingBtn:'✓ Following',
    userNotFound:'NOT FOUND',
    backBtn:'← Back', loadingTxt:'Loading...',
    showComments:'💬 Show comments', hideComments:'💬 Hide comments',
    noComments:'No comments yet.', commentPlaceholder:'Write a comment...', commentBtn:'Send',
    toastAdded:'" added to list!', toastDeleted:'Game removed from list.',
    toastListCreated:'" list created!', toastListUpdated:'List updated.',
    toastListDeleted:' deleted.', toastFollowed:' followed!', toastUnfollowed:' unfollowed.',
    toastEmpty:'List is empty.', toastImporting:'Importing...',
    toastImportDone_pre:'Done: ', toastImportDone_added:' added, ', toastImportDone_skipped:' skipped.',
    toastFileErr:'Could not read file.', toastNoData:'No data in file.', toastNoCol:'"Game Name" column not found.',
    toastListNameReq:'List name is required.',
    toastCSV:'CSV downloaded!', toastXLSX:'Excel downloaded!', toastPDF:'Use the print window to save as PDF.',
    confirmDel:' removed from list?', confirmListDel:' list and all its games will be deleted?',
    colName:'Game Name', colScore:'Score', colYear:'Year', colGenres:'Genres', colPlatform:'Platform', colNote:'Note', colDate:'Added',
    footer:'',
    oyunCount:' games · ', listeCount:' lists',
    dateLocale:'en-US',
  }
};

let currentLang = 'tr';
function t(k){ return (LANG[currentLang][k] !== undefined ? LANG[currentLang][k] : (LANG['tr'][k] || k)); }

function applyLang(){
  const l = currentLang;
  // Auth screen
  document.getElementById('loginTab').textContent = t('loginTab');
  document.getElementById('registerTab').textContent = t('registerTab');
  document.getElementById('authBtn').textContent = t('authMode') === 'register' ? t('authBtn_register') : t('authBtn_login');
  document.querySelector('.auth-sub').textContent = t('authSub');
  document.querySelectorAll('.auth-field label')[0].textContent = t('emailLabel');
  document.querySelectorAll('.auth-field label')[1].textContent = t('passLabel');
  document.querySelectorAll('.auth-field label')[2].textContent = t('usernameLabel');
  document.getElementById('authEmail').placeholder = t('emailPlaceholder');
  document.getElementById('authUsername').placeholder = t('usernamePlaceholder');
  // Header
  document.querySelector('.logo span').textContent = t('logoSub');
  document.getElementById('tabSearch').textContent = t('tabSearch');
  document.getElementById('tabMylist').textContent = t('tabMylist');
  document.getElementById('tabFriends').textContent = t('tabFriends');
  document.getElementById('logoutBtn').textContent = t('logoutBtn');
  // Hero
  const h1 = document.querySelector('.search-hero h1');
  if(h1) h1.innerHTML = t('heroH1');
  const heroP = document.querySelector('.search-hero p');
  if(heroP) heroP.textContent = t('heroSub');
  document.getElementById('searchInput').placeholder = t('searchPlaceholder');
  document.getElementById('searchBtn').textContent = t('searchBtn');
  // Friends
  document.getElementById('userSearchInput').placeholder = t('userSearchPlaceholder');
  document.getElementById('userSearchBtn').textContent = t('searchBtn');
  document.getElementById('ftFollowing').textContent = t('ftFollowing');
  document.getElementById('ftFollowers').textContent = t('ftFollowers');
  document.getElementById('ftSearch').textContent = t('ftSearch');
  // Back
  document.getElementById('backBtn').textContent = t('backBtn');
  // Footer
  const footer = document.querySelector('.site-footer');
  if(footer) footer.innerHTML = 'Contact: <a href="mailto:sahintoper@hotmail.com" style="color:var(--accent);text-decoration:none">sahintoper@hotmail.com</a>';
  // Lang toggle
  document.getElementById('langTR').classList.toggle('active', l === 'tr');
  document.getElementById('langEN').classList.toggle('active', l === 'en');
}

function switchLang(lang){
  currentLang = lang;
  applyLang();
  // Re-render current view content that has dynamic text
  const searchRes = document.getElementById('searchResults');
  if(searchRes) searchRes.innerHTML = '';
  const si = document.getElementById('searchInput');
  if(si) si.value = '';
}
