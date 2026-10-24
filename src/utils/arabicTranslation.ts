/**
 * Automatic Arabic translation & term generator for CCTV, IT infrastructure, 
 * security systems, and commercial quotations in Saudi Arabia (ZATCA compliance & commercial standards).
 */

const EXACT_PHRASES: { pattern: RegExp; arabic: string }[] = [
  // Surveillance & CCTV Cameras
  {
    pattern: /hikvision.*8mp.*bullet/i,
    arabic: 'كاميرا مراقبة هيكفيجن 8 ميجابكسل 4K أسطوانية بوليت خارجية'
  },
  {
    pattern: /hikvision.*8mp.*dome/i,
    arabic: 'كاميرا مراقبة هيكفيجن 8 ميجابكسل 4K قبة دوم داخلية مضادة للكسر'
  },
  {
    pattern: /hikvision.*4mp.*bullet/i,
    arabic: 'كاميرا مراقبة هيكفيجن 4 ميجابكسل أسطوانية بوليت خارجية'
  },
  {
    pattern: /hikvision.*4mp.*dome/i,
    arabic: 'كاميرا مراقبة هيكفيجن 4 ميجابكسل قبة دوم داخلية'
  },
  {
    pattern: /dahua.*8mp.*bullet/i,
    arabic: 'كاميرا مراقبة داهوا 8 ميجابكسل 4K أسطوانية بوليت'
  },
  {
    pattern: /dahua.*8mp.*dome/i,
    arabic: 'كاميرا مراقبة داهوا 8 ميجابكسل 4K قبة دوم داخلية'
  },
  {
    pattern: /ptz.*camera|speed dome/i,
    arabic: 'كاميرا مراقبة متحركة PTZ زووم بصري 360 درجة'
  },

  // Recorders
  {
    pattern: /32-channel.*nvr|32ch.*nvr/i,
    arabic: 'جهاز تسجيل شبكي NVR سعة 32 قناة بدقة 4K فائقة'
  },
  {
    pattern: /16-channel.*nvr|16ch.*nvr/i,
    arabic: 'جهاز تسجيل شبكي NVR سعة 16 قناة بدقة 4K'
  },
  {
    pattern: /8-channel.*nvr|8ch.*nvr/i,
    arabic: 'جهاز تسجيل شبكي NVR سعة 8 قنوات بدقة 4K'
  },
  {
    pattern: /64-channel.*nvr|64ch.*nvr/i,
    arabic: 'جهاز تسجيل شبكي NVR سعة 64 قناة للمنشآت والمشاريع الكبرى'
  },
  {
    pattern: /16-channel.*dvr|16ch.*dvr/i,
    arabic: 'جهاز تسجيل دي في ار DVR سعة 16 قناة'
  },

  // Hard Drives
  {
    pattern: /western digital.*purple.*8tb|wd.*purple.*8tb/i,
    arabic: 'قرص صلب ويسترن ديجيتال بيربل 8 تيرابايت للمراقبة المستمرة 24/7'
  },
  {
    pattern: /western digital.*purple.*4tb|wd.*purple.*4tb/i,
    arabic: 'قرص صلب ويسترن ديجيتال بيربل 4 تيرابايت للمراقبة المستمرة 24/7'
  },
  {
    pattern: /western digital.*purple.*6tb|wd.*purple.*6tb/i,
    arabic: 'قرص صلب ويسترن ديجيتال بيربل 6 تيرابايت للمراقبة المستمرة 24/7'
  },
  {
    pattern: /seagate.*skyhawk.*8tb/i,
    arabic: 'قرص صلب سيجيت سكاي هوك 8 تيرابايت مخصص للمراقبة 24/7'
  },

  // Cables & Networking
  {
    pattern: /cat6.*cable|cat6.*ftp|cat6.*roll/i,
    arabic: 'لفة كيبل شبكة كات 6 نحاس نقي مقاوم للشمس والحرارة 305م'
  },
  {
    pattern: /cat6a.*cable/i,
    arabic: 'لفة كيبل شبكة كات 6A محمي عالي السرعة 10G'
  },
  {
    pattern: /24-port.*poe.*switch/i,
    arabic: 'موزع شبكة 24 منفذ PoE جيجابت مع منافذ فايبر SFP'
  },
  {
    pattern: /16-port.*poe.*switch/i,
    arabic: 'موزع شبكة 16 منفذ PoE جيجابت'
  },
  {
    pattern: /8-port.*poe.*switch/i,
    arabic: 'موزع شبكة 8 منافذ PoE جيجابت'
  },
  {
    pattern: /server rack|network cabinet|42u|24u|12u|9u/i,
    arabic: 'كابينة سيرفر وشبكات راك مع مراوح ووحدة توزيع طاقة PDU'
  },

  // Access Control & Biometrics
  {
    pattern: /face recognition.*terminal|facial attendance/i,
    arabic: 'جهاز بصمة حضور وانصراف والتعرف على الوجه الذكي'
  },
  {
    pattern: /fingerprint.*attendance/i,
    arabic: 'جهاز بصمة إصبع وبطاقات ذكية للحضور والانصراف'
  },
  {
    pattern: /magnetic lock|door access control/i,
    arabic: 'نظام قفل مغناطيسي للأبواب والتحكم بالدخول الذكي'
  },
  {
    pattern: /turnstile|barrier gate/i,
    arabic: 'بوابات مرور المشاة الذكية مع قارئ البصمة والكروت'
  },

  // Installation & Services
  {
    pattern: /cctv.*installation|cable laying/i,
    arabic: 'أعمال تمديد الكيابل والمواسير وتركيب وبرمجة كاميرات المراقبة'
  },
  {
    pattern: /compliance testing.*certificate|moi|civil defense/i,
    arabic: 'فحص واختبار النظام وإصدار شهادة مطابقة معتمدة للأمن العام والدفاع المدني'
  },
  {
    pattern: /maintenance.*contract|amc/i,
    arabic: 'عقد صيانة دورية سنوي شامل الدعم الفني والزيارات الوقائية'
  },
  {
    pattern: /fiber optic.*splicing/i,
    arabic: 'أعمال لحام واختبار كابلات الألياف البصرية فايبر أوبتيك'
  },
  {
    pattern: /power supply.*12v/i,
    arabic: 'محول طاقة مركزي 12 فولت لكاميرات المراقبة'
  },
  {
    pattern: /ups.*power backup/i,
    arabic: 'مزود طاقة احتياطي UPS بدون انقطاع لحماية الأجهزة'
  },
  {
    pattern: /display monitor|led monitor|surveillance screen/i,
    arabic: 'شاشة عرض LED احترافية للمراقبة المستمرة بدقة عالية'
  }
];

const TERM_MAP: Record<string, string> = {
  // Brands
  'hikvision': 'هيكفيجن',
  'dahua': 'داهوا',
  'cisco': 'سيسكو',
  'ruijie': 'رويجي',
  'schneider': 'شنايدر',
  'western digital': 'ويسترن ديجيتال',
  'wd': 'ويسترن ديجيتال',
  'seagate': 'سيجيت',
  'samsung': 'سامسونج',
  'dell': 'ديل',
  'hp': 'اتش بي',
  'ubiquiti': 'يوبيكويتي',
  'tp-link': 'تي بي لينك',
  'uniview': 'يوني فيو',

  // Cameras & Video
  'camera': 'كاميرا',
  'cameras': 'كاميرات مراقبة',
  'cctv': 'مراقبة أمنية',
  'ip camera': 'كاميرا شبكية IP',
  'bullet': 'أسطوانية بوليت',
  'dome': 'قبة دوم',
  'ptz': 'متحركة PTZ',
  'turret': 'قبة توريت',
  'lens': 'عدسة',
  '4k': 'بدقة 4K',
  '8mp': '8 ميجابكسل',
  '5mp': '5 ميجابكسل',
  '4mp': '4 ميجابكسل',
  '2mp': '2 ميجابكسل',
  '1080p': 'فول اتش دي 1080p',
  'night vision': 'رؤية ليلية',
  'darkfighter': 'تصوير ليلي متطور',
  'colorvu': 'تصوير ليلي ملون 24/7',
  'acusense': 'ذكاء اصطناعي',
  'ai': 'بالذكاء الاصطناعي',
  'weatherproof': 'مقاومة للعوامل الجوية IP67',
  'vandal-proof': 'مضادة للتخريب IK10',
  'audio': 'مع ميكروفون مدمج',
  'mic': 'ميكروفون صوتي',

  // Recorders & Storage
  'nvr': 'جهاز تسجيل شبكي NVR',
  'dvr': 'جهاز تسجيل DVR',
  'recorder': 'جهاز تسجيل',
  '32ch': '32 قناة',
  '16ch': '16 قناة',
  '8ch': '8 قنوات',
  '4ch': '4 قنوات',
  'channel': 'قنوات',
  'hdd': 'قرص صلب',
  'hard drive': 'قرص صلب',
  'purple': 'بيربل للمراقبة',
  'skyhawk': 'سكاي هوك',
  '8tb': '8 تيرابايت',
  '6tb': '6 تيرابايت',
  '4tb': '4 تيرابايت',
  '2tb': '2 تيرابايت',
  '1tb': '1 تيرابايت',

  // Networking
  'cable': 'كيبل',
  'cat6': 'كات 6',
  'cat6a': 'كات 6A',
  'ftp': 'محمي FTP',
  'utp': 'بدون شيلد UTP',
  'copper': 'نحاس نقي',
  'switch': 'موزع شبكة (سويتش)',
  'poe': 'تغذية شبكية PoE',
  'gigabit': 'جيجابت سريع',
  'managed': 'مُدار',
  'fiber': 'ألياف بصرية (فايبر)',
  'patch cord': 'وصلة شبكة باتش كورد',
  'patch panel': 'لوحة توزيع شبكة',
  'keystone': 'مقبس شبكة كيستون',
  'rack': 'كابينة راك',
  'cabinet': 'كابينة شبكات',
  'pdu': 'وحدة توزيع طاقة',
  'router': 'راوتر',
  'access point': 'نقطة اتصال لاسلكي واي فاي',
  'wifi': 'واي فاي',

  // Access Control
  'face': 'التعرف على الوجه',
  'biometric': 'بصمة ذكية',
  'fingerprint': 'بصمة الإصبع',
  'attendance': 'حضور وانصراف',
  'access control': 'تحكم في الأبواب',
  'lock': 'قفل كهربائي',
  'magnetic': 'مغناطيسي',
  'card': 'بطاقات ذكية',
  'rfid': 'بطاقات RFID',
  'turnstile': 'بوابة مرور ذكية',
  'barrier': 'بوابة حاجز سيارات',

  // Electrical & Accessories
  'power supply': 'محول طاقة',
  'adapter': 'محول كهرباء',
  'ups': 'مزود طاقة احتياطي UPS',
  'battery': 'بطارية',
  'conduit': 'مواسير حماية',
  'pvc': 'مواسير بلاستيك PVC',
  'emt': 'مواسير حديد EMT',
  'bracket': 'حامل تثبيت',
  'mount': 'قاعدة تثبيت جدارية',
  'monitor': 'شاشة عرض LED',
  'screen': 'شاشة عرض',
  'hdmi': 'كيبل HDMI عالي الدقة',
  'connector': 'موصل',
  'bnc': 'موصل BNC',
  'rj45': 'كونكتر شبكة RJ45',

  // Services & Work
  'installation': 'أعمال التركيب والتمديد',
  'laying': 'تمديد وتمرير الكيابل',
  'mounting': 'تثبيت وتركيب',
  'configuration': 'البرمجة وضبط الإعدادات',
  'programming': 'البرمجة والتهيئة',
  'testing': 'الفحص والاختبار وضبط الزوايا',
  'commissioning': 'التشغيل وتسليم المشروع',
  'maintenance': 'عقد صيانة ودعم فني',
  'amc': 'عقد صيانة سنوي معتمد',
  'certificate': 'شهادة مطابقة رسمية معتمدة',
  'moi': 'مطابق لاشتراطات الأمن العام',
  'civil defense': 'معتمد للدفاع المدني',
  'labor': 'أجور يد فنية متخصصة',
  'warranty': 'ضمان رسمي شامل',
  'service': 'خدمة فنية',
  'supply': 'توريد وتوصيل',
  'delivery': 'التوصيل لموقع المشروع'
};

/**
 * Automatically translates or generates an appropriate Arabic title for a product/service.
 */
export function getAutoArabicName(englishName: string, customArabicName?: string): string {
  if (customArabicName && customArabicName.trim()) {
    return customArabicName.trim();
  }

  if (!englishName || !englishName.trim()) {
    return '';
  }

  const cleanEng = englishName.trim();

  // 1. Check exact phrase patterns first
  for (const match of EXACT_PHRASES) {
    if (match.pattern.test(cleanEng)) {
      return match.arabic;
    }
  }

  const lower = cleanEng.toLowerCase();

  // 2. Keyword detection & composition
  const translatedWords: string[] = [];
  const addedConcepts = new Set<string>();

  // Check multi-word keys first
  const multiWordKeys = Object.keys(TERM_MAP).filter(k => k.includes(' '));
  multiWordKeys.sort((a, b) => b.length - a.length);

  for (const mw of multiWordKeys) {
    if (lower.includes(mw)) {
      const arabic = TERM_MAP[mw];
      if (!addedConcepts.has(arabic)) {
        translatedWords.push(arabic);
        addedConcepts.add(arabic);
      }
    }
  }

  // Check single-word terms
  const singleKeys = Object.keys(TERM_MAP).filter(k => !k.includes(' '));
  // Priority order: Category (camera/nvr/switch) then specs (8mp/poe/etc.)
  for (const sk of singleKeys) {
    // word boundary check or substring
    const regex = new RegExp(`\\b${sk}\\b`, 'i');
    if (regex.test(lower)) {
      const arabic = TERM_MAP[sk];
      if (!addedConcepts.has(arabic)) {
        translatedWords.push(arabic);
        addedConcepts.add(arabic);
      }
    }
  }

  if (translatedWords.length > 0) {
    return translatedWords.join(' ');
  }

  // Default professional fallback
  return `توريد وتركيب: ${cleanEng}`;
}
