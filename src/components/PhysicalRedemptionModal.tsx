import React, { useState } from 'react';
import { Truck, X, ShieldAlert, CheckCircle, Package, ArrowRight, Lock } from 'lucide-react';
import { UserProfile, VaultBar } from '../types';

interface PhysicalRedemptionModalProps {
  currentUser: UserProfile;
  userBars: VaultBar[];
  onClose: () => void;
  onRedeemSuccess: (data: any) => void;
}

export const PhysicalRedemptionModal: React.FC<PhysicalRedemptionModalProps> = ({
  currentUser,
  userBars,
  onClose,
  onRedeemSuccess
}) => {
  const [tokenAmount, setTokenAmount] = useState<number>(1);
  const [shippingAddress, setShippingAddress] = useState<string>('Paradeplatz 8, 8001 Zurich, Switzerland');
  const [destinationVault, setDestinationVault] = useState<string>('Zurich Freeport Secure Transfer Desk');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  const maxRedeemable = Math.floor(currentUser.goldBalance);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenAmount < 1 || tokenAmount > maxRedeemable) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.userId,
          tokenAmount,
          shippingAddress,
          vaultLocation: destinationVault
        })
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
        onRedeemSuccess(data);
      } else {
        alert(data.error || 'Redemption failed');
      }
    } catch (err: any) {
      alert(err.message || 'Network error during redemption');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0a0a0a] border border-[#d4af3744] rounded-sm max-w-lg w-full p-6 sm:p-8 text-[#d4af37] shadow-2xl relative">
        
        <div className="flex items-center justify-between pb-5 border-b border-[#d4af3722]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-[#d4af37] rotate-45 flex items-center justify-center bg-[#050505] shrink-0">
              <Truck className="-rotate-45 w-4 h-4 text-[#d4af37]" />
            </div>
            <div>
              <h3 className="font-serif uppercase tracking-widest text-base text-white font-semibold">
                Physical Bar Redemption
              </h3>
              <p className="text-[10px] text-[#d4af37aa] uppercase tracking-wider">
                Zurich & Singapore Vault Custody
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

        {result ? (
          <div className="my-6 space-y-5 text-center">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-sm flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-serif uppercase tracking-wider text-white">Redemption Dispatch Created</h4>
              <p className="text-xs text-[#d4af37aa] mt-1">
                Your GOLD10 tokens have been burned on the backend ledger and physical bars are assigned for armored transport.
              </p>
            </div>

            <div className="bg-[#050505] p-4 rounded-sm text-left text-xs space-y-2 border border-[#d4af3722]">
              <div className="flex justify-between">
                <span className="text-[#d4af37aa]">Dispatch Order ID:</span>
                <span className="font-mono font-bold text-[#d4af37]">{result.deliveryId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#d4af37aa]">Armored Courier:</span>
                <span className="text-white">{result.courier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#d4af37aa]">Destination:</span>
                <span className="text-white truncate max-w-[220px]">{result.destination}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 bg-[#d4af37] hover:bg-white text-black font-bold uppercase tracking-[0.2em] text-xs rounded-sm transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleRedeem} className="my-6 space-y-5">
            
            <div className="p-3.5 rounded-sm bg-[#050505] border border-[#d4af3722] text-xs text-zinc-300 flex gap-2.5">
              <Package className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
              <div>
                Physical gold bars are redeemed in units of <strong className="text-white">10 grams 24K pure gold</strong> per 1.0 GOLD10 token, sealed in serialized assay blister cards.
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#d4af37aa] font-medium mb-1.5">
                Redemption Quantity (1.0 GOLD10 = 10g Bar)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max={maxRedeemable || 1}
                  step="1"
                  value={tokenAmount}
                  onChange={(e) => setTokenAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-[#050505] border border-[#d4af3733] focus:border-[#d4af37] rounded-sm px-3.5 py-2.5 text-white font-mono text-sm focus:outline-none"
                />
                <span className="text-xs text-[#d4af37] font-serif whitespace-nowrap">
                  = {(tokenAmount * 10).toFixed(0)}g 24K Gold
                </span>
              </div>
              <div className="text-[10px] text-[#d4af37aa] mt-1">
                Available to redeem: {maxRedeemable} bars ({maxRedeemable * 10}g)
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#d4af37aa] font-medium mb-1.5">
                Delivery Option / Vault Transfer Hub
              </label>
              <select
                value={destinationVault}
                onChange={(e) => setDestinationVault(e.target.value)}
                className="w-full bg-[#050505] border border-[#d4af3733] focus:border-[#d4af37] rounded-sm px-3 py-2.5 text-xs text-white focus:outline-none"
              >
                <option value="Zurich Freeport Secure Transfer Desk">Zurich Freeport Vault Desk (Switzerland)</option>
                <option value="Le Freeport Armored Pick-up Singapore">Le Freeport Armored Pick-up (Singapore)</option>
                <option value="Brinks London High-Security Delivery">Brinks London High-Security Delivery (UK)</option>
                <option value="Insured Armored Courier Door-to-Door">Insured Armored Courier (Door-to-Door)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#d4af37aa] font-medium mb-1.5">
                Delivery / Identity Verification Address
              </label>
              <textarea
                rows={2}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full bg-[#050505] border border-[#d4af3733] focus:border-[#d4af37] rounded-sm px-3 py-2 text-xs text-white focus:outline-none"
                placeholder="Enter verified delivery address..."
              />
            </div>

            <div className="pt-4 border-t border-[#d4af3722] flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-wider text-[#d4af37aa] flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#d4af37]" />
                Admin SDK Backend
              </div>
              <button
                type="submit"
                disabled={submitting || maxRedeemable < 1}
                className="px-5 py-2.5 bg-[#d4af37] hover:bg-white text-black font-bold uppercase tracking-[0.15em] rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center gap-1.5"
              >
                {submitting ? 'Processing...' : 'Confirm Redemption'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
