import React from 'react';
import { motion } from 'motion/react';
import { CompanyProfile } from '../types';
import { VisionGuardLogo } from './VisionGuardLogo';
import { 
  FileText, 
  PlusCircle, 
  Users, 
  Package, 
  Settings, 
  Receipt,
  FileCheck2,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

export type NavigationTab = 'quotations' | 'new-quote' | 'clients' | 'products' | 'settings';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  quotationCount: number;
  clientCount: number;
  productCount: number;
  company: CompanyProfile;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  quotationCount,
  clientCount,
  productCount,
  company,
}) => {
  const navItems = [
    {
      id: 'quotations' as NavigationTab,
      label: 'Quotations',
      icon: FileText,
      count: quotationCount,
      sublabel: 'Proposals & Bids'
    },
    {
      id: 'clients' as NavigationTab,
      label: 'Clients (CRM)',
      icon: Users,
      count: clientCount,
      sublabel: 'Directory & Accounts'
    },
    {
      id: 'products' as NavigationTab,
      label: 'Products & CCTV',
      icon: Package,
      count: productCount,
      sublabel: 'Inventory & Rates'
    },
    {
      id: 'settings' as NavigationTab,
      label: 'Company & Letterhead',
      icon: Settings,
      sublabel: 'Banking & ZATCA'
    },
  ];

  return (
    <aside className="w-64 bg-[#090F1E] border-r border-neutral-800/80 flex flex-col justify-between shrink-0 min-h-screen no-print select-none">
      {/* Brand & Wordmark Zone */}
      <div>
        <div className="p-4 border-b border-neutral-800/80 bg-neutral-950/40">
          <VisionGuardLogo showText={true} size="md" />
          <div className="text-[10px] font-mono text-cyan-400/80 mt-2.5 flex items-center justify-between">
            <span className="truncate">CR: 403012389</span>
            <span className="text-neutral-500 font-sans">Jeddah, KSA</span>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="p-3.5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectTab('new-quote')}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
              currentTab === 'new-quote'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/25 ring-2 ring-cyan-400/30'
                : 'bg-cyan-950/50 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 text-cyan-300 hover:text-white border border-cyan-800/60'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Quotation</span>
          </motion.button>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`relative w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'text-white bg-gradient-to-r from-neutral-800/90 to-neutral-850 border border-neutral-700/80 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarIndicator"
                    className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-r-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-neutral-500'}`} />
                  <div className="text-left">
                    <span className="block leading-tight">{item.label}</span>
                    <span className="text-[10px] text-neutral-500 font-normal leading-none block mt-0.5">
                      {item.sublabel}
                    </span>
                  </div>
                </div>

                {item.count !== undefined && (
                  <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                      : 'bg-neutral-800/80 text-neutral-400'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info / Currency Notice */}
      <div className="p-3.5 border-t border-neutral-800/80 text-xs">
        <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-3 space-y-1.5 shadow-inner">
          <div className="flex items-center justify-between text-neutral-400 text-[11px]">
            <span>Active Currency:</span>
            <span className="font-mono font-bold text-white">
              {company.currencyCode} ({company.currencySymbol})
            </span>
          </div>
          <div className="flex items-center justify-between text-neutral-400 text-[11px]">
            <span>Taxation:</span>
            <span className="font-mono font-bold text-cyan-400">
              15% ZATCA VAT
            </span>
          </div>
          <div className="pt-1.5 border-t border-neutral-800/60 flex items-center justify-between text-[10px] text-neutral-500">
            <span>Security Est.</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
