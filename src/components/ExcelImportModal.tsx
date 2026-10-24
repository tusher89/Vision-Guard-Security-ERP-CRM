import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  FileSpreadsheet, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  ArrowRight, 
  Package, 
  Users, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { ProductItem, Client } from '../types';
import { 
  parseProductsExcel, 
  parseClientsExcel, 
  downloadProductsExcelTemplate, 
  downloadClientsExcelTemplate 
} from '../utils/excelImport';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'products' | 'clients';
  onImportProducts?: (products: ProductItem[], replace: boolean) => void;
  onImportClients?: (clients: Client[], replace: boolean) => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  type,
  onImportProducts,
  onImportClients,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [parseWarnings, setParseWarnings] = useState<string[]>([]);
  const [parsedProducts, setParsedProducts] = useState<ProductItem[]>([]);
  const [parsedClients, setParsedClients] = useState<Client[]>([]);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const resetState = () => {
    setSelectedFile(null);
    setIsProcessing(false);
    setErrorMsg(null);
    setParseWarnings([]);
    setParsedProducts([]);
    setParsedClients([]);
    setReplaceExisting(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const processFile = async (file: File) => {
    // Validate extension
    const name = file.name.toLowerCase();
    if (!name.endsWith('.xlsx') && !name.endsWith('.xls') && !name.endsWith('.csv')) {
      setErrorMsg('Please select a valid Excel (.xlsx, .xls) or CSV (.csv) file.');
      return;
    }

    setSelectedFile(file);
    setIsProcessing(true);
    setErrorMsg(null);
    setParseWarnings([]);

    try {
      if (type === 'products') {
        const result = await parseProductsExcel(file);
        if (result.products.length === 0) {
          setErrorMsg(result.errors[0] || 'No valid products could be extracted from this Excel file.');
        } else {
          setParsedProducts(result.products);
          setParseWarnings(result.errors);
        }
      } else {
        const result = await parseClientsExcel(file);
        if (result.clients.length === 0) {
          setErrorMsg(result.errors[0] || 'No valid clients could be extracted from this Excel file.');
        } else {
          setParsedClients(result.clients);
          setParseWarnings(result.errors);
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error parsing Excel file. Please verify file format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDownloadTemplate = () => {
    if (type === 'products') {
      downloadProductsExcelTemplate();
    } else {
      downloadClientsExcelTemplate();
    }
  };

  const handleConfirmImport = () => {
    if (type === 'products') {
      if (parsedProducts.length === 0) return;
      onImportProducts?.(parsedProducts, replaceExisting);
    } else {
      if (parsedClients.length === 0) return;
      onImportClients?.(parsedClients, replaceExisting);
    }
    handleClose();
  };

  const hasData = type === 'products' ? parsedProducts.length > 0 : parsedClients.length > 0;
  const itemCount = type === 'products' ? parsedProducts.length : parsedClients.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 14 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-750 rounded-2xl shadow-2xl overflow-hidden my-8"
      >
        {/* Futuristic Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-850/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-500/10">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Import {type === 'products' ? 'Products Catalog' : 'Clients Directory'} from Excel</span>
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  .XLSX / .CSV
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                {type === 'products' 
                  ? 'Batch import all products and equipment into catalog from an Excel file.' 
                  : 'Batch import client directory and contact records from an Excel file.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto no-scrollbar">
          {/* Download Template Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-neutral-850/90 border border-neutral-800 rounded-xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Need the official format?</p>
                <p className="text-[11px] text-neutral-400">
                  Download our pre-formatted Excel template with sample {type === 'products' ? 'CCTV equipment' : 'clients'} data.
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Excel Template (.xlsx)</span>
            </motion.button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 p-3.5 bg-red-950/40 border border-red-800/80 rounded-xl text-red-200 text-xs"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-red-300">File Processing Error</p>
                <p className="mt-0.5 text-neutral-300">{errorMsg}</p>
              </div>
            </motion.div>
          )}

          {/* Upload Drop Zone (Shown when no data parsed yet) */}
          {!hasData && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-500/10 scale-[1.01]'
                  : 'border-neutral-750 bg-neutral-850/50 hover:bg-neutral-850 hover:border-neutral-600'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/10">
                  {isProcessing ? (
                    <RefreshCw className="w-7 h-7 animate-spin text-emerald-400" />
                  ) : (
                    <UploadCloud className="w-7 h-7" />
                  )}
                </div>

                <div>
                  <p className="text-sm font-bold text-white">
                    {isProcessing ? 'Reading and parsing file...' : 'Choose or drop your Excel file here'}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Supports Microsoft Excel (<strong className="text-neutral-200">.xlsx, .xls</strong>) and CSV (<strong className="text-neutral-200">.csv</strong>)
                  </p>
                </div>

                <div className="pt-2">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold border border-neutral-700 shadow-sm">
                    Browse Computer
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Preview of Parsed Data */}
          {hasData && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-neutral-850 border border-neutral-800 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <div>
                    <span className="text-xs font-bold text-white">
                      {itemCount} {type === 'products' ? 'Products' : 'Clients'} Detected Ready to Import
                    </span>
                    <span className="text-[11px] text-neutral-400 block">
                      Source: {selectedFile?.name} ({(selectedFile?.size ? (selectedFile.size / 1024).toFixed(1) : '0')} KB)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    resetState();
                    fileInputRef.current?.click();
                  }}
                  className="text-xs text-neutral-400 hover:text-white underline cursor-pointer"
                >
                  Choose another file
                </button>
              </div>

              {/* Warnings / Skipped Rows if any */}
              {parseWarnings.length > 0 && (
                <div className="p-3 bg-amber-950/30 border border-amber-800/60 rounded-xl text-amber-200 text-xs space-y-1 max-h-24 overflow-y-auto no-scrollbar">
                  <p className="font-semibold text-amber-300">Notice during import ({parseWarnings.length}):</p>
                  {parseWarnings.map((w, idx) => (
                    <p key={idx} className="text-neutral-300 text-[11px]">• {w}</p>
                  ))}
                </div>
              )}

              {/* Data Table Preview */}
              <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900">
                <div className="px-4 py-2 bg-neutral-850 border-b border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                  <span className="font-semibold text-neutral-300">Data Preview (Showing first 5 rows)</span>
                  <span>{itemCount} total records</span>
                </div>

                <div className="overflow-x-auto no-scrollbar max-h-56">
                  {type === 'products' ? (
                    <table className="w-full text-left text-xs text-neutral-300">
                      <thead className="bg-neutral-850/60 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
                        <tr>
                          <th className="py-2.5 px-3">Code</th>
                          <th className="py-2.5 px-3">Product Name</th>
                          <th className="py-2.5 px-3">Arabic Name</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3 text-right">Price</th>
                          <th className="py-2.5 px-3 text-center">Unit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/60">
                        {parsedProducts.slice(0, 5).map((p, idx) => (
                          <tr key={idx} className="hover:bg-neutral-850/40">
                            <td className="py-2 px-3 font-mono text-cyan-400">{p.code}</td>
                            <td className="py-2 px-3 font-medium text-white max-w-[200px] truncate">{p.name}</td>
                            <td className="py-2 px-3 text-neutral-400 font-arabic text-right">{p.arabicName || '-'}</td>
                            <td className="py-2 px-3">
                              <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-[10px] text-neutral-300">
                                {p.category || 'General'}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-mono text-right text-emerald-400">{p.unitPrice}</td>
                            <td className="py-2 px-3 text-center text-neutral-400">{p.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full text-left text-xs text-neutral-300">
                      <thead className="bg-neutral-850/60 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
                        <tr>
                          <th className="py-2.5 px-3">Company Name</th>
                          <th className="py-2.5 px-3">Contact Person</th>
                          <th className="py-2.5 px-3">Phone</th>
                          <th className="py-2.5 px-3">Email</th>
                          <th className="py-2.5 px-3">City</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/60">
                        {parsedClients.slice(0, 5).map((c, idx) => (
                          <tr key={idx} className="hover:bg-neutral-850/40">
                            <td className="py-2 px-3 font-bold text-white">{c.companyName}</td>
                            <td className="py-2 px-3 text-neutral-300">{c.contactPerson || c.name}</td>
                            <td className="py-2 px-3 font-mono text-cyan-400">{c.phone || '-'}</td>
                            <td className="py-2 px-3 text-neutral-400">{c.email || '-'}</td>
                            <td className="py-2 px-3 text-neutral-300">{c.city || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Import Mode Options (Append vs Replace) */}
              <div className="p-4 bg-neutral-850/80 border border-neutral-800 rounded-xl space-y-2">
                <span className="text-xs font-semibold text-white block">Import Behavior:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                    !replaceExisting 
                      ? 'bg-cyan-500/10 border-cyan-500/50 text-white' 
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}>
                    <input
                      type="radio"
                      name="importMode"
                      checked={!replaceExisting}
                      onChange={() => setReplaceExisting(false)}
                      className="mt-0.5 text-cyan-500"
                    />
                    <div>
                      <p className="font-semibold text-white">Append to Current Items</p>
                      <p className="text-[11px] text-neutral-400">Keep current items and add/update new records from Excel.</p>
                    </div>
                  </label>

                  <label className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                    replaceExisting 
                      ? 'bg-amber-500/10 border-amber-500/50 text-white' 
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}>
                    <input
                      type="radio"
                      name="importMode"
                      checked={replaceExisting}
                      onChange={() => setReplaceExisting(true)}
                      className="mt-0.5 text-amber-500"
                    />
                    <div>
                      <p className="font-semibold text-amber-300">Replace All Current Items</p>
                      <p className="text-[11px] text-neutral-400">Wipe current items and populate strictly with this Excel file.</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800 bg-neutral-850/90">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {hasData && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={handleConfirmImport}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <span>Confirm & Import {itemCount} Records</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
