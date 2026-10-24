import React, { useState } from 'react';
import { CompanyProfile, CurrencyCode } from '../types';
import { 
  Building, 
  CreditCard, 
  ShieldCheck, 
  Save, 
  Upload, 
  Download, 
  RotateCcw,
  Check,
  Globe,
  Crosshair,
  Sparkles,
  FileSpreadsheet,
  Package,
  Users,
  Image as ImageIcon,
  Trash2,
  UploadCloud
} from 'lucide-react';
import { VisionGuardLogo } from './VisionGuardLogo';
import { ExcelImportModal } from './ExcelImportModal';
import { 
  downloadProductsExcelTemplate, 
  downloadClientsExcelTemplate 
} from '../utils/excelImport';
import { ProductItem, Client } from '../types';

interface CompanySettingsProps {
  company: CompanyProfile;
  onSaveCompany: (updated: CompanyProfile) => void;
  onResetData: () => void;
  onExportBackup: () => void;
  onImportBackup: (jsonString: string) => void;
  onImportBulkProducts?: (products: ProductItem[], replace: boolean) => void;
  onImportBulkClients?: (clients: Client[], replace: boolean) => void;
}

export const CompanySettings: React.FC<CompanySettingsProps> = ({
  company,
  onSaveCompany,
  onResetData,
  onExportBackup,
  onImportBackup,
  onImportBulkProducts,
  onImportBulkClients,
}) => {
  const [formData, setFormData] = useState<CompanyProfile>({ ...company });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [excelModalType, setExcelModalType] = useState<'products' | 'clients' | null>(null);

  const handleChange = (field: keyof CompanyProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCurrencyChange = (code: CurrencyCode) => {
    const symbolMap: Record<CurrencyCode, string> = {
      BDT: 'Tk',
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹',
      AED: 'AED',
      SAR: 'SAR'
    };
    setFormData(prev => ({
      ...prev,
      currencyCode: code,
      currencySymbol: symbolMap[code] || '$'
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCompany(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportBackup(content);
      }
    };
    reader.readAsText(file);
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, SVG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file is too large. Please select an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      if (base64Data) {
        handleChange('logoUrl', base64Data);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Company Profile & Quotation Settings
          </h1>
          <p className="text-xs text-neutral-400">
            Configure your official company letterhead, logo, bank details, and default quotation terms.
          </p>
        </div>

        {savedSuccess && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-lg">
            <Check className="w-4 h-4" />
            <span>Settings Saved Successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Letterhead Identity */}
        <div className="bg-neutral-850 border border-neutral-800 rounded-xl p-5 space-y-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-white border-b border-neutral-800 pb-3">
            <Building className="w-4 h-4 text-blue-400" />
            Official Letterhead &amp; Brand
          </div>

          {/* Company Official Logo Upload & Live Preview Card */}
          <div className="bg-neutral-900 border border-neutral-750 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <label className="text-sm font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-cyan-400" />
                  <span>Company Official Logo (Import / Upload)</span>
                </label>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Import your official company logo. It automatically formats on quotation printouts, PDFs, and system menus.
                </p>
              </div>

              {formData.logoUrl && (
                <button
                  type="button"
                  onClick={() => handleChange('logoUrl', '')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-900/40 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset / Remove Logo</span>
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5 pt-1">
              {/* Logo Preview Box */}
              <div className="w-40 h-28 sm:w-48 sm:h-32 rounded-xl border-2 border-dashed border-neutral-700 bg-neutral-950 flex items-center justify-center p-3 relative overflow-hidden shrink-0 shadow-inner">
                {formData.logoUrl ? (
                  <img
                    src={formData.logoUrl}
                    alt="Company Logo Preview"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="text-center space-y-1.5">
                    <VisionGuardLogo showText={false} size="md" />
                    <span className="text-[10px] text-neutral-500 block font-medium">Default System Logo</span>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-3 w-full">
                <div className="flex flex-wrap items-center gap-2.5">
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-600/20 cursor-pointer transition-all active:scale-95">
                    <UploadCloud className="w-4 h-4" />
                    <span>Import Logo File (PNG, JPG, SVG)</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
                      onChange={handleLogoFileUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-neutral-500">or enter image web URL:</span>
                </div>

                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://yourcompany.com/assets/logo.png"
                    value={formData.logoUrl || ''}
                    onChange={(e) => handleChange('logoUrl', e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-neutral-500 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Company / Organization Legal Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Vision Guard Security"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Business Tagline / Subtitle
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                placeholder="Advanced CCTV Surveillance & Electronic Security Systems"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Official Phone / Mobile
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+966 50 123 4567"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Official Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="securetechtusher@gmail.com"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Office Address (Street & Building)
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="7663-7713 Khaled Bin Waleed"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                City / District / Postal Code
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="Al Sharafeyah, Jeddah 23218"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Country
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                placeholder="Saudi Arabia"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Commercial Registration (CR) & VAT Number
              </label>
              <input
                type="text"
                value={formData.taxId}
                onChange={(e) => handleChange('taxId', e.target.value)}
                placeholder="CR: 403012389 | VAT: 310128956700003"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Website URL
              </label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="www.yourcompany.com"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Currency & Financial Standards */}
        <div className="bg-neutral-850 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white border-b border-neutral-800 pb-3">
            <Globe className="w-4 h-4 text-emerald-400" />
            Currency & Regional Settings
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Default Currency Code
              </label>
              <select
                value={formData.currencyCode}
                onChange={(e) => handleCurrencyChange(e.target.value as CurrencyCode)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white cursor-pointer"
              >
                <option value="BDT">BDT (Tk) - Bangladeshi Taka</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="AED">AED (AED) - UAE Dirham</option>
                <option value="SAR">SAR (SAR) - Saudi Riyal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Currency Symbol Display
              </label>
              <input
                type="text"
                value={formData.currencySymbol}
                onChange={(e) => handleChange('currencySymbol', e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Banking & Remittance Details for Quotations */}
        <div className="bg-neutral-850 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white border-b border-neutral-800 pb-3">
            <CreditCard className="w-4 h-4 text-blue-400" />
            Bank & Payment Instructions (Printed on Quotation)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => handleChange('bankName', e.target.value)}
                placeholder="e.g. City Bank PLC / Brac Bank"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Account Title / Name
              </label>
              <input
                type="text"
                value={formData.accountName}
                onChange={(e) => handleChange('accountName', e.target.value)}
                placeholder="Apex Solutions & Engineering Ltd."
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Account Number
              </label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => handleChange('accountNumber', e.target.value)}
                placeholder="1102938475001"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white font-mono font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Branch Name
              </label>
              <input
                type="text"
                value={formData.branchName}
                onChange={(e) => handleChange('branchName', e.target.value)}
                placeholder="Gulshan-2 Branch, Dhaka"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Routing Number
              </label>
              <input
                type="text"
                value={formData.routingNumber}
                onChange={(e) => handleChange('routingNumber', e.target.value)}
                placeholder="225261734"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                SWIFT Code (Optional)
              </label>
              <input
                type="text"
                value={formData.swiftCode || ''}
                onChange={(e) => handleChange('swiftCode', e.target.value)}
                placeholder="CIBLBDDH"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Signatory & Defaults */}
        <div className="bg-neutral-850 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white border-b border-neutral-800 pb-3">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            Authorized Signatory & Quotation Defaults
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Authorized Signatory Name
              </label>
              <input
                type="text"
                value={formData.authorizedSignatoryName}
                onChange={(e) => handleChange('authorizedSignatoryName', e.target.value)}
                placeholder="e.g. Tusher Ahmed"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Signatory Official Designation / Title
              </label>
              <input
                type="text"
                value={formData.authorizedSignatoryTitle}
                onChange={(e) => handleChange('authorizedSignatoryTitle', e.target.value)}
                placeholder="Head of Commercial / Managing Director"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">
              Default Scope Note (Printed above line items)
            </label>
            <textarea
              rows={2}
              value={formData.defaultNotes}
              onChange={(e) => handleChange('defaultNotes', e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-xs text-white"
            />
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4" />
            Save All Changes
          </button>
        </div>
      </form>

      {/* Visual Effects & Cursor Animation */}
      <div className="bg-neutral-850 border border-neutral-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Crosshair className="w-4 h-4 text-cyan-400" />
            <span>Interactive Cyber Cursor Animation</span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono">
            Active
          </span>
        </div>
        
        <p className="text-xs text-neutral-400 leading-relaxed">
          Smooth holographic follower with precision laser core, real-time particle sparks, target locking on clickable buttons/inputs, and click shockwave ripples. You can toggle this dynamically using the top navigation header button (<strong>Cursor FX</strong>).
        </p>

        <div className="flex items-center gap-3 p-3 bg-neutral-900 border border-neutral-800 rounded-lg">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <div className="text-neutral-200 font-semibold">Real-time Reactive Effects</div>
            <div className="text-neutral-400 text-[11px]">Hover over any button or catalog tab to see the lock-on reticle expand and glow.</div>
          </div>
        </div>
      </div>

      {/* Excel Data Hub (.xlsx / .csv import and template download) */}
      <div className="bg-neutral-850 border border-neutral-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Excel Spreadsheet Import Hub</span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono">
            .XLSX • .CSV
          </span>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed">
          Bulk import your product catalog inventory and client records directly from Microsoft Excel or CSV files. You can also download official pre-formatted Excel templates.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {/* Products Box */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-cyan-400" />
                Products Catalog
              </span>
              <button
                type="button"
                onClick={downloadProductsExcelTemplate}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                Template
              </button>
            </div>
            <p className="text-[11px] text-neutral-400">
              Bulk import items, item codes, specs, prices, units, and auto-translated Arabic names.
            </p>
            <button
              type="button"
              onClick={() => setExcelModalType('products')}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              Import Products from Excel
            </button>
          </div>

          {/* Clients Box */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                Clients Directory (CRM)
              </span>
              <button
                type="button"
                onClick={downloadClientsExcelTemplate}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                Template
              </button>
            </div>
            <p className="text-[11px] text-neutral-400">
              Bulk import company accounts, attention persons, phone numbers, emails, and VAT IDs.
            </p>
            <button
              type="button"
              onClick={() => setExcelModalType('clients')}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
              Import Clients from Excel
            </button>
          </div>
        </div>
      </div>

      {/* Backup, Restore & Data Reset Section */}
      <div className="bg-neutral-850 border border-neutral-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">
          Data Management & Backup
        </h3>
        <p className="text-xs text-neutral-400">
          Your quotations, clients, and catalog items are saved safely in your browser. You can export a JSON backup file or restore it anytime.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onExportBackup}
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-400" />
            Export Backup (.JSON)
          </button>

          <label className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-lg text-xs font-medium transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Import Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset all quotations and reload standard demo data?')) {
                onResetData();
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-red-950/40 text-neutral-400 hover:text-red-400 border border-neutral-800 hover:border-red-900/50 rounded-lg text-xs font-medium transition-colors cursor-pointer ml-auto"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Sample Data
          </button>
        </div>
      </div>

      {/* Excel Import Modal */}
      <ExcelImportModal
        isOpen={excelModalType !== null}
        onClose={() => setExcelModalType(null)}
        type={excelModalType || 'products'}
        onImportProducts={onImportBulkProducts}
        onImportClients={onImportBulkClients}
      />
    </div>
  );
};
