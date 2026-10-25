import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quotation, Client, ProductItem, QuotationLineItem, CompanyProfile } from '../types';
import { numberToWords } from '../utils/numberToWords';
import { getAutoArabicName } from '../utils/arabicTranslation';
import { 
  Plus, 
  Trash2, 
  Printer, 
  Save, 
  ArrowLeft, 
  Search, 
  UserPlus, 
  Package, 
  Check, 
  X, 
  FileText, 
  Calculator, 
  ShieldCheck, 
  Building, 
  Languages, 
  Sparkles, 
  PackagePlus, 
  AlertTriangle,
  UserX,
  CheckCircle2,
  ExternalLink,
  Info
} from 'lucide-react';

interface QuotationBuilderProps {
  initialQuotation?: Quotation | null;
  clients: Client[];
  products: ProductItem[];
  company: CompanyProfile;
  nextQuotationNumber: string;
  onSave: (quotation: Quotation, andPrint?: boolean) => void;
  onCancel: () => void;
  onAddNewClient: (client: Client) => void;
  onSaveProduct?: (product: ProductItem) => void;
  onDeleteQuotation?: (quotationId: string) => void;
  onDeleteClient?: (clientId: string) => void;
}

export const QuotationBuilder: React.FC<QuotationBuilderProps> = ({
  initialQuotation,
  clients,
  products,
  company,
  nextQuotationNumber,
  onSave,
  onCancel,
  onAddNewClient,
  onSaveProduct,
  onDeleteQuotation,
  onDeleteClient
}) => {
  // Quotation meta
  const [quotationNumber, setQuotationNumber] = useState(
    initialQuotation?.quotationNumber || nextQuotationNumber
  );
  const [reference, setReference] = useState(initialQuotation?.reference || '');
  const [date, setDate] = useState(
    initialQuotation?.date || new Date().toISOString().split('T')[0]
  );
  
  // Expiry defaults to 30 days
  const defaultExpiry = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  };
  const [validUntil, setValidUntil] = useState(
    initialQuotation?.validUntil || defaultExpiry()
  );
  const [status, setStatus] = useState<Quotation['status']>(
    initialQuotation?.status || 'draft'
  );

  // Client Selection
  const [selectedClientId, setSelectedClientId] = useState<string>(
    initialQuotation?.clientId || (clients[0]?.id || '')
  );
  const [isAddingNewClient, setIsAddingNewClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');
  const [newClientTaxId, setNewClientTaxId] = useState('');

  // Toast notification for in-builder actions
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'danger' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'danger' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Line Items
  const [items, setItems] = useState<QuotationLineItem[]>(
    initialQuotation?.items && initialQuotation.items.length > 0
      ? initialQuotation.items
      : [
          {
            id: 'item-' + Date.now(),
            name: '',
            arabicName: '',
            description: '',
            quantity: 1,
            unit: 'Pcs',
            unitPrice: 0,
            discountPercent: 0,
            total: 0
          }
        ]
  );

  // Additional options
  const [taxRate, setTaxRate] = useState<number>(
    initialQuotation?.taxRate !== undefined ? initialQuotation.taxRate : 15
  );
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>(
    initialQuotation?.discountType || 'percentage'
  );
  const [discountValue, setDiscountValue] = useState<number>(
    initialQuotation?.discountValue || 0
  );
  const [shippingCost, setShippingCost] = useState<number>(
    initialQuotation?.shippingCost || 0
  );
  const [terms, setTerms] = useState<string[]>(
    initialQuotation?.termsAndConditions || company.defaultTerms
  );
  const [notes, setNotes] = useState<string>(
    initialQuotation?.notes || company.defaultNotes
  );
  const [warrantyText, setWarrantyText] = useState<string>(
    initialQuotation?.warrantyText || '2 Years Comprehensive Hardware Warranty (2 سنوات ضمان شامل)'
  );
  const [leadTime, setLeadTime] = useState<string>(
    initialQuotation?.leadTime || 'Immediate ex-stock / 3 to 5 business days'
  );

  // Catalog picker & inline product creation
  const [activeItemIndexForCatalog, setActiveItemIndexForCatalog] = useState<number | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [isAddingNewProductInline, setIsAddingNewProductInline] = useState(false);
  const [inlineProdName, setInlineProdName] = useState('');
  const [inlineProdArabic, setInlineProdArabic] = useState('');
  const [inlineProdPrice, setInlineProdPrice] = useState<number>(0);
  const [inlineProdUnit, setInlineProdUnit] = useState('Pcs');
  const [inlineProdCode, setInlineProdCode] = useState('');
  const [inlineProdCategory, setInlineProdCategory] = useState('IP Surveillance');
  const [activeSuggestIndex, setActiveSuggestIndex] = useState<number | null>(null);

  // Delete Quotation & Client modals
  const [showDeleteQuoteModal, setShowDeleteQuoteModal] = useState(false);
  const [showDeleteClientConfirm, setShowDeleteClientConfirm] = useState(false);

  // Line item helpers
  const updateItem = (index: number, changes: Partial<QuotationLineItem>) => {
    setItems(prev => {
      const next = [...prev];
      const current = { ...next[index], ...changes };

      const qty = typeof current.quantity === 'number' ? current.quantity : 0;
      const rate = typeof current.unitPrice === 'number' ? current.unitPrice : 0;
      const disc = typeof current.discountPercent === 'number' ? current.discountPercent : 0;

      const gross = qty * rate;
      const net = gross - (gross * (disc / 100));
      current.total = Math.max(0, net);

      next[index] = current;
      return next;
    });
  };

  const addItem = () => {
    setItems(prev => [
      ...prev,
      {
        id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        name: '',
        arabicName: '',
        description: '',
        quantity: 1,
        unit: 'Pcs',
        unitPrice: 0,
        discountPercent: 0,
        total: 0
      }
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) {
      updateItem(0, { name: '', arabicName: '', description: '', quantity: 1, unitPrice: 0, discountPercent: 0, total: 0, productId: undefined });
      return;
    }
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const selectProductForLine = (product: ProductItem, index: number) => {
    updateItem(index, {
      productId: product.id,
      code: product.code,
      name: product.name,
      arabicName: product.arabicName || getAutoArabicName(product.name),
      description: product.description,
      unitPrice: product.unitPrice,
      unit: product.unit
    });
    setActiveItemIndexForCatalog(null);
    setProductSearch('');
    showToast(`Selected "${product.name}" for item #${index + 1}`, 'info');
  };

  // Instant save custom item directly to catalog right from where typed
  const handleSaveLineItemToCatalog = (item: QuotationLineItem) => {
    if (!item.name.trim() || !onSaveProduct) return;
    const arabic = item.arabicName?.trim() || getAutoArabicName(item.name);
    const newProd: ProductItem = {
      id: 'prod-' + Date.now(),
      code: item.code?.trim() || 'VG-' + Date.now().toString().slice(-4),
      name: item.name.trim(),
      arabicName: arabic,
      description: item.description || '',
      unitPrice: item.unitPrice || 0,
      unit: item.unit || 'Pcs',
      category: 'IP Surveillance'
    };
    onSaveProduct(newProd);

    // Link product ID and update item row
    const targetIdx = items.findIndex(it => it.id === item.id);
    if (targetIdx !== -1) {
      updateItem(targetIdx, { 
        productId: newProd.id, 
        arabicName: arabic,
        code: newProd.code
      });
    }

    showToast(`✨ "${newProd.name}" saved to Product Catalog! You can pick it anytime.`, 'success');
  };

  // Inline product creation from catalog picker modal
  const handleInlineProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineProdName.trim() || !onSaveProduct) return;
    const arabic = inlineProdArabic.trim() || getAutoArabicName(inlineProdName);
    const newProd: ProductItem = {
      id: 'prod-' + Date.now(),
      code: inlineProdCode.trim() || 'VG-' + Date.now().toString().slice(-4),
      name: inlineProdName.trim(),
      arabicName: arabic,
      description: '',
      unitPrice: Math.max(0, inlineProdPrice),
      unit: inlineProdUnit || 'Pcs',
      category: inlineProdCategory || 'IP Surveillance'
    };
    onSaveProduct(newProd);

    if (activeItemIndexForCatalog !== null) {
      selectProductForLine(newProd, activeItemIndexForCatalog);
    }

    setIsAddingNewProductInline(false);
    setInlineProdName('');
    setInlineProdArabic('');
    setInlineProdCode('');
    setInlineProdPrice(0);
    showToast(`Product "${newProd.name}" added to catalog!`, 'success');
  };

  const handleAddNewClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim() && !newClientCompany.trim()) return;

    const newClient: Client = {
      id: 'cli-' + Date.now(),
      name: newClientName.trim() || newClientCompany.trim(),
      companyName: newClientCompany.trim(),
      email: newClientEmail.trim(),
      phone: newClientPhone.trim(),
      address: newClientAddress.trim(),
      city: '',
      taxId: newClientTaxId.trim(),
      createdAt: new Date().toISOString().split('T')[0]
    };

    onAddNewClient(newClient);
    setSelectedClientId(newClient.id);
    setIsAddingNewClient(false);
    setNewClientName('');
    setNewClientCompany('');
    setNewClientPhone('');
    setNewClientEmail('');
    setNewClientAddress('');
    setNewClientTaxId('');
    showToast(`Client "${newClient.companyName || newClient.name}" created and assigned!`, 'success');
  };

  const handleDeleteCurrentClient = () => {
    if (!selectedClientId || !onDeleteClient) return;
    const clientToDelete = clients.find(c => c.id === selectedClientId);
    const name = clientToDelete?.companyName || clientToDelete?.name || 'Client';
    onDeleteClient(selectedClientId);
    setSelectedClientId('');
    setShowDeleteClientConfirm(false);
    showToast(`Client "${name}" removed from CRM`, 'danger');
  };

  // Calculations
  const subtotal = items.reduce((acc, it) => acc + (it.total || 0), 0);
  const discountAmount =
    discountType === 'percentage'
      ? subtotal * (discountValue / 100)
      : Math.min(subtotal, discountValue);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const vatAmount = taxableAmount * (taxRate / 100);
  const grandTotal = taxableAmount + vatAmount + Number(shippingCost || 0);

  const handleSave = (andPrint = false) => {
    if (!selectedClientId) {
      alert('Please select or create a client before saving.');
      return;
    }
    const validItems = items.filter(it => it.name.trim() !== '');
    if (validItems.length === 0) {
      alert('Please add at least one line item with a name.');
      return;
    }

    const clientSnapshot = clients.find(c => c.id === selectedClientId) || clients[0];

    const quotationData: Quotation = {
      id: initialQuotation ? initialQuotation.id : 'qt-' + Date.now(),
      quotationNumber,
      reference,
      date,
      validUntil,
      status,
      clientId: selectedClientId,
      clientSnapshot,
      items: validItems.map(it => ({
        ...it,
        arabicName: it.arabicName?.trim() || getAutoArabicName(it.name)
      })),
      subtotal,
      discountType,
      discountValue,
      discountAmount,
      taxRate,
      taxAmount: vatAmount,
      shippingCost,
      grandTotal,
      totalInWords: numberToWords(grandTotal, company.currencyCode),
      termsAndConditions: terms.filter(t => t.trim() !== ''),
      notes,
      warrantyText,
      leadTime,
      templateStyle: initialQuotation?.templateStyle || 'corporate',
      showBankDetails: initialQuotation?.showBankDetails ?? true,
      showSignature: initialQuotation?.showSignature ?? true,
      showTerms: initialQuotation?.showTerms ?? true,
      createdAt: initialQuotation ? initialQuotation.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(quotationData, andPrint);
  };

  const handleDeleteThisQuotation = () => {
    if (!initialQuotation || !onDeleteQuotation) return;
    onDeleteQuotation(initialQuotation.id);
  };

  const selectedClient = clients.find(c => c.id === selectedClientId);

  return (
    <div className="space-y-6 pb-20 relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold backdrop-blur-md ${
              toastMessage.type === 'danger'
                ? 'bg-red-950/90 text-red-200 border-red-500/50'
                : toastMessage.type === 'info'
                ? 'bg-blue-950/90 text-blue-200 border-blue-500/50'
                : 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50'
            }`}
          >
            {toastMessage.type === 'danger' ? (
              <UserX className="w-4 h-4 text-red-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
            title="Return to Quotation List"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{initialQuotation ? 'Edit Quotation' : 'Create Commercial Quotation'}</span>
              <span className="text-xs font-mono bg-cyan-950/60 text-cyan-400 border border-cyan-800/60 px-2 py-0.5 rounded-md">
                {quotationNumber}
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Vision Guard official proposal builder • Bilingual English + Arabic print generation.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
          {initialQuotation && onDeleteQuotation && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDeleteQuoteModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/60 rounded-xl font-semibold text-xs cursor-pointer transition-colors min-h-[38px]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Quote</span>
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSave(false)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-semibold text-xs transition-colors cursor-pointer border border-neutral-700 min-h-[38px]"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSave(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer min-h-[38px]"
          >
            <Printer className="w-4 h-4" />
            <span>Save &amp; Print / PDF</span>
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content: Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Metadata Card */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3.5 sm:p-5 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              Quotation Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Quotation Number *
                </label>
                <input
                  type="text"
                  value={quotationNumber}
                  onChange={(e) => setQuotationNumber(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700/80 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700/80 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Valid Until (30 Days)
                </label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700/80 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">
                Project Subject / Reference
              </label>
              <input
                type="text"
                placeholder="e.g. Supply & Installation of 4K IP CCTV & Central Monitoring System"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Client Selection & CRM Options Card */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-cyan-400" />
                <span>Client &amp; Billing Account</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsAddingNewClient(!isAddingNewClient)}
                className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                {isAddingNewClient ? 'Select Registered Client' : '+ Add New Client to CRM'}
              </button>
            </div>

            {!isAddingNewClient ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <select
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">-- Choose Client from CRM Directory --</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.companyName ? `${c.companyName} (${c.name})` : c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Client Delete / Deselect Buttons */}
                  {selectedClientId && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedClientId('')}
                        className="px-2.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1 transition-colors"
                        title="Deselect or clear client name"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Deselect</span>
                      </button>

                      {onDeleteClient && (
                        <button
                          type="button"
                          onClick={() => setShowDeleteClientConfirm(true)}
                          className="px-2.5 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/50 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1 transition-colors"
                          title="Delete this client permanently from CRM"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Delete from CRM</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected client preview badge */}
                {selectedClient ? (
                  <div className="p-3 bg-neutral-950/70 rounded-xl border border-neutral-800 text-xs text-neutral-400 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span><strong className="text-white">Account:</strong> {selectedClient.companyName || selectedClient.name}</span>
                      {selectedClient.contactPerson && (
                        <span><strong className="text-white">Attn:</strong> {selectedClient.contactPerson}</span>
                      )}
                      {selectedClient.phone && (
                        <span className="font-mono"><strong className="text-white">Tel:</strong> {selectedClient.phone}</span>
                      )}
                      {selectedClient.taxId && (
                        <span className="font-mono text-[11px] text-neutral-500">{selectedClient.taxId}</span>
                      )}
                    </div>

                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-2 py-0.5 rounded">
                      Linked to Quote
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-xl text-xs text-amber-300 flex items-center gap-2">
                    <Info className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>No client selected yet. Please select an existing client or click "+ Add New Client to CRM".</span>
                  </div>
                )}
              </div>
            ) : (
              /* Inline new client form */
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
                  Add &amp; Save New Client to CRM
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    placeholder="Company / Facility Name *"
                    value={newClientCompany}
                    onChange={(e) => setNewClientCompany(e.target.value)}
                    className="bg-neutral-900 border border-neutral-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <input
                    type="text"
                    placeholder="Contact Person Name"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="bg-neutral-900 border border-neutral-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <input
                    type="text"
                    placeholder="Phone Number (e.g. +966 50 ...)"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="bg-neutral-900 border border-neutral-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    className="bg-neutral-900 border border-neutral-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <input
                    type="text"
                    placeholder="Client CR / VAT Tax ID Number"
                    value={newClientTaxId}
                    onChange={(e) => setNewClientTaxId(e.target.value)}
                    className="bg-neutral-900 border border-neutral-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 sm:col-span-2 font-mono"
                  />
                  <textarea
                    rows={2}
                    placeholder="Physical Address / District / City"
                    value={newClientAddress}
                    onChange={(e) => setNewClientAddress(e.target.value)}
                    className="bg-neutral-900 border border-neutral-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 sm:col-span-2 resize-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingNewClient(false)}
                    className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddNewClientSubmit}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Save &amp; Select Client
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Line Items Section */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3.5 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-cyan-400" />
                  Quotation Line Items &amp; Catalog
                </h2>
                <p className="text-xs text-neutral-400">
                  Pick from catalog or type custom items. Any unsaved item can be saved to catalog instantly right from the row!
                </p>
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={addItem}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl transition-all cursor-pointer shadow-sm shadow-cyan-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item Row</span>
              </motion.button>
            </div>

            {/* Line items list with spring animation */}
            <div className="space-y-3.5">
              <AnimatePresence mode="popLayout">
                {items.map((item, index) => {
                  const currentArabic = item.arabicName || getAutoArabicName(item.name);
                  const isSavedInCatalog = Boolean(
                    item.productId || 
                    (item.name.trim() && products.some(p => p.name.trim().toLowerCase() === item.name.trim().toLowerCase()))
                  );

                  return (
                    <motion.div
                      key={item.id || index}
                      layout
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, height: 0, scale: 0.92, marginBottom: 0 }}
                      transition={{ duration: 0.25 }}
                      className="bg-neutral-950 border border-neutral-800/90 hover:border-cyan-500/40 rounded-xl p-3 sm:p-4 space-y-3 transition-colors relative shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-cyan-400 font-bold bg-neutral-900 border border-neutral-800 px-2.5 py-0.5 rounded-lg">
                            Item #{index + 1}
                          </span>
                          {isSavedInCatalog ? (
                            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-400" />
                              In Catalog
                            </span>
                          ) : item.name.trim() ? (
                            <span className="text-[10px] font-semibold text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                              Custom (Not Saved)
                            </span>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Pick from catalog button */}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveItemIndexForCatalog(activeItemIndexForCatalog === index ? null : index);
                              setProductSearch('');
                              setIsAddingNewProductInline(false);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 border border-cyan-800/60 px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
                          >
                            <Package className="w-3 h-3" />
                            <span>Catalog</span>
                          </button>

                          {/* Quick Save to Catalog Button if item has name and not in catalog */}
                          {onSaveProduct && item.name.trim() && !isSavedInCatalog && (
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleSaveLineItemToCatalog(item)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 hover:text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-2.5 py-1 rounded-lg cursor-pointer shadow-sm transition-all"
                              title="Save this typed item to product catalog right now"
                            >
                              <PackagePlus className="w-3 h-3" />
                              <span>Save to Catalog</span>
                            </motion.button>
                          )}

                          {/* Delete Item Button */}
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeItem(index)}
                            className="text-neutral-500 hover:text-red-400 p-1.5 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Remove line item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </motion.button>
                        </div>
                      </div>

                      {/* Catalog dropdown modal for this item */}
                      <AnimatePresence>
                        {activeItemIndexForCatalog === index && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-3.5 bg-neutral-900 border border-cyan-500/50 rounded-xl space-y-2.5 my-2 overflow-hidden shadow-xl"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <Package className="w-3.5 h-3.5 text-cyan-400" />
                                Select Product or Equipment from Catalog:
                              </span>
                              <div className="flex items-center gap-2">
                                {onSaveProduct && (
                                  <button
                                    type="button"
                                    onClick={() => setIsAddingNewProductInline(!isAddingNewProductInline)}
                                    className="text-[11px] text-cyan-300 hover:text-white font-semibold px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/80 cursor-pointer"
                                  >
                                    {isAddingNewProductInline ? 'Back to List' : '+ Add New Product'}
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setActiveItemIndexForCatalog(null)}
                                  className="text-neutral-400 hover:text-white p-1 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Inline new product creation inside catalog picker */}
                            {isAddingNewProductInline ? (
                              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 space-y-2.5 text-xs">
                                <span className="font-semibold text-white block">Add New Product to Catalog:</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    placeholder="Product Name (English) *"
                                    value={inlineProdName}
                                    onChange={(e) => {
                                      setInlineProdName(e.target.value);
                                      if (!inlineProdArabic) {
                                        setInlineProdArabic(getAutoArabicName(e.target.value));
                                      }
                                    }}
                                    className="bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white"
                                  />
                                  <input
                                    type="text"
                                    dir="rtl"
                                    placeholder="الاسم بالعربي..."
                                    value={inlineProdArabic}
                                    onChange={(e) => setInlineProdArabic(e.target.value)}
                                    className="bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white font-sans text-right"
                                  />
                                  <input
                                    type="number"
                                    placeholder="Standard Rate (SAR) *"
                                    value={inlineProdPrice || ''}
                                    onChange={(e) => setInlineProdPrice(parseFloat(e.target.value) || 0)}
                                    className="bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Item Code (e.g. VG-CAM-099)"
                                    value={inlineProdCode}
                                    onChange={(e) => setInlineProdCode(e.target.value)}
                                    className="bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                                  />
                                </div>
                                <div className="flex justify-end gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => setIsAddingNewProductInline(false)}
                                    className="px-2.5 py-1 text-neutral-400 hover:text-white"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleInlineProductSubmit}
                                    className="px-3.5 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white rounded-lg font-bold cursor-pointer"
                                  >
                                    Save &amp; Pick for Item
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="relative">
                                  <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2" />
                                  <input
                                    type="text"
                                    placeholder="Search catalog items by name, code or description..."
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg text-xs pl-8 pr-2.5 py-1.5 text-white focus:outline-none focus:border-cyan-500"
                                    autoFocus
                                  />
                                </div>
                                <div className="max-h-48 overflow-y-auto divide-y divide-neutral-800">
                                  {products
                                    .filter(p => 
                                      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                                      p.code.toLowerCase().includes(productSearch.toLowerCase()) ||
                                      (p.arabicName && p.arabicName.toLowerCase().includes(productSearch.toLowerCase())) ||
                                      (p.description && p.description.toLowerCase().includes(productSearch.toLowerCase()))
                                    )
                                    .map(prod => (
                                      <button
                                        key={prod.id}
                                        type="button"
                                        onClick={() => selectProductForLine(prod, index)}
                                        className="w-full text-left py-2 px-2.5 hover:bg-neutral-800/80 flex items-center justify-between text-xs transition-colors cursor-pointer rounded-lg"
                                      >
                                        <div className="max-w-md">
                                          <div className="font-semibold text-white">{prod.name}</div>
                                          {prod.arabicName && (
                                            <div className="text-[11px] text-cyan-400 font-sans" dir="rtl">{prod.arabicName}</div>
                                          )}
                                          <span className="text-[10px] text-neutral-500 font-mono">[{prod.code}]</span>
                                        </div>
                                        <div className="text-right shrink-0 ml-3">
                                          <span className="font-mono text-neutral-200 font-bold">
                                            {company.currencySymbol} {prod.unitPrice.toLocaleString()}
                                          </span>
                                          <span className="text-[10px] text-neutral-500 block">/{prod.unit}</span>
                                        </div>
                                      </button>
                                    ))}
                                </div>
                              </>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Item Model, Name & Arabic Inputs with Instant Catalog Autocomplete */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        {/* Model Number / Item Code Input */}
                        <div className="sm:col-span-3">
                          <label className="block text-xs text-neutral-300 font-semibold mb-1">
                            Model Number / Code
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. VG-CAM-4K"
                            value={item.code || ''}
                            onChange={(e) => updateItem(index, { code: e.target.value })}
                            onFocus={() => setActiveSuggestIndex(index)}
                            className="w-full bg-neutral-900 border border-neutral-700/90 rounded-xl px-3 py-2 text-sm text-cyan-300 font-mono focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all font-semibold"
                          />
                        </div>

                        {/* English Product Name with Live Search & Dropdown Suggestions */}
                        <div className="sm:col-span-5 relative">
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs text-neutral-200 font-bold">
                              English Product / Service Name *
                            </label>
                            {products.length > 0 && (
                              <span className="text-[10px] text-cyan-400 font-medium">
                                Auto-suggests from catalog
                              </span>
                            )}
                          </div>

                          <div className="relative">
                            <input
                              type="text"
                              placeholder="e.g. Hikvision 8MP 4K Bullet Camera"
                              value={item.name}
                              onFocus={() => setActiveSuggestIndex(index)}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateItem(index, { 
                                  name: val,
                                  arabicName: item.arabicName ? item.arabicName : getAutoArabicName(val)
                                });
                                setActiveSuggestIndex(index);
                              }}
                              className="w-full bg-neutral-900 border border-neutral-700/90 rounded-xl px-3.5 py-2 text-sm text-white font-medium focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/25 transition-all"
                            />

                            {/* Live Floating Catalog Dropdown Popover */}
                            <AnimatePresence>
                              {activeSuggestIndex === index && products.length > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-neutral-900/95 border border-cyan-500/50 rounded-xl shadow-2xl overflow-hidden backdrop-blur-md max-w-lg min-w-full"
                                >
                                  {/* Filter matching products by name or code */}
                                  {(() => {
                                    const q = (item.name || item.code || '').trim().toLowerCase();
                                    const matching = products.filter(p => {
                                      if (!q) return true;
                                      return (
                                        (p.name && p.name.toLowerCase().includes(q)) ||
                                        (p.code && p.code.toLowerCase().includes(q)) ||
                                        (p.arabicName && p.arabicName.toLowerCase().includes(q)) ||
                                        (p.description && p.description.toLowerCase().includes(q))
                                      );
                                    }).slice(0, 7);

                                    return (
                                      <>
                                        <div className="px-3 py-1.5 bg-neutral-950/90 border-b border-neutral-800 flex items-center justify-between text-[11px] text-cyan-400 font-semibold">
                                          <span>
                                            {matching.length > 0 ? `Matching Catalog Items (${matching.length})` : 'Catalog Search'}
                                          </span>
                                          <button
                                            type="button"
                                            onMouseDown={(e) => {
                                              e.preventDefault();
                                              setActiveSuggestIndex(null);
                                            }}
                                            className="text-neutral-500 hover:text-white text-[10px]"
                                          >
                                            Close ✕
                                          </button>
                                        </div>

                                        {matching.length > 0 ? (
                                          <div className="max-h-56 overflow-y-auto divide-y divide-neutral-800/80">
                                            {matching.map((prod) => (
                                              <div
                                                key={prod.id}
                                                onMouseDown={(e) => {
                                                  e.preventDefault();
                                                  selectProductForLine(prod, index);
                                                  setActiveSuggestIndex(null);
                                                }}
                                                className="p-3 hover:bg-cyan-950/50 flex items-center justify-between transition-colors cursor-pointer group"
                                              >
                                                <div className="min-w-0 pr-3">
                                                  <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold shrink-0">
                                                      {prod.code}
                                                    </span>
                                                    <span className="font-bold text-white text-sm group-hover:text-cyan-200 transition-colors truncate">
                                                      {prod.name}
                                                    </span>
                                                  </div>
                                                  {prod.arabicName && (
                                                    <div className="text-xs text-neutral-400 font-sans mt-0.5" dir="rtl">
                                                      {prod.arabicName}
                                                    </div>
                                                  )}
                                                </div>
                                                <div className="text-right shrink-0">
                                                  <span className="font-mono text-emerald-400 font-bold text-sm block">
                                                    {company.currencySymbol} {prod.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                  </span>
                                                  <span className="text-[11px] text-neutral-400">/{prod.unit}</span>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <div className="p-3.5 text-center space-y-2">
                                            <p className="text-xs text-neutral-300">
                                              "{item.name}" is not in the product catalog yet.
                                            </p>
                                          </div>
                                        )}

                                        {/* Save as New Option in Dropdown */}
                                        {!isSavedInCatalog && item.name.trim().length > 1 && (
                                          <div className="p-2.5 bg-neutral-950/90 border-t border-neutral-800">
                                            <button
                                              type="button"
                                              onMouseDown={(e) => {
                                                e.preventDefault();
                                                handleSaveLineItemToCatalog(item);
                                                setActiveSuggestIndex(null);
                                              }}
                                              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-600/20 cursor-pointer"
                                            >
                                              <PackagePlus className="w-4 h-4" />
                                              <span>+ Save "{item.name}" as New Product in Catalog</span>
                                            </button>
                                          </div>
                                        )}
                                      </>
                                    );
                                  })()}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Instant Save to Catalog Card if not in catalog */}
                          {item.name.trim().length > 1 && !isSavedInCatalog && (
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-2 p-2.5 bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border border-cyan-500/40 rounded-xl flex items-center justify-between gap-3 shadow-md"
                            >
                              <div className="flex items-center gap-2 text-xs text-cyan-300">
                                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
                                <span>Not in catalog yet: save for next time</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleSaveLineItemToCatalog(item)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-lg font-bold text-xs shadow-md shadow-emerald-500/20 cursor-pointer transition-all active:scale-95 shrink-0"
                              >
                                <PackagePlus className="w-3.5 h-3.5" />
                                <span>Save to Catalog</span>
                              </button>
                            </motion.div>
                          )}

                          {/* Saved indicator */}
                          {item.name.trim().length > 1 && isSavedInCatalog && (
                            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>✓ Saved in Product Catalog ({item.code || 'Catalog Item'})</span>
                            </div>
                          )}
                        </div>

                        {/* Arabic Title with Auto-Generate Sparkle Button */}
                        <div className="sm:col-span-4">
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs text-cyan-300 font-semibold flex items-center gap-1">
                              <Languages className="w-3.5 h-3.5 text-cyan-400" />
                              Auto Arabic (عربي)
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const generated = getAutoArabicName(item.name);
                                updateItem(index, { arabicName: generated });
                                showToast(`Auto-Arabic generated: "${generated}"`, 'info');
                              }}
                              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-medium"
                              title="Re-generate Arabic Translation"
                            >
                              <Sparkles className="w-3 h-3 text-amber-400" />
                              <span>Auto-Translate</span>
                            </button>
                          </div>
                          <input
                            type="text"
                            dir="rtl"
                            placeholder="الاسم بالعربي للطباعة..."
                            value={item.arabicName !== undefined ? item.arabicName : currentArabic}
                            onChange={(e) => updateItem(index, { arabicName: e.target.value })}
                            className="w-full bg-neutral-900 border border-neutral-700/90 rounded-xl px-3 py-2 text-sm text-white font-sans text-right placeholder:text-neutral-500 focus:border-cyan-500 focus:outline-none"
                          />
                        </div>

                        {/* Description */}
                        <div className="sm:col-span-12">
                          <input
                            type="text"
                            placeholder="Optional technical specs (e.g. 8MP IR 30m, IP67 weatherproof, PoE powered)..."
                            value={item.description || ''}
                            onChange={(e) => updateItem(index, { description: e.target.value })}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      </div>

                      {/* Quantity, Unit, Price, Discount, Total Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-neutral-800">
                        <div>
                          <label className="block text-xs text-neutral-300 mb-1 font-semibold">Quantity</label>
                          <input
                            type="number"
                            min="0.1"
                            step="any"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, { quantity: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-neutral-900 border border-neutral-700/80 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500 font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-neutral-300 mb-1 font-semibold">Unit</label>
                          <select
                            value={item.unit}
                            onChange={(e) => updateItem(index, { unit: e.target.value })}
                            className="w-full bg-neutral-900 border border-neutral-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                          >
                            <option value="Pcs">Pcs (حبة)</option>
                            <option value="Set">Set (طقم)</option>
                            <option value="Meter">Meter (متر)</option>
                            <option value="Roll">Roll (لفة)</option>
                            <option value="Box">Box (صندوق)</option>
                            <option value="Lot">Lot (دفعة)</option>
                            <option value="Point">Point (نقطة)</option>
                            <option value="Hours">Hours (ساعة)</option>
                            <option value="Month">Month (شهر)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs text-neutral-300 mb-1 font-semibold">Unit Price ({company.currencySymbol})</label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={item.unitPrice || ''}
                            onChange={(e) => updateItem(index, { unitPrice: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-neutral-900 border border-neutral-700/80 rounded-xl px-3 py-2 text-sm text-emerald-400 font-mono font-bold focus:outline-none focus:border-cyan-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-neutral-300 mb-1 font-semibold">Discount (%)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.discountPercent || ''}
                            onChange={(e) => updateItem(index, { discountPercent: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-neutral-900 border border-neutral-700/80 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
                          />
                        </div>

                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-xs text-cyan-300 mb-1 font-semibold">Total ({company.currencySymbol})</label>
                          <div className="w-full bg-neutral-900/90 border border-cyan-500/30 rounded-xl px-3 py-2 text-sm sm:text-base text-cyan-300 font-mono font-bold flex items-center justify-end">
                            {item.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Scope, Warranty & Terms Card */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Terms, Warranty &amp; Delivery Lead Time
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Warranty Coverage
                </label>
                <input
                  type="text"
                  value={warrantyText}
                  onChange={(e) => setWarrantyText(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700/80 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Lead Time / Delivery Period
                </label>
                <input
                  type="text"
                  value={leadTime}
                  onChange={(e) => setLeadTime(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700/80 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">
                Standard Commercial Terms (one per line)
              </label>
              <textarea
                rows={4}
                value={terms.join('\n')}
                onChange={(e) => setTerms(e.target.value.split('\n'))}
                className="w-full bg-neutral-950 border border-neutral-700/80 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Financials Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-5 space-y-4 sticky top-6 shadow-xl">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-cyan-400" />
              Financials &amp; Total
            </h2>

            {/* Calculations Breakdown */}
            <div className="space-y-2.5 text-xs border-b border-neutral-800 pb-4">
              <div className="flex justify-between text-neutral-300">
                <span>Gross Subtotal:</span>
                <span className="font-mono font-bold text-white">
                  {company.currencySymbol} {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Overall Discount */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="flex items-center gap-1">Discount:</span>
                  <div className="flex items-center gap-1">
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                      className="bg-neutral-950 border border-neutral-700 text-[10px] text-white rounded px-1.5 py-0.5"
                    >
                      <option value="percentage">%</option>
                      <option value="fixed">{company.currencySymbol}</option>
                    </select>
                    <input
                      type="number"
                      min="0"
                      value={discountValue || ''}
                      onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                      className="w-16 bg-neutral-950 border border-neutral-700 text-xs text-white rounded px-1.5 py-0.5 font-mono text-right"
                    />
                  </div>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 text-[11px]">
                    <span>Discount Deducted:</span>
                    <span className="font-mono">-{company.currencySymbol} {discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>

              {/* Taxable Amount */}
              <div className="flex justify-between text-neutral-300 pt-1">
                <span>Taxable Net Amount:</span>
                <span className="font-mono font-bold text-white">
                  {company.currencySymbol} {taxableAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* VAT / Tax Rate */}
              <div className="flex items-center justify-between text-neutral-300">
                <div className="flex items-center gap-1.5">
                  <span>VAT Rate:</span>
                  <select
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    className="bg-neutral-950 border border-neutral-700 text-[10px] text-white rounded px-1.5 py-0.5"
                  >
                    <option value={15}>15% (KSA Standard)</option>
                    <option value={5}>5% (UAE Standard)</option>
                    <option value={0}>0% (Tax Exempt)</option>
                  </select>
                </div>
                <span className="font-mono font-bold text-white">
                  {company.currencySymbol} {vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Shipping / Mobilization fee */}
              <div className="flex items-center justify-between text-neutral-300 pt-1">
                <span>Shipping / Mobilization:</span>
                <input
                  type="number"
                  min="0"
                  value={shippingCost || ''}
                  onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-20 bg-neutral-950 border border-neutral-700 text-xs text-white rounded px-1.5 py-0.5 font-mono text-right"
                />
              </div>
            </div>

            {/* Grand Total Display */}
            <div className="p-4 bg-gradient-to-br from-neutral-950 via-neutral-900 to-cyan-950/40 border border-cyan-500/30 rounded-xl space-y-2">
              <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Grand Total (شامل الضريبة 15%)
              </div>
              <div className="text-2xl font-black text-white font-mono flex items-baseline gap-1.5">
                <span className="text-sm text-cyan-400 font-sans">{company.currencySymbol}</span>
                <span>{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="text-[10px] text-neutral-400 italic leading-snug">
                {numberToWords(grandTotal, company.currencyCode)}
              </div>
            </div>

            {/* Status Selector */}
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">
                Quotation Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Quotation['status'])}
                className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl px-3 py-2 text-xs text-white capitalize focus:outline-none focus:border-cyan-500"
              >
                <option value="draft">Draft (مسودة)</option>
                <option value="sent">Sent (تم الإرسال)</option>
                <option value="pending">Pending Follow-up (قيد المتابعة)</option>
                <option value="accepted">Accepted / Won (معتمد / فوز)</option>
                <option value="rejected">Rejected (مرفوض)</option>
                <option value="invoiced">Invoiced (تمت الفوترة)</option>
              </select>
            </div>

            {/* Primary Action Buttons */}
            <div className="pt-2 space-y-2.5">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSave(true)}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Save &amp; Print / Export PDF</span>
              </motion.button>

              <button
                type="button"
                onClick={() => handleSave(false)}
                className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs rounded-xl border border-neutral-700 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save and Return to List</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Quotation Modal */}
      <AnimatePresence>
        {showDeleteQuoteModal && initialQuotation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: 'spring', stiffness: 450, damping: 28 }}
              className="bg-neutral-900 border border-red-500/40 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl relative"
            >
              <div className="flex items-center gap-3 text-red-400">
                <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Delete Quotation?</h3>
                  <p className="text-xs text-neutral-400">
                    Are you sure you want to delete quotation <span className="font-mono text-white font-bold">{initialQuotation.quotationNumber}</span>?
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteQuoteModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleDeleteThisQuotation}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-lg shadow-red-600/30 cursor-pointer"
                >
                  Confirm Delete
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Client Confirm Modal in Builder */}
      <AnimatePresence>
        {showDeleteClientConfirm && selectedClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              className="bg-neutral-900 border border-red-500/40 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl"
            >
              <div className="flex items-center gap-3 text-red-400">
                <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800 flex items-center justify-center shrink-0">
                  <UserX className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Delete Client from CRM?</h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Delete <span className="text-white font-bold">"{selectedClient.companyName || selectedClient.name}"</span>?
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-red-400/90 bg-red-950/30 border border-red-900/40 p-2.5 rounded-lg">
                This will permanently delete this client record from the CRM directory.
              </p>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteClientConfirm(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteCurrentClient}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-lg shadow-red-600/30 cursor-pointer"
                >
                  Delete Client
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
