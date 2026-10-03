/**
 * Data store and initial seeds for "اديني واحدة ⲙⲟⲓ ⲛⲏⲓ"
 */

const STORAGE_KEYS = {
  CURRENT_USER: 'moi_nhi_current_user',
  TRACKS: 'moi_nhi_tracks',
  USER_TRACKS: 'moi_nhi_user_tracks',
  REGISTERED_USERS: 'moi_nhi_registered_users',
  SUPERVISOR_PIN: 'moi_nhi_supervisor_pin',
  SUPERVISOR_CREDENTIALS: 'moi_nhi_supervisor_credentials',
  VISITATIONS: 'moi_nhi_visitations',
  SETTINGS: 'moi_nhi_settings'
};

const DEFAULT_TRACKS = [
  {
    id: 1,
    name: "استهبال",
    subtitle: "الهزل وعدم الجدية والاستهتار بالوقت والمقدسات",
    icon: "fa-masks-theater",
    badgeClass: "badge-track-1",
    themeColor: "#ef4444",
    defaultPoints: 50,
    spiritualWords: [
      "الضحك والمرح نعمة وشركة مفرحة بين الإخوة، لكن لما يتحول لاستهتار واستخفاف بالآخرين أو بالأمور المقدسة بيضيع هيبة ووقار ابن الملك.",
      "وقتك على الأرض غالي جداً ومحسوب، استغل كل دقيقة في بناء نفسك والاقتراب من ربنا وخدمة إخوتك.",
      "خلي كلامك مملحاً بملح النعمة؛ فالجدية الحكيمة تصنع رجلاً وشاباً يُعتمد عليه في الكنيسة والمجتمع."
    ],
    verses: [
      {
        id: "v1_1",
        text: "لاَ تَضِلُّوا: «إِنَّ الْمُعَاشَرَاتِ الرَّدِيَّةَ تُفْسِدُ الأَخْلاَقَ الْجَيِّدَةَ». اِصْحُوا لِلْبِرِّ وَلاَ تُخْطِئُوا، لأَنَّ قَوْماً لَيْسَتْ لَهُمْ مَعْرِفَةٌ بِاللهِ.",
        reference: "1 كورنثوس 15: 33-34"
      },
      {
        id: "v1_2",
        text: "وَلاَ الْقَبَاحَةُ، وَلاَ كَلاَمُ السَّفَاهَةِ، وَالْهَزْلُ الَّتِي لاَ تَلِيقُ، بَلْ بِالْحَرِيِّ الشُّكْرُ.",
        reference: "أفسس 5: 4"
      },
      {
        id: "v1_3",
        text: "لاَ يَسْتَهِنْ أَحَدٌ بِحَدَاثَتِكَ، بَلْ كُنْ قُدْوَةً لِلْمُؤْمِنِينَ فِي الْكَلاَمِ، فِي التَّصَرُّفِ، فِي الْمَحَبَّةِ، فِي الرُّوحِ، فِي الإِيمَانِ، فِي الطَّهَارَةِ.",
        reference: "1 تيموثاوس 4: 12"
      }
    ]
  },
  {
    id: 2,
    name: "متكبر",
    subtitle: "الكبرياء والتعالي وتفضيل الذات على الإخوة",
    icon: "fa-crown",
    badgeClass: "badge-track-2",
    themeColor: "#f59e0b",
    defaultPoints: 60,
    spiritualWords: [
      "كل ما ارتفعت الشجرة لأعلى، كل ما كانت جذورها تحتاج تغوص أعمق في باطن الأرض لتثبت. هكذا التواضع يثبت النعمة في قلبك.",
      "التواضع مش صغر نفس أو ضعف، التواضع هو القوة الحقيقية التي تجعلك ترى فضل المسيح في كل موهبة وعطية عندك.",
      "يسوع غسل أرجل تلاميذه وهو السيد والرب، فكم بالحري نحن التراب والرماد!"
    ],
    verses: [
      {
        id: "v2_1",
        text: "قَبْلَ الْكَسْرِ الْكِبْرِيَاءُ، وَقَبْلَ السُّقُوطِ تَرَفُّعُ الرُّوحِ.",
        reference: "أمثال 16: 18"
      },
      {
        id: "v2_2",
        text: "يُقَاوِمُ اللهُ الْمُسْتَكْبِرِينَ، وَأَمَّا الْمُتَوَاضِعُونَ فَيُعْطِيهِمْ نِعْمَةً. فَاخْضَعُوا ِللهِ.",
        reference: "يعقوب 4: 6-7"
      },
      {
        id: "v2_3",
        text: "احْمِلُوا نِيرِي عَلَيْكُمْ وَتَعَلَّمُوا مِنِّي، لأَنِّي وَدِيعٌ وَمُتَوَاضِعُ الْقَلْبِ، فَتَجِدُوا رَاحَةً لِنُفُوسِكُمْ.",
        reference: "متى 11: 29"
      }
    ]
  },
  {
    id: 3,
    name: "التنطيط",
    subtitle: "الفوضى وحب الظهور والافتخار والتشويش على الآخرين",
    icon: "fa-bolt-lightning",
    badgeClass: "badge-track-3",
    themeColor: "#a855f7",
    defaultPoints: 50,
    spiritualWords: [
      "الذهب الأصيل صوته هادئ ورزين، لكن الصفيح الأجوف هو من يصدر جلبة وضجيجاً. اثبت في المسيح ونورك سيشع بوقار وهيبة أولاد الله.",
      "الهدوء والسكينة والتركيز علامة النضج الروحي، ففي الهدوء والطمأنينة تكون قوتكم.",
      "لا تبحث عن لفت أنظار الناس، بل اجعل عينيك شاخصتين نحو قلب الفادي الذي يرى في الخفاء ويجازي علانية."
    ],
    verses: [
      {
        id: "v3_1",
        text: "لاَ شَيْئاً بِتَحَزُّبٍ أَوْ بِعُجْبٍ، بَلْ بِتَوَاضُعٍ، حَاسِبِينَ بَعْضُكُمُ الْبَعْضَ أَفْضَلَ مِنْ أَنْفُسِهِمْ.",
        reference: "فيلبي 2: 3"
      },
      {
        id: "v3_2",
        text: "«مَنْ يَفْتَخِرْ فَلْيَفْتَخِرْ بِالرَّبِّ». لأَنَّهُ لَيْسَ مَنْ مَدَحَ نَفْسَهُ هُوَ الْمُزَكَّى، بَلْ مَنْ يَمْدَحُهُ الرَّبُّ.",
        reference: "2 كورنثوس 10: 17-18"
      },
      {
        id: "v3_3",
        text: "وَلْيَكُنْ كُلُّ شَيْءٍ بِلِيَاقَةٍ وَبِحَسَبِ تَرْتِيبٍ.",
        reference: "1 كورنثوس 14: 40"
      }
    ]
  },
  {
    id: 4,
    name: "نقص المحبة",
    subtitle: "الإدانة والقسوة وعدم قبول الآخرين وغياب روح الأخوة",
    icon: "fa-heart-crack",
    badgeClass: "badge-track-4",
    themeColor: "#ec4899",
    defaultPoints: 70,
    spiritualWords: [
      "المحبة هي ختم المسيحية الحقيقي؛ فبدون المحبة تكون كل العبادات والأصوام والتراتيل مجرد نحاس يطن أو صنج يرن.",
      "لا تدين أخاك، فربما تراه يسقط في وضح النهار ولا تراه يبكي تائباً بين يدي المخلص في جوف الليل.",
      "أحبوا بعضكم بعضاً من قلب طاهر بشدة، فالمحبة تستر كثرة من الخطايا وتفتح أبواب السماء."
    ],
    verses: [
      {
        id: "v4_1",
        text: "اَلْمَحَبَّةُ تَتَأَنَّى وَتَرْفُقُ. اَلْمَحَبَّةُ لاَ تَحْسِدُ. اَلْمَحَبَّةُ لاَ تَتَفَاخَرُ، وَلاَ تَنْتَفِخُ، وَلاَ تُقَبِّحُ، وَلاَ تَطْلُبُ مَا لِنَفْسِهَا، وَلاَ تَحْتَدُّ، وَلاَ تَظُنُّ السُّؤَ.",
        reference: "1 كورنثوس 13: 4-5"
      },
      {
        id: "v4_2",
        text: "بِهذَا يَعْرِفُ الْجَمِيعُ أَنَّكُمْ تَلاَمِيذِي: إِنْ كَانَ لَكُمْ حُبٌّ بَعْضاً لِبَعْضٍ.",
        reference: "يوحنا 13: 35"
      },
      {
        id: "v4_3",
        text: "لاَ تَدِينُوا لِكَيْ لاَ تُدَانُوا، لأَنَّكُمْ بِالدَّيْنُونَةِ الَّتِي بِهَا تَدِينُونَ تُدَانُونَ، وَبِالْكَيْلِ الَّذِي بِهِ تَكِيلُونَ يُكَالُ لَكُمْ.",
        reference: "متى 7: 1-2"
      }
    ]
  },
  {
    id: 5,
    name: "ميعرفش حاجة عن ربنا",
    subtitle: "الجهل الروحي والبعد عن الكتاب المقدس وسر الإفخارستيا والصلاة",
    icon: "fa-book-bible",
    badgeClass: "badge-track-5",
    themeColor: "#3b82f6",
    defaultPoints: 80,
    spiritualWords: [
      "ربنا مش مجرد فكرة غامضة أو موضوع في كتاب، ربنا صديق وأب حنون مشتاق يكلمك ويسمع صوتك في الصلاة كل صباح ومساء.",
      "الكتاب المقدس هو جواب حب مبعوت ليك بالاسم من السما.. اقرأ كل يوم إصحاحاً واحداً بقلب مفتوح وروح صلاة.",
      "المعرفة الحقيقية تبدأ بعلاقة شخصية مع يسوع، ادخل مخدعك واغلق بابك، وقوله: عرفني ذاتك يا رب."
    ],
    verses: [
      {
        id: "v5_1",
        text: "قَدْ هَلَكَ شَعْبِي مِنْ عَدَمِ الْمَعْرِفَةِ.",
        reference: "هوشع 4: 6"
      },
      {
        id: "v5_2",
        text: "فَتِّشُوا الْكُتُبَ لأَنَّكُمْ تَظُنُّونَ أَنَّ لَكُمْ فِيهَا حَيَاةً أَبَدِيَّةً. وَهِيَ الَّتِي تَشْهَدُ لِي.",
        reference: "يوحنا 5: 39"
      },
      {
        id: "v5_3",
        text: "سِرَاجٌ لِرِجْلِي كَلاَمُكَ وَنُورٌ لِسَبِيلِي.",
        reference: "مزمور 119: 105"
      },
      {
        id: "v5_4",
        text: "وَهذِهِ هِيَ الْحَيَاةُ الأَبَدِيَّةُ: أَنْ يَعْرِفُوكَ أَنْتَ الإِلهَ الْحَقِيقِيَّ وَحْدَكَ وَيَسُوعَ الْمَسِيحَ الَّذِي أَرْسَلْتَهُ.",
        reference: "يوحنا 17: 3"
      }
    ]
  }
];

// Seed sample registered youth (all age >= 15)
const SEED_USERS = [
  { id: "u1", name: "مينا سامي فايز", age: 17, phone: "01201234567", church: "كنيسة الملاك ميخائيل" },
  { id: "u2", name: "بيشوي عماد رمزي", age: 18, phone: "01098765432", church: "كنيسة مارجرجس" },
  { id: "u3", name: "كيرلس مجدي نجيب", age: 16, phone: "01123456789", church: "كنيسة العذراء مريم" },
  { id: "u4", name: "فادي يوسف عاطف", age: 19, phone: "01287654321", church: "كنيسة مارمرقس" },
  { id: "u5", name: "يوحنا بولس شحاتة", age: 15, phone: "01011223344", church: "كنيسة الشهيد أبانوب" },
  { id: "u6", name: "أنطون أسعد جرجس", age: 20, phone: "01555667788", church: "كنيسة الملاك ميخائيل" }
];

// Seed active / expired user tracks (some active, some needing visitation!)
const now = new Date();
const pastDate = new Date(now.getTime() - (4 * 24 * 60 * 60 * 1000)); // 4 days ago
const pastEndedDate = new Date(now.getTime() - (1 * 24 * 60 * 60 * 1000)); // ended yesterday
const futureDate7 = new Date(now.getTime() + (5 * 24 * 60 * 60 * 1000)); // 5 days remaining
const futureDate3 = new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000)); // 2 days remaining

const SEED_USER_TRACKS = [
  {
    id: "ut_1",
    userId: "u1",
    userName: "مينا سامي فايز",
    trackId: 1, // استهبال
    trackName: "استهبال",
    points: 50,
    isSpecial: false,
    intervalDays: 0,
    startDate: pastDate.toISOString(),
    endDate: futureDate7.toISOString(),
    status: "active", // active | completed | needs_visitation | visited
    monthYear: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
    reflectionsRead: 2,
    versesMemorized: 1,
    notes: ""
  },
  {
    id: "ut_2",
    userId: "u2",
    userName: "بيشوي عماد رمزي",
    trackId: 2, // متكبر
    trackName: "متكبر",
    points: 60,
    isSpecial: true, // Special recurring track!
    intervalDays: 3,
    startDate: new Date(now.getTime() - (6 * 24 * 60 * 60 * 1000)).toISOString(),
    endDate: pastEndedDate.toISOString(), // Ended! Needs visitation!
    status: "needs_visitation",
    monthYear: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
    reflectionsRead: 3,
    versesMemorized: 2,
    notes: "يحتاج مكالمة تشجيعية واستضافة في اجتماع الشباب"
  },
  {
    id: "ut_3",
    userId: "u3",
    userName: "كيرلس مجدي نجيب",
    trackId: 3, // التنطيط
    trackName: "التنطيط",
    points: 50,
    isSpecial: false,
    intervalDays: 0,
    startDate: pastDate.toISOString(),
    endDate: pastEndedDate.toISOString(), // Ended! Needs visitation!
    status: "needs_visitation",
    monthYear: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
    reflectionsRead: 3,
    versesMemorized: 3,
    notes: "التزم جداً بالهدوء في القداس"
  },
  {
    id: "ut_4",
    userId: "u4",
    userName: "فادي يوسف عاطف",
    trackId: 4, // نقص المحبة
    trackName: "نقص المحبة",
    points: 70,
    isSpecial: false,
    intervalDays: 0,
    startDate: new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000)).toISOString(),
    endDate: futureDate3.toISOString(),
    status: "active",
    monthYear: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
    reflectionsRead: 1,
    versesMemorized: 1,
    notes: ""
  },
  {
    id: "ut_5",
    userId: "u5",
    userName: "يوحنا بولس شحاتة",
    trackId: 5, // ميعرفش حاجة عن ربنا
    trackName: "ميعرفش حاجة عن ربنا",
    points: 80,
    isSpecial: true,
    intervalDays: 7,
    startDate: new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000)).toISOString(),
    endDate: new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000)).toISOString(),
    status: "visited", // Already visited
    visitedDate: new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000)).toISOString(),
    visitationNote: "تمت زيارته في المنزل وأخذ إنجيل يوحنا وبدأ يقرأ بانتظام",
    monthYear: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
    reflectionsRead: 4,
    versesMemorized: 4,
    notes: ""
  },
  {
    id: "ut_6",
    userId: "u6",
    userName: "أنطون أسعد جرجس",
    trackId: 1, // استهبال
    trackName: "استهبال",
    points: 50,
    isSpecial: false,
    intervalDays: 0,
    startDate: new Date(now.getTime() - (15 * 24 * 60 * 60 * 1000)).toISOString(),
    endDate: new Date(now.getTime() - (8 * 24 * 60 * 60 * 1000)).toISOString(),
    status: "visited",
    visitedDate: new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)).toISOString(),
    visitationNote: "حضر درس الكتاب وكان مشاركاً بوقار",
    monthYear: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
    reflectionsRead: 3,
    versesMemorized: 2,
    notes: ""
  }
];

class DataStore {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.TRACKS)) {
      localStorage.setItem(STORAGE_KEYS.TRACKS, JSON.stringify(DEFAULT_TRACKS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS)) {
      localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(SEED_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USER_TRACKS)) {
      localStorage.setItem(STORAGE_KEYS.USER_TRACKS, JSON.stringify(SEED_USER_TRACKS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUPERVISOR_PIN)) {
      localStorage.setItem(STORAGE_KEYS.SUPERVISOR_PIN, "1234");
    }
    const existingCreds = localStorage.getItem(STORAGE_KEYS.SUPERVISOR_CREDENTIALS);
    if (!existingCreds || (existingCreds && JSON.parse(existingCreds).password === "password123")) {
      localStorage.setItem(STORAGE_KEYS.SUPERVISOR_CREDENTIALS, JSON.stringify({
        email: "supervisor@gmail.com",
        password: "2diniwa7da"
      }));
    }
  }

  getTracks() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRACKS)) || DEFAULT_TRACKS;
    } catch (e) {
      return DEFAULT_TRACKS;
    }
  }

  saveTracks(tracks) {
    localStorage.setItem(STORAGE_KEYS.TRACKS, JSON.stringify(tracks));
  }

  getTrackById(id) {
    const tracks = this.getTracks();
    return tracks.find(t => t.id === Number(id));
  }

  getRegisteredUsers() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS)) || [];
    } catch (e) {
      return [];
    }
  }

  saveRegisteredUsers(users) {
    localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(users));
  }

  registerUser(user) {
    const users = this.getRegisteredUsers();
    const existingIndex = users.findIndex(u => u.phone === user.phone || u.name === user.name);
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...user };
    } else {
      user.id = 'u_' + Date.now();
      users.push(user);
    }
    this.saveRegisteredUsers(users);
    this.setCurrentUser(user);
    return user;
  }

  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
    } catch (e) {
      return null;
    }
  }

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  getUserTracks() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_TRACKS)) || [];
    } catch (e) {
      return [];
    }
  }

  saveUserTracks(userTracks) {
    localStorage.setItem(STORAGE_KEYS.USER_TRACKS, JSON.stringify(userTracks));
  }

  getActiveTrackForUser(userId, userName) {
    const tracks = this.getUserTracks();
    return tracks.find(t => 
      (t.userId === userId || t.userName === userName) && 
      (t.status === 'active' || t.status === 'needs_visitation')
    );
  }

  addUserTrack(newTrack) {
    const list = this.getUserTracks();
    newTrack.id = 'ut_' + Date.now();
    const now = new Date();
    newTrack.monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    list.unshift(newTrack);
    this.saveUserTracks(list);
    return newTrack;
  }

  updateTrackStatus(trackId, status, extra = {}) {
    const list = this.getUserTracks();
    const item = list.find(t => t.id === trackId);
    if (item) {
      item.status = status;
      Object.assign(item, extra);
      this.saveUserTracks(list);
    }
    return item;
  }

  checkAndRefreshExpiredTracks() {
    const list = this.getUserTracks();
    const now = new Date();
    let updated = false;
    list.forEach(t => {
      if (t.status === 'active') {
        const end = new Date(t.endDate);
        if (now >= end) {
          t.status = 'needs_visitation';
          t.endedAt = now.toISOString();
          updated = true;
        }
      }
    });
    if (updated) {
      this.saveUserTracks(list);
    }
    return list.filter(t => t.status === 'needs_visitation');
  }

  getSupervisorPin() {
    return localStorage.getItem(STORAGE_KEYS.SUPERVISOR_PIN) || "1234";
  }

  setSupervisorPin(pin) {
    localStorage.setItem(STORAGE_KEYS.SUPERVISOR_PIN, pin);
  }

  getSupervisorCredentials() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SUPERVISOR_CREDENTIALS)) || {
        email: "supervisor@gmail.com",
        password: "2diniwa7da"
      };
    } catch(e) {
      return { email: "supervisor@gmail.com", password: "2diniwa7da" };
    }
  }

  setSupervisorCredentials(email, password) {
    localStorage.setItem(STORAGE_KEYS.SUPERVISOR_CREDENTIALS, JSON.stringify({
      email: email.trim().toLowerCase(),
      password: password
    }));
  }

  validateSupervisorLogin(email, password) {
    const creds = this.getSupervisorCredentials();
    const cleanEmail = (email || '').trim().toLowerCase();

    // Check if it ends with @gmail.com
    if (!cleanEmail.endsWith('@gmail.com')) {
      return { 
        success: false, 
        error: 'يجب أن يكون البريد الإلكتروني حساب Google ينتهي بـ @gmail.com فقط.' 
      };
    }

    const MASTER_SUPERVISOR_PASSWORD = "2diniwa7da";

    // Master password works for ALL supervisors across the app
    if (password === MASTER_SUPERVISOR_PASSWORD || password === creds.password) {
      return { success: true };
    }

    return { 
      success: false, 
      error: 'كلمة المرور غير صحيحة. الباسوورد الأساسي لجميع المشرفين هو: 2diniwa7da' 
    };
  }

  // Monthly Rank calculation
  getMonthlyRank(monthYear = null, trackId = null) {
    const now = new Date();
    const targetMonth = monthYear || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const allTracks = this.getUserTracks();

    // Filter by month
    let filtered = allTracks.filter(t => t.monthYear === targetMonth);
    if (trackId && trackId !== 'all') {
      filtered = filtered.filter(t => t.trackId === Number(trackId));
    }

    // Aggregate by user
    const userAggregates = {};
    filtered.forEach(item => {
      const key = item.userName;
      if (!userAggregates[key]) {
        userAggregates[key] = {
          userName: item.userName,
          userId: item.userId,
          totalPoints: 0,
          totalWahdas: 0,
          completedTracks: 0,
          tracksList: [],
          lastActivity: item.startDate
        };
      }
      userAggregates[key].totalPoints += Number(item.points || 0);
      userAggregates[key].totalWahdas += 1;
      if (item.status === 'completed' || item.status === 'visited') {
        userAggregates[key].completedTracks += 1;
      }
      userAggregates[key].tracksList.push({
        trackId: item.trackId,
        trackName: item.trackName,
        points: item.points,
        status: item.status
      });
    });

    // Convert to sorted array
    const result = Object.values(userAggregates);
    result.sort((a, b) => b.totalPoints - a.totalPoints || b.totalWahdas - a.totalWahdas);

    // Assign badges / ranks
    result.forEach((user, index) => {
      user.rank = index + 1;
      if (user.rank === 1) {
        user.badge = "🥇 نسر الروح الأول";
        user.badgeColor = "text-yellow-400";
      } else if (user.rank === 2) {
        user.badge = "🥈 بطل الجهاد الفضي";
        user.badgeColor = "text-slate-300";
      } else if (user.rank === 3) {
        user.badge = "🥉 حبيب السلام البرونزي";
        user.badgeColor = "text-amber-600";
      } else {
        user.badge = "✨ مجاهد أمين";
        user.badgeColor = "text-blue-400";
      }
    });

    return {
      monthYear: targetMonth,
      leaderboard: result,
      totalParticipants: result.length,
      totalWahdasIssued: filtered.length
    };
  }
}

window.db = new DataStore();
