export type CurrencyCode = 'BDT' | 'USD' | 'EUR' | 'GBP' | 'INR' | 'AED' | 'SAR';

export interface CompanyProfile {
  name: string;
  nameArabic?: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  addressArabic?: string;
  city: string;
  country: string;
  website: string;
  taxId: string; // BIN / VAT / TIN / TRN
  currencySymbol: string;
  currencyCode: CurrencyCode;
  logoUrl?: string;
  
  // Bank Information for Quotations
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchName: string;
  routingNumber: string;
  swiftCode?: string;

  // Defaults for Quotations
  defaultTerms: string[];
  defaultNotes: string;
  authorizedSignatoryName: string;
  authorizedSignatoryTitle: string;
}

export interface Client {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  taxId?: string; // Client's VAT or BIN
  contactPerson?: string;
  notes?: string;
  createdAt: string;
}

export interface ProductItem {
  id: string;
  code: string; // SKU or Item Code (e.g. ITM-001)
  name: string;
  arabicName?: string;
  description: string;
  unitPrice: number;
  unit: string; // Pcs, Hours, Set, Month, Day, Box, Sq.Ft, Kg, etc.
  category?: string;
}

export interface QuotationLineItem {
  id: string;
  productId?: string;
  code?: string;
  name: string;
  arabicName?: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountPercent: number; // Item-level discount %
  total: number;
}

export type QuotationStatus = 'draft' | 'sent' | 'pending' | 'accepted' | 'rejected' | 'invoiced';

export type TemplateStyle = 'corporate' | 'modern' | 'minimalist';

export interface Quotation {
  id: string;
  quotationNumber: string; // e.g. QT-2026-0042
  reference?: string; // Subject / Project Name
  date: string; // YYYY-MM-DD
  validUntil: string; // YYYY-MM-DD
  
  clientId: string;
  clientSnapshot: Client; // frozen client details at time of quotation
  
  items: QuotationLineItem[];
  
  subtotal: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  
  taxRate: number; // e.g. 5, 7.5, 15%
  taxAmount: number;
  shippingCost: number;
  
  grandTotal: number;
  totalInWords: string;
  
  notes: string;
  termsAndConditions: string[];
  
  status: QuotationStatus;
  templateStyle: TemplateStyle;
  
  showBankDetails: boolean;
  showSignature: boolean;
  showTerms: boolean;
  warrantyText?: string;
  leadTime?: string;
  
  createdAt: string;
  updatedAt: string;
}
