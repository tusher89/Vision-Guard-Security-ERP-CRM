import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quotation, CompanyProfile } from '../types';
import { 
  Plus, 
  Printer, 
  Edit3, 
  Copy, 
  Trash2, 
  Search, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Send,
  Languages,
  X,
  TrendingUp,
  Receipt
} from 'lucide-react';

interface QuotationListProps {
  quotations: Quotation[];
  company: CompanyProfile;
  onCreateNew: () => void;
  onEdit: (quotation: Quotation) => void;
  onPrint: (quotation: Quotation) => void;
  onDuplicate: (quotationId: string) => void;
  onDelete: (quotationId: string) => void;
  onUpdateStatus: (quotationId: string, status: Quotation['status']) => void;
}

export const QuotationList: React.FC<QuotationListProps> = ({
  quotations,
  company,
  onCreateNew,
  onEdit,
  onPrint,
  onDuplicate,
  onDelete,
  onUpdateStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [quoteToDelete, setQuoteToDelete] = useState<Quotation | null>(null);

  // Filter logic
  const filteredQuotations = quotations.filter(q => {
    const matchesStatus = selectedStatus === 'all' || q.status === selectedStatus;
    const clientName = q.clientSnapshot?.companyName || q.clientSnapshot?.name || '';
    const ref = q.reference || '';
    const num = q.quotationNumber || '';
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      clientName.toLowerCase().includes(query) ||
      ref.toLowerCase().includes(query) ||
      num.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  // Pipeline metrics
  const totalValue = quotations.reduce((acc, q) => acc + q.grandTotal, 0);
  const acceptedQuotes = quotations.filter(q => q.status === 'accepted');
  const acceptedValue = acceptedQuotes.reduce((acc, q) => acc + q.grandTotal, 0);
  const pendingQuotes = quotations.filter(q => q.status === 'sent' || q.status === 'pending');
  const winRate = quotations.length > 0 ? Math.round((acceptedQuotes.length / quotations.length) * 100) : 0;

  const formatMoney = (amount: number) => {
    return `${company.currencySymbol} ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const handleConfirmDelete = () => {
    if (quoteToDelete) {
      onDelete(quoteToDelete.id);
      setQuoteToDelete(null);
    }
  };

  // KPI container variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Quotation Management & Pipeline
          </h1>
          <p className="text-xs text-neutral-400">
            Generate, customize, manage, and print commercial quotations with automatic Arabic translation.
          </p>
        </div>

        <motion.button
          onClick={onCreateNew}
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.96 }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-xs shadow-md shadow-blue-600/25 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create New Quotation
        </motion.button>
      </motion.div>

      {/* KPI Cards Strip with Staggered Entrance */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4"
      >
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="bg-neutral-850 border border-neutral-800 rounded-xl p-3 sm:p-4 shadow-sm hover:border-neutral-700 transition-colors"
        >
          <span className="text-[11px] sm:text-xs text-neutral-400 font-medium block truncate">Total Quotations</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl sm:text-2xl font-bold font-mono text-white">
              {quotations.length}
            </span>
            <span className="text-[10px] sm:text-xs font-mono text-neutral-400 hidden xs:inline truncate">
              {formatMoney(totalValue)}
            </span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-neutral-500 mt-1 truncate">Pipeline volume</div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="bg-neutral-850 border border-neutral-800 rounded-xl p-3 sm:p-4 shadow-sm hover:border-neutral-700 transition-colors"
        >
          <span className="text-[11px] sm:text-xs text-neutral-400 font-medium block truncate">Accepted / Won</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
              {acceptedQuotes.length}
            </span>
            <span className="text-[10px] sm:text-xs font-mono text-emerald-400 font-semibold hidden xs:inline truncate">
              {formatMoney(acceptedValue)}
            </span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-neutral-500 mt-1">{winRate}% win rate</div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="bg-neutral-850 border border-neutral-800 rounded-xl p-3 sm:p-4 shadow-sm hover:border-neutral-700 transition-colors"
        >
          <span className="text-[11px] sm:text-xs text-neutral-400 font-medium block truncate">Pending</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl sm:text-2xl font-bold font-mono text-amber-400">
              {pendingQuotes.length}
            </span>
            <span className="text-[10px] sm:text-xs font-mono text-neutral-400 hidden xs:inline truncate">
              {formatMoney(pendingQuotes.reduce((acc, q) => acc + q.grandTotal, 0))}
            </span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-neutral-500 mt-1 truncate">Awaiting decision</div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="bg-neutral-850 border border-neutral-800 rounded-xl p-3 sm:p-4 shadow-sm hover:border-neutral-700 transition-colors"
        >
          <span className="text-[11px] sm:text-xs text-neutral-400 font-medium block truncate">Avg Quote Size</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl sm:text-2xl font-bold font-mono text-blue-400">
              {quotations.length > 0 ? formatMoney(totalValue / quotations.length) : '0'}
            </span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-neutral-500 mt-1 truncate">Average proposal</div>
        </motion.div>
      </motion.div>

      {/* Filter and Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-neutral-850 border border-neutral-800 rounded-xl p-3 sm:p-4 space-y-3"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status filter tabs with animated indicator */}
          <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-lg text-xs overflow-x-auto no-scrollbar scroll-smooth">
            {['all', 'accepted', 'sent', 'pending', 'draft', 'rejected'].map(status => {
              const isActive = selectedStatus === status;
              return (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`relative px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer capitalize whitespace-nowrap text-xs shrink-0 ${
                    isActive ? 'text-white font-bold' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeFilterTab"
                      transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                      className="absolute inset-0 bg-neutral-800 rounded-md shadow-sm"
                    />
                  )}
                  <span className="relative z-10">
                    {status === 'all' ? `All (${quotations.length})` : status}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by quote #, client, reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700/80 rounded-lg pl-9 pr-3 py-2 sm:py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </motion.div>

      {/* Quotations List: Mobile Touch Cards (<md) + Desktop Table (>=md) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        className="bg-neutral-850 border border-neutral-800 rounded-xl overflow-hidden shadow-sm"
      >
        {filteredQuotations.length === 0 ? (
          <div className="py-16 text-center space-y-3 px-4">
            <FileText className="w-10 h-10 text-neutral-600 mx-auto" />
            <h3 className="text-sm font-semibold text-neutral-300">No Quotations Found</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {searchQuery || selectedStatus !== 'all'
                ? 'Try adjusting your search filters or status selection.'
                : 'Get started by creating your first quotation for your client.'}
            </p>
            <motion.button
              onClick={onCreateNew}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Create First Quotation
            </motion.button>
          </div>
        ) : (
          <>
            {/* MOBILE CARDS VIEW (block md:hidden) */}
            <div className="block md:hidden divide-y divide-neutral-800">
              {filteredQuotations.map((q) => (
                <div key={`m-${q.id}`} className="p-4 space-y-3 hover:bg-neutral-800/40 transition-colors">
                  {/* Top line: Quote Number & Status Select */}
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => onPrint(q)}
                      className="font-mono font-bold text-cyan-400 text-sm hover:underline cursor-pointer flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-cyan-500" />
                      <span>{q.quotationNumber}</span>
                    </button>
                    <select
                      value={q.status}
                      onChange={(e) => onUpdateStatus(q.id, e.target.value as Quotation['status'])}
                      className="bg-neutral-900 border border-neutral-700/80 rounded-lg text-xs px-2.5 py-1 text-neutral-200 cursor-pointer font-medium"
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                      <option value="invoiced">Invoiced</option>
                    </select>
                  </div>

                  {/* Client name and reference */}
                  <div>
                    <div className="font-semibold text-white text-sm">
                      {q.clientSnapshot?.companyName || q.clientSnapshot?.name}
                    </div>
                    <div className="text-xs text-neutral-400 mt-0.5 truncate">
                      {q.reference || `${q.items.length} item(s)`}
                    </div>
                  </div>

                  {/* Date & Grand Total */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-neutral-500 font-mono">Date: {q.date}</span>
                    <div className="text-right">
                      <span className="font-mono font-bold text-base text-white">
                        {formatMoney(q.grandTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Mobile Action Buttons Bar with large touch targets */}
                  <div className="flex items-center gap-2 pt-2 border-t border-neutral-800/80">
                    <button
                      onClick={() => onPrint(q)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print / PDF</span>
                    </button>

                    <button
                      onClick={() => onEdit(q)}
                      className="p-2 min-w-[38px] min-h-[38px] flex items-center justify-center text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 rounded-lg cursor-pointer"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDuplicate(q.id)}
                      className="p-2 min-w-[38px] min-h-[38px] flex items-center justify-center text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 rounded-lg cursor-pointer"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setQuoteToDelete(q)}
                      className="p-2 min-w-[38px] min-h-[38px] flex items-center justify-center text-neutral-400 hover:text-red-400 bg-neutral-900 hover:bg-red-950/40 border border-neutral-700/80 rounded-lg cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE VIEW (hidden md:block) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-900/60 border-b border-neutral-800 text-neutral-400 font-medium">
                  <tr>
                    <th className="py-3 px-4">Quotation #</th>
                    <th className="py-3 px-4">Client & Project</th>
                    <th className="py-3 px-4">Issue Date</th>
                    <th className="py-3 px-4">Valid Until</th>
                    <th className="py-3 px-4 text-right">Grand Total</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80">
                  {filteredQuotations.map((q, idx) => (
                    <motion.tr
                      key={q.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.03 }}
                      className="hover:bg-neutral-800/50 transition-colors group"
                    >
                      {/* Quotation Number */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-white whitespace-nowrap">
                        <button
                          onClick={() => onPrint(q)}
                          className="hover:text-blue-400 transition-colors cursor-pointer text-left flex items-center gap-1.5"
                        >
                          <span>{q.quotationNumber}</span>
                        </button>
                      </td>

                      {/* Client & Project */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-neutral-200 truncate">
                          {q.clientSnapshot?.companyName || q.clientSnapshot?.name}
                        </div>
                        <div className="text-[11px] text-neutral-400 truncate flex items-center gap-1.5 mt-0.5">
                          <span>{q.reference || `${q.items.length} items`}</span>
                          <span className="text-neutral-600">·</span>
                          <span className="text-[10px] text-blue-400 font-medium flex items-center gap-0.5">
                            <Languages className="w-3 h-3" /> Arabic
                          </span>
                        </div>
                      </td>

                      {/* Issue Date */}
                      <td className="py-3.5 px-4 font-mono text-neutral-400 whitespace-nowrap">
                        {q.date}
                      </td>

                      {/* Valid Until */}
                      <td className="py-3.5 px-4 font-mono text-neutral-400 whitespace-nowrap">
                        {q.validUntil}
                      </td>

                      {/* Grand Total */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-white whitespace-nowrap">
                        {formatMoney(q.grandTotal)}
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <select
                          value={q.status}
                          onChange={(e) => onUpdateStatus(q.id, e.target.value as Quotation['status'])}
                          className="bg-neutral-900 border border-neutral-700 rounded text-xs px-2 py-1 text-neutral-200 cursor-pointer focus:outline-none focus:border-blue-500 transition-colors"
                        >
                          <option value="draft">Draft</option>
                          <option value="sent">Sent</option>
                          <option value="pending">Pending</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                          <option value="invoiced">Invoiced</option>
                        </select>
                      </td>

                      {/* Actions with Spring Button Interactions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* PRINT BUTTON - Prominent */}
                          <motion.button
                            onClick={() => onPrint(q)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.94 }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 rounded-md font-medium transition-colors cursor-pointer"
                            title="Print Quotation with Arabic"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print</span>
                          </motion.button>

                          {/* EDIT BUTTON */}
                          <motion.button
                            onClick={() => onEdit(q)}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.92 }}
                            className="p-1.5 text-neutral-400 hover:text-neutral-200 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 rounded-md transition-colors cursor-pointer"
                            title="Edit Quotation"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </motion.button>

                          {/* DUPLICATE BUTTON */}
                          <motion.button
                            onClick={() => onDuplicate(q.id)}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.92 }}
                            className="p-1.5 text-neutral-400 hover:text-neutral-200 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 rounded-md transition-colors cursor-pointer"
                            title="Duplicate Quotation"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </motion.button>

                          {/* DELETE BUTTON */}
                          <motion.button
                            onClick={() => setQuoteToDelete(q)}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.92 }}
                            className="p-1.5 text-neutral-500 hover:text-red-400 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 rounded-md transition-colors cursor-pointer"
                            title="Delete Quotation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </motion.div>

      {/* Delete Confirmation Modal with AnimatePresence */}
      <AnimatePresence>
        {quoteToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 450, damping: 28 }}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 w-full max-w-md space-y-4 shadow-2xl"
            >
              <div className="flex items-center gap-3 text-red-400">
                <div className="w-10 h-10 rounded-full bg-red-950/60 border border-red-800 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Delete Quotation?</h3>
                  <p className="text-xs text-neutral-400">This action cannot be undone.</p>
                </div>
              </div>

              <div className="bg-neutral-800/60 border border-neutral-700/80 rounded-lg p-3 text-xs space-y-1">
                <div className="font-mono font-bold text-white">{quoteToDelete.quotationNumber}</div>
                <div className="text-neutral-300 font-medium">
                  Client: {quoteToDelete.clientSnapshot?.companyName || quoteToDelete.clientSnapshot?.name}
                </div>
                <div className="text-neutral-400 font-mono">
                  Total: {formatMoney(quoteToDelete.grandTotal)} · {quoteToDelete.items.length} items
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setQuoteToDelete(null)}
                  className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg cursor-pointer shadow-sm shadow-red-600/30"
                >
                  Yes, Delete Quotation
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
