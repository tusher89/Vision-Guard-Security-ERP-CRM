import { Client, CompanyProfile, ProductItem, Quotation } from '../types';
import { numberToWords } from './numberToWords';
import { getAutoArabicName } from './arabicTranslation';

const STORAGE_KEYS = {
  COMPANY: 'apex_erp_company_profile',
  CLIENTS: 'apex_erp_clients',
  PRODUCTS: 'apex_erp_products',
  QUOTATIONS: 'apex_erp_quotations',
  NEXT_QT_NUMBER: 'apex_erp_next_quotation_seq',
};

export const DEFAULT_COMPANY: CompanyProfile = {
  name: 'Vision Guard Security',
  tagline: 'Advanced CCTV Surveillance & Electronic Security Systems',
  email: 'securetechtusher@gmail.com',
  phone: '+966 50 789 1234 / +966 12 654 3210',
  address: '7663-7713 Khaled Bin Waleed',
  city: 'Al Sharafeyah, Jeddah 23218',
  country: 'Saudi Arabia',
  website: 'www.visionguard-sa.com',
  taxId: 'CR: 403012389 | VAT: 310128956700003',
  currencySymbol: 'SAR',
  currencyCode: 'SAR',
  logoUrl: '',
  bankName: 'Al Rajhi Bank (مصرف الراجحي)',
  accountName: 'Vision Guard Security Establishment',
  accountNumber: 'SA4280000123608010123456',
  branchName: 'Al Sharafeyah Branch, Jeddah',
  routingNumber: 'RJHI SA RI',
  swiftCode: 'RJHISARI',
  defaultTerms: [
    'Quotation validity is 30 (thirty) days from the date of issue.',
    'All prices are subject to 15% VAT in accordance with ZATCA (Zakat, Tax and Customs Authority) regulations.',
    'Payment terms: 50% advance upon formal Purchase Order (PO), 50% upon supply, testing, and handover.',
    'Warranty: 2 (two) years comprehensive hardware warranty on CCTV cameras, NVRs, and power supplies.',
    'Civil conduits, structured cabling, and camera mounting as per MOI / Civil Defense security standards.'
  ],
  defaultNotes: 'Thank you for giving Vision Guard Security the opportunity to submit this proposal. All proposed equipment meets Saudi Ministry of Interior (MOI) and HCIS technical specifications.',
  authorizedSignatoryName: 'Tusher Ahmed',
  authorizedSignatoryTitle: 'General Manager / Head of Projects'
};

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-001',
    name: 'Eng. Abdullah Al-Ghamdi',
    companyName: 'Al-Andalus Commercial Plaza',
    email: 'procurement@alandalus-plaza.sa',
    phone: '+966 54 321 8765',
    address: 'King Fahd Road, Al-Andalus District',
    city: 'Jeddah',
    taxId: 'CR: 4030284711 | VAT: 300184920400003',
    contactPerson: 'Eng. Abdullah Al-Ghamdi (Facilities Director)',
    notes: 'Commercial mall with 64 IP CCTV points and perimeter intrusion detection.',
    createdAt: '2026-10-01'
  },
  {
    id: 'cli-002',
    name: 'Sultan Al-Harbi',
    companyName: 'Red Sea Logistics & Warehousing Hub',
    email: 'operations@redsealogistics.com.sa',
    phone: '+966 56 987 1122',
    address: 'Jeddah Islamic Port Industrial Zone',
    city: 'Jeddah',
    taxId: 'CR: 4030198273 | VAT: 310928374600003',
    contactPerson: 'Sultan Al-Harbi (Operations Head)',
    notes: 'High-bay warehouse security and automated license plate recognition (ALPR).',
    createdAt: '2026-10-05'
  },
  {
    id: 'cli-003',
    name: 'Dr. Tariq Al-Shehri',
    companyName: 'Al-Hamra Specialized Medical Complex',
    email: 'admin@alhamra-medical.sa',
    phone: '+966 50 445 6677',
    address: 'Palestine Street, Al-Hamra District',
    city: 'Jeddah',
    taxId: 'CR: 4030332190 | VAT: 302019485700003',
    contactPerson: 'Dr. Tariq Al-Shehri (Executive Director)',
    notes: 'Access control and pharmacy surveillance system.',
    createdAt: '2026-10-08'
  },
  {
    id: 'cli-004',
    name: 'Fahad Al-Otaibi',
    companyName: 'Al-Rawdah Business Center',
    email: 'management@rawdahcenter.sa',
    phone: '+966 55 112 3344',
    address: 'Prince Sultan Road, Al-Rawdah',
    city: 'Jeddah',
    contactPerson: 'Fahad Al-Otaibi',
    notes: 'Smart video intercom and biometric turnstiles.',
    createdAt: '2026-10-11'
  }
];

export const INITIAL_PRODUCTS: ProductItem[] = [];

export const INITIAL_QUOTATIONS: Quotation[] = [
  {
    id: 'qt-1001',
    quotationNumber: 'VG-QT-2026-0041',
    reference: '4K IP Security Surveillance & Video Recording System Installation',
    date: '2026-10-12',
    validUntil: '2026-11-11',
    clientId: 'cli-001',
    clientSnapshot: INITIAL_CLIENTS[0],
    items: [
      {
        id: 'item-1',
        productId: 'prod-001',
        code: 'VG-CAM-4K-IP',
        name: 'Hikvision 8MP 4K Ultra HD AcuSense IP Bullet Camera',
        description: 'Human & Vehicle target classification, DarkFighter low-light tech, 60m Smart IR, IP67.',
        quantity: 16,
        unit: 'Pcs',
        unitPrice: 420,
        discountPercent: 5,
        total: 6384
      },
      {
        id: 'item-2',
        productId: 'prod-003',
        code: 'VG-NVR-32CH',
        name: '32-Channel 4K Embedded Network Video Recorder (NVR)',
        description: '4 SATA interfaces, H.265+ compression, dual 4K HDMI out.',
        quantity: 1,
        unit: 'Unit',
        unitPrice: 2850,
        discountPercent: 0,
        total: 2850
      },
      {
        id: 'item-3',
        productId: 'prod-004',
        code: 'VG-HDD-8TB',
        name: 'Western Digital Purple 8TB Surveillance Hard Drive',
        description: '24/7 continuous surveillance recording certified.',
        quantity: 4,
        unit: 'Pcs',
        unitPrice: 780,
        discountPercent: 0,
        total: 3120
      },
      {
        id: 'item-4',
        productId: 'prod-005',
        code: 'VG-CBL-CAT6',
        name: 'Schneider Outdoor UV-Resistant Cat6 FTP Shielded Cable Roll',
        description: '305-meter drum, 100% pure copper.',
        quantity: 3,
        unit: 'Roll',
        unitPrice: 580,
        discountPercent: 0,
        total: 1740
      },
      {
        id: 'item-5',
        productId: 'prod-007',
        code: 'VG-SRV-INST',
        name: 'CCTV Turnkey Installation, Cable Laying & Conduit Piping',
        description: 'Camera mounting, EMT conduit, focusing, rack dressing and testing.',
        quantity: 1,
        unit: 'Lot',
        unitPrice: 2200,
        discountPercent: 0,
        total: 2200
      }
    ],
    subtotal: 16294,
    discountType: 'fixed',
    discountValue: 294,
    discountAmount: 294,
    taxRate: 15,
    taxAmount: 2400,
    shippingCost: 0,
    grandTotal: 18400,
    totalInWords: 'Eighteen Thousand Four Hundred Riyals Only',
    notes: 'Price includes full on-site installation at Al-Andalus Plaza, mobile monitoring setup, and 2-Year warranty.',
    termsAndConditions: DEFAULT_COMPANY.defaultTerms,
    status: 'accepted',
    templateStyle: 'corporate',
    showBankDetails: true,
    showSignature: true,
    showTerms: true,
    createdAt: '2026-10-12T10:00:00Z',
    updatedAt: '2026-10-14T11:20:00Z'
  },
  {
    id: 'qt-1002',
    quotationNumber: 'VG-QT-2026-0042',
    reference: 'Perimeter CCTV & Gate Barrier Surveillance System',
    date: '2026-10-14',
    validUntil: '2026-11-13',
    clientId: 'cli-002',
    clientSnapshot: INITIAL_CLIENTS[1],
    items: [
      {
        id: 'item-201',
        productId: 'prod-001',
        code: 'VG-CAM-4K-IP',
        name: 'Hikvision 8MP 4K Ultra HD AcuSense IP Bullet Camera',
        description: 'Outdoor weatherproof perimeter coverage with night vision.',
        quantity: 8,
        unit: 'Pcs',
        unitPrice: 420,
        discountPercent: 0,
        total: 3360
      },
      {
        id: 'item-202',
        productId: 'prod-006',
        code: 'VG-POE-SW24',
        name: 'Cisco / Ruijie 24-Port Gigabit PoE+ Managed Switch',
        description: '370W PoE budget, 2 SFP fiber uplink ports.',
        quantity: 1,
        unit: 'Unit',
        unitPrice: 1650,
        discountPercent: 0,
        total: 1650
      },
      {
        id: 'item-203',
        productId: 'prod-008',
        code: 'VG-SRV-TEST',
        name: 'MOI / Civil Defense Compliance Testing & Handover Certificate',
        description: 'Complete system commissioning and compliance paperwork.',
        quantity: 1,
        unit: 'Package',
        unitPrice: 1200,
        discountPercent: 0,
        total: 1200
      }
    ],
    subtotal: 6210,
    discountType: 'percentage',
    discountValue: 0,
    discountAmount: 0,
    taxRate: 15,
    taxAmount: 931.5,
    shippingCost: 0,
    grandTotal: 7141.5,
    totalInWords: 'Seven Thousand One Hundred Forty-One Riyals and Fifty Halalas Only',
    notes: 'Equipment delivered to Jeddah Islamic Port logistics warehouse.',
    termsAndConditions: DEFAULT_COMPANY.defaultTerms,
    status: 'sent',
    templateStyle: 'corporate',
    showBankDetails: true,
    showSignature: true,
    showTerms: true,
    createdAt: '2026-10-14T14:30:00Z',
    updatedAt: '2026-10-14T14:30:00Z'
  }
];

export const storage = {
  getCompanyProfile(): CompanyProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPANY);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(DEFAULT_COMPANY));
        return DEFAULT_COMPANY;
      }
      const parsed: CompanyProfile = JSON.parse(data);
      // Auto-migrate from previous sample placeholder if present
      if (!parsed.name || parsed.name.includes('Apex Solutions')) {
        localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(DEFAULT_COMPANY));
        return DEFAULT_COMPANY;
      }
      return parsed;
    } catch {
      return DEFAULT_COMPANY;
    }
  },

  saveCompanyProfile(profile: CompanyProfile) {
    localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(profile));
  },

  getClients(): Client[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(INITIAL_CLIENTS));
        return INITIAL_CLIENTS;
      }
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.city === 'Dhaka') {
        localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(INITIAL_CLIENTS));
        return INITIAL_CLIENTS;
      }
      return parsed;
    } catch {
      return INITIAL_CLIENTS;
    }
  },

  saveClient(client: Client): Client[] {
    const clients = storage.getClients();
    const index = clients.findIndex(c => c.id === client.id);
    let updated: Client[];
    if (index >= 0) {
      updated = [...clients];
      updated[index] = client;
    } else {
      updated = [client, ...clients];
    }
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(updated));
    return updated;
  },

  deleteClient(clientId: string): Client[] {
    const clients = storage.getClients().filter(c => c.id !== clientId);
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    return clients;
  },

  saveBulkClients(newClients: Client[], replace = false): Client[] {
    const existing = replace ? [] : storage.getClients();
    const merged = replace ? [...newClients] : [...newClients, ...existing];
    // Deduplicate by name or company
    const seen = new Set<string>();
    const deduplicated = merged.filter(c => {
      const key = `${c.name || ''}_${c.companyName || ''}`.toLowerCase().trim();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(deduplicated));
    return deduplicated;
  },

  getProducts(): ProductItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
        return [];
      }
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
        return [];
      }

      // Filter out demo products so that ONLY products added by the user remain
      const demoCodes = new Set([
        'VG-CAM-4K-IP',
        'VG-CAM-DOME-4K',
        'VG-NVR-32CH',
        'VG-HDD-8TB',
        'VG-CBL-CAT6',
        'VG-POE-SW24',
        'VG-SRV-INST',
        'VG-SRV-TEST',
        'VG-RACK-42U'
      ]);

      const userProducts = parsed.filter((p: ProductItem) => {
        if (!p || !p.id) return false;
        if (/^prod-00[1-9]$/.test(p.id)) return false;
        if (p.code && demoCodes.has(p.code)) return false;
        if (p.name && (
          p.name.includes('Hikvision 8MP') ||
          p.name.includes('Hikvision 4K') ||
          p.name.includes('Western Digital Purple 8TB') ||
          p.name.includes('Schneider Outdoor UV-Resistant') ||
          p.name.includes('Cisco / Ruijie 24-Port') ||
          p.name.includes('32-Channel 4K Embedded Network Video') ||
          p.name.includes('MOI / Civil Defense Compliance Testing') ||
          p.name.includes('CCTV Turnkey Installation')
        )) return false;
        return true;
      });

      // Synchronize back to localStorage so purged demo products are cleared
      if (userProducts.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(userProducts));
      }

      return userProducts.map((p: ProductItem) => ({
        ...p,
        arabicName: p.arabicName || getAutoArabicName(p.name, p.arabicName)
      }));
    } catch {
      return [];
    }
  },

  clearAllProducts(): ProductItem[] {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
    return [];
  },

  saveProduct(product: ProductItem): ProductItem[] {
    const products = storage.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    const enrichedProduct: ProductItem = {
      ...product,
      arabicName: product.arabicName?.trim() || getAutoArabicName(product.name, product.arabicName)
    };
    let updated: ProductItem[];
    if (index >= 0) {
      updated = [...products];
      updated[index] = enrichedProduct;
    } else {
      updated = [enrichedProduct, ...products];
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
    return updated;
  },

  deleteProduct(productId: string): ProductItem[] {
    const products = storage.getProducts().filter(p => p.id !== productId);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    return products;
  },

  saveBulkProducts(newProducts: ProductItem[], replace = false): ProductItem[] {
    const existing = replace ? [] : storage.getProducts();
    const enrichedNew = newProducts.map(p => ({
      ...p,
      arabicName: p.arabicName?.trim() || getAutoArabicName(p.name, p.arabicName)
    }));

    let updated: ProductItem[];
    if (replace) {
      updated = enrichedNew;
    } else {
      const merged = [...existing];
      enrichedNew.forEach(item => {
        const idx = item.code 
          ? merged.findIndex(p => p.code && p.code.toLowerCase() === item.code.toLowerCase())
          : -1;
        if (idx >= 0) {
          merged[idx] = item;
        } else {
          merged.unshift(item);
        }
      });
      updated = merged;
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
    return updated;
  },

  getQuotations(): Quotation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUOTATIONS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(INITIAL_QUOTATIONS));
        return INITIAL_QUOTATIONS;
      }
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.quotationNumber?.startsWith('QT-2026-0038')) {
        localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(INITIAL_QUOTATIONS));
        return INITIAL_QUOTATIONS;
      }
      return (parsed || []).map((q: Quotation) => ({
        ...q,
        items: (q.items || []).map(item => ({
          ...item,
          arabicName: item.arabicName || getAutoArabicName(item.name, item.arabicName)
        }))
      }));
    } catch {
      return INITIAL_QUOTATIONS;
    }
  },

  saveQuotation(quotation: Quotation): Quotation[] {
    const quotations = storage.getQuotations();
    const index = quotations.findIndex(q => q.id === quotation.id);
    let updated: Quotation[];
    if (index >= 0) {
      updated = [...quotations];
      updated[index] = { ...quotation, updatedAt: new Date().toISOString() };
    } else {
      updated = [{ ...quotation, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...quotations];
    }
    localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(updated));
    return updated;
  },

  deleteQuotation(quotationId: string): Quotation[] {
    const quotations = storage.getQuotations().filter(q => q.id !== quotationId);
    localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(quotations));
    return quotations;
  },

  duplicateQuotation(quotationId: string): Quotation | null {
    const quotes = storage.getQuotations();
    const target = quotes.find(q => q.id === quotationId);
    if (!target) return null;

    const nextNumber = storage.getNextQuotationNumber();
    const duplicate: Quotation = {
      ...target,
      id: 'qt-' + Date.now(),
      quotationNumber: nextNumber,
      reference: `Copy of ${target.reference || target.quotationNumber}`,
      date: new Date().toISOString().split('T')[0],
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    storage.saveQuotation(duplicate);
    return duplicate;
  },

  getNextQuotationNumber(): string {
    const year = new Date().getFullYear();
    const currentSeq = parseInt(localStorage.getItem(STORAGE_KEYS.NEXT_QT_NUMBER) || '42', 10);
    const nextSeq = currentSeq + 1;
    localStorage.setItem(STORAGE_KEYS.NEXT_QT_NUMBER, nextSeq.toString());
    const padded = String(nextSeq).padStart(4, '0');
    return `VG-QT-${year}-${padded}`;
  },

  resetAllData() {
    localStorage.removeItem(STORAGE_KEYS.COMPANY);
    localStorage.removeItem(STORAGE_KEYS.CLIENTS);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.QUOTATIONS);
    localStorage.removeItem(STORAGE_KEYS.NEXT_QT_NUMBER);
  }
};
