/**
 * Core Application Controller for "اديني واحدة ⲙⲟⲓ ⲛⲏⲓ"
 */

class AppController {
  constructor() {
    this.currentView = 'youth'; // youth | leaderboard | supervisor
    this.currentSupervisorTab = 'generator'; // generator | visitation | verses | youth
    this.activeCountdownTimer = null;
    this.deferredPwaPrompt = null;
    this.leaderboardFilterTrack = 'all';
    this.selectedLeaderboardMonth = null;
    this.visitationTargetTrack = null;
    this.generatedQrInstance = null;
  }

  init() {
    // 1. Setup PWA install prompt listener
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPwaPrompt = e;
      const installBtn = document.getElementById('pwa-install-btn');
      if (installBtn) installBtn.classList.remove('hidden');
    });

    // 2. Ensure user session
    let currentUser = window.db.getCurrentUser();
    if (!currentUser) {
      // Default to first seed user so the app is immediately explorable
      const defaultUser = window.db.getRegisteredUsers()[0];
      if (defaultUser) {
        window.db.setCurrentUser(defaultUser);
        currentUser = defaultUser;
      } else {
        this.openLoginModal();
      }
    }

    this.updateUserDisplay();
    this.renderTracksCards();
    this.populateSupervisorDropdowns();
    this.checkPastoralNotifications();

    // 3. Periodic check for expired tracks every 15 seconds
    setInterval(() => {
      this.checkPastoralNotifications();
    }, 15000);

    // 4. Initial view render
    this.showHomeView();
    this.initDefaultQrPreview();
  }

  // ==========================================
  // NAVIGATION & VIEW SWITCHING
  // ==========================================

  showHomeView() {
    this.currentView = 'youth';
    document.getElementById('view-youth').classList.remove('hidden');
    document.getElementById('view-leaderboard').classList.add('hidden');
    document.getElementById('view-supervisor').classList.add('hidden');
    this.updateNavButtons('home');
    this.renderYouthDashboard();
  }

  showLeaderboardView() {
    this.currentView = 'leaderboard';
    document.getElementById('view-youth').classList.add('hidden');
    document.getElementById('view-leaderboard').classList.remove('hidden');
    document.getElementById('view-supervisor').classList.add('hidden');
    this.updateNavButtons('rank');
    this.populateLeaderboardMonths();
    this.refreshLeaderboard();
  }

  showSupervisorView() {
    this.currentView = 'supervisor';
    document.getElementById('view-youth').classList.add('hidden');
    document.getElementById('view-leaderboard').classList.add('hidden');
    document.getElementById('view-supervisor').classList.remove('hidden');
    this.updateNavButtons('sup');
    this.switchSupervisorTab(this.currentSupervisorTab);
  }

  openSupervisorViewPrompt() {
    const currentUser = window.db.getCurrentUser();
    if (currentUser && currentUser.isSupervisor) {
      this.showSupervisorView();
    } else {
      // Prompt for PIN or open supervisor login
      this.openLoginModal('supervisor');
    }
  }

  updateNavButtons(activeKey) {
    const btnHome = document.getElementById('nav-btn-home');
    const btnRank = document.getElementById('nav-btn-rank');
    const btnSup = document.getElementById('nav-btn-sup');

    if (btnHome) btnHome.className = activeKey === 'home' ? 'flex flex-col items-center gap-1 text-amber-400 text-[11px] font-bold' : 'flex flex-col items-center gap-1 text-slate-400 hover:text-amber-400 text-[11px] font-bold';
    if (btnRank) btnRank.className = activeKey === 'rank' ? 'flex flex-col items-center gap-1 text-amber-400 text-[11px] font-bold' : 'flex flex-col items-center gap-1 text-slate-400 hover:text-amber-400 text-[11px] font-bold';
    if (btnSup) btnSup.className = activeKey === 'sup' ? 'flex flex-col items-center gap-1 text-amber-400 text-[11px] font-bold' : 'flex flex-col items-center gap-1 text-slate-400 hover:text-amber-400 text-[11px] font-bold';
  }

  // ==========================================
  // USER PROFILE & LOGIN (AGE 15+)
  // ==========================================

  updateUserDisplay() {
    const currentUser = window.db.getCurrentUser();
    const nameEl = document.getElementById('user-display-name');
    const avatarEl = document.getElementById('user-avatar-initials');

    if (!currentUser) {
      if (nameEl) nameEl.textContent = 'دخول';
      if (avatarEl) avatarEl.innerHTML = '<i class="fa-solid fa-user"></i>';
      return;
    }

    if (currentUser.isSupervisor) {
      if (nameEl) nameEl.textContent = currentUser.name || 'المشرف (الخادم)';
      if (avatarEl) avatarEl.innerHTML = '<i class="fa-solid fa-user-shield text-amber-400"></i>';
    } else {
      if (nameEl) nameEl.textContent = currentUser.name.split(' ')[0] || currentUser.name;
      if (avatarEl) {
        const firstLetter = currentUser.name.trim().charAt(0);
        avatarEl.textContent = firstLetter || 'ش';
      }
    }
  }

  toggleUserMenu() {
    this.openLoginModal();
  }

  openLoginModal(defaultRole = 'youth') {
    const modal = document.getElementById('login-modal');
    modal.classList.remove('hidden');
    this.switchLoginRole(defaultRole);
  }

  closeLoginModal() {
    document.getElementById('login-modal').classList.add('hidden');
  }

  switchLoginRole(role) {
    const youthTab = document.getElementById('role-tab-youth');
    const supTab = document.getElementById('role-tab-supervisor');
    const youthForm = document.getElementById('form-youth-login');
    const supForm = document.getElementById('form-supervisor-login');

    if (role === 'youth') {
      youthTab.className = 'flex-1 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold transition';
      supTab.className = 'flex-1 py-2 rounded-lg text-slate-400 hover:text-white font-bold transition';
      youthForm.classList.remove('hidden');
      supForm.classList.add('hidden');
    } else {
      supTab.className = 'flex-1 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold transition';
      youthTab.className = 'flex-1 py-2 rounded-lg text-slate-400 hover:text-white font-bold transition';
      supForm.classList.remove('hidden');
      youthForm.classList.add('hidden');
    }
  }

  handleYouthSubmit(event) {
    event.preventDefault();
    const name = document.getElementById('login-youth-name').value.trim();
    const age = parseInt(document.getElementById('login-youth-age').value);
    const phone = document.getElementById('login-youth-phone').value.trim();
    const church = document.getElementById('login-youth-church').value.trim();
    const errorHint = document.getElementById('age-error-hint');

    // Strict Age check: >= 15 years old
    if (isNaN(age) || age < 15) {
      errorHint.classList.remove('hidden');
      alert("عفواً، تسجيل الدخول في برنامج «اديني واحدة» يبدأ من سن 15 سنة فما فوق.");
      return;
    }
    errorHint.classList.add('hidden');

    const user = {
      name,
      age,
      phone,
      church: church || "كنيسة قبطية أرثوذكسية",
      isSupervisor: false
    };

    window.db.registerUser(user);
    this.closeLoginModal();
    this.updateUserDisplay();
    this.showHomeView();
    window.sounds.playChurchBell();
  }

  handleSupervisorSubmit(event) {
    event.preventDefault();
    const gmailInput = document.getElementById('login-sup-gmail');
    const passwordInput = document.getElementById('login-sup-password');
    const errorHint = document.getElementById('sup-email-error-hint');

    const email = gmailInput ? gmailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';

    if (!email.toLowerCase().endsWith('@gmail.com')) {
      if (errorHint) errorHint.classList.remove('hidden');
      alert("عفواً، الدخول لقسم المشرف مخصص لحسابات Gmail فقط التي تنتهي بـ @gmail.com");
      return;
    }
    if (errorHint) errorHint.classList.add('hidden');

    const result = window.db.validateSupervisorLogin(email, password);

    if (result.success) {
      const emailPrefix = email.split('@')[0];
      const supUser = {
        name: `خادم (${emailPrefix})`,
        email: email,
        isSupervisor: true
      };
      window.db.setCurrentUser(supUser);
      this.closeLoginModal();
      this.updateUserDisplay();
      this.showSupervisorView();
      window.sounds.playChurchBell();
    } else {
      alert(result.error || "البريد الإلكتروني أو كلمة المرور غير صحيحة.");
    }
  }

  autofillSupervisorCreds() {
    const creds = window.db.getSupervisorCredentials();
    const gmailInput = document.getElementById('login-sup-gmail');
    const passwordInput = document.getElementById('login-sup-password');
    if (gmailInput) gmailInput.value = creds.email;
    if (passwordInput) passwordInput.value = creds.password;
  }

  togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      btn.innerHTML = '<i class="fa-solid fa-eye-slash text-sm text-amber-400"></i>';
    } else {
      input.type = 'password';
      btn.innerHTML = '<i class="fa-regular fa-eye text-sm"></i>';
    }
  }

  handleChangeSupervisorCredentials(event) {
    event.preventDefault();
    const newGmail = document.getElementById('change-sup-gmail').value.trim();
    const newPass = document.getElementById('change-sup-password').value;
    const confirmPass = document.getElementById('change-sup-password-confirm').value;

    if (!newGmail.toLowerCase().endsWith('@gmail.com')) {
      alert("عفواً، يجب أن ينتهي البريد الإلكتروني بـ @gmail.com فقط.");
      return;
    }

    if (newPass.length < 4) {
      alert("كلمة المرور يجب أن تتكون من 4 أحرف أو أرقام على الأقل.");
      return;
    }

    if (newPass !== confirmPass) {
      alert("كلمة المرور وتأكيدها غير متطابقين.");
      return;
    }

    window.db.setSupervisorCredentials(newGmail, newPass);
    window.sounds.playChurchBell();
    alert("تم حفظ بيانات الدخول الجديدة للمشرف (Gmail والباسوورد) بنجاح!");
    
    // Clear password inputs
    document.getElementById('change-sup-password').value = '';
    document.getElementById('change-sup-password-confirm').value = '';
  }

  quickLoginDemo(userId) {
    if (userId === 'supervisor') {
      const creds = window.db.getSupervisorCredentials();
      const supUser = { 
        name: "مشرف البرنامج", 
        email: creds.email,
        isSupervisor: true 
      };
      window.db.setCurrentUser(supUser);
      this.closeLoginModal();
      this.updateUserDisplay();
      this.showSupervisorView();
    } else {
      const users = window.db.getRegisteredUsers();
      const target = users.find(u => u.id === userId);
      if (target) {
        target.isSupervisor = false;
        window.db.setCurrentUser(target);
        this.closeLoginModal();
        this.updateUserDisplay();
        this.showHomeView();
      }
    }
    window.sounds.playChurchBell();
  }

  // ==========================================
  // YOUTH DASHBOARD & ACTIVE TRACK VIEW
  // ==========================================

  renderYouthDashboard() {
    const currentUser = window.db.getCurrentUser();
    if (!currentUser || currentUser.isSupervisor) {
      document.getElementById('no-track-container').classList.remove('hidden');
      document.getElementById('active-track-container').classList.add('hidden');
      return;
    }

    const activeTrack = window.db.getActiveTrackForUser(currentUser.id, currentUser.name);

    if (activeTrack) {
      document.getElementById('no-track-container').classList.add('hidden');
      document.getElementById('active-track-container').classList.remove('hidden');
      this.renderActiveTrack(activeTrack);
    } else {
      document.getElementById('no-track-container').classList.remove('hidden');
      document.getElementById('active-track-container').classList.add('hidden');
    }
  }

  renderActiveTrack(userTrack) {
    const trackInfo = window.db.getTrackById(userTrack.trackId) || window.db.getTracks()[0];
    const container = document.getElementById('active-track-container');

    const isUrgent = userTrack.status === 'needs_visitation';

    let html = `
      <div class="glass-panel rounded-3xl p-6 md:p-8 border border-amber-500/40 relative overflow-hidden space-y-6 ${isUrgent ? 'urgent-visitation-card' : ''}">
        
        <!-- Header Banner -->
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="px-3 py-1 rounded-full text-xs font-bold ${trackInfo.badgeClass}">
                المسار المعتمد: ${trackInfo.name}
              </span>
              ${userTrack.isSpecial ? `
                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  ⭐ كود خاص دوري (كل ${userTrack.intervalDays || 3} أيام)
                </span>
              ` : ''}
            </div>
            <h2 class="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
              <i class="fa-solid ${trackInfo.icon} text-amber-400"></i>
              <span>${trackInfo.name}</span>
            </h2>
            <p class="text-xs md:text-sm text-slate-300">${trackInfo.subtitle}</p>
          </div>

          <!-- Points and Duration Badge -->
          <div class="flex md:flex-col items-end gap-2 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div class="text-right">
              <span class="text-[11px] text-slate-400 block">درجات المشرف:</span>
              <span class="text-xl font-black text-gold-gradient">${userTrack.points || 50} درجة</span>
            </div>
            <span class="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <i class="fa-solid fa-shield-halved"></i> معتمد رسمياً
            </span>
          </div>
        </div>

        <!-- Live Countdown Timer -->
        <div class="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="text-center md:text-right">
            <span class="text-xs text-amber-400 font-bold block mb-0.5 flex items-center gap-1.5 justify-center md:justify-start">
              <i class="fa-solid fa-stopwatch animate-spin" style="animation-duration: 4s;"></i>
              <span>الوقت المتبقي لانتهاء فترة المسار:</span>
            </span>
            <span class="text-[11px] text-slate-400">عند انتهاء الوقت يرسل تنبيه للمشرف لافتقادك</span>
          </div>

          <div class="flex items-center gap-2 font-mono" id="countdown-display-boxes">
            <div class="countdown-box">
              <span class="text-lg md:text-2xl font-black text-amber-300 block" id="cd-days">00</span>
              <span class="text-[9px] text-slate-400 uppercase font-sans">يوم</span>
            </div>
            <span class="text-amber-400 font-bold text-lg">:</span>
            <div class="countdown-box">
              <span class="text-lg md:text-2xl font-black text-amber-300 block" id="cd-hours">00</span>
              <span class="text-[9px] text-slate-400 uppercase font-sans">ساعة</span>
            </div>
            <span class="text-amber-400 font-bold text-lg">:</span>
            <div class="countdown-box">
              <span class="text-lg md:text-2xl font-black text-amber-300 block" id="cd-mins">00</span>
              <span class="text-[9px] text-slate-400 uppercase font-sans">دقيقة</span>
            </div>
            <span class="text-amber-400 font-bold text-lg">:</span>
            <div class="countdown-box">
              <span class="text-lg md:text-2xl font-black text-amber-300 block" id="cd-secs">00</span>
              <span class="text-[9px] text-slate-400 uppercase font-sans">ثانية</span>
            </div>
          </div>
        </div>

        ${isUrgent ? `
          <div class="p-3.5 rounded-2xl bg-red-950/70 border border-red-500 text-red-200 text-xs flex items-center gap-3">
            <i class="fa-solid fa-bell text-red-400 text-lg"></i>
            <div>
              <b class="text-white block">انتهت مدة مسارك المقررة!</b>
              تم إشعار المشرف لترتيب زيارة وافتقاد روحي معك للاطمئنان عليك وتقدير التزامك.
            </div>
          </div>
        ` : ''}

        <!-- Spiritual Reflections & Words (كلمات روحية) -->
        <div class="space-y-3">
          <h3 class="text-sm font-bold text-amber-300 flex items-center gap-2">
            <i class="fa-solid fa-dove text-amber-400"></i>
            <span>كلمات وتوجيهات روحية لمسارك:</span>
          </h3>
          <div class="space-y-2">
            ${(trackInfo.spiritualWords || []).map((word, idx) => `
              <div class="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs md:text-sm text-slate-200 leading-relaxed flex items-start gap-2.5">
                <span class="text-amber-400 text-sm font-bold">☦</span>
                <p>${word}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Bible Verses with Reference (آيات من الكتاب المقدس مع الشاهد) -->
        <div class="space-y-3">
          <h3 class="text-sm font-bold text-amber-300 flex items-center gap-2">
            <i class="fa-solid fa-book-bible text-amber-400"></i>
            <span>آيات المسار مع الشاهد للحفظ والتأمل:</span>
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            ${(trackInfo.verses || []).map((v, i) => `
              <div class="p-4 rounded-2xl bg-slate-900/70 border border-amber-500/20 hover:border-amber-500/40 transition space-y-2">
                <div class="text-amber-400 text-xs font-serif">❝</div>
                <p class="text-xs md:text-sm text-amber-100 font-medium leading-relaxed">${v.text}</p>
                <div class="flex justify-between items-center pt-2 border-t border-slate-800 text-[11px]">
                  <span class="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    الشاهد: ${v.reference}
                  </span>
                  <button onclick="app.copyVerse('${v.text.replace(/'/g, "\\'")} - ${v.reference}')" class="text-slate-400 hover:text-white">
                    <i class="fa-solid fa-copy"></i>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Daily Spiritual Checklist -->
        <div class="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
          <h4 class="text-xs font-bold text-slate-300 flex items-center gap-2">
            <i class="fa-solid fa-list-check text-emerald-400"></i>
            <span>المحاسبة الروحية اليومية لمسارك:</span>
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <label class="flex items-center gap-2 p-2 rounded-xl bg-slate-800/40 border border-slate-700/50 cursor-pointer">
              <input type="checkbox" checked class="w-4 h-4 text-emerald-500 rounded bg-slate-900 border-slate-700">
              <span class="text-slate-300">قرأت تأمل اليوم</span>
            </label>
            <label class="flex items-center gap-2 p-2 rounded-xl bg-slate-800/40 border border-slate-700/50 cursor-pointer">
              <input type="checkbox" checked class="w-4 h-4 text-emerald-500 rounded bg-slate-900 border-slate-700">
              <span class="text-slate-300">صليت بالآية والشاهد</span>
            </label>
            <label class="flex items-center gap-2 p-2 rounded-xl bg-slate-800/40 border border-slate-700/50 cursor-pointer">
              <input type="checkbox" class="w-4 h-4 text-emerald-500 rounded bg-slate-900 border-slate-700">
              <span class="text-slate-300">وقفة توبة ومحاسبة</span>
            </label>
          </div>
        </div>

        <!-- Action: Share progress with servant -->
        <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <button onclick="app.shareProgressWithServant('${userTrack.userName}', '${trackInfo.name}')" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-2 shadow transition">
            <i class="fa-brands fa-whatsapp text-sm"></i>
            <span>مشاركة الالتزام مع الخادم على واتساب</span>
          </button>
          
          <button onclick="app.openScannerModal()" class="text-slate-400 hover:text-amber-300 text-xs flex items-center gap-1.5 transition">
            <i class="fa-solid fa-qrcode"></i>
            <span>مسح كود مسار جديد أو تحديث</span>
          </button>
        </div>

      </div>
    `;

    container.innerHTML = html;
    this.startCountdownTimer(userTrack.endDate);
  }

  startCountdownTimer(endDateStr) {
    if (this.activeCountdownTimer) {
      clearInterval(this.activeCountdownTimer);
    }

    const update = () => {
      const now = new Date().getTime();
      const end = new Date(endDateStr).getTime();
      const diff = end - now;

      const dEl = document.getElementById('cd-days');
      const hEl = document.getElementById('cd-hours');
      const mEl = document.getElementById('cd-mins');
      const sEl = document.getElementById('cd-secs');

      if (!dEl) return;

      if (diff <= 0) {
        dEl.textContent = '00';
        hEl.textContent = '00';
        mEl.textContent = '00';
        sEl.textContent = '00';
        clearInterval(this.activeCountdownTimer);
        // Refresh notifications
        window.db.checkAndRefreshExpiredTracks();
        this.checkPastoralNotifications();
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      dEl.textContent = String(days).padStart(2, '0');
      hEl.textContent = String(hours).padStart(2, '0');
      mEl.textContent = String(minutes).padStart(2, '0');
      sEl.textContent = String(seconds).padStart(2, '0');
    };

    update();
    this.activeCountdownTimer = setInterval(update, 1000);
  }

  renderTracksCards() {
    const grid = document.getElementById('tracks-cards-grid');
    if (!grid) return;
    const tracks = window.db.getTracks();

    grid.innerHTML = tracks.map(t => `
      <div class="glass-panel glass-card-interactive rounded-2xl p-4 border border-slate-800 flex flex-col justify-between space-y-3 cursor-pointer" onclick="app.previewTrackModal(${t.id})">
        <div class="space-y-2">
          <div class="w-10 h-10 rounded-xl ${t.badgeClass} flex items-center justify-center text-base">
            <i class="fa-solid ${t.icon}"></i>
          </div>
          <h4 class="font-black text-sm text-white">${t.name}</h4>
          <p class="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">${t.subtitle}</p>
        </div>
        <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
          <span class="text-amber-400 font-bold">${t.verses.length} آيات بالشاهد</span>
          <i class="fa-solid fa-arrow-left text-slate-500"></i>
        </div>
      </div>
    `).join('');
  }

  previewTrackModal(trackId) {
    const track = window.db.getTrackById(trackId);
    if (!track) return;

    let versesHtml = track.verses.map(v => `
      <div class="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs space-y-1">
        <p class="text-amber-100 font-medium">«${v.text}»</p>
        <span class="text-amber-400 font-bold block text-[11px]">الشاهد: ${v.reference}</span>
      </div>
    `).join('');

    alert(`مسار: ${track.name}\n\n${track.subtitle}\n\nالآيات المعتمدة:\n${track.verses.map(v => '• ' + v.text + ' (' + v.reference + ')').join('\n\n')}`);
  }

  // ==========================================
  // QR CODE SCANNER (LIVE CAMERA & IMAGE FILE)
  // ==========================================

  openScannerModal() {
    const modal = document.getElementById('scanner-modal');
    modal.classList.remove('hidden');
    const statusText = document.getElementById('scanner-status-text');
    statusText.textContent = "جاري فتح الكاميرا للمسح...";

    window.qrScanner.startCameraScan(
      "interactive-qr-reader",
      (parsedData, raw) => this.onSuccessfulScan(parsedData, raw),
      (err) => {
        statusText.textContent = "تعذر الوصول للكاميرا تلقائياً، يمكنك رفع صورة الكود من جهازك بالأسفل.";
      }
    );
  }

  closeScannerModal() {
    window.qrScanner.stopCameraScan();
    document.getElementById('scanner-modal').classList.add('hidden');
  }

  handleQrFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const statusText = document.getElementById('scanner-status-text');
    statusText.textContent = "جاري قراءة صورة الـ QR...";

    window.qrScanner.scanFile(
      file,
      (parsedData, raw) => this.onSuccessfulScan(parsedData, raw),
      (err) => {
        statusText.textContent = err;
      }
    );
  }

  handleManualQrSubmit() {
    const raw = document.getElementById('manual-qr-input').value.trim();
    if (!raw) return;
    window.qrScanner.handleDecodedText(raw);
  }

  onSuccessfulScan(data, rawText) {
    this.closeScannerModal();

    if (!data || !data.trackId) {
      alert("عفواً، كود الـ QR هذا غير صالح أو لا يتبع نظام «اديني واحدة».");
      return;
    }

    // Identify user
    let currentUser = window.db.getCurrentUser();
    const userName = data.name || (currentUser ? currentUser.name : "مشترك");
    
    // Check if user is registered, else register
    let registeredUser = window.db.getRegisteredUsers().find(u => u.name === userName);
    if (!registeredUser) {
      registeredUser = window.db.registerUser({
        name: userName,
        age: 16,
        phone: "01000000000",
        church: "كنيسة قبطية أرثوذكسية"
      });
    }

    window.db.setCurrentUser(registeredUser);

    // Compute dates
    const now = new Date();
    const durationDays = Number(data.durationDays || 7);
    const durationHours = Number(data.durationHours || 0);

    let endMs = now.getTime() + (durationDays * 24 * 60 * 60 * 1000);
    if (durationHours > 0) {
      endMs = now.getTime() + (durationHours * 60 * 60 * 1000);
    }
    const endDate = new Date(endMs);

    const trackInfo = window.db.getTrackById(data.trackId) || window.db.getTracks()[0];

    const newTrackRecord = {
      userId: registeredUser.id,
      userName: registeredUser.name,
      trackId: trackInfo.id,
      trackName: trackInfo.name,
      points: Number(data.points || trackInfo.defaultPoints || 50),
      isSpecial: Boolean(data.isSpecial),
      intervalDays: Number(data.intervalDays || 0),
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      status: "active",
      reflectionsRead: 0,
      versesMemorized: 0
    };

    window.db.addUserTrack(newTrackRecord);

    // Audio & Confetti celebration
    window.sounds.playChurchBell();
    if (window.confetti) {
      window.confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    alert(`تهانينا يا ${registeredUser.name}! 🎉\nتم تفعيل مسار [${trackInfo.name}] لمدة ${durationDays} أيام بنجاح مع رصيد ${newTrackRecord.points} درجة!`);
    this.updateUserDisplay();
    this.showHomeView();
  }

  // ==========================================
  // SUPERVISOR DASHBOARD: QR GENERATOR
  // ==========================================

  populateSupervisorDropdowns() {
    const userSelect = document.getElementById('gen-user-select');
    if (!userSelect) return;

    const users = window.db.getRegisteredUsers();
    userSelect.innerHTML = '<option value="">-- اختر من المسجلين --</option>' +
      users.map(u => `<option value="${u.id}" data-name="${u.name}">${u.name} (${u.age} سنة)</option>`).join('');
  }

  onGenUserSelectChange() {
    const select = document.getElementById('gen-user-select');
    const input = document.getElementById('gen-user-name');
    const selectedOpt = select.options[select.selectedIndex];
    if (selectedOpt && selectedOpt.value) {
      input.value = selectedOpt.getAttribute('data-name');
    }
  }

  onGenTrackChange() {
    const trackId = document.getElementById('gen-track-id').value;
    const track = window.db.getTrackById(trackId);
    if (track) {
      document.getElementById('gen-points').value = track.defaultPoints;
    }
  }

  toggleSpecialFrequency(isSpecial) {
    const box = document.getElementById('gen-frequency-box');
    if (isSpecial) {
      box.classList.remove('hidden');
    } else {
      box.classList.add('hidden');
    }
  }

  handleGenerateQR(event) {
    event.preventDefault();
    const name = document.getElementById('gen-user-name').value.trim();
    if (!name) {
      alert("برجاء إدخال اسم المخدوم");
      return;
    }

    const trackId = Number(document.getElementById('gen-track-id').value);
    const durationVal = Number(document.getElementById('gen-duration-val').value);
    const durationUnit = document.getElementById('gen-duration-unit').value;
    const points = Number(document.getElementById('gen-points').value);
    const isSpecial = document.getElementById('gen-is-special').checked;
    const intervalDays = isSpecial ? Number(document.getElementById('gen-interval-days').value) : 0;

    const trackInfo = window.db.getTrackById(trackId);

    const payload = {
      v: 1,
      name: name,
      trackId: trackId,
      durationDays: durationUnit === 'days' ? durationVal : 0,
      durationHours: durationUnit === 'hours' ? durationVal : 0,
      points: points,
      isSpecial: isSpecial,
      intervalDays: intervalDays,
      issuedAt: new Date().toISOString()
    };

    const payloadString = JSON.stringify(payload);

    this.renderQrCode(payloadString, name, trackInfo.name, `${durationVal} ${durationUnit === 'days' ? 'أيام' : 'ساعات'}`, points);
    window.sounds.playScanSuccess();
  }

  initDefaultQrPreview() {
    const defaultPayload = JSON.stringify({
      v: 1,
      name: "مينا سامي",
      trackId: 1,
      durationDays: 7,
      durationHours: 0,
      points: 50,
      isSpecial: false,
      intervalDays: 0,
      issuedAt: new Date().toISOString()
    });
    this.renderQrCode(defaultPayload, "مينا سامي", "١- استهبال", "7 أيام", 50);
  }

  renderQrCode(payloadString, name, trackName, durationStr, points) {
    const container = document.getElementById('generated-qrcode');
    if (!container) return;

    container.innerHTML = '';
    this.generatedQrInstance = new QRCode(container, {
      text: payloadString,
      width: 190,
      height: 190,
      colorDark: "#020617",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });

    document.getElementById('summary-name').textContent = name;
    document.getElementById('summary-track').textContent = trackName;
    document.getElementById('summary-duration').textContent = durationStr;
    document.getElementById('summary-points').textContent = points + ' درجة';

    this.currentGeneratedPayload = { payloadString, name, trackName, durationStr, points };
  }

  shareQRViaWhatsApp() {
    if (!this.currentGeneratedPayload) return;
    const { name, trackName, durationStr, points, payloadString } = this.currentGeneratedPayload;

    const message = `✝️ سلام ونعمة يا ${name}،\nمعاك مشرف برنامج «اديني واحدة ⲙⲟⲓ ⲛⲏⲓ».\nتم اعتماد مسارك الروحي:\n📍 المسار: ${trackName}\n⏳ المدة المقررة: ${durationStr}\n⭐ الدرجات المرصودة: ${points} درجة\n\nافتح التطبيق وامسح كود المسار للبدء بالنعمة، ربنا يبارك جهادك!`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  downloadGeneratedQR() {
    const img = document.querySelector('#generated-qrcode img');
    if (img && img.src) {
      const a = document.createElement('a');
      a.href = img.src;
      a.download = `QR-اديني-واحدة-${document.getElementById('summary-name').textContent}.png`;
      a.click();
    } else {
      alert("انتظر لحظة حتى يتم توليد الصورة.");
    }
  }

  // ==========================================
  // SUPERVISOR: PASTORAL VISITATION (الافتقاد)
  // ==========================================

  checkPastoralNotifications() {
    const pendingVisitations = window.db.checkAndRefreshExpiredTracks();
    const urgentCount = pendingVisitations.length;

    const banner = document.getElementById('visitation-urgent-banner');
    const badge = document.getElementById('visitation-badge-count');
    const tabBadge = document.getElementById('sup-visitation-tab-badge');

    if (urgentCount > 0) {
      if (banner) banner.classList.remove('hidden');
      if (badge) {
        badge.textContent = urgentCount;
        badge.classList.remove('hidden');
      }
      if (tabBadge) {
        tabBadge.textContent = urgentCount;
        tabBadge.classList.remove('hidden');
      }

      const urgentBannerText = document.getElementById('urgent-banner-text');
      if (urgentBannerText) {
        urgentBannerText.textContent = `يوجد ${urgentCount} من الشباب انتهت مدة مسارهم ومحتاجين افتقاد ومتابعة رعوية.`;
      }
    } else {
      if (banner) banner.classList.add('hidden');
      if (badge) badge.classList.add('hidden');
      if (tabBadge) tabBadge.classList.add('hidden');
    }
  }

  renderVisitationList() {
    const allTracks = window.db.getUserTracks();
    const needsVisitation = allTracks.filter(t => t.status === 'needs_visitation');
    const alreadyVisited = allTracks.filter(t => t.status === 'visited');

    document.getElementById('visitation-pending-counter').textContent = `${needsVisitation.length} محتاج افتقاد`;
    document.getElementById('visitation-completed-counter').textContent = `${alreadyVisited.length} تم افتقادهم`;

    const listContainer = document.getElementById('visitation-cards-list');
    if (!listContainer) return;

    if (needsVisitation.length === 0 && alreadyVisited.length === 0) {
      listContainer.innerHTML = `
        <div class="text-center py-8 text-slate-400 text-xs">
          <i class="fa-solid fa-circle-check text-emerald-400 text-3xl mb-2 block"></i>
          لا توجد حالات افتقاد حالياً، جميع المسارات نشطة أو تمت متابعتها!
        </div>
      `;
      return;
    }

    let html = '';

    // Pending Section
    if (needsVisitation.length > 0) {
      html += `<h4 class="text-xs font-bold text-red-400 flex items-center gap-1.5"><i class="fa-solid fa-triangle-exclamation"></i> انتهت مدتهم ومحتاجين افتقاد فوري:</h4>`;
      needsVisitation.forEach(item => {
        const track = window.db.getTrackById(item.trackId) || { name: item.trackName, badgeClass: 'badge-track-1' };
        html += `
          <div class="glass-panel p-4 rounded-2xl border-2 border-red-500/60 bg-red-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="text-sm font-black text-white">${item.userName}</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full font-bold ${track.badgeClass}">${track.name}</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-bold animate-pulse">انتهت المدة!</span>
              </div>
              <p class="text-xs text-slate-300">
                الدرجات المرصودة: <b class="text-amber-400">${item.points} درجة</b> • تاريخ الانتهاء: ${new Date(item.endDate).toLocaleDateString('ar-EG')}
              </p>
            </div>

            <div class="flex items-center gap-2 w-full md:w-auto">
              <button onclick="app.sendWhatsAppVisitation('${item.userName}', '${item.trackName}')" class="flex-1 md:flex-initial bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition">
                <i class="fa-brands fa-whatsapp"></i>
                <span>واتساب</span>
              </button>
              <button onclick="app.openVisitationModal('${item.id}', '${item.userName}', '${item.trackName}')" class="flex-1 md:flex-initial bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition">
                <i class="fa-solid fa-check-double"></i>
                <span>تسجيل الافتقاد</span>
              </button>
            </div>
          </div>
        `;
      });
    }

    // Completed Section
    if (alreadyVisited.length > 0) {
      html += `<h4 class="text-xs font-bold text-emerald-400 pt-4 border-t border-slate-800 flex items-center gap-1.5"><i class="fa-solid fa-clipboard-check"></i> سجل الافتقادات المكتملة:</h4>`;
      alreadyVisited.forEach(item => {
        html += `
          <div class="glass-panel p-3.5 rounded-2xl border border-slate-800 bg-slate-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-200">${item.userName}</span>
                <span class="text-slate-400">• مسار ${item.trackName}</span>
                <span class="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">تم الافتقاد</span>
              </div>
              ${item.visitationNote ? `<p class="text-slate-400 text-[11px] mt-1">تقرير الخادم: «${item.visitationNote}»</p>` : ''}
            </div>
            <span class="text-slate-400 text-[11px]">
              ${item.visitedDate ? new Date(item.visitedDate).toLocaleDateString('ar-EG') : ''}
            </span>
          </div>
        `;
      });
    }

    listContainer.innerHTML = html;
  }

  sendWhatsAppVisitation(userName, trackName) {
    const text = `سلام ونعمة يا ${userName}، بنطمن عليك بمحبة من الكنيسة بعد انتهاء فترة مسار [${trackName}] في برنامج «اديني واحدة».. وحشتنا ومحتاجين نتقابل ونفتقدك في الكنيسة ونشجعك بالنعمة!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }

  openVisitationModal(trackRecordId, userName, trackName) {
    this.visitationTargetTrackId = trackRecordId;
    document.getElementById('visit-modal-user').textContent = userName;
    document.getElementById('visit-modal-track').textContent = trackName;
    document.getElementById('visit-modal-notes').value = '';
    document.getElementById('visitation-modal').classList.remove('hidden');
  }

  closeVisitationModal() {
    document.getElementById('visitation-modal').classList.add('hidden');
    this.visitationTargetTrackId = null;
  }

  confirmVisitation() {
    if (!this.visitationTargetTrackId) return;
    const notes = document.getElementById('visit-modal-notes').value.trim();
    const bonus = Number(document.getElementById('visit-bonus-points').value) || 0;

    const track = window.db.getUserTracks().find(t => t.id === this.visitationTargetTrackId);
    if (track) {
      window.db.updateTrackStatus(this.visitationTargetTrackId, 'visited', {
        visitedDate: new Date().toISOString(),
        visitationNote: notes || "تم الافتقاد بنجاح والتوجيه الروحي",
        points: (Number(track.points) || 0) + bonus
      });
    }

    this.closeVisitationModal();
    this.checkPastoralNotifications();
    this.renderVisitationList();
    window.sounds.playChurchBell();
    alert("تم تسجيل إتمام الافتقاد وإضافة درجات الالتزام بنجاح! ✝️");
  }

  // ==========================================
  // SUPERVISOR: CONTENT MANAGEMENT (VERSES & WORDS)
  // ==========================================

  renderContentManager() {
    const select = document.getElementById('content-track-select');
    const trackId = Number(select.value);
    const track = window.db.getTrackById(trackId);
    const list = document.getElementById('content-verses-list');

    if (!track || !list) return;

    list.innerHTML = `
      <div class="space-y-3">
        <h4 class="text-xs font-bold text-amber-400">الآيات والشواهد المعتمدة حالياً في مسار (${track.name}):</h4>
        ${track.verses.map((v, idx) => `
          <div class="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-start justify-between gap-3 text-xs">
            <div class="space-y-1">
              <p class="text-amber-100 font-medium">«${v.text}»</p>
              <span class="text-amber-400 font-bold text-[11px] block">الشاهد: ${v.reference}</span>
            </div>
            <button onclick="app.deleteVerseFromTrack(${track.id}, '${v.id}')" class="text-red-400 hover:text-red-300 p-1">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        `).join('')}

        <h4 class="text-xs font-bold text-amber-400 pt-3 border-t border-slate-800">الكلمات والتوجيهات الروحية:</h4>
        ${(track.spiritualWords || []).map((w, i) => `
          <div class="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-start justify-between gap-3 text-xs">
            <p class="text-slate-200">${w}</p>
            <button onclick="app.deleteWordFromTrack(${track.id}, ${i})" class="text-red-400 hover:text-red-300 p-1">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        `).join('')}
      </div>
    `;
  }

  addNewVerseToTrack() {
    const select = document.getElementById('content-track-select');
    const trackId = Number(select.value);
    const text = document.getElementById('new-verse-text').value.trim();
    const ref = document.getElementById('new-verse-ref').value.trim();

    if (!text) {
      alert("برجاء إدخال نص الآية أو الكلمة الروحية");
      return;
    }

    const tracks = window.db.getTracks();
    const track = tracks.find(t => t.id === trackId);
    if (track) {
      if (ref) {
        track.verses.push({
          id: 'v_' + Date.now(),
          text: text,
          reference: ref
        });
      } else {
        if (!track.spiritualWords) track.spiritualWords = [];
        track.spiritualWords.push(text);
      }
      window.db.saveTracks(tracks);
      document.getElementById('new-verse-text').value = '';
      document.getElementById('new-verse-ref').value = '';
      this.renderContentManager();
      alert("تمت الإضافة بنجاح للمسار! ✝️");
    }
  }

  deleteVerseFromTrack(trackId, verseId) {
    if (!confirm("هل أنت متأكد من حذف هذه الآية؟")) return;
    const tracks = window.db.getTracks();
    const track = tracks.find(t => t.id === trackId);
    if (track) {
      track.verses = track.verses.filter(v => v.id !== verseId);
      window.db.saveTracks(tracks);
      this.renderContentManager();
    }
  }

  deleteWordFromTrack(trackId, wordIdx) {
    if (!confirm("هل أنت متأكد من حذف هذا التوجيه؟")) return;
    const tracks = window.db.getTracks();
    const track = tracks.find(t => t.id === trackId);
    if (track && track.spiritualWords) {
      track.spiritualWords.splice(wordIdx, 1);
      window.db.saveTracks(tracks);
      this.renderContentManager();
    }
  }

  // ==========================================
  // SUPERVISOR: YOUTH DIRECTORY
  // ==========================================

  renderYouthDirectory() {
    const list = document.getElementById('youth-directory-list');
    if (!list) return;
    const users = window.db.getRegisteredUsers();

    list.innerHTML = users.map(u => {
      const active = window.db.getActiveTrackForUser(u.id, u.name);
      return `
        <div class="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-sm font-black text-white">${u.name}</span>
              <span class="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">${u.age} سنة</span>
              <span class="text-slate-400 font-mono">${u.phone}</span>
            </div>
            <p class="text-slate-400">${u.church || "كنيسة قبطية أرثوذكسية"}</p>
          </div>

          <div class="flex items-center gap-2">
            ${active ? `
              <span class="px-2.5 py-1 rounded-lg text-[11px] font-bold ${active.status === 'needs_visitation' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}">
                مسار: ${active.trackName} (${active.points} درجة)
              </span>
            ` : `
              <span class="px-2.5 py-1 rounded-lg text-[11px] text-slate-400 bg-slate-800/80">بدون مسار نشط</span>
            `}
            <button onclick="app.quickAssignUser('${u.name}')" class="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold px-3 py-1.5 rounded-xl transition">
              توليد QR له
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  quickAssignUser(userName) {
    this.switchSupervisorTab('generator');
    document.getElementById('gen-user-name').value = userName;
  }

  openNewUserModal() {
    const name = prompt("أدخل اسم المخدوم بالكامل (سن 15+):");
    if (!name) return;
    const age = parseInt(prompt("أدخل سن المخدوم (يجب أن يكون 15 سنة فما فوق):"));
    if (isNaN(age) || age < 15) {
      alert("عفواً، لا يمكن تسجيل من هم دون سن 15 سنة.");
      return;
    }
    const phone = prompt("أدخل رقم الموبايل:") || "01000000000";
    const church = prompt("أدخل الكنيسة:") || "كنيسة قبطية أرثوذكسية";

    window.db.registerUser({ name, age, phone, church });
    this.populateSupervisorDropdowns();
    this.renderYouthDirectory();
    alert(`تم تسجيل ${name} بنجاح!`);
  }

  switchSupervisorTab(tabKey) {
    this.currentSupervisorTab = tabKey;
    ['generator', 'visitation', 'verses', 'youth', 'security'].forEach(k => {
      const btn = document.getElementById(`sup-tab-btn-${k}`);
      const content = document.getElementById(`sup-subtab-${k}`);
      if (k === tabKey) {
        if (btn) btn.className = 'sup-tab-btn active flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs md:text-sm font-bold transition flex items-center justify-center gap-2 bg-amber-500 text-slate-950';
        if (content) content.classList.remove('hidden');
      } else {
        if (btn) btn.className = 'sup-tab-btn relative flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs md:text-sm font-bold transition flex items-center justify-center gap-2 bg-slate-800 text-slate-300 hover:text-white';
        if (content) content.classList.add('hidden');
      }
    });

    if (tabKey === 'visitation') this.renderVisitationList();
    if (tabKey === 'verses') this.renderContentManager();
    if (tabKey === 'youth') this.renderYouthDirectory();
    if (tabKey === 'security') {
      const creds = window.db.getSupervisorCredentials();
      const input = document.getElementById('change-sup-gmail');
      if (input) input.value = creds.email;
    }
  }

  openSupervisorTab(tabKey) {
    const user = window.db.getCurrentUser();
    if (!user || !user.isSupervisor) {
      this.openLoginModal('supervisor');
    } else {
      this.showSupervisorView();
      this.switchSupervisorTab(tabKey);
    }
  }

  // ==========================================
  // MONTHLY LEADERBOARD & RANK ENGINE
  // ==========================================

  populateLeaderboardMonths() {
    const select = document.getElementById('leaderboard-month-select');
    if (!select) return;

    const allTracks = window.db.getUserTracks();
    const monthsSet = new Set();
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    monthsSet.add(currentMonth);

    allTracks.forEach(t => {
      if (t.monthYear) monthsSet.add(t.monthYear);
    });

    const monthsArr = Array.from(monthsSet).sort().reverse();

    select.innerHTML = monthsArr.map(m => {
      const [year, month] = m.split('-');
      const date = new Date(year, month - 1, 1);
      const label = date.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
      return `<option value="${m}" ${m === currentMonth ? 'selected' : ''}>${label}</option>`;
    }).join('');
  }

  setLeaderboardTrackFilter(trackKey) {
    this.leaderboardFilterTrack = trackKey;
    document.querySelectorAll('.leaderboard-tab-btn').forEach(btn => {
      const t = btn.getAttribute('data-track');
      if (t == trackKey) {
        btn.className = 'leaderboard-tab-btn active px-3.5 py-1.5 rounded-xl text-xs font-bold transition bg-amber-500 text-slate-950';
      } else {
        btn.className = 'leaderboard-tab-btn px-3.5 py-1.5 rounded-xl text-xs font-bold transition bg-slate-800/80 text-slate-300 hover:text-white';
      }
    });
    this.refreshLeaderboard();
  }

  refreshLeaderboard() {
    const monthSelect = document.getElementById('leaderboard-month-select');
    const selectedMonth = monthSelect ? monthSelect.value : null;

    const { leaderboard, totalParticipants, totalWahdasIssued } = window.db.getMonthlyRank(selectedMonth, this.leaderboardFilterTrack);

    this.renderPodium(leaderboard.slice(0, 3));
    this.renderLeaderboardList(leaderboard);
  }

  renderPodium(top3) {
    const container = document.getElementById('podium-container');
    if (!container) return;

    if (!top3 || top3.length === 0) {
      container.innerHTML = `
        <div class="col-span-3 text-center py-6 text-slate-400 text-xs">
          لا توجد بيانات مشاركين مسجلة لهذا الشهر في هذا المسار حتى الآن.
        </div>
      `;
      return;
    }

    const orderIndices = top3.length >= 3 ? [1, 0, 2] : (top3.length === 2 ? [1, 0] : [0]);

    container.innerHTML = orderIndices.map(idx => {
      const user = top3[idx];
      if (!user) return '';

      let crownIcon = '👑';
      let cardBg = 'bg-slate-900/60 border-slate-800';
      let rankText = `#${user.rank}`;

      if (user.rank === 1) {
        crownIcon = '🥇';
        cardBg = 'bg-gradient-to-b from-amber-500/20 via-slate-900/90 to-slate-950 border-amber-500/50 shadow-amber-500/20';
        rankText = 'المركز الأول';
      } else if (user.rank === 2) {
        crownIcon = '🥈';
        cardBg = 'bg-gradient-to-b from-slate-400/20 via-slate-900/90 to-slate-950 border-slate-400/40';
        rankText = 'المركز الثاني';
      } else if (user.rank === 3) {
        crownIcon = '🥉';
        cardBg = 'bg-gradient-to-b from-amber-800/20 via-slate-900/90 to-slate-950 border-amber-800/40';
        rankText = 'المركز الثالث';
      }

      return `
        <div class="glass-panel rounded-3xl p-5 border ${cardBg} flex flex-col items-center text-center space-y-3 relative overflow-hidden transform hover:-translate-y-1 transition duration-300">
          <div class="text-3xl">${crownIcon}</div>
          <div class="space-y-0.5">
            <span class="text-[10px] font-bold text-amber-300 tracking-wider">${rankText}</span>
            <h4 class="font-black text-base text-white">${user.userName}</h4>
            <span class="text-xs ${user.badgeColor} font-bold block">${user.badge}</span>
          </div>

          <div class="w-full bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 flex justify-around text-xs">
            <div>
              <span class="text-slate-400 block text-[10px]">إجمالي الدرجات</span>
              <b class="text-amber-400 text-sm font-black">${user.totalPoints}</b>
            </div>
            <div class="border-r border-slate-800"></div>
            <div>
              <span class="text-slate-400 block text-[10px]">عدد «واحدة»</span>
              <b class="text-white text-sm font-black">${user.totalWahdas}</b>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  renderLeaderboardList(usersList) {
    const container = document.getElementById('leaderboard-list');
    if (!container) return;

    if (usersList.length === 0) {
      container.innerHTML = `<p class="text-center py-4 text-xs text-slate-400">لا يوجد متسابقون متاحون.</p>`;
      return;
    }

    container.innerHTML = usersList.map(u => `
      <div class="p-3.5 rounded-2xl bg-slate-900/50 hover:bg-slate-800/60 border border-slate-800/80 flex items-center justify-between gap-3 text-xs transition">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl bg-slate-800 text-amber-300 flex items-center justify-center font-black text-xs border border-slate-700">
            ${u.rank}
          </div>
          <div>
            <h5 class="font-bold text-white text-sm">${u.userName}</h5>
            <span class="text-[11px] text-slate-400">${u.badge} • أخذ «واحدة» ${u.totalWahdas} مرات</span>
          </div>
        </div>

        <div class="text-left">
          <span class="text-sm font-black text-gold-gradient block">${u.totalPoints} درجة</span>
          <span class="text-[10px] text-slate-400">المجموع المعتمد</span>
        </div>
      </div>
    `).join('');
  }

  // ==========================================
  // HELPERS: SHARING & UTILITIES
  // ==========================================

  shareProgressWithServant(userName, trackName) {
    const text = `✝️ سلام ونعمة يا خادمي العزيز،\nأنا ${userName}، حبيت أشاركك التزامي في مسار [${trackName}] في تطبيق «اديني واحدة ⲙⲟⲓ ⲛⲏⲓ»:\n✓ قرأت التأمل اليومي\n✓ صليت بآيات المسار والشاهد\n✓ ملتزم بجهاد التوبة.\nأذكرني في صلاتك!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }

  copyVerse(verseText) {
    navigator.clipboard.writeText(verseText).then(() => {
      alert("تم نسخ الآية والشاهد للحافظة بنجاح!");
    }).catch(() => {
      prompt("انسخ الآية والشاهد:", verseText);
    });
  }

  openPhotoViewer() {
    document.getElementById('photo-viewer-modal').classList.remove('hidden');
  }

  promptPwaInstall() {
    if (this.deferredPwaPrompt) {
      this.deferredPwaPrompt.prompt();
      this.deferredPwaPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted PWA installation');
        }
        this.deferredPwaPrompt = null;
      });
    } else {
      document.getElementById('pwa-guide-modal').classList.remove('hidden');
    }
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.app = new AppController();
  window.app.init();
});
