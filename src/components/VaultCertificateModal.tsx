import React from 'react';
import { ShieldCheck, X, Award, CheckCircle2, Lock, ExternalLink, QrCode } from 'lucide-react';
import { VaultBar } from '../types';

interface VaultCertificateModalProps {
  bar: VaultBar | null;
  onClose: () => void;
}

export const VaultCertificateModal: React.FC<VaultCertificateModalProps> = ({ bar, onClose }) => {
  if (!bar) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0a0a0a] border border-[#d4af3744] rounded-sm max-w-lg w-full p-6 sm:p-8 text-[#d4af37] shadow-2xl relative overflow-hidden">
        
        {/* Diamond Icon & Title */}
        <div className="flex items-center justify-between pb-5 border-b border-[#d4af3722]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-[#d4af37] rotate-45 flex items-center justify-center bg-[#050505] shrink-0">
              <Award className="-rotate-45 w-4 h-4 text-[#d4af37]" />
            </div>
            <div>
              <h3 className="font-serif uppercase tracking-widest text-base text-white font-semibold">
                Allocation Certificate
              </h3>
              <p className="text-[10px] text-[#d4af37aa] uppercase tracking-wider">
                Official LBMA Good Delivery
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

        {/* Certificate Body */}
        <div className="my-6 p-6 rounded-sm bg-[#050505] border border-[#d4af3722] space-y-4">
          
          <div className="text-center pb-4 border-b border-[#d4af3722]">
            <div className="text-[10px] uppercase tracking-widest text-[#d4af37aa] font-serif">
              CERTIFICATE IDENTIFIER
            </div>
            <div className="text-xl font-serif font-bold text-white mt-1">
              {bar.auditCertificateId}
            </div>
            <div className="inline-flex items-center gap-1.5 mt-2 text-[10px] text-emerald-400 font-semibold bg-[#0a0a0a] px-3 py-1 rounded-sm border border-emerald-500/30 uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified LBMA Good Delivery Standard
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[#d4af37aa] text-[10px] uppercase tracking-wider">Bar Serial Number:</span>
              <p className="font-mono font-bold text-white text-sm mt-0.5">{bar.serialNumber}</p>
            </div>
            <div>
              <span className="text-[#d4af37aa] text-[10px] uppercase tracking-wider">Weight & Purity:</span>
              <p className="font-serif font-semibold text-white text-sm mt-0.5">{bar.weightGrams.toFixed(2)}g / {bar.purity}</p>
            </div>
            <div>
              <span className="text-[#d4af37aa] text-[10px] uppercase tracking-wider">Refinery & Assayer:</span>
              <p className="font-serif text-white mt-0.5">{bar.refinery}</p>
            </div>
            <div>
              <span className="text-[#d4af37aa] text-[10px] uppercase tracking-wider">Allocated Custodian:</span>
              <p className="font-serif text-white mt-0.5">{bar.vaultLocation}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-[#d4af3722] text-xs">
            <span className="text-[#d4af37aa] text-[10px] uppercase tracking-wider">Cryptographic Merkle Proof:</span>
            <p className="font-mono text-[10px] text-zinc-300 break-all bg-[#0a0a0a] p-2.5 rounded-sm border border-[#d4af3722] mt-1.5">
              {bar.merkleRootHash}
            </p>
          </div>

        </div>

        {/* Security & Verification Footer */}
        <div className="flex items-center justify-between text-xs text-[#d4af37aa] pt-2">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#d4af37]" />
            <span className="text-[10px] uppercase tracking-wider">Bureau Veritas & PwC</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#d4af37] hover:bg-white text-black font-bold uppercase tracking-[0.15em] text-xs rounded-sm transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
