// booklog-app.js (veya app.js)
// Not: HTML dosyanızdaki <script src="..."> kısmındaki isimle bu dosya ismi aynı olmalıdır.

document.addEventListener('DOMContentLoaded', () => {
    console.log("BookLog Uygulaması Başlatıldı...");

    // 1. SUPABASE AYARLARI (Buradaki bilgileri kendi Supabase panelinden doldurmalısın)
    const SUPABASE_URL = 'https://PROJE_ID.supabase.co'; 
    const SUPABASE_ANON_KEY = 'SENIN_ANON_KEY_BURAYA';
    
    // Supabase bağlantısını başlat
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // 2. ELEMENTLERİ SEÇELİM
    const authBtn = document.getElementById('authBtn');
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const usernameField = document.getElementById('usernameField');
    const authEmail = document.getElementById('authEmail');
    const authPassword = document.getElementById('authPassword');
    const authUsername = document.getElementById('authUsername');
    const authError = document.getElementById('authError');
    const authSuccess = document.getElementById('authSuccess');
    
    let isLogin = true; // Başlangıçta giriş modundayız

    // 3. TAB (SEKME) DEĞİŞTİRME MANTIĞI
    registerTab.addEventListener('click', () => {
        isLogin = false;
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        usernameField.style.display = 'block';
        authBtn.textContent = t('authBtn_register');
        authError.style.display = 'none';
    });

    loginTab.addEventListener('click', () => {
        isLogin = true;
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        usernameField.style.display = 'none';
        authBtn.textContent = t('authBtn_login');
        authError.style.display = 'none';
    });

    // 4. GİRİŞ VE KAYIT İŞLEMLERİ
    authBtn.addEventListener('click', async () => {
        const email = authEmail.value;
        const password = authPassword.value;
        const username = authUsername.value;

        // Temizleme
        authError.style.display = 'none';
        authSuccess.style.display = 'none';

        if (!email || !password) {
            authError.textContent = t('authErrEmpty');
            authError.style.display = 'block';
            return;
        }

        authBtn.disabled = true;
        authBtn.textContent = t('searching');

        if (isLogin) {
            // GİRİŞ YAP
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                authError.textContent = t('authErrWrong');
                authError.style.display = 'block';
                authBtn.disabled = false;
                authBtn.textContent = t('authBtn_login');
            } else {
                console.log("Giriş başarılı:", data);
                // Başarılı girişten sonra uygulamayı göster
                window.location.reload(); // Sayfayı yenileyerek oturumu algılatıyoruz
            }
        } else {
            // KAYIT OL
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: { display_name: username }
                }
            });

            if (error) {
                authError.textContent = error.message;
                authError.style.display = 'block';
                authBtn.disabled = false;
            } else {
                authSuccess.textContent = t('authOK');
                authSuccess.style.display = 'block';
                authBtn.disabled = false;
            }
        }
    });

    // 5. DİL DEĞİŞTİRME BUTONLARI
    document.getElementById('langTR').addEventListener('click', () => {
        switchLang('tr');
    });

    document.getElementById('langEN').addEventListener('click', () => {
        switchLang('en');
    });

    // Başlangıçta dili uygula
    applyLang();
});