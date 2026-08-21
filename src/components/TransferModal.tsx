import React, { useState } from 'react';
import { Send, X, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { UserProfile } from '../types';

interface TransferModalProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onClose: () => void;
  onTransferSuccess: (data: any) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  currentUser,
  allUsers,
  onClose,
  onTransferSuccess
}) => {
  const [recipient, setRecipient] = useState<string>(
    allUsers.find((u) => u.userId !== currentUser.userId)?.email || 'auditor@pwc-swissvaults.ch'
  );
  const [amount, setAmount] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || amount > currentUser.goldBalance) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId: currentUser.userId,
          recipientIdOrEmail: recipient,
          tokenAmount: amount
        })
      });
      const data = await res.json();
      if (data.success) {
        onTransferSuccess(data);
        onClose();
      } else {
        alert(data.error || 'Transfer failed');
      }
    } catch (err: any) {
      alert(err.message || 'Network error during transfer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0a0a0a] border border-[#d4af3744] rounded-sm max-w-md w-full p-6 sm:p-8 text-[#d4af37] shadow-2xl relative">
        
        <div className="flex items-center justify-between pb-5 border-b border-[#d4af3722]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-[#d4af37] rotate-45 flex items-center justify-center bg-[#050505] shrink-0">
              <Send className="-rotate-45 w-4 h-4 text-[#d4af37]" />
            </div>
            <div>
              <h3 className="font-serif uppercase tracking-widest text-base text-white font-semibold">
                Transfer Tokens
              </h3>
              <p className="text-[10px] text-[#d4af37aa] uppercase tracking-wider">
                Atomic Ledger Reallocation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#d4af37aa] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleTransfer} className="my-6 space-y-5">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#d4af37aa] font-medium mb-1.5">
              Recipient (Email or Account ID)
            </label>
            <input
              type="text"
              required
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g. user@domain.com"
              className="w-full bg-[#050505] border border-[#d4af3733] focus:border-[#d4af37] rounded-sm px-3.5 py-2.5 text-xs text-white focus:outline-none"
            />
            
            {/* Quick user pills */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {allUsers
                .filter((u) => u.userId !== currentUser.userId)
                .map((u) => (
                  <button
                    type="button"
                    key={u.userId}
                    onClick={() => setRecipient(u.email)}
                    className="text-[10px] px-2 py-0.5 rounded-sm bg-[#050505] hover:bg-[#d4af37] hover:text-black border border-[#d4af3722] text-[#d4af37aa] transition-colors font-mono"
                  >
                    {u.email}
                  </button>
                ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] uppercase tracking-widest text-[#d4af37aa] font-medium">
                Amount (GOLD10)
              </label>
              <span className="text-[11px] text-[#d4af37] font-serif">
                Max: {currentUser.goldBalance.toFixed(2)} GOLD10
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0.1"
                max={currentUser.goldBalance}
                step="0.1"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#050505] border border-[#d4af3733] focus:border-[#d4af37] rounded-sm px-3.5 py-2.5 text-white font-mono text-sm focus:outline-none"
              />
              <span className="text-xs text-[#d4af37] font-serif whitespace-nowrap">
                = {(amount * 10).toFixed(1)}g 24K
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-[#050505] rounded-sm border border-[#d4af3722] text-[11px] text-zinc-400 space-y-1.5">
            <div className="flex justify-between">
              <span>Settlement Network:</span>
              <span className="text-white">Firestore Ledger + EVM Bridge</span>
            </div>
            <div className="flex justify-between">
              <span>Physical Custody Re-allocation:</span>
              <span className="text-emerald-400">Automated</span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#d4af3722] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-[#050505] hover:bg-zinc-900 border border-[#d4af3722] text-xs font-serif uppercase tracking-wider rounded-sm text-[#d4af37aa]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || amount <= 0 || amount > currentUser.goldBalance}
              className="px-5 py-2.5 bg-[#d4af37] hover:bg-white text-black font-bold uppercase tracking-[0.15em] rounded-sm text-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Transferring...' : 'Execute Transfer'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
