import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductItem, CompanyProfile } from '../types';
import { getAutoArabicName } from '../utils/arabicTranslation';
import { 
  Plus, 
  Search, 
  Package, 
  Edit3, 
  Trash2, 
  Tag, 
  Languages, 
  Sparkles, 
  AlertTriangle, 
  Check, 
  X,
  Layers,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { ExcelImportModal } from './ExcelImportModal';
import { exportProductsToExcel, exportProductsToCSV } from '../utils/excelImport';

interface ProductManagerProps {
  products: ProductItem[];
  company: CompanyProfile;
  onSaveProduct: (product: ProductItem) => void;
  onDeleteProduct: (productId: string) => void;
  onImportBulkProducts?: (products: ProductItem[], replace: boolean) => void;
}

export const ProductManager: React.FC<ProductManagerProps> = ({
  products,
  company,
  onSaveProduct,
  onDeleteProduct,
  onImportBulkProducts,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductItem | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [arabicName, setArabicName] = useState('');
  const [description, setDescription] = useState('');
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [unit, setUnit] = useState('Pcs');
  const [category, setCategory] = useState('');
  const [autoTranslatedNotification, setAutoTranslatedNotification] = useState(false);

  const categories = Array.from(new Set(products.map(p => p.category || 'General'))).filter(Boolean);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 6);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
    }
  };

  useEffect(() => {
    checkScroll();
    const timer = setTimeout(checkScroll, 100);
    window.addEventListener('resize', checkScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkScroll);
    };
  }, [categories, products]);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -220 : 220;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
      setTimeout(checkScroll, 320);
    }
  };

  const getCategoryCount = (cat: string) => {
    if (cat === 'all') return products.length;
    return products.filter(p => (p.category || 'General') === cat).length;
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setCode('VG-' + String(products.length + 1).padStart(3, '0'));
    setName('');
    setArabicName('');
    setDescription('');
    setUnitPrice(0);
    setUnit('Pcs');
    setCategory('IP Surveillance');
    setAutoTranslatedNotification(false);
    setIsModalOpen(true);
  };

  const openEditModal = (product: ProductItem) => {
    setEditingProduct(product);
    setCode(product.code);
    setName(product.name);
    setArabicName(product.arabicName || getAutoArabicName(product.name));
    setDescription(product.description || '');
    setUnitPrice(product.unitPrice);
    setUnit(product.unit);
    setCategory(product.category || 'General');
    setAutoTranslatedNotification(false);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    // If arabic name is empty or wasn't manually edited, auto-fill it
    if (!editingProduct || !arabicName) {
      const generated = getAutoArabicName(val);
      setArabicName(generated);
    }
  };

  const handleAutoTranslateArabic = () => {
    if (!name.trim()) return;
    const translated = getAutoArabicName(name);
    setArabicName(translated);
    setAutoTranslatedNotification(true);
    setTimeout(() => setAutoTranslatedNotification(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalArabic = arabicName.trim() || getAutoArabicName(name);

    const productData: ProductItem = {
      id: editingProduct ? editingProduct.id : 'prod-' + Date.now(),
      code: code.trim() || 'VG-' + Date.now().toString().slice(-4),
      name: name.trim(),
      arabicName: finalArabic,
      description: description.trim(),
      unitPrice: Math.max(0, unitPrice),
      unit: unit.trim() || 'Pcs',
      category: category.trim() || 'General'
    };

    onSaveProduct(productData);
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      onDeleteProduct(productToDelete.id);
      setProductToDelete(null);
    }
  };

  const filteredProducts = products.filter(p => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return selectedCategory === 'all' || (p.category || 'General') === selectedCategory;
    }

    // Match Model Number / Code, Product Name, Arabic Name, Description
    const codeMatch = p.code ? p.code.toLowerCase().includes(q) : false;
    const nameMatch = p.name ? p.name.toLowerCase().includes(q) : false;
    const arabicMatch = p.arabicName ? p.arabicName.toLowerCase().includes(q) : false;
    const descMatch = p.description ? p.description.toLowerCase().includes(q) : false;
    const catMatch = p.category ? p.category.toLowerCase().includes(q) : false;

    // Search across entire catalog so searching by model number or name always finds the product
    return codeMatch || nameMatch || arabicMatch || descMatch || catMatch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <motion.div 
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Products & Services Catalog
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage inventory equipment with Model Numbers, rates, and Arabic titles.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {products.length > 0 && (
            <motion.button
              type="button"
              onClick={() => exportProductsToExcel(products)}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-neutral-850 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 rounded-xl font-semibold text-xs shadow-sm transition-all cursor-pointer"
              title="Export all products with Model Number and Name to Excel (.xlsx)"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export Excel</span>
            </motion.button>
          )}

          <motion.button
            type="button"
            onClick={() => setIsExcelModalOpen(true)}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl font-semibold text-xs shadow-md shadow-emerald-500/10 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Import Excel</span>
          </motion.button>

          <motion.button
            type="button"
            onClick={openAddModal}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Filter and Search Bar with Fluid Animations */}
      <motion.div 
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-neutral-850/95 backdrop-blur-md border border-neutral-800 rounded-xl p-3.5 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4 shadow-lg shadow-black/20"
      >
        {/* Left Side: Animated Search Input & Category Pills */}
        <div className="flex flex-1 items-center gap-3 min-w-0">
          {/* Animated Search Input */}
          <div className="relative w-64 sm:w-80 shrink-0">
            <motion.div
              animate={{ scale: searchQuery ? 1.1 : 1, color: searchQuery ? '#06b6d4' : '#737373' }}
              transition={{ duration: 0.2 }}
              className="w-4 h-4 absolute left-3.5 top-3 pointer-events-none"
            >
              <Search className="w-full h-full" />
            </motion.div>
            <input
              type="text"
              placeholder="Search by Model Number or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700/80 rounded-xl pl-10 pr-8 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all font-medium"
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 p-0.5 rounded-full transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Animated Category Pills Slider */}
          <div className="relative flex items-center min-w-0 flex-1">
            {/* Left Scroll Button */}
            <AnimatePresence>
              {canScrollLeft && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => scrollCategories('left')}
                  className="absolute -left-2 z-20 w-6 h-6 rounded-full bg-neutral-900/95 border border-cyan-500/50 text-cyan-400 hover:text-white hover:bg-cyan-600/30 shadow-lg shadow-black/80 flex items-center justify-center backdrop-blur-sm cursor-pointer"
                  title="Scroll categories left"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Left Gradient Mask */}
            {canScrollLeft && (
              <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-neutral-850 to-transparent z-10 pointer-events-none" />
            )}

            {/* Scrollable Track (no-scrollbar hides default Windows scrollbar) */}
            <div 
              ref={scrollContainerRef}
              onScroll={checkScroll}
              className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1 w-full"
            >
              {/* "All" Category Pill */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setSelectedCategory('all')}
                className={`relative px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 select-none ${
                  selectedCategory === 'all'
                    ? 'text-white'
                    : 'text-neutral-400 hover:text-neutral-200 bg-neutral-900/80 hover:bg-neutral-800/80 border border-neutral-800'
                }`}
              >
                {selectedCategory === 'all' && (
                  <motion.div
                    layoutId="activeCategoryPill"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 rounded-lg shadow-md shadow-cyan-500/30 -z-0"
                  />
                )}
                <span className="relative z-10 font-semibold">All</span>
                <span className={`relative z-10 text-[10px] font-mono px-1.5 py-0.2 rounded-full transition-colors ${
                  selectedCategory === 'all' ? 'bg-black/30 text-cyan-200 font-bold' : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {products.length}
                </span>
              </motion.button>

              {/* Dynamic Category Pills */}
              {categories.map(cat => {
                const isSelected = selectedCategory === cat;
                const count = getCategoryCount(cat);
                return (
                  <motion.button
                    key={cat}
                    type="button"
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setSelectedCategory(cat)}
                    className={`relative px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 select-none ${
                      isSelected
                        ? 'text-white'
                        : 'text-neutral-400 hover:text-neutral-200 bg-neutral-900/80 hover:bg-neutral-800/80 border border-neutral-800'
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="activeCategoryPill"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 rounded-lg shadow-md shadow-cyan-500/30 -z-0"
                      />
                    )}
                    <span className="relative z-10 font-semibold">{cat}</span>
                    <span className={`relative z-10 text-[10px] font-mono px-1.5 py-0.2 rounded-full transition-colors ${
                      isSelected ? 'bg-black/30 text-cyan-200 font-bold' : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      {count}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Right Gradient Mask */}
            {canScrollRight && (
              <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-neutral-850 to-transparent z-10 pointer-events-none" />
            )}

            {/* Right Scroll Button */}
            <AnimatePresence>
              {canScrollRight && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => scrollCategories('right')}
                  className="absolute -right-2 z-20 w-6 h-6 rounded-full bg-neutral-900/95 border border-cyan-500/50 text-cyan-400 hover:text-white hover:bg-cyan-600/30 shadow-lg shadow-black/80 flex items-center justify-center backdrop-blur-sm cursor-pointer"
                  title="Scroll categories right"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Animated Total Items Counter */}
        <motion.div 
          className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900/90 border border-neutral-800 rounded-lg text-xs font-mono shrink-0 shadow-inner"
          whileHover={{ scale: 1.02 }}
        >
          <span className="text-neutral-400">Total Items:</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={filteredProducts.length}
              initial={{ y: -6, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 6, opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="text-cyan-400 font-bold px-1.5 py-0.2 rounded bg-cyan-950/60 border border-cyan-500/30 inline-block text-center min-w-[20px]"
            >
              {filteredProducts.length}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Products Table with Motion */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-neutral-850 border border-neutral-800 rounded-xl overflow-hidden shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-900/80 border-b border-neutral-800 text-neutral-400 font-semibold text-xs tracking-wider uppercase">
              <tr>
                <th className="py-3.5 px-4 w-36">Model Number</th>
                <th className="py-3.5 px-4">Product Name &amp; Arabic Specs</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-center">Unit</th>
                <th className="py-3.5 px-4 text-right">Standard Rate</th>
                <th className="py-3.5 px-4 text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, idx) => {
                  const arabic = product.arabicName || getAutoArabicName(product.name);
                  return (
                    <motion.tr 
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      transition={{ duration: 0.25, delay: idx * 0.02 }}
                      className="hover:bg-neutral-800/50 transition-colors"
                    >
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-block px-3 py-1 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 font-mono text-xs sm:text-sm font-bold tracking-wide shadow-xs">
                          {product.code}
                        </span>
                      </td>
                      <td className="py-4 px-4 max-w-md">
                        <div className="font-bold text-white text-sm sm:text-base leading-snug">{product.name}</div>
                        {/* Bilingual Arabic display */}
                        {arabic && (
                          <div className="text-xs sm:text-sm font-semibold text-cyan-400 font-sans mt-0.5 tracking-tight" dir="rtl">
                            {arabic}
                          </div>
                        )}
                        {product.description && (
                          <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                            {product.description}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-neutral-300">
                        <span className="px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-750 text-xs font-medium">
                          {product.category || 'General'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-neutral-300 whitespace-nowrap font-medium text-xs sm:text-sm">
                        {product.unit}
                      </td>
                      <td className="py-4 px-4 text-right font-mono font-bold text-emerald-400 whitespace-nowrap text-sm sm:text-base">
                        {company.currencySymbol} {product.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openEditModal(product)}
                            className="p-1.5 text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 rounded-md transition-colors cursor-pointer"
                            title="Edit Item"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setProductToDelete(product)}
                            className="p-1.5 text-neutral-500 hover:text-red-400 bg-neutral-900 hover:bg-red-950/40 border border-neutral-700/80 hover:border-red-800/60 rounded-md transition-colors cursor-pointer"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-neutral-400">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="max-w-md mx-auto space-y-3"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 shadow-lg shadow-cyan-500/10">
                        <Package className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          {searchQuery || selectedCategory !== 'all' ? 'No matching products found' : 'No products in your catalog yet'}
                        </p>
                        <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                          {searchQuery || selectedCategory !== 'all'
                            ? 'Try clearing your search query or category filter.'
                            : 'Your catalog currently contains only products you add. Click below to add new equipment or import in bulk from Excel.'}
                        </p>
                      </div>
                      <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsExcelModalOpen(true)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600/25 hover:bg-emerald-600/35 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-semibold shadow-md shadow-emerald-500/15 cursor-pointer"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                          Import from Excel (.xlsx)
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={openAddModal}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-lg text-xs font-semibold shadow-md shadow-cyan-500/20 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          Add Your Product
                        </motion.button>
                      </div>
                    </motion.div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add / Edit Product Modal with Motion */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 w-full max-w-lg space-y-4 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-400" />
                  {editingProduct ? 'Edit Catalog Product' : 'Add New Product / Service'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-neutral-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      Item Code / SKU *
                    </label>
                    <input
                      type="text"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="e.g. VG-CAM-001"
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. IP Surveillance, Networking"
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-neutral-400">
                      Product Name (English) *
                    </label>
                    <span className="text-[10px] text-neutral-500">Auto-translates to Arabic</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Hikvision 8MP 4K Ultra HD Bullet Camera"
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Arabic Name with Auto-Translate Button */}
                <div className="bg-neutral-950/60 p-3 rounded-lg border border-blue-900/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-blue-300 flex items-center gap-1.5">
                      <Languages className="w-3.5 h-3.5 text-blue-400" />
                      Arabic Name / الاسم باللغة العربية (للطباعة وعروض الأسعار)
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoTranslateArabic}
                      className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium px-2 py-0.5 rounded bg-blue-950 border border-blue-800/80 cursor-pointer transition-colors"
                      title="Generate Arabic from English name"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Auto-Translate
                    </button>
                  </div>
                  <input
                    type="text"
                    dir="rtl"
                    value={arabicName}
                    onChange={(e) => setArabicName(e.target.value)}
                    placeholder="سيظهر هنا الاسم بالعربي تلقائياً..."
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white font-sans text-right focus:border-blue-500 focus:outline-none"
                  />
                  {autoTranslatedNotification && (
                    <motion.p 
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[11px] text-emerald-400 flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Auto translated successfully!
                    </motion.p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      Standard Unit Rate ({company.currencySymbol}) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="any"
                      value={unitPrice || ''}
                      onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      Billing Unit
                    </label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="Pcs">Pcs (حبة)</option>
                      <option value="Unit">Unit (وحدة)</option>
                      <option value="Roll">Roll (لفة 305م)</option>
                      <option value="Lot">Lot (مقطوعية)</option>
                      <option value="Package">Package (باقة شاملة)</option>
                      <option value="Meter">Meter (متر)</option>
                      <option value="Set">Set (طقم)</option>
                      <option value="Hours">Hours (ساعات)</option>
                      <option value="Month">Month (شهر)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Technical Specifications / Description
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Key specifications, warranty, or mounting requirements..."
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3.5 py-2 text-xs text-neutral-400 hover:text-white bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow transition-colors cursor-pointer"
                  >
                    {editingProduct ? 'Update Product' : 'Add to Catalog'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal with Motion */}
      <AnimatePresence>
        {productToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              className="bg-neutral-900 border border-red-900/60 rounded-xl p-6 w-full max-w-md space-y-4 shadow-2xl"
            >
              <div className="flex items-center gap-3 text-red-400">
                <div className="p-2 bg-red-950/60 border border-red-800/80 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Delete Product from Catalog</h3>
                  <p className="text-xs text-neutral-400">This action cannot be undone.</p>
                </div>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs">
                <div className="font-semibold text-white">{productToDelete.name}</div>
                {productToDelete.arabicName && (
                  <div className="text-blue-400 font-sans mt-0.5" dir="rtl">{productToDelete.arabicName}</div>
                )}
                <div className="text-neutral-400 font-mono mt-1">
                  Code: {productToDelete.code} • Rate: {company.currencySymbol} {productToDelete.unitPrice}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProductToDelete(null)}
                  className="px-3.5 py-2 text-xs text-neutral-400 hover:text-white bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow transition-colors cursor-pointer"
                >
                  Confirm Delete
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Excel Bulk Import Modal */}
      <ExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        type="products"
        onImportProducts={onImportBulkProducts}
      />
    </div>
  );
};
