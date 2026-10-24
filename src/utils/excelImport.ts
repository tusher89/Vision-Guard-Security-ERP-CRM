import * as XLSX from 'xlsx';
import { ProductItem, Client } from '../types';
import { getAutoArabicName } from './arabicTranslation';

/**
 * Normalizes an object's keys to lowercase alphanumeric strings for flexible header matching
 */
function normalizeKeys(row: Record<string, any>): Record<string, any> {
  const normalized: Record<string, any> = {};
  for (const [key, val] of Object.entries(row)) {
    const cleanKey = key.trim().toLowerCase().replace(/[\s\-_]+/g, '');
    normalized[cleanKey] = val;
  }
  return normalized;
}

function getField(row: Record<string, any>, possibleKeys: string[]): any {
  for (const key of possibleKeys) {
    const clean = key.toLowerCase().replace(/[\s\-_]+/g, '');
    if (row[clean] !== undefined && row[clean] !== null && row[clean] !== '') {
      return row[clean];
    }
  }
  return undefined;
}

/**
 * Parse an Excel (.xlsx, .xls) or CSV file into ProductItem[]
 */
export async function parseProductsExcel(file: File): Promise<{ products: ProductItem[]; errors: string[]; rawCount: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Use first sheet
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          resolve({ products: [], errors: ['Excel file does not contain any sheets.'], rawCount: 0 });
          return;
        }

        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (jsonRows.length === 0) {
          resolve({ products: [], errors: ['No data rows found in the selected Excel sheet.'], rawCount: 0 });
          return;
        }

        const products: ProductItem[] = [];
        const errors: string[] = [];

        jsonRows.forEach((rawRow, idx) => {
          const row = normalizeKeys(rawRow);

          // Find product name (Required)
          const name = getField(row, [
            'name', 'productname', 'itemname', 'item', 'title', 'descriptionname',
            'product', 'itemtitle'
          ]);

          if (!name || String(name).trim() === '') {
            errors.push(`Row ${idx + 2}: Skipped because product name is empty.`);
            return;
          }

          // Model Number / Item Code / SKU
          const code = getField(row, [
            'modelnumber', 'modelno', 'model', 'modelname', 'itemcode', 'code', 'sku', 'productcode', 'id',
            'partnumber', 'itemnum', 'partno'
          ]) || `MOD-${(idx + 1).toString().padStart(4, '0')}`;

          // Arabic Name (or auto-translated if blank)
          const explicitArabic = getField(row, [
            'arabicname', 'arabic', 'namearabic', 'arabictitle', 'الاسم بالعربي', 'اسم المنتج'
          ]);
          const arabicName = explicitArabic ? String(explicitArabic).trim() : getAutoArabicName(String(name).trim());

          // Description
          const description = getField(row, [
            'description', 'details', 'specs', 'specification', 'desc'
          ]) || '';

          // Unit Price
          const rawPrice = getField(row, [
            'unitprice', 'price', 'rate', 'sellingprice', 'amount', 'cost', 'unitcost', 'priceeach'
          ]);
          let unitPrice = 0;
          if (rawPrice !== undefined) {
            const parsed = parseFloat(String(rawPrice).replace(/[^0-9.-]/g, ''));
            if (!isNaN(parsed) && parsed >= 0) {
              unitPrice = parsed;
            }
          }

          // Unit
          const unit = getField(row, [
            'unit', 'uom', 'unitofmeasure', 'measure', 'qtyunit', 'pack'
          ]) || 'Pcs';

          // Category
          const category = getField(row, [
            'category', 'group', 'type', 'cat', 'classification', 'department'
          ]) || 'General';

          products.push({
            id: `prod-imp-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
            code: String(code).trim(),
            name: String(name).trim(),
            arabicName,
            description: String(description).trim(),
            unitPrice,
            unit: String(unit).trim(),
            category: String(category).trim()
          });
        });

        resolve({ products, errors, rawCount: jsonRows.length });
      } catch (err: any) {
        reject(new Error(err?.message || 'Failed to parse Excel file. Please ensure it is a valid .xlsx, .xls, or .csv.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read the file.'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parse an Excel (.xlsx, .xls) or CSV file into Client[]
 */
export async function parseClientsExcel(file: File): Promise<{ clients: Client[]; errors: string[]; rawCount: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          resolve({ clients: [], errors: ['Excel file does not contain any sheets.'], rawCount: 0 });
          return;
        }

        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (jsonRows.length === 0) {
          resolve({ clients: [], errors: ['No data rows found in the selected Excel sheet.'], rawCount: 0 });
          return;
        }

        const clients: Client[] = [];
        const errors: string[] = [];

        jsonRows.forEach((rawRow, idx) => {
          const row = normalizeKeys(rawRow);

          // Company Name or Client Name
          const companyName = getField(row, [
            'companyname', 'company', 'organization', 'clientcompany', 'business', 'firm', 'clientorg'
          ]);
          const name = getField(row, [
            'name', 'clientname', 'client', 'customer', 'accountname', 'fullname'
          ]) || companyName;

          if (!name && !companyName) {
            errors.push(`Row ${idx + 2}: Skipped because both Client Name and Company Name are blank.`);
            return;
          }

          const resolvedName = String(name || companyName).trim();
          const resolvedCompany = String(companyName || name).trim();

          const email = getField(row, [
            'email', 'mail', 'emailaddress', 'contactemail'
          ]) || '';

          const phone = getField(row, [
            'phone', 'mobile', 'tel', 'telephone', 'cell', 'contactphone', 'phone1'
          ]) || '';

          const address = getField(row, [
            'address', 'location', 'street', 'officeaddress', 'streetaddress'
          ]) || '';

          const city = getField(row, [
            'city', 'town', 'district', 'province', 'region'
          ]) || '';

          const taxId = getField(row, [
            'taxid', 'vat', 'vatno', 'trn', 'bin', 'tin', 'taxnumber', 'vatnumber'
          ]) || '';

          const contactPerson = getField(row, [
            'contactperson', 'attention', 'attnto', 'contact', 'contactname', 'attperson'
          ]) || resolvedName;

          const notes = getField(row, [
            'notes', 'remarks', 'note', 'comments'
          ]) || '';

          clients.push({
            id: `cli-imp-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
            name: resolvedName,
            companyName: resolvedCompany,
            email: String(email).trim(),
            phone: String(phone).trim(),
            address: String(address).trim(),
            city: String(city).trim(),
            taxId: taxId ? String(taxId).trim() : undefined,
            contactPerson: String(contactPerson).trim(),
            notes: notes ? String(notes).trim() : undefined,
            createdAt: new Date().toISOString().split('T')[0]
          });
        });

        resolve({ clients, errors, rawCount: jsonRows.length });
      } catch (err: any) {
        reject(new Error(err?.message || 'Failed to parse Excel file.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read the file.'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Download a ready-to-fill Excel template for Products
 */
export function downloadProductsExcelTemplate() {
  const templateData = [
    {
      'Item Code': 'VG-CAM-4K',
      'Product Name': '4K IP Outdoor Bullet Security Camera',
      'Arabic Name': 'كاميرا مراقبة خارجية 4K',
      'Description': 'Ultra HD with Night Vision & Weatherproof IP67 enclosure',
      'Unit Price': 350,
      'Unit': 'Pcs',
      'Category': 'IP Surveillance'
    },
    {
      'Item Code': 'VG-NVR-16CH',
      'Product Name': '16-Channel 4K Network Video Recorder (NVR)',
      'Arabic Name': 'جهاز تسجيل شبكي 16 قناة بدقة 4K',
      'Description': 'Supports up to 2 SATA HDDs and H.265+ smart compression',
      'Unit Price': 1850,
      'Unit': 'Unit',
      'Category': 'Recording & Storage'
    },
    {
      'Item Code': 'VG-CBL-CAT6',
      'Product Name': 'Cat6 Pure Copper UTP Network Cable (305m)',
      'Arabic Name': 'كيبل شبكة كات 6 نحاس نقي (305 متر)',
      'Description': 'High-performance gigabit rated, outdoor UV-resistant',
      'Unit Price': 420,
      'Unit': 'Roll',
      'Category': 'Networking Cables'
    },
    {
      'Item Code': 'VG-SRV-INST',
      'Product Name': 'Professional CCTV Installation & Cabling Service',
      'Arabic Name': 'خدمة تركيب وتمديد كاميرات المراقبة المعتمدة',
      'Description': 'Turnkey installation including trunking, testing & handover',
      'Unit Price': 120,
      'Unit': 'Point',
      'Category': 'Services & Installation'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  // Set nice column widths
  worksheet['!cols'] = [
    { wch: 16 }, // Code
    { wch: 42 }, // Name
    { wch: 32 }, // Arabic Name
    { wch: 50 }, // Description
    { wch: 14 }, // Price
    { wch: 10 }, // Unit
    { wch: 22 }, // Category
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
  XLSX.writeFile(workbook, 'Vision_Guard_Product_Catalog_Template.xlsx');
}

/**
 * Download a ready-to-fill Excel template for Clients
 */
export function downloadClientsExcelTemplate() {
  const templateData = [
    {
      'Company Name': 'Al-Madinah Logistics Group',
      'Contact Person': 'Eng. Tariq Al-Mansoor',
      'Email': 'procurement@almadinah-logistics.com',
      'Phone': '+966 54 888 1234',
      'Address': 'Industrial Area Phase 3, Warehouse 14',
      'City': 'Jeddah',
      'VAT / Tax ID': '310987654300003',
      'Notes': 'Central logistics hub with 24/7 security gate requirements'
    },
    {
      'Company Name': 'Red Sea Contracting & Trading Co.',
      'Contact Person': 'Fahad Al-Zahrani',
      'Email': 'projects@redsea-contracting.sa',
      'Phone': '+966 50 111 9876',
      'Address': 'King Fahd Road, Al-Faisaliyah Tower Floor 8',
      'City': 'Riyadh',
      'VAT / Tax ID': '300123456700003',
      'Notes': 'Needs commercial proposals with stamped bilingual quotation format'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  worksheet['!cols'] = [
    { wch: 35 }, // Company Name
    { wch: 26 }, // Contact Person
    { wch: 36 }, // Email
    { wch: 20 }, // Phone
    { wch: 45 }, // Address
    { wch: 15 }, // City
    { wch: 20 }, // VAT
    { wch: 45 }  // Notes
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients');
  XLSX.writeFile(workbook, 'Vision_Guard_Clients_Directory_Template.xlsx');
}

/**
 * Export current Products Catalog to Excel (.xlsx)
 */
export function exportProductsToExcel(products: ProductItem[], filename = 'Vision_Guard_Products_Catalog.xlsx') {
  const data = products.map((p, idx) => ({
    'SL': idx + 1,
    'Model Number': p.code,
    'Product Name': p.name,
    'Arabic Name': p.arabicName || '',
    'Category': p.category || 'General',
    'Unit Price': p.unitPrice,
    'Unit': p.unit,
    'Description': p.description || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 22 }, // Model Number
    { wch: 42 }, // Product Name
    { wch: 32 }, // Arabic Name
    { wch: 22 }, // Category
    { wch: 14 }, // Unit Price
    { wch: 10 }, // Unit
    { wch: 45 }  // Description
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
  XLSX.writeFile(workbook, filename);
}

/**
 * Export current Products Catalog to CSV (.csv)
 */
export function exportProductsToCSV(products: ProductItem[], filename = 'Vision_Guard_Products_Catalog.csv') {
  const data = products.map((p, idx) => ({
    'SL': idx + 1,
    'Model Number': p.code,
    'Product Name': p.name,
    'Arabic Name': p.arabicName || '',
    'Category': p.category || 'General',
    'Unit Price': p.unitPrice,
    'Unit': p.unit,
    'Description': p.description || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
  XLSX.writeFile(workbook, filename, { bookType: 'csv' });
}

/**
 * Export current Clients Directory to Excel (.xlsx)
 */
export function exportClientsToExcel(clients: Client[], filename = 'Vision_Guard_Clients_Directory.xlsx') {
  const data = clients.map((c, idx) => ({
    'SL': idx + 1,
    'Company Name': c.companyName,
    'Client Name': c.name,
    'Contact Person': c.contactPerson || c.name,
    'Phone': c.phone,
    'Email': c.email,
    'City': c.city,
    'Address': c.address,
    'VAT / Tax ID': c.taxId || '',
    'Notes': c.notes || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 35 },
    { wch: 24 },
    { wch: 24 },
    { wch: 18 },
    { wch: 32 },
    { wch: 16 },
    { wch: 40 },
    { wch: 20 },
    { wch: 30 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients');
  XLSX.writeFile(workbook, filename);
}

