import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quotation, CompanyProfile } from '../types';
import { VisionGuardLogo } from './VisionGuardLogo';
import { getAutoArabicName } from '../utils/arabicTranslation';
import { ThemeToggle } from './ThemeToggle';
import { 
  Printer, 
  ArrowLeft, 
  Edit3, 
  CheckCircle2, 
  FileText, 
  Building2, 
  CreditCard, 
  ShieldCheck, 
  Download,
  Share2,
  Copy,
  MapPin,
  Phone,
  Mail,
  Languages,
  Trash2,
  AlertTriangle
} from 'lucide-react';

interface QuotationPrintViewProps {
  quotation: Quotation;
  company: CompanyProfile;
  onBack: () => void;
  onEdit: (quotation: Quotation) => void;
  onUpdateStatus?: (status: Quotation['status']) => void;
  onDelete?: (quotationId: string) => void;
}

export const QuotationPrintView: React.FC<QuotationPrintViewProps> = ({
  quotation,
  company,
  onBack,
  onEdit,
  onUpdateStatus,
  onDelete,
}) => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('vision_guard_theme') as 'dark' | 'light') || 'dark';
  });

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('vision_guard_theme', next);
      return next;
    });
  };

  const [template, setTemplate] = useState<'corporate' | 'modern' | 'minimalist'>(quotation.templateStyle || 'corporate');
  const [showArabic, setShowArabic] = useState<boolean>(true);
  const [showBank, setShowBank] = useState<boolean>(quotation.showBankDetails ?? true);
  const [showTerms, setShowTerms] = useState<boolean>(quotation.showTerms ?? true);
  const [showSignature, setShowSignature] = useState<boolean>(quotation.showSignature ?? true);
  const [showWatermark, setShowWatermark] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const formatMoney = (amount: number) => {
    return `${company.currencySymbol} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const copyQuotationSummary = () => {
    const summary = `Quotation ${quotation.quotationNumber}\nClient: ${quotation.clientSnapshot.companyName || quotation.clientSnapshot.name}\nTotal: ${formatMoney(quotation.grandTotal)}\nValid Until: ${quotation.validUntil}`;
    navigator.clipboard.writeText(summary);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(quotation.id);
      setShowDeleteModal(false);
      onBack();
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'dark bg-neutral-900 text-neutral-100' : 'light bg-slate-200 text-slate-800'
    } pb-16`}>
      {/* Print Control Header (Hidden when printing via CSS @media print) */}
      <div className={`no-print sticky top-0 z-40 border-b backdrop-blur px-3 sm:px-6 py-3 sm:py-4 transition-colors duration-300 ${
        theme === 'dark' ? 'bg-neutral-900/95 border-neutral-800' : 'bg-white/95 border-slate-300 shadow-sm'
      }`}>
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors cursor-pointer min-h-[36px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </motion.button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-sm sm:text-base">
                  {quotation.quotationNumber}
                </span>
                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded uppercase font-mono tracking-wider font-medium bg-neutral-800 text-neutral-300 border border-neutral-700">
                  {quotation.status}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-400 truncate max-w-[200px] sm:max-w-sm">
                {quotation.reference || quotation.clientSnapshot.companyName}
              </p>
            </div>
          </div>

          {/* Quick controls toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status changer */}
            {onUpdateStatus && (
              <select
                value={quotation.status}
                onChange={(e) => onUpdateStatus(e.target.value as Quotation['status'])}
                className="bg-neutral-800 text-neutral-200 border border-neutral-700 rounded-lg text-xs px-3 py-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="invoiced">Invoiced</option>
              </select>
            )}

            {/* Template Chooser */}
            <div className="flex items-center bg-neutral-800 p-1 rounded-lg border border-neutral-700 text-xs">
              <button
                onClick={() => setTemplate('corporate')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer font-medium ${
                  template === 'corporate' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Corporate
              </button>
              <button
                onClick={() => setTemplate('modern')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer font-medium ${
                  template === 'modern' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Modern
              </button>
              <button
                onClick={() => setTemplate('minimalist')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer font-medium ${
                  template === 'minimalist' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Minimal
              </button>
            </div>

            {/* Edit button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onEdit(quotation)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit
            </motion.button>

            {/* Copy summary button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={copyQuotationSummary}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors cursor-pointer"
              title="Copy Summary"
            >
              <Copy className="w-3.5 h-3.5" />
              {copiedLink ? 'Copied!' : 'Copy'}
            </motion.button>

            {/* Delete button */}
            {onDelete && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-950/70 border border-red-800/60 rounded-lg transition-colors cursor-pointer"
                title="Delete Quotation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </motion.button>
            )}

            {/* Animated Day / Night Toggle */}
            <ThemeToggle theme={theme} onToggle={toggleTheme} />

            {/* PRIMARY PRINT / PDF BUTTON */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-all cursor-pointer hover:shadow-blue-500/20"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </motion.button>
          </div>
        </div>

        {/* View Options Toggle Bar */}
        <div className="max-w-5xl mx-auto mt-3 pt-3 border-t border-neutral-800/80 flex flex-wrap items-center justify-between text-xs text-neutral-400 gap-3">
          <div className="flex items-center gap-4">
            <span className="text-neutral-500 font-medium">Print Content Options:</span>
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-neutral-200">
              <input
                type="checkbox"
                checked={showArabic}
                onChange={(e) => setShowArabic(e.target.checked)}
                className="rounded border-neutral-700 text-blue-600 focus:ring-0 bg-neutral-800"
              />
              <span className="flex items-center gap-1 text-blue-400 font-bold">
                <Languages className="w-3.5 h-3.5" />
                Auto Arabic Products (عربي)
              </span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-neutral-200">
              <input
                type="checkbox"
                checked={showBank}
                onChange={(e) => setShowBank(e.target.checked)}
                className="rounded border-neutral-700 text-blue-600 focus:ring-0 bg-neutral-800"
              />
              Bank & Payment Info
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-neutral-200">
              <input
                type="checkbox"
                checked={showTerms}
                onChange={(e) => setShowTerms(e.target.checked)}
                className="rounded border-neutral-700 text-blue-600 focus:ring-0 bg-neutral-800"
              />
              Terms & Conditions
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-neutral-200">
              <input
                type="checkbox"
                checked={showSignature}
                onChange={(e) => setShowSignature(e.target.checked)}
                className="rounded border-neutral-700 text-blue-600 focus:ring-0 bg-neutral-800"
              />
              Signature Boxes
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-neutral-200">
              <input
                type="checkbox"
                checked={showWatermark}
                onChange={(e) => setShowWatermark(e.target.checked)}
                className="rounded border-neutral-700 text-blue-600 focus:ring-0 bg-neutral-800"
              />
              Watermark Stamp
            </label>
          </div>

          <div className="text-neutral-500 text-[11px]">
            Tip: In browser print dialog, choose <span className="text-neutral-300 font-medium">"Save as PDF"</span> or select physical printer.
          </div>
        </div>
      </div>

      {/* Actual Printable Quotation Sheet - Centered A4 Page */}
      <div className="max-w-4xl mx-auto mt-4 sm:mt-8 px-2 sm:px-4 print:p-0 print:m-0 print:max-w-none">
        <div
          id="printable-quotation-sheet"
          className={`quotation-sheet relative bg-white text-slate-900 shadow-2xl rounded-sm p-4 sm:p-8 md:p-14 mx-auto transition-all overflow-x-auto print:overflow-visible ${
            template === 'corporate'
              ? 'border-t-8 border-slate-900'
              : template === 'modern'
              ? 'border-t-8 border-blue-600'
              : 'border-t-2 border-slate-300'
          }`}
          style={{ minHeight: '297mm', width: '100%', maxWidth: '210mm' }}
        >
          {/* Optional Watermark */}
          {showWatermark && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 rotate-[-30deg]">
              <span className="text-8xl font-black uppercase tracking-widest text-slate-950">
                {quotation.status === 'accepted' ? 'APPROVED' : 'QUOTATION'}
              </span>
            </div>
          )}

          {/* Header Section */}
          <div className="quotation-header flex items-start justify-between border-b border-slate-200 pb-6 mb-6">
            <div className="space-y-2">
              {/* Brand Logo & Name */}
              <div className="flex items-center gap-3.5">
                {company.logoUrl ? (
                  <img
                    src={company.logoUrl}
                    alt={company.name}
                    className="h-16 max-w-[220px] object-contain shrink-0"
                  />
                ) : (
                  <VisionGuardLogo showText={false} size="lg" />
                )}
                <div>
                  <div className="text-2xl font-black tracking-tight leading-tight text-[#0B132B]">
                    {company.name}
                  </div>
                  <span className="text-[10px] font-bold tracking-[0.22em] text-slate-600 block uppercase mt-0.5">
                    {company.tagline || 'Commercial Security & Enterprise Solutions'}
                  </span>
                </div>
              </div>

              {/* CR & VAT Line */}
              <div className="text-xs font-mono font-bold text-slate-800 tracking-wide pt-1">
                {company.taxId || 'CR: 403012389 | VAT: 310128956700003'}
              </div>

              {/* Address */}
              <div className="flex items-start gap-1.5 text-xs text-slate-600 leading-snug">
                <MapPin className="w-3.5 h-3.5 text-slate-800 shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-slate-800">{company.address}</div>
                  <div>{company.city}, {company.country}</div>
                </div>
              </div>

              {/* Contact info */}
              <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-0.5 pt-0.5">
                {company.phone && <span>Tel: {company.phone}</span>}
                {company.email && <span>Email: {company.email}</span>}
              </div>
            </div>

            {/* Document Title & Reference Block */}
            <div className="text-right">
              <div className="inline-block">
                <span
                  className={`text-2xl font-black tracking-tight uppercase block ${
                    template === 'modern' ? 'text-blue-700' : 'text-slate-900'
                  }`}
                >
                  QUOTATION
                </span>
                <span className="text-xs font-semibold text-slate-500 block">
                  عرض سعر معتمد
                </span>
                <span className="text-xs font-mono font-bold text-slate-800 block mt-0.5">
                  #{quotation.quotationNumber}
                </span>
              </div>

              <div className="mt-4 text-xs text-slate-600 space-y-1">
                <div>
                  <span className="text-slate-400">Date / التاريخ: </span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {quotation.date}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Valid Until / الصلاحية: </span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {quotation.validUntil}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Prepared By: </span>
                  <span className="font-medium text-slate-800">
                    {company.authorizedSignatoryName}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bill To & Project Reference Grid */}
          <div className="grid grid-cols-2 gap-8 mb-6 pb-6 border-b border-slate-100 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                QUOTATION ISSUED TO / السادة:
              </span>
              <h2 className="text-sm font-bold text-slate-900">
                {quotation.clientSnapshot.companyName || quotation.clientSnapshot.name}
              </h2>
              {quotation.clientSnapshot.contactPerson && (
                <p className="font-medium text-slate-700 mt-0.5">
                  Attn: {quotation.clientSnapshot.contactPerson}
                </p>
              )}
              <p className="text-slate-600 mt-1 whitespace-pre-line leading-relaxed">
                {quotation.clientSnapshot.address || 'Address on file'}
                {quotation.clientSnapshot.city ? `, ${quotation.clientSnapshot.city}` : ''}
              </p>
              <div className="mt-1 text-slate-600 space-y-0.5">
                {quotation.clientSnapshot.phone && <p>Tel: {quotation.clientSnapshot.phone}</p>}
                {quotation.clientSnapshot.email && <p>Email: {quotation.clientSnapshot.email}</p>}
                {quotation.clientSnapshot.taxId && (
                  <p className="font-medium text-slate-700">{quotation.clientSnapshot.taxId}</p>
                )}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                PROJECT / SUBJECT REFERENCE / الموضوع:
              </span>
              <p className="text-sm font-semibold text-slate-800 leading-snug">
                {quotation.reference || 'Supply, Installation & Technical Services Proposal'}
              </p>
              {quotation.notes && (
                <div className="mt-3 bg-slate-50 border border-slate-200/80 rounded p-2.5 text-slate-600 text-[11px] leading-relaxed">
                  <span className="font-semibold text-slate-700 block mb-0.5">Scope Note:</span>
                  {quotation.notes}
                </div>
              )}
            </div>
          </div>

          {/* Line Items Table with Auto Arabic */}
          <div className="mb-6">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className={`${template === 'modern' ? 'bg-blue-50 text-blue-900' : 'bg-slate-100 text-slate-800'} font-semibold border-y border-slate-200`}>
                  <th className="py-2.5 px-3 w-8 text-center">#</th>
                  <th className="py-2.5 px-3">
                    <div>Item Description</div>
                    <div className="text-[10px] font-normal text-slate-500">بيان المواد والخدمات</div>
                  </th>
                  <th className="py-2.5 px-3 text-center w-16">
                    <div>Qty</div>
                    <div className="text-[10px] font-normal text-slate-500">الكمية</div>
                  </th>
                  <th className="py-2.5 px-3 text-center w-16">
                    <div>Unit</div>
                    <div className="text-[10px] font-normal text-slate-500">الوحدة</div>
                  </th>
                  <th className="py-2.5 px-3 text-right w-28">
                    <div>Rate ({company.currencySymbol})</div>
                    <div className="text-[10px] font-normal text-slate-500">السعر الفردي</div>
                  </th>
                  <th className="py-2.5 px-3 text-right w-16">
                    <div>Dis%</div>
                    <div className="text-[10px] font-normal text-slate-500">خصم</div>
                  </th>
                  <th className="py-2.5 px-3 text-right w-32">
                    <div>Total ({company.currencySymbol})</div>
                    <div className="text-[10px] font-normal text-slate-500">المجموع</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {quotation.items.map((item, index) => {
                  const arabicText = item.arabicName || getAutoArabicName(item.name);
                  return (
                    <tr key={item.id || index} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 text-center text-slate-400 font-mono">
                        {index + 1}
                      </td>
                      <td className="py-3 px-3">
                        {/* English Name */}
                        <div className="font-bold text-slate-900">{item.name}</div>
                        {/* Auto Arabic Title - Prominently Displayed */}
                        {showArabic && arabicText && (
                          <div className="text-[11px] font-bold text-[#0b1a2f] mt-0.5 leading-snug font-sans tracking-tight" dir="rtl">
                            {arabicText}
                          </div>
                        )}
                        {item.code && (
                          <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                            Code: {item.code}
                          </span>
                        )}
                        {item.description && (
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                            {item.description}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-medium text-slate-800">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-600">
                        {item.unit || 'Pcs'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        {item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-600">
                        {item.discountPercent > 0 ? `${item.discountPercent}%` : '—'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900">
                        {item.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Calculations & Bank Info Section */}
          <div className="grid grid-cols-2 gap-8 mb-6 pt-2">
            {/* Left: Bank Details for Payment */}
            <div>
              {showBank && company.bankName && (
                <div className="border border-slate-200 rounded p-4 text-xs bg-slate-50/60">
                  <div className="flex items-center gap-2 font-bold text-slate-800 mb-2">
                    <CreditCard className="w-4 h-4 text-slate-700" />
                    <span>BANK PAYMENT DETAILS / بيانات التحويل البنكي</span>
                  </div>
                  <div className="space-y-1 text-slate-600 text-[11px]">
                    <div>
                      <span className="text-slate-400">Bank Name: </span>
                      <span className="font-semibold text-slate-800">{company.bankName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Account Name: </span>
                      <span className="font-medium text-slate-800">{company.accountName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Account / IBAN: </span>
                      <span className="font-mono font-bold text-slate-900">{company.accountNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Branch: </span>
                      <span>{company.branchName}</span>
                    </div>
                    {company.routingNumber && (
                      <div>
                        <span className="text-slate-400">Routing / Swift: </span>
                        <span className="font-mono">{company.routingNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Calculations Summary Table */}
            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Subtotal / المجموع الفرعي:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {formatMoney(quotation.subtotal)}
                </span>
              </div>

              {quotation.discountAmount > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-700">
                  <span>
                    Discount / الخصم {quotation.discountType === 'percentage' ? `(${quotation.discountValue}%)` : ''}:
                  </span>
                  <span className="font-mono font-semibold">
                    - {formatMoney(quotation.discountAmount)}
                  </span>
                </div>
              )}

              {quotation.taxRate > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">
                    VAT / ضريبة القيمة المضافة ({quotation.taxRate}%):
                  </span>
                  <span className="font-mono font-semibold text-slate-800">
                    + {formatMoney(quotation.taxAmount)}
                  </span>
                </div>
              )}

              {quotation.shippingCost > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Delivery / التوصيل والتركيب:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    + {formatMoney(quotation.shippingCost)}
                  </span>
                </div>
              )}

              {/* Grand Total */}
              <div className="flex justify-between py-2 border-t-2 border-slate-900 text-slate-950 font-bold">
                <div>
                  <div className="text-sm uppercase tracking-wide">GRAND TOTAL</div>
                  <div className="text-[10px] text-slate-500 font-normal">المبلغ الإجمالي المستحق</div>
                </div>
                <div className="text-base font-black font-mono text-slate-950">
                  {formatMoney(quotation.grandTotal)}
                </div>
              </div>

              {/* Total In Words */}
              <div className="pt-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="font-semibold text-slate-700 block text-[10px] uppercase">Amount in Words / المبلغ كتابة:</span>
                <span className="italic font-medium text-slate-800">{quotation.totalInWords}</span>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          {showTerms && quotation.termsAndConditions && quotation.termsAndConditions.length > 0 && (
            <div className="mb-8 pt-4 border-t border-slate-200 text-xs">
              <span className="font-bold text-slate-900 block mb-2 uppercase text-[10px] tracking-wider">
                TERMS & CONDITIONS / الشروط والأحكام:
              </span>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px] leading-relaxed">
                {quotation.termsAndConditions.map((term, i) => (
                  <li key={i}>{term}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Dual Signatures */}
          {showSignature && (
            <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-2 gap-12 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">
                  PREPARED & AUTHORIZED BY / الجهة المصدرة:
                </span>
                <div className="font-bold text-slate-900 text-sm">{company.authorizedSignatoryName}</div>
                <div className="text-slate-500 text-[11px]">{company.authorizedSignatoryTitle}</div>
                <div className="text-slate-400 text-[10px] mt-0.5">{company.name}</div>
                <div className="mt-8 pt-2 border-t border-slate-300 w-44 text-slate-400 text-[10px]">
                  Authorized Signature & Stamp
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">
                  CUSTOMER ACCEPTANCE / موافقة وتوقيع العميل:
                </span>
                <div className="font-bold text-slate-900 text-sm">
                  {quotation.clientSnapshot.contactPerson || quotation.clientSnapshot.companyName}
                </div>
                <div className="text-slate-500 text-[11px]">Authorized Client Representative</div>
                <div className="text-slate-400 text-[10px] mt-0.5">Date: _______________</div>
                <div className="mt-8 pt-2 border-t border-slate-300 w-44 ml-auto text-slate-400 text-[10px]">
                  Client Signature & Company Seal
                </div>
              </div>
            </div>
          )}

          {/* Footer Page Number and Reference */}
          <div className="mt-12 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Vision Guard Security ERP · Ref: {quotation.quotationNumber}</span>
            <span>Commercial Document · Page 1 of 1</span>
          </div>
        </div>
      </div>

      {/* Delete Quotation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: 'spring', stiffness: 450, damping: 28 }}
              className="bg-neutral-900 border border-red-900/80 rounded-xl p-5 w-full max-w-md space-y-4 shadow-2xl"
            >
              <div className="flex items-center gap-3 text-red-400">
                <div className="w-10 h-10 rounded-full bg-red-950/60 border border-red-800 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Delete Quotation?</h3>
                  <p className="text-xs text-neutral-400">
                    Are you sure you want to delete quotation <span className="font-mono text-white">{quotation.quotationNumber}</span>?
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow cursor-pointer"
                >
                  Confirm Delete
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
