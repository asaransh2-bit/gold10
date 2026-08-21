import React from 'react';
import { Database, Coins, Cpu, ShieldCheck, UserCheck } from 'lucide-react';
import { UserProfile, GoldSpotData } from '../types';

interface HeaderProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onSelectUser: (userId: string) => void;
  activeTab: 'dashboard' | 'purchase' | 'blockchain' | 'architecture' | 'vault';
  setActiveTab: (tab: 'dashboard' | 'purchase' | 'blockchain' | 'architecture' | 'vault') => void;
  spotData: GoldSpotData;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  allUsers,
  onSelectUser,
  activeTab,
  setActiveTab,
  spotData
}) => {
  return (
    <header id="main-header" className="sticky top-0 z-40 bg-[#0a0a0a] border-b border-[#d4af3722] text-[#d4af37]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-20 flex items-center justify-between gap-4">
          
          {/* Logo & Brand: Sophisticated 45-degree diamond emblem */}
          <div className="flex items-center gap-3">
            <button
              id="brand-home-btn"
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-3 group text-left"
            >
              <div className="w-10 h-10 border-2 border-[#d4af37] rotate-45 flex items-center justify-center transition-transform group-hover:scale-105 bg-[#050505]">
                <span className="-rotate-45 font-serif font-bold text-lg text-[#d4af37]">G</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-serif tracking-[0.2em] uppercase text-white font-normal">
                  Gold10
                </span>
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#d4af37aa]">
                  Physical 24K Standard
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Links - Sleek Uppercase Tracked */}
          <nav id="nav-tabs" className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-widest text-[#d4af37aa]">
            <button
              id="nav-dashboard-tab"
              onClick={() => setActiveTab('dashboard')}
              className={`transition-all py-1 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'text-[#d4af37] border-b-2 border-[#d4af37] font-bold'
                  : 'hover:text-[#d4af37]'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              Dashboard
            </button>

            <button
              id="nav-purchase-tab"
              onClick={() => setActiveTab('purchase')}
              className={`transition-all py-1 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'purchase'
                  ? 'text-[#d4af37] border-b-2 border-[#d4af37] font-bold'
                  : 'hover:text-[#d4af37]'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              Secure Mint
            </button>

            <button
              id="nav-blockchain-tab"
              onClick={() => setActiveTab('blockchain')}
              className={`transition-all py-1 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'blockchain'
                  ? 'text-[#d4af37] border-b-2 border-[#d4af37] font-bold'
                  : 'hover:text-[#d4af37]'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              EVM Ledger
            </button>

            <button
              id="nav-architecture-tab"
              onClick={() => setActiveTab('architecture')}
              className={`transition-all py-1 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'architecture'
                  ? 'text-[#d4af37] border-b-2 border-[#d4af37] font-bold'
                  : 'hover:text-[#d4af37]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Zero-Trust Security
            </button>
          </nav>

          {/* Right Status & Auth Context */}
          <div className="flex items-center gap-4">
            
            {/* Live Node Connected status pill from Design */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-sm bg-[#050505] border border-[#d4af3722]">
              <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
              <span className="text-[10px] uppercase tracking-tighter opacity-70 text-[#d4af37]">Node Connected</span>
              <span className="text-zinc-600">|</span>
              <span className="text-[11px] font-mono text-white font-semibold">${spotData.pricePerToken10g.toFixed(2)}</span>
            </div>

            {/* Auth User Sandbox Selector */}
            <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#d4af3744] rounded-sm px-2.5 py-1.5">
              <div className="text-[10px] uppercase tracking-widest text-[#d4af37aa] flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Auth:</span>
              </div>
              <select
                id="user-auth-selector"
                value={currentUser.userId}
                onChange={(e) => onSelectUser(e.target.value)}
                className="bg-[#050505] text-xs font-mono text-white rounded px-2 py-0.5 border border-[#d4af3733] focus:outline-none focus:border-[#d4af37] cursor-pointer max-w-[140px] sm:max-w-[180px] truncate"
                title="Switch simulated authenticated Firebase user to test zero-trust security isolation"
              >
                {allUsers.map((u) => (
                  <option key={u.userId} value={u.userId}>
                    {u.email} ({u.goldBalance.toFixed(1)} G10)
                  </option>
                ))}
              </select>
            </div>

          </div>

        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2.5 border-t border-[#d4af3722] gap-1 overflow-x-auto text-[10px] uppercase tracking-wider text-[#d4af37aa]">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-2 py-1 ${activeTab === 'dashboard' ? 'text-[#d4af37] font-bold border-b border-[#d4af37]' : ''}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('purchase')}
            className={`px-2 py-1 ${activeTab === 'purchase' ? 'text-[#d4af37] font-bold border-b border-[#d4af37]' : ''}`}
          >
            Secure Mint
          </button>
          <button
            onClick={() => setActiveTab('blockchain')}
            className={`px-2 py-1 ${activeTab === 'blockchain' ? 'text-[#d4af37] font-bold border-b border-[#d4af37]' : ''}`}
          >
            EVM Ledger
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-2 py-1 ${activeTab === 'architecture' ? 'text-[#d4af37] font-bold border-b border-[#d4af37]' : ''}`}
          >
            Security Rules
          </button>
        </div>

      </div>
    </header>
  );
};
