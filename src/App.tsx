import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Client, 
  CompanyProfile, 
  ProductItem, 
  Quotation, 
  QuotationStatus 
} from './types';
import { storage } from './utils/storage';
import { Sidebar, NavigationTab } from './components/Sidebar';
import { QuotationList } from './components/QuotationList';
import { QuotationBuilder } from './components/QuotationBuilder';
import { QuotationPrintView } from './components/QuotationPrintView';
import { ClientManager } from './components/ClientManager';
import { ProductManager } from './components/ProductManager';
import { CompanySettings } from './components/CompanySettings';
import { ThemeToggle } from './components/ThemeToggle';
import { CyberCursor } from './components/CyberCursor';
import { 
  Menu, 
  X, 
  Plus, 
  Check, 
  Printer, 
  Languages,
  Sparkles,
  Crosshair
} from 'lucide-react';

export default function App() {
  // Theme state: Day (light) vs Night (dark)
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

  // Core application state loaded from local storage
  const [company, setCompany] = useState<CompanyProfile>(storage.getCompanyProfile());
  const [clients, setClients] = useState<Client[]>(storage.getClients());
  const [products, setProducts] = useState<ProductItem[]>(storage.getProducts());
  const [quotations, setQuotations] = useState<Quotation[]>(storage.getQuotations());

  // Navigation and active views
  const [currentTab, setCurrentTab] = useState<NavigationTab>('quotations');
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [printingQuotation, setPrintingQuotation] = useState<Quotation | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Cyber Cursor Animation state (Enabled by default)
  const [cursorAnimation, setCursorAnimation] = useState<boolean>(() => {
    const saved = localStorage.getItem('vision_guard_cursor_anim');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleCursorAnimation = () => {
    setCursorAnimation(prev => {
      const next = !prev;
      localStorage.setItem('vision_guard_cursor_anim', String(next));
      showToast(next ? 'Cyber Cursor FX Active' : 'Cursor FX Disabled');
      return next;
    });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Switch to new quotation builder
  const handleStartCreateQuotation = (prefilledClientId?: string) => {
    if (prefilledClientId) {
      const client = clients.find(c => c.id === prefilledClientId);
      if (client) {
        setEditingQuotation({
          id: '',
          quotationNumber: storage.getNextQuotationNumber(),
          reference: `Proposal for ${client.companyName || client.name}`,
          date: new Date().toISOString().split('T')[0],
          validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          clientId: client.id,
          clientSnapshot: client,
          items: [],
          subtotal: 0,
          discountType: 'percentage',
          discountValue: 0,
          discountAmount: 0,
          taxRate: 15,
          taxAmount: 0,
          shippingCost: 0,
          grandTotal: 0,
          totalInWords: '',
          notes: company.defaultNotes,
          termsAndConditions: company.defaultTerms,
          status: 'draft',
          templateStyle: 'corporate',
          showBankDetails: true,
          showSignature: true,
          showTerms: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    } else {
      setEditingQuotation(null);
    }
    setPrintingQuotation(null);
    setCurrentTab('new-quote');
  };

  // Edit existing quotation
  const handleEditQuotation = (quotation: Quotation) => {
    setEditingQuotation(quotation);
    setPrintingQuotation(null);
    setCurrentTab('new-quote');
  };

  // Open dedicated print view
  const handlePrintQuotation = (quotation: Quotation) => {
    setPrintingQuotation(quotation);
  };

  // Save Quotation (from Builder)
  const handleSaveQuotation = (savedQuote: Quotation, andPrint: boolean = false) => {
    const updated = storage.saveQuotation(savedQuote);
    setQuotations(updated);
    showToast(`Quotation ${savedQuote.quotationNumber} saved successfully`);

    if (andPrint) {
      setPrintingQuotation(savedQuote);
    } else {
      setEditingQuotation(null);
      setCurrentTab('quotations');
    }
  };

  // Duplicate Quotation
  const handleDuplicateQuotation = (quotationId: string) => {
    const duplicated = storage.duplicateQuotation(quotationId);
    if (duplicated) {
      setQuotations(storage.getQuotations());
      showToast(`Duplicated as ${duplicated.quotationNumber}`);
      setEditingQuotation(duplicated);
      setCurrentTab('new-quote');
    }
  };

  // Delete Quotation
  const handleDeleteQuotation = (quotationId: string) => {
    const updated = storage.deleteQuotation(quotationId);
    setQuotations(updated);
    showToast('Quotation deleted successfully');
    if (printingQuotation?.id === quotationId) {
      setPrintingQuotation(null);
    }
    if (editingQuotation?.id === quotationId) {
      setEditingQuotation(null);
      setCurrentTab('quotations');
    }
  };

  // Quick Status Update
  const handleUpdateQuotationStatus = (quotationId: string, newStatus: QuotationStatus) => {
    const quote = quotations.find(q => q.id === quotationId);
    if (quote) {
      const updatedQuote = { ...quote, status: newStatus };
      const updatedList = storage.saveQuotation(updatedQuote);
      setQuotations(updatedList);
      if (printingQuotation?.id === quotationId) {
        setPrintingQuotation(updatedQuote);
      }
      showToast(`Status updated to ${newStatus.toUpperCase()}`);
    }
  };

  // Client Handlers
  const handleSaveClient = (client: Client) => {
    const updated = storage.saveClient(client);
    setClients(updated);
    showToast('Client record saved');
  };

  const handleDeleteClient = (clientId: string) => {
    const updated = storage.deleteClient(clientId);
    setClients(updated);
    showToast('Client deleted');
  };

  // Product Handlers
  const handleSaveProduct = (product: ProductItem) => {
    const updated = storage.saveProduct(product);
    setProducts(updated);
    showToast(`Product "${product.name}" saved to catalog`);
  };

  const handleDeleteProduct = (productId: string) => {
    const updated = storage.deleteProduct(productId);
    setProducts(updated);
    showToast('Product item removed from catalog');
  };

  // Bulk Excel import handlers
  const handleImportBulkProducts = (newProducts: ProductItem[], replace: boolean) => {
    const updated = storage.saveBulkProducts(newProducts, replace);
    setProducts(updated);
    showToast(`Successfully imported ${newProducts.length} products from Excel!`);
  };

  const handleImportBulkClients = (newClients: Client[], replace: boolean) => {
    const updated = storage.saveBulkClients(newClients, replace);
    setClients(updated);
    showToast(`Successfully imported ${newClients.length} clients from Excel!`);
  };

  // Company Settings Handlers
  const handleSaveCompany = (updatedCompany: CompanyProfile) => {
    storage.saveCompanyProfile(updatedCompany);
    setCompany(updatedCompany);
    showToast('Company profile & bank info updated');
  };

  // Reset all to sample data
  const handleResetData = () => {
    storage.resetAllData();
    setCompany(storage.getCompanyProfile());
    setClients(storage.getClients());
    setProducts(storage.getProducts());
    setQuotations(storage.getQuotations());
    setEditingQuotation(null);
    setPrintingQuotation(null);
    setCurrentTab('quotations');
    showToast('Reset to demo data complete');
  };

  // Export full JSON backup
  const handleExportBackup = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      company,
      clients,
      products,
      quotations
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quotation-erp-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup file downloaded');
  };

  // Import JSON backup
  const handleImportBackup = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.company) {
        storage.saveCompanyProfile(data.company);
        setCompany(data.company);
      }
      if (Array.isArray(data.clients)) {
        localStorage.setItem('apex_erp_clients', JSON.stringify(data.clients));
        setClients(data.clients);
      }
      if (Array.isArray(data.products)) {
        localStorage.setItem('apex_erp_products', JSON.stringify(data.products));
        setProducts(data.products);
      }
      if (Array.isArray(data.quotations)) {
        localStorage.setItem('apex_erp_quotations', JSON.stringify(data.quotations));
        setQuotations(data.quotations);
      }
      showToast('Backup imported successfully');
    } catch {
      showToast('Error importing backup file: invalid format');
    }
  };

  // If in dedicated print preview mode, render full print view
  if (printingQuotation) {
    return (
      <QuotationPrintView
        quotation={printingQuotation}
        company={company}
        onBack={() => setPrintingQuotation(null)}
        onEdit={(q) => {
          setPrintingQuotation(null);
          handleEditQuotation(q);
        }}
        onUpdateStatus={(newStatus) => handleUpdateQuotationStatus(printingQuotation.id, newStatus)}
        onDelete={(id) => handleDeleteQuotation(id)}
      />
    );
  }

  return (
    <div className={`flex h-screen overflow-hidden font-sans transition-colors duration-500 ${
      theme === 'dark' ? 'dark bg-neutral-900 text-neutral-100' : 'light bg-slate-100 text-slate-800'
    }`}>
      {/* High-Tech Cyber Cursor Follower & Pulse Animations */}
      <CyberCursor enabled={cursorAnimation} />

      {/* Toast Alert Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 bg-neutral-800 text-white border border-neutral-700 shadow-xl rounded-lg px-4 py-2.5 text-xs font-medium flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Navigation Sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            if (tab === 'new-quote') {
              handleStartCreateQuotation();
            } else {
              setEditingQuotation(null);
              setCurrentTab(tab);
            }
          }}
          quotationCount={quotations.length}
          clientCount={clients.length}
          productCount={products.length}
          company={company}
        />
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden bg-black/60 backdrop-blur-xs">
            <motion.div 
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="w-64 bg-neutral-900 h-full border-r border-neutral-800"
            >
              <div className="p-4 flex items-center justify-between border-b border-neutral-800">
                <span className="font-bold text-sm text-white">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-neutral-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <Sidebar
                currentTab={currentTab}
                onSelectTab={(tab) => {
                  setMobileMenuOpen(false);
                  if (tab === 'new-quote') {
                    handleStartCreateQuotation();
                  } else {
                    setEditingQuotation(null);
                    setCurrentTab(tab);
                  }
                }}
                quotationCount={quotations.length}
                clientCount={clients.length}
                productCount={products.length}
                company={company}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Viewport Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar with Animated Day / Night Toggle */}
        <header className={`sticky top-0 z-30 flex items-center justify-between gap-6 px-6 py-3.5 backdrop-blur-md border-b transition-colors duration-500 ${
          theme === 'dark' ? 'bg-[#080E1A]/90 border-neutral-800/80 shadow-md shadow-black/20' : 'bg-white/95 border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 text-neutral-400 hover:text-white bg-neutral-800 rounded-lg cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Navigation Trail */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-neutral-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>Vision Guard</span>
              </span>
              <span className="text-neutral-600">/</span>
              <span className="font-bold capitalize bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                {currentTab === 'new-quote'
                  ? editingQuotation
                    ? `Edit Quote (${editingQuotation.quotationNumber})`
                    : 'Create Quotation'
                  : currentTab === 'quotations'
                  ? 'All Quotations'
                  : currentTab === 'clients'
                  ? 'Client Directory (CRM)'
                  : currentTab === 'products'
                  ? 'Catalog & Inventory'
                  : 'Company Settings'}
              </span>
            </div>
          </div>

          {/* Top Bar Zone: Cursor Animation Toggle, Day/Night Mode & Primary Action */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Cursor Animation FX Toggle */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleCursorAnimation}
              title={cursorAnimation ? 'Cursor Animation Active - Click to toggle' : 'Enable Cursor Animation'}
              aria-label="Toggle Cyber Cursor Animation"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer select-none no-print ${
                cursorAnimation
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'bg-neutral-800/80 border-neutral-700/80 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Crosshair className={`w-3.5 h-3.5 ${cursorAnimation ? 'animate-spin-slow text-cyan-400' : ''}`} />
              <span className="text-[11px] font-medium hidden sm:inline">
                {cursorAnimation ? 'Cursor FX' : 'Cursor Off'}
              </span>
              {cursorAnimation && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              )}
            </motion.button>

            {/* Animated Day / Night Mode Toggle */}
            <ThemeToggle theme={theme} onToggle={toggleTheme} showLabel={false} />

            {currentTab !== 'new-quote' && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleStartCreateQuotation()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl shadow-md shadow-cyan-500/20 transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Quote</span>
              </motion.button>
            )}
          </div>
        </header>

        {/* Tab Content Rendering with Motion Transition */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab + (editingQuotation ? editingQuotation.id : '')}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {currentTab === 'quotations' && (
                <QuotationList
                  quotations={quotations}
                  company={company}
                  onCreateNew={() => handleStartCreateQuotation()}
                  onEdit={handleEditQuotation}
                  onPrint={handlePrintQuotation}
                  onDuplicate={handleDuplicateQuotation}
                  onDelete={handleDeleteQuotation}
                  onUpdateStatus={handleUpdateQuotationStatus}
                />
              )}

              {currentTab === 'new-quote' && (
                <QuotationBuilder
                  initialQuotation={editingQuotation}
                  clients={clients}
                  products={products}
                  company={company}
                  nextQuotationNumber={storage.getNextQuotationNumber()}
                  onSave={handleSaveQuotation}
                  onCancel={() => {
                    setEditingQuotation(null);
                    setCurrentTab('quotations');
                  }}
                  onAddNewClient={handleSaveClient}
                  onSaveProduct={handleSaveProduct}
                  onDeleteQuotation={handleDeleteQuotation}
                  onDeleteClient={handleDeleteClient}
                />
              )}

              {currentTab === 'clients' && (
                <ClientManager
                  clients={clients}
                  quotations={quotations}
                  company={company}
                  onSaveClient={handleSaveClient}
                  onDeleteClient={handleDeleteClient}
                  onCreateQuoteForClient={handleStartCreateQuotation}
                  onImportBulkClients={handleImportBulkClients}
                />
              )}

              {currentTab === 'products' && (
                <ProductManager
                  products={products}
                  company={company}
                  onSaveProduct={handleSaveProduct}
                  onDeleteProduct={handleDeleteProduct}
                  onImportBulkProducts={handleImportBulkProducts}
                />
              )}

              {currentTab === 'settings' && (
                <CompanySettings
                  company={company}
                  onSaveCompany={handleSaveCompany}
                  onResetData={handleResetData}
                  onExportBackup={handleExportBackup}
                  onImportBackup={handleImportBackup}
                  onImportBulkProducts={handleImportBulkProducts}
                  onImportBulkClients={handleImportBulkClients}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
