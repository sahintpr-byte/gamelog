const LANG = {
  tr:{
    loginTab:'Giriş Yap',registerTab:'Kayıt Ol',authBtn_login:'Giriş Yap',authBtn_register:'Kayıt Ol',
    authSub:'Kitap listeni oluştur, takip et.',emailLabel:'E-posta',passLabel:'Şifre',usernameLabel:'Kullanıcı Adı',
    emailPH:'ornek@mail.com',usernamePH:'kitapsever42',
    authErrEmpty:'E-posta ve şifre gerekli.',authErrWrong:'E-posta veya şifre hatalı.',
    authOK:'Kayıt başarılı! E-postanı doğrula, ardından giriş yap.',
    logoSub:'kitap listem',tabSearch:'🔍 Ara',tabMylist:'📚 Listelerim',tabFriends:'👥 Arkadaşlar',logoutBtn:'Çıkış',
    heroTitle:'Kitap <em>Bul,</em><br>Listene <em>Ekle</em>',
    heroSub:'Milyonlarca kitap arasından ara, puanla, takip et.',
    searchPH:'Kitap adı veya yazar ara...',searchBtn:'Ara',
    resultsLabel:' SONUÇ BULUNDU',noResults:'Sonuç bulunamadı.',searching:'Aranıyor...',connErr:'Bağlantı hatası.',
    addBtn:'+ Ekle',addedBtn:'✓ Listede',
    scoreLbl:'PUAN VER',listLbl:'LİSTE SEÇ',noteLbl:'NOT (opsiyonel)',
    notePH:'Bu kitap hakkında düşüncelerini yaz...',
    cancelBtn:'İptal',saveBtn:'Listeye Ekle ✓',updateBtn:'Güncelle ✓',
    sidebarTitle:'Listelerim',newListBtn:'+ Yeni',
    emptyTitle:'Liste Seç',emptySub:'Soldan bir liste seç.',
    listEmptyTitle:'Henüz Boş',listEmptySub:'Arama yapıp kitap ekleyebilirsin.',
    statBooks:'Kitap',statAvg:'Ort.',
    sortDate:'📅 Eklenme',sortHigh:'⬆ En Yüksek',sortLow:'⬇ En Düşük',sortName:'🔤 İsim',
    exportBtn:'⬇ Dışa Aktar',importLbl:'⬆ İçe Aktar',
    expCSV:'📄 CSV',expXLSX:'📊 Excel',expPDF:'📋 PDF',
    tblNum:'#',tblBook:'Kitap',tblAuthor:'Yazar',tblScore:'Puan',tblYear:'Yıl',tblNote:'Not',tblDate:'Eklenme',
    newListTitle:'Yeni Liste',editListTitle:'Listeyi Düzenle',
    listNameLbl:'Liste Adı',listDescLbl:'Açıklama (opsiyonel)',
    listNamePH:'ör: Okumak İstediklerim',listDescPH:'Kısa bir açıklama...',
    saveListBtn:'Kaydet',
    friendsTitle:'Arkadaşlar',userSearchPH:'Kullanıcı adı ara...',
    ftFollowing:'Takip Ettiklerim',ftFollowers:'Takipçilerim',ftSearch:'Arama Sonuçları',
    viewListBtn:'📚 Listeyi Gör',followBtn:'+ Takip Et',followingBtn:'✓ Takip Ediliyor',
    notFound:'Bulunamadı',backBtn:'← Geri',loadingTxt:'Yükleniyor...',
    showComments:'💬 Yorumları göster',hideComments:'💬 Yorumları gizle',
    noComments:'Henüz yorum yok.',commentPH:'Yorum yaz...',commentBtn:'Gönder',
    toastAdded:'" listeye eklendi!',toastDeleted:'Kitap listeden silindi.',
    toastListCreated:'" listesi oluşturuldu!',toastListUpdated:'Liste güncellendi.',
    toastListDeleted:' silindi.',toastFollowed:' takip edildi!',toastUnfollowed:' takipten çıkarıldı.',
    toastEmpty:'Liste boş.',toastImporting:'İçe aktarılıyor...',
    toastDone_pre:'Tamamlandı: ',toastDone_add:' eklendi, ',toastDone_skip:' atlandı.',
    toastFileErr:'Dosya okunamadı.',toastNoData:'Dosyada veri yok.',toastNoCol:'"Kitap Adı" sütunu bulunamadı.',
    toastListNameReq:'Liste adı gerekli.',
    toastCSV:'CSV indirildi!',toastXLSX:'Excel indirildi!',toastPDF:'PDF için yazdır penceresini kullan.',
    confirmDel:'" listeden silinsin mi?',confirmListDel:'" listesi ve içindeki tüm kitaplar silinsin mi?',
    colName:'Kitap Adı',colAuthor:'Yazar',colScore:'Puan',colYear:'Yıl',colGenres:'Kategoriler',
    colPages:'Sayfa',colNote:'Not',colDate:'Eklenme',
    footer:'Bu İslam ve Şahin kardeşlerin ortak projesidir.',
    bookCount:' kitap · ',listCount:' liste',dateLocale:'tr-TR',
  },
  en:{
    loginTab:'Log In',registerTab:'Sign Up',authBtn_login:'Log In',authBtn_register:'Sign Up',
    authSub:'Build your book list, follow others.',emailLabel:'Email',passLabel:'Password',usernameLabel:'Username',
    emailPH:'example@mail.com',usernamePH:'bookworm42',
    authErrEmpty:'Email and password are required.',authErrWrong:'Incorrect email or password.',
    authOK:'Registration successful! Verify your email, then log in.',
    logoSub:'my book list',tabSearch:'🔍 Search',tabMylist:'📚 My Lists',tabFriends:'👥 Friends',logoutBtn:'Logout',
    heroTitle:'Find <em>Books,</em><br>Build <em>Lists</em>',
    heroSub:'Search millions of books, rate them, and track your reading.',
    searchPH:'Search by title or author...',searchBtn:'Search',
    resultsLabel:' RESULTS FOUND',noResults:'No results found.',searching:'Searching...',connErr:'Connection error.',
    addBtn:'+ Add',addedBtn:'✓ In List',
    scoreLbl:'RATE',listLbl:'SELECT LIST',noteLbl:'NOTE (optional)',
    notePH:'Write your thoughts about this book...',
    cancelBtn:'Cancel',saveBtn:'Add to List ✓',updateBtn:'Update ✓',
    sidebarTitle:'My Lists',newListBtn:'+ New',
    emptyTitle:'Select List',emptySub:'Choose a list on the left.',
    listEmptyTitle:'Empty',listEmptySub:'Search and add books to this list.',
    statBooks:'Books',statAvg:'Avg.',
    sortDate:'📅 Date Added',sortHigh:'⬆ Highest',sortLow:'⬇ Lowest',sortName:'🔤 Name',
    exportBtn:'⬇ Export',importLbl:'⬆ Import',
    expCSV:'📄 CSV',expXLSX:'📊 Excel',expPDF:'📋 PDF',
    tblNum:'#',tblBook:'Book',tblAuthor:'Author',tblScore:'Score',tblYear:'Year',tblNote:'Note',tblDate:'Added',
    newListTitle:'New List',editListTitle:'Edit List',
    listNameLbl:'List Name',listDescLbl:'Description (optional)',
    listNamePH:'e.g. Want to Read',listDescPH:'Short description...',
    saveListBtn:'Save',
    friendsTitle:'Friends',userSearchPH:'Search by username...',
    ftFollowing:'Following',ftFollowers:'Followers',ftSearch:'Search Results',
    viewListBtn:'📚 View List',followBtn:'+ Follow',followingBtn:'✓ Following',
    notFound:'Not Found',backBtn:'← Back',loadingTxt:'Loading...',
    showComments:'💬 Show comments',hideComments:'💬 Hide comments',
    noComments:'No comments yet.',commentPH:'Write a comment...',commentBtn:'Send',
    toastAdded:'" added to list!',toastDeleted:'Book removed from list.',
    toastListCreated:'" list created!',toastListUpdated:'List updated.',
    toastListDeleted:' deleted.',toastFollowed:' followed!',toastUnfollowed:' unfollowed.',
    toastEmpty:'List is empty.',toastImporting:'Importing...',
    toastDone_pre:'Done: ',toastDone_add:' added, ',toastDone_skip:' skipped.',
    toastFileErr:'Could not read file.',toastNoData:'No data in file.',toastNoCol:'"Book Name" column not found.',
    toastListNameReq:'List name is required.',
    toastCSV:'CSV downloaded!',toastXLSX:'Excel downloaded!',toastPDF:'Use the print window to save as PDF.',
    confirmDel:'" removed from list?',confirmListDel:'" list and all its books will be deleted?',
    colName:'Book Name',colAuthor:'Author',colScore:'Score',colYear:'Year',colGenres:'Categories',
    colPages:'Pages',colNote:'Note',colDate:'Added',
    footer:'A joint project by Islam and Sahin.',
    bookCount:' books · ',listCount:' lists',dateLocale:'en-US',
  }
};
let currentLang='tr';
function t(k){return LANG[currentLang][k]!==undefined?LANG[currentLang][k]:(LANG.tr[k]||k);}
function applyLang(){
  document.getElementById('loginTab').textContent=t('loginTab');
  document.getElementById('registerTab').textContent=t('registerTab');
  document.getElementById('authBtn').textContent=t('authBtn_login');
  document.querySelector('.auth-sub').textContent=t('authSub');
  document.querySelectorAll('.auth-field label')[0].textContent=t('emailLabel');
  document.querySelectorAll('.auth-field label')[1].textContent=t('passLabel');
  document.querySelectorAll('.auth-field label')[2].textContent=t('usernameLabel');
  document.getElementById('authEmail').placeholder=t('emailPH');
  document.getElementById('authUsername').placeholder=t('usernamePH');
  document.querySelector('.logo span').textContent=t('logoSub');
  document.getElementById('tabSearch').textContent=t('tabSearch');
  document.getElementById('tabMylist').textContent=t('tabMylist');
  document.getElementById('tabFriends').textContent=t('tabFriends');
  document.getElementById('logoutBtn').textContent=t('logoutBtn');
  document.getElementById('heroTitle').innerHTML=t('heroTitle');
  document.getElementById('heroSub').textContent=t('heroSub');
  document.getElementById('searchInput').placeholder=t('searchPH');
  document.getElementById('searchBtn').textContent=t('searchBtn');
  document.getElementById('sidebarTitle').textContent=t('sidebarTitle');
  document.getElementById('newListBtn').textContent=t('newListBtn');
  document.getElementById('friendsTitle').textContent=t('friendsTitle');
  document.getElementById('userSearchInput').placeholder=t('userSearchPH');
  document.getElementById('userSearchBtn').textContent=t('searchBtn');
  document.getElementById('ftFollowing').textContent=t('ftFollowing');
  document.getElementById('ftFollowers').textContent=t('ftFollowers');
  document.getElementById('ftSearch').textContent=t('ftSearch');
  document.getElementById('backBtn').textContent=t('backBtn');
  document.getElementById('scoreLbl').textContent=t('scoreLbl');
  document.getElementById('listLbl').textContent=t('listLbl');
  document.getElementById('noteLbl').textContent=t('noteLbl');
  document.getElementById('notesInput').placeholder=t('notePH');
  document.getElementById('modalCancel').textContent=t('cancelBtn');
  document.getElementById('siteFooter').innerHTML=t('footer')+'<br><span style="margin-top:6px;display:inline-block">Contact: <a href="mailto:sahintoper@hotmail.com" style="color:var(--accent2);text-decoration:none">sahintoper@hotmail.com</a></span>';
  document.getElementById('langTR').classList.toggle('active',currentLang==='tr');
  document.getElementById('langEN').classList.toggle('active',currentLang==='en');
}
function switchLang(lang){
  currentLang=lang;
  applyLang();
  document.getElementById('searchResults').innerHTML='';
  document.getElementById('searchInput').value='';
}
