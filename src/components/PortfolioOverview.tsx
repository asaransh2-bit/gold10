import React, { useState } from 'react';
import {
  Coins,
  Scale,
  ShieldCheck,
  Send,
  Truck,
  Plus,
  Award,
  Lock,
  Clock,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  FileCode2
} from 'lucide-react';
import { UserProfile, VaultBar, TransactionRecord, GoldSpotData } from '../types';
import { VaultCertificateModal } from './VaultCertificateModal';

interface PortfolioOverviewProps {
  currentUser: UserProfile;
  userBars: VaultBar[];
  transactions: TransactionRecord[];
  spotData: GoldSpotData;
  onOpenPurchase: () => void;
  onOpenTransfer: () => void;
  onOpenRedeem: () => void;
  onOpenArchitecture: () => void;
}

export const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({
  currentUser,
  userBars,
  transactions,
  spotData,
  onOpenPurchase,
  onOpenTransfer,
  onOpenRedeem,
  onOpenArchitecture
}) => {
  const [selectedBar, setSelectedBar] = useState<VaultBar | null>(null);

  const tokens = currentUser.goldBalance;
  const totalGrams = tokens * 10; // 10 grams per token
  const troyOunces = totalGrams / 31.1034768;
  const totalUsdValue = totalGrams * spotData.pricePerGram;

  return (
    <div id="portfolio-overview-section" className="space-y-8">
      
      {/* Top Banner: Master Portfolio Balance Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Vault Balance Card (8 cols) */}
        <div className="lg:col-span-8 bg-[#050505] border border-[#d4af3733] p-8 sm:p-10 flex flex-col justify-between rounded-sm shadow-2xl relative overflow-hidden">
          
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#d4af3722]">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] opacity-60 text-[#d4af37] font-medium">
                  Current Holdings & Bullion Vault Account
                </p>
                <p className="text-xs text-[#d4af37aa] mt-0.5 font-mono">
                  {currentUser.email}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-sm bg-[#0a0a0a] border border-[#d4af3733]">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                  <span className="text-[10px] uppercase tracking-wider text-[#d4af37]">Live Stream</span>
                </div>
                <button
                  onClick={onOpenArchitecture}
                  className="text-[11px] uppercase tracking-widest text-[#d4af37aa] hover:text-[#d4af37] underline decoration-[#d4af3744] flex items-center gap-1 hidden sm:flex"
                >
                  <FileCode2 className="w-3 h-3" />
                  SDK Code
                </button>
              </div>
            </div>

            {/* Big Numbers - High contrast light serif display */}
            <div>
              <div className="flex items-baseline gap-4 flex-wrap">
                <h1 className="text-6xl sm:text-8xl font-serif font-light text-white leading-none tracking-tight">
                  {tokens.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h1>
                <span className="text-2xl font-serif tracking-[0.2em] uppercase text-[#d4af37]">
                  GOLD10
                </span>
              </div>

              <div className="flex flex-wrap gap-8 mt-6">
                <div className="border-l border-[#d4af3744] pl-4">
                  <p className="text-[10px] uppercase tracking-widest opacity-50 mb-1 text-[#d4af37]">Physical Weight</p>
                  <p className="text-xl font-serif text-[#d4af37] font-normal">
                    {totalGrams.toFixed(2)}g <span className="text-[12px] opacity-60 ml-1 font-sans">24K ({troyOunces.toFixed(3)} oz t)</span>
                  </p>
                </div>

                <div className="border-l border-[#d4af3744] pl-4">
                  <p className="text-[10px] uppercase tracking-widest opacity-50 mb-1 text-[#d4af37]">Market Value</p>
                  <p className="text-xl font-serif text-white font-normal">
                    ${totalUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[11px] font-mono text-emerald-400 ml-1 font-sans">+2.4%</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons styled to design */}
          <div className="pt-8 mt-6 border-t border-[#d4af3722] flex flex-wrap gap-3">
            <button
              id="buy-mint-action-btn"
              onClick={onOpenPurchase}
              className="bg-[#d4af37] text-[#050505] font-bold py-3.5 px-6 text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors rounded-sm flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Execute Mint Transaction
            </button>

            <button
              id="transfer-action-btn"
              onClick={onOpenTransfer}
              className="border border-[#d4af3744] bg-[#0a0a0a] hover:border-[#d4af37] text-[#d4af37] py-3.5 px-5 text-xs uppercase tracking-widest rounded-sm flex items-center gap-2 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              Transfer Tokens
            </button>

            <button
              id="redeem-action-btn"
              onClick={onOpenRedeem}
              className="border border-[#d4af3744] bg-[#0a0a0a] hover:border-[#d4af37] text-[#d4af37] py-3.5 px-5 text-xs uppercase tracking-widest rounded-sm flex items-center gap-2 transition-colors"
            >
              <Truck className="w-3.5 h-3.5" />
              Physical Bar Delivery
            </button>
          </div>

        </div>

        {/* Custody Summary (4 cols) */}
        <aside className="lg:col-span-4 bg-[#0a0a0a] border border-[#d4af3722] p-8 flex flex-col justify-between rounded-sm">
          <div>
            <h2 className="text-[12px] uppercase tracking-widest mb-6 border-b border-[#d4af3722] pb-2 text-[#d4af37]">
              Custody & Vault Proof
            </h2>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-[#050505] border border-[#d4af3722] space-y-1 rounded-sm">
                <div className="text-[10px] uppercase tracking-wider text-[#d4af37aa] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Assay Purity Standard
                </div>
                <div className="font-serif text-sm text-white font-semibold">999.9 Fine 24K Gold</div>
                <div className="text-[11px] text-zinc-400">
                  Argor-Heraeus, Valcambi & PAMP (Switzerland)
                </div>
              </div>

              <div className="p-4 bg-[#050505] border border-[#d4af3722] space-y-1 rounded-sm">
                <div className="text-[10px] uppercase tracking-wider text-[#d4af37aa] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#d4af37]" />
                  Allocated Vault Zones
                </div>
                <div className="font-serif text-sm text-white font-semibold">Zurich, Singapore & London</div>
                <div className="text-[11px] text-zinc-400">
                  Direct legal bailment ownership per serialized bar.
                </div>
              </div>

              <div className="p-4 bg-[#050505] border border-[#d4af3722] space-y-1 rounded-sm">
                <div className="text-[10px] uppercase tracking-wider text-[#d4af37aa] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                  Audit Proof of Reserve
                </div>
                <div className="font-serif text-sm text-white font-semibold">Monthly PwC & BV Audits</div>
                <div className="text-[11px] text-zinc-500 font-mono">
                  Merkle Tree Root on Base EVM
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#d4af3722]">
            <button
              onClick={onOpenArchitecture}
              className="w-full py-3 bg-[#050505] hover:bg-[#d4af37] hover:text-black border border-[#d4af3744] text-[#d4af37] text-[11px] uppercase tracking-[0.15em] font-semibold transition-all rounded-sm flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Inspect Security Rules
            </button>
          </div>
        </aside>

      </div>

      {/* Section 2: Allocated Physical 10g Gold Bars Grid */}
      <div className="bg-[#0a0a0a] border border-[#d4af3722] p-8 rounded-sm shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-[#d4af3722]">
          <div>
            <h3 className="text-base font-serif tracking-widest uppercase text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-[#d4af37]" />
              Allocated Physical 10g 24K Gold Bars ({userBars.length})
            </h3>
            <p className="text-[11px] text-[#d4af37aa] mt-1">
              Each GOLD10 token corresponds to an exact 10-gram LBMA serialized bar held in insured Swiss/Singapore vaults.
            </p>
          </div>
          <span className="text-[11px] font-mono uppercase tracking-wider bg-[#050505] text-[#d4af37] px-3 py-1.5 border border-[#d4af3733] rounded-sm">
            Allocated: {userBars.length * 10}g
          </span>
        </div>

        {userBars.length === 0 ? (
          <div className="text-center py-12 px-4 bg-[#050505] border border-[#d4af3722] space-y-3 rounded-sm">
            <Coins className="w-10 h-10 text-[#d4af37aa] mx-auto opacity-60" />
            <div className="text-sm font-serif uppercase tracking-widest text-white">No physical gold bars allocated yet</div>
            <p className="text-xs text-[#d4af37aa] max-w-sm mx-auto">
              Execute a GOLD10 purchase transaction to trigger the Cloud Function to allocate serialized 24K bars.
            </p>
            <button
              onClick={onOpenPurchase}
              className="mt-2 px-6 py-2.5 bg-[#d4af37] text-black font-bold uppercase tracking-widest text-xs rounded-sm hover:bg-white transition-colors"
            >
              Buy First GOLD10
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {userBars.map((bar) => (
              <div
                key={bar.serialNumber}
                className="group relative bg-[#050505] border border-[#d4af3722] hover:border-[#d4af37] p-5 transition-all space-y-3 rounded-sm"
              >
                {/* Physical Ingot Top */}
                <div className="flex items-center justify-between pb-3 border-b border-[#d4af3722]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border border-[#d4af37] rotate-45 flex items-center justify-center bg-[#0a0a0a]">
                      <span className="-rotate-45 font-serif font-bold text-[10px] text-[#d4af37]">10g</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-[0.2em] text-[#d4af37aa] block">
                        Serial Number
                      </span>
                      <div className="font-mono font-bold text-sm text-white">
                        {bar.serialNumber}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-[#0a0a0a] text-[#d4af37] border border-[#d4af3744]">
                    24K 999.9
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Refinery:</span>
                    <span className="text-zinc-200 font-medium truncate max-w-[180px]">
                      {bar.refinery}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Vault Custody:</span>
                    <span className="text-zinc-200 font-medium truncate max-w-[180px]">
                      {bar.vaultLocation}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Audit Status:</span>
                    <span className="text-emerald-400 font-medium flex items-center gap-1 font-mono text-[11px]">
                      <CheckCircle2 className="w-3 h-3" />
                      LBMA Verified
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedBar(bar)}
                    className="w-full py-2 bg-[#0a0a0a] hover:bg-[#d4af37] hover:text-black border border-[#d4af3733] text-xs font-semibold uppercase tracking-wider text-[#d4af37] transition-colors flex items-center justify-center gap-1.5 rounded-sm"
                  >
                    <Award className="w-3.5 h-3.5" />
                    Inspect Assay Certificate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 3: Recent Ledger */}
      <div className="bg-[#0a0a0a] border border-[#d4af3722] p-8 rounded-sm shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#d4af3722]">
          <div>
            <h3 className="text-base font-serif uppercase tracking-widest text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#d4af37]" />
              Recent Ledger ({transactions.length})
            </h3>
            <p className="text-[11px] text-[#d4af37aa]">
              Immutable audit ledger records written atomically by Cloud Functions via Firebase Admin SDK.
            </p>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest hidden sm:inline">
            transactions/{'{txId}'}
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-6 text-xs text-zinc-500">
            No transaction records found in ledger.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[#d4af37aa] uppercase tracking-wider text-[10px] border-b border-[#d4af3722]">
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Tokens</th>
                  <th className="pb-3 font-semibold">Gold Weight</th>
                  <th className="pb-3 font-semibold">Total USD</th>
                  <th className="pb-3 font-semibold">Allocated Bars</th>
                  <th className="pb-3 font-semibold">Status / EVM Tx</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d4af3711]">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#050505] transition-colors">
                    <td className="py-3 font-semibold">
                      {tx.type === 'MINT_PURCHASE' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                          Mint Purchase
                        </span>
                      ) : tx.type === 'TRANSFER_OUT' ? (
                        <span className="inline-flex items-center gap-1 text-[#d4af37]">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          Transfer Out
                        </span>
                      ) : tx.type === 'TRANSFER_IN' ? (
                        <span className="inline-flex items-center gap-1 text-sky-400">
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                          Transfer In
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400">
                          <Truck className="w-3.5 h-3.5" />
                          Physical Delivery
                        </span>
                      )}
                    </td>
                    <td className="py-3 font-mono font-bold text-white">
                      {tx.tokenAmount.toFixed(2)} G10
                    </td>
                    <td className="py-3 text-zinc-300 font-mono">
                      {tx.goldGrams.toFixed(1)}g 24K
                    </td>
                    <td className="py-3 text-zinc-300 font-mono">
                      ${tx.usdTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 text-zinc-400 font-mono text-[11px]">
                      {tx.vaultBarSerials.length > 0
                        ? tx.vaultBarSerials.slice(0, 2).join(', ') +
                          (tx.vaultBarSerials.length > 2 ? ` +${tx.vaultBarSerials.length - 2} more` : '')
                        : 'N/A'}
                    </td>
                    <td className="py-3">
                      {tx.blockchainTx ? (
                        <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span>{tx.blockchainTx.txHash.slice(0, 6)}...{tx.blockchainTx.txHash.slice(-4)}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-500 font-mono">Confirmed Ledger</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assay Certificate Modal */}
      {selectedBar && (
        <VaultCertificateModal bar={selectedBar} onClose={() => setSelectedBar(null)} />
      )}

    </div>
  );
};
