import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PriceTicker } from './components/PriceTicker';
import { PortfolioOverview } from './components/PortfolioOverview';
import { PurchaseTerminal } from './components/PurchaseTerminal';
import { BlockchainExplorer } from './components/BlockchainExplorer';
import { ArchitectureView } from './components/ArchitectureView';
import { PhysicalRedemptionModal } from './components/PhysicalRedemptionModal';
import { TransferModal } from './components/TransferModal';
import { UserProfile, VaultBar, TransactionRecord, GoldSpotData } from './types';
import { INITIAL_USERS, INITIAL_SPOT_DATA } from './data/mockDatabase';

export default function App() {
  const [allUsers, setAllUsers] = useState<UserProfile[]>(Object.values(INITIAL_USERS));
  const [currentUserId, setCurrentUserId] = useState<string>('usr_asaransh2');
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS['usr_asaransh2']);
  const [userBars, setUserBars] = useState<VaultBar[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [spotData, setSpotData] = useState<GoldSpotData>(INITIAL_SPOT_DATA);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'purchase' | 'blockchain' | 'architecture' | 'vault'>('dashboard');
  const [showRedeemModal, setShowRedeemModal] = useState<boolean>(false);
  const [showTransferModal, setShowTransferModal] = useState<boolean>(false);

  // Fetch live spot data & user data
  const loadUserData = async (uid: string) => {
    try {
      const [uRes, bRes, tRes, sRes, allRes] = await Promise.all([
        fetch(`/api/user/${uid}`),
        fetch(`/api/user/${uid}/vault-bars`),
        fetch(`/api/user/${uid}/transactions`),
        fetch('/api/spot-price'),
        fetch('/api/users')
      ]);

      if (uRes.ok) {
        const u = await uRes.json();
        setCurrentUser(u);
      }
      if (bRes.ok) {
        const b = await bRes.json();
        setUserBars(b);
      }
      if (tRes.ok) {
        const t = await tRes.json();
        setTransactions(t);
      }
      if (sRes.ok) {
        const s = await sRes.json();
        setSpotData(s);
      }
      if (allRes.ok) {
        const all = await allRes.json();
        setAllUsers(all);
      }
    } catch (e) {
      console.warn('Backend API connection fallback to local state:', e);
    }
  };

  useEffect(() => {
    loadUserData(currentUserId);
    const interval = setInterval(() => {
      loadUserData(currentUserId);
    }, 4000);
    return () => clearInterval(interval);
  }, [currentUserId]);

  const handleSelectUser = (uid: string) => {
    setCurrentUserId(uid);
    loadUserData(uid);
  };

  const handlePurchaseSuccess = (data: any) => {
    loadUserData(currentUserId);
  };

  const handleTransferSuccess = (data: any) => {
    loadUserData(currentUserId);
  };

  const handleRedeemSuccess = (data: any) => {
    loadUserData(currentUserId);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#d4af37] flex flex-col font-sans selection:bg-[#d4af37] selection:text-black border border-[#d4af3722]">
      
      {/* Top Main Navigation Bar */}
      <Header
        currentUser={currentUser}
        allUsers={allUsers}
        onSelectUser={handleSelectUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        spotData={spotData}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Spot Price & Gold Market Header Banner */}
        <PriceTicker spotData={spotData} onRefresh={() => loadUserData(currentUserId)} />

        {/* View Switcher */}
        {activeTab === 'dashboard' && (
          <PortfolioOverview
            currentUser={currentUser}
            userBars={userBars}
            transactions={transactions}
            spotData={spotData}
            onOpenPurchase={() => setActiveTab('purchase')}
            onOpenTransfer={() => setShowTransferModal(true)}
            onOpenRedeem={() => setShowRedeemModal(true)}
            onOpenArchitecture={() => setActiveTab('architecture')}
          />
        )}

        {activeTab === 'purchase' && (
          <PurchaseTerminal
            currentUser={currentUser}
            spotData={spotData}
            onPurchaseComplete={handlePurchaseSuccess}
            onViewArchitecture={() => setActiveTab('architecture')}
          />
        )}

        {activeTab === 'blockchain' && (
          <BlockchainExplorer
            transactions={transactions}
            onViewContractCode={() => setActiveTab('architecture')}
          />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureView />
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#d4af3722] bg-[#050505] text-[#d4af37aa] py-4 px-6 sm:px-10 text-[10px] uppercase tracking-[0.2em]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-serif font-bold text-white tracking-widest">GOLD10</span>
            <span className="opacity-40">&bull;</span>
            <span className="opacity-70">10g 24K Physical Allocated Standard</span>
          </div>
          <div className="flex items-center gap-6 opacity-60 text-[9px] font-mono">
            <span>Cloud Functions v2.0-Secure</span>
            <span>Firestore Ledger: Synchronized</span>
            <span>EVM Contract: 0x742d...f44e</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showTransferModal && (
        <TransferModal
          currentUser={currentUser}
          allUsers={allUsers}
          onClose={() => setShowTransferModal(false)}
          onTransferSuccess={handleTransferSuccess}
        />
      )}

      {showRedeemModal && (
        <PhysicalRedemptionModal
          currentUser={currentUser}
          userBars={userBars}
          onClose={() => setShowRedeemModal(false)}
          onRedeemSuccess={handleRedeemSuccess}
        />
      )}

    </div>
  );
}
