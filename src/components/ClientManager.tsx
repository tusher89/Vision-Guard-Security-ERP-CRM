import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Client, Quotation, CompanyProfile } from '../types';
import { 
  Plus, 
  Search, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Edit3, 
  Trash2, 
  ArrowRight,
  UserCheck,
  AlertTriangle,
  X,
  UserX,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Receipt,
  FileSpreadsheet
} from 'lucide-react';
import { ExcelImportModal } from './ExcelImportModal';

interface ClientManagerProps {
  clients: Client[];
  quotations: Quotation[];
  company: CompanyProfile;
  onSaveClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
  onCreateQuoteForClient: (clientId: string) => void;
  onImportBulkClients?: (clients: Client[], replace: boolean) => void;
}

export const ClientManager: React.FC<ClientManagerProps> = ({
  clients,
  quotations,
  company,
  onSaveClient,
  onDeleteClient,
  onCreateQuoteForClient,
  onImportBulkClients,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'danger' } | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [taxId, setTaxId] = useState('');
  const [notes, setNotes] = useState('');

  const triggerNotification = (message: string, type: 'success' | 'danger' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const openAddModal = () => {
    setEditingClient(null);
    setName('');
    setCompanyName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setCity('');
    setTaxId('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setName(client.name);
    setCompanyName(client.companyName);
    setEmail(client.email);
    setPhone(client.phone);
    setAddress(client.address);
    setCity(client.city);
    setTaxId(client.taxId || '');
    setNotes(client.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() && !companyName.trim()) return;

    const clientData: Client = {
      id: editingClient ? editingClient.id : 'cli-' + Date.now(),
      name: name.trim() || companyName.trim(),
      companyName: companyName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      taxId: taxId.trim(),
      contactPerson: name.trim(),
      notes: notes.trim(),
      createdAt: editingClient ? editingClient.createdAt : new Date().toISOString().split('T')[0]
    };

    onSaveClient(clientData);
    setIsModalOpen(false);
    triggerNotification(
      editingClient 
        ? `Client "${clientData.companyName || clientData.name}" updated successfully` 
        : `New client "${clientData.companyName || clientData.name}" added to CRM!`,
      'success'
    );
  };

  const handleConfirmDelete = () => {
    if (!clientToDelete) return;
    const clientName = clientToDelete.companyName || clientToDelete.name;
    onDeleteClient(clientToDelete.id);
    setClientToDelete(null);
    if (editingClient?.id === clientToDelete.id) {
      setIsModalOpen(false);
      setEditingClient(null);
    }
    triggerNotification(`Client "${clientName}" removed from CRM database`, 'danger');
  };

  const filteredClients = clients.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.companyName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      (c.city && c.city.toLowerCase().includes(q))
    );
  });

  const totalQuotesValue = quotations.reduce((acc, q) => acc + q.grandTotal, 0);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold backdrop-blur-md ${
              notification.type === 'danger'
                ? 'bg-red-950/90 text-red-200 border-red-500/50'
                : 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50'
            }`}
          >
            {notification.type === 'danger' ? (
              <UserX className="w-4 h-4 text-red-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header & CRM Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span className="text-white">CRM &amp; Client Directory</span>
              <span className="text-[11px] font-mono font-bold bg-cyan-950/60 text-cyan-400 border border-cyan-800/60 px-2 py-0.5 rounded-full">
                {clients.length} Clients
              </span>
            </h1>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Manage corporate accounts, delete or edit client profiles, and issue rapid quotations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsExcelModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl font-bold text-xs shadow-md shadow-emerald-500/10 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Import Excel</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Client</span>
          </motion.button>
        </div>
      </div>

      {/* CRM Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Total Accounts</div>
            <div className="text-xl font-bold text-white font-mono">{clients.length}</div>
          </div>
        </div>

        <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Active Quotations</div>
            <div className="text-xl font-bold text-white font-mono">{quotations.length}</div>
          </div>
        </div>

        <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Quoted Pipeline</div>
            <div className="text-xl font-bold text-emerald-400 font-mono">
              {company.currencySymbol} {totalQuotesValue.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by client name, company, phone, email, VAT CR..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-neutral-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="text-xs text-neutral-400 font-medium">
          Showing <span className="text-white font-bold">{filteredClients.length}</span> of {clients.length} clients
        </div>
      </div>

      {/* Clients Cards Grid */}
      {filteredClients.length === 0 ? (
        <div className="text-center py-14 bg-neutral-900/50 border border-dashed border-neutral-800 rounded-2xl p-6">
          <UserX className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white">No clients found</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
            {searchQuery 
              ? `No client matches "${searchQuery}". Clear your search or add a new account.` 
              : 'Your client directory is currently empty. Click "Add New Client" to start.'}
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add First Client
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredClients.map(client => {
              const clientQuotes = quotations.filter(q => q.clientId === client.id);
              const totalSpent = clientQuotes.reduce((acc, q) => acc + q.grandTotal, 0);

              return (
                <motion.div
                  key={client.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  className="bg-neutral-900/90 border border-neutral-800/90 hover:border-cyan-500/40 rounded-xl p-5 transition-all flex flex-col justify-between space-y-4 shadow-sm hover:shadow-cyan-500/5 group relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700/60 flex items-center justify-center text-cyan-400 font-bold text-xs uppercase shrink-0">
                            {(client.companyName || client.name).charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-white text-sm truncate group-hover:text-cyan-300 transition-colors">
                              {client.companyName || client.name}
                            </h3>
                            {client.contactPerson && client.companyName && (
                              <p className="text-[11px] text-neutral-400 truncate flex items-center gap-1">
                                <span className="text-neutral-500">Contact:</span>
                                <span className="text-neutral-300 font-medium">{client.contactPerson}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons: Edit and CRM Delete */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openEditModal(client)}
                          className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg cursor-pointer transition-colors"
                          title="Edit Client"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setClientToDelete(client)}
                          className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg cursor-pointer transition-colors"
                          title="Delete Client from CRM"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-1.5 text-xs text-neutral-400 bg-neutral-950/60 border border-neutral-800/60 rounded-lg p-2.5">
                      {client.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                          <span className="font-mono text-neutral-300">{client.phone}</span>
                        </div>
                      )}
                      {client.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span className="truncate text-neutral-300">{client.email}</span>
                        </div>
                      )}
                      {client.address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0 mt-0.5" />
                          <span className="text-neutral-400 line-clamp-1">
                            {client.address}{client.city ? `, ${client.city}` : ''}
                          </span>
                        </div>
                      )}
                      {client.taxId && (
                        <div className="text-[10px] font-mono text-neutral-500 pt-0.5 flex items-center justify-between">
                          <span>{client.taxId}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quotations Summary Footer */}
                  <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase font-semibold">
                        Quotes ({clientQuotes.length})
                      </span>
                      <span className="font-mono font-bold text-neutral-200">
                        {company.currencySymbol} {totalSpent.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setClientToDelete(client)}
                        className="text-[11px] text-red-400/80 hover:text-red-300 px-2 py-1 rounded hover:bg-red-950/50 cursor-pointer font-medium transition-colors"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => onCreateQuoteForClient(client.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-800 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 text-neutral-200 hover:text-white rounded-lg font-semibold text-xs transition-all cursor-pointer shadow-sm"
                      >
                        <span>New Quote</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Animated CRM Client Delete Confirmation Modal */}
      <AnimatePresence>
        {clientToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-neutral-900 border border-red-500/30 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl relative overflow-hidden"
            >
              {/* Top Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-amber-500" />

              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Delete Client from CRM?
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Are you sure you want to delete <span className="text-white font-semibold">"{clientToDelete.companyName || clientToDelete.name}"</span>?
                  </p>
                </div>
              </div>

              {/* Client Info Card */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs space-y-1.5">
                <div className="flex justify-between text-neutral-400">
                  <span>Contact Person:</span>
                  <span className="text-white font-medium">{clientToDelete.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Linked Quotations:</span>
                  <span className="text-cyan-400 font-mono font-bold">
                    {quotations.filter(q => q.clientId === clientToDelete.id).length} Quotes
                  </span>
                </div>
                {clientToDelete.phone && (
                  <div className="flex justify-between text-neutral-400">
                    <span>Phone:</span>
                    <span className="text-neutral-300 font-mono">{clientToDelete.phone}</span>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-red-400/90 bg-red-950/30 border border-red-900/40 p-2.5 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                This action is irreversible. The client will be permanently removed from your CRM records.
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setClientToDelete(null)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-lg shadow-red-600/30 cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Client</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit Client Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">
                      {editingClient ? 'Edit Client Details' : 'Add New Client to CRM'}
                    </h2>
                    <p className="text-[11px] text-neutral-400">
                      {editingClient ? 'Modify contact profile or remove account.' : 'Create a corporate buyer record.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Company Name with Clear Button */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-neutral-300">
                        Company / Establishment Name *
                      </label>
                      {companyName && (
                        <button
                          type="button"
                          onClick={() => setCompanyName('')}
                          className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                          Clear Name
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Al-Andalus Commercial Plaza / Al Rajhi Logistics"
                        className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  {/* Contact Person Name with Clear / Delete Name Button */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-neutral-300">
                        Contact Person Name
                      </label>
                      {name && (
                        <button
                          type="button"
                          onClick={() => setName('')}
                          className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                          title="Delete contact person name"
                        >
                          <X className="w-3 h-3" />
                          Delete Name
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Eng. Abdullah Al-Ghamdi"
                      className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Phone / Mobile Number
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+966 54 321 8765"
                      className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="procurement@company.sa"
                      className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      City / Region
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Jeddah / Riyadh / Dammam"
                      className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* CR / VAT Tax ID */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Commercial Registration (CR) / VAT Number
                    </label>
                    <input
                      type="text"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      placeholder="CR: 4030284711 | VAT: 300184920400003"
                      className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  {/* Physical Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Physical Address / Facility Location
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="King Fahd Road, Al-Andalus District, Jeddah"
                      className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Notes */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Internal Notes / Project Context
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. 64-channel IP surveillance project with HCIS compliance."
                      className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
                  {editingClient ? (
                    <button
                      type="button"
                      onClick={() => setClientToDelete(editingClient)}
                      className="text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Client</span>
                    </button>
                  ) : <div />}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-3.5 py-2 text-xs font-semibold text-neutral-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 cursor-pointer"
                    >
                      {editingClient ? 'Save Changes' : 'Create Client'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Excel Bulk Import Modal */}
      <ExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        type="clients"
        onImportClients={onImportBulkClients}
      />
    </div>
  );
};
