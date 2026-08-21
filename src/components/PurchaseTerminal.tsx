import React, { useState } from 'react';
import {
  Coins,
  Scale,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Cpu,
  RefreshCw,
  Wallet,
  Building,
  CreditCard,
  Layers,
  Copy,
  Check
} from 'lucide-react';
import { UserProfile, GoldSpotData } from '../types';

interface PurchaseTerminalProps {
  currentUser: UserProfile;
  spotData: GoldSpotData;
  onPurchaseComplete: (data: any) => void;
  onViewArchitecture: () => void;
}

export const PurchaseTerminal: React.FC<PurchaseTerminalProps> = ({
  currentUser,
  spotData,
  onPurchaseComplete,
  onViewArchitecture
}) => {
  const [tokenAmount, setTokenAmount] = useState<number>(2.0); // Default 2 GOLD10 = 20g
  const [paymentMethod, setPaymentMethod] = useState<'USDC_INSTANT' | 'BANK_WIRE' | 'CREDIT_CARD'>('USDC_INSTANT');
  const [walletAddress, setWalletAddress] = useState<string>(currentUser.walletAddress || '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [copiedCalldata, setCopiedCalldata] = useState<boolean>(false);

  const grams = tokenAmount * 10;
  const rawGoldCost = grams * spotData.pricePerGram;
  const mintFee = rawGoldCost * 0.005; // 0.5% mint & custody fee
  const totalCostUsd = rawGoldCost + mintFee;

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenAmount <= 0 || isNaN(tokenAmount)) return;

    setIsProcessing(true);
    setExecutionResult(null);

    try {
      const response = await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.userId,
          tokenAmount,
          paymentMethod,
          recipientWallet: walletAddress
        })
      });

      const data = await response.json();
      if (data.success) {
        setExecutionResult(data);
        onPurchaseComplete(data);
      } else {
        alert(data.error || 'Failed to complete purchase');
      }
    } catch (err: any) {
      alert(err.message || 'Network error executing purchase');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCalldata(true);
    setTimeout(() => setCopiedCalldata(false), 2000);
  };

  return (
    <div id="purchase-terminal-container" className="max-w-4xl mx-auto space-y-6">
      
      {/* Execution Results View */}
      {executionResult ? (
        <div className="bg-[#050505] border border-emerald-500/40 rounded-sm p-6 sm:p-8 text-white shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[#d4af3722]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-sm bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-serif text-white uppercase tracking-wider">
                  Cloud Function Purchase & Mint Succeeded
                </h3>
                <p className="text-xs text-[#d4af37aa]">
                  Atomic transaction committed to Firestore via Firebase Admin SDK.
                </p>
              </div>
            </div>

            <button
              onClick={() => setExecutionResult(null)}
              className="px-4 py-2 bg-[#0a0a0a] hover:bg-[#d4af37] hover:text-black border border-[#d4af3744] text-xs font-semibold uppercase tracking-wider text-[#d4af37] rounded-sm transition-colors"
            >
              New Order
            </button>
          </div>

          {/* Key transaction outcomes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-sm bg-[#0a0a0a] border border-[#d4af3722] space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-[#d4af37aa]">New GOLD10 Balance:</span>
              <div className="text-2xl font-serif font-bold text-[#d4af37]">
                {executionResult.user.goldBalance.toFixed(2)} GOLD10
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">
                {(executionResult.user.goldBalance * 10).toFixed(1)}g Physical Gold
              </span>
            </div>

            <div className="p-4 rounded-sm bg-[#0a0a0a] border border-[#d4af3722] space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-[#d4af37aa]">Allocated 10g 24K Bars:</span>
              <div className="text-base font-serif font-bold text-white mt-1">
                {executionResult.allocatedBars.length} Serialized Bars
              </div>
              <span className="text-[11px] text-emerald-400">
                Zurich & Singapore Vaults
              </span>
            </div>

            <div className="p-4 rounded-sm bg-[#0a0a0a] border border-[#d4af3722] space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-[#d4af37aa]">On-Chain Relay Status:</span>
              <div className="text-base font-serif font-bold text-sky-400 flex items-center gap-1 mt-1">
                <Cpu className="w-4 h-4" />
                EVM Ready
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">
                Gas: {executionResult.blockchainRelay.gasUsed}
              </span>
            </div>
          </div>

          {/* Cryptographic Proof & EVM Calldata Payload */}
          <div className="p-5 rounded-sm bg-[#0a0a0a] border border-[#d4af3722] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-serif uppercase tracking-widest text-[#d4af37] flex items-center gap-1.5 font-semibold">
                <Lock className="w-3.5 h-3.5 text-[#d4af37]" />
                EVM Cryptographic Mint Calldata (Backend Signer)
              </span>
              <button
                onClick={() => copyToClipboard(executionResult.transaction.blockchainTx.vaultReceiptHash)}
                className="text-[11px] text-[#d4af37] hover:text-white flex items-center gap-1 bg-[#050505] px-3 py-1 rounded-sm border border-[#d4af3733]"
              >
                {copiedCalldata ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedCalldata ? 'Copied Hash' : 'Copy Proof Hash'}
              </button>
            </div>

            <div className="space-y-2 text-[11px] font-mono">
              <div className="bg-[#050505] p-3 rounded-sm border border-[#d4af3722] break-all text-zinc-300">
                <span className="text-[#d4af37aa] uppercase tracking-wider mr-2">Vault Receipt Hash:</span>
                {executionResult.transaction.blockchainTx.vaultReceiptHash}
              </div>
              <div className="bg-[#050505] p-3 rounded-sm border border-[#d4af3722] break-all text-zinc-300">
                <span className="text-[#d4af37aa] uppercase tracking-wider mr-2">Admin Authority Signature:</span>
                {executionResult.transaction.blockchainTx.signature}
              </div>
            </div>
          </div>

          {/* Allocated Bars Breakdown */}
          <div className="space-y-2">
            <h4 className="text-[11px] uppercase tracking-widest text-[#d4af37aa]">
              Allocated Physical Bars Assays
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {executionResult.allocatedBars.map((bar: any) => (
                <div key={bar.serialNumber} className="p-3 bg-[#0a0a0a] rounded-sm border border-[#d4af3722] text-xs flex justify-between items-center">
                  <div>
                    <span className="font-mono font-bold text-[#d4af37]">{bar.serialNumber}</span>
                    <p className="text-[11px] text-zinc-400">{bar.vaultLocation.split('(')[0]}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-sm bg-[#050505] text-emerald-400 border border-[#d4af3733] font-mono">
                    {bar.auditCertificateId}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : null}

      {/* Main Buy & Mint Form */}
      <div className="bg-[#0a0a0a] border border-[#d4af3722] rounded-sm p-6 sm:p-10 text-[#d4af37] shadow-xl space-y-8">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#d4af3722]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 border border-[#d4af37] rotate-45 flex items-center justify-center bg-[#050505] shrink-0">
              <Coins className="-rotate-45 w-5 h-5 text-[#d4af37]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-serif text-white uppercase tracking-widest">
                Buy & Mint GOLD10 Tokens
              </h2>
              <p className="text-xs text-[#d4af37aa] mt-1">
                Backend Cloud Function executes purchase, updates Firestore ledger, and prepares EVM mint calldata.
              </p>
            </div>
          </div>
          <button
            onClick={onViewArchitecture}
            className="text-[11px] text-[#d4af37] hover:text-white uppercase tracking-widest underline decoration-[#d4af3744] flex items-center gap-1 font-medium"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Security Model
          </button>
        </div>

        <form onSubmit={handlePurchase} className="space-y-8">
          
          {/* Order Sizing */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <label className="uppercase tracking-widest text-[#d4af37aa] font-medium text-[11px]">
                Select Purchase Quantity (GOLD10)
              </label>
              <span className="text-white font-serif">
                1 GOLD10 = <strong className="text-[#d4af37]">10.00 Grams 24K</strong>
              </span>
            </div>

            <div className="relative">
              <input
                type="number"
                min="0.1"
                max="500"
                step="0.1"
                required
                value={tokenAmount}
                onChange={(e) => setTokenAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#050505] border border-[#d4af3733] focus:border-[#d4af37] rounded-sm px-4 py-3.5 text-2xl font-serif font-light text-white focus:outline-none transition-colors"
                placeholder="2.0"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-xs font-serif uppercase tracking-widest text-[#d4af37] bg-[#0a0a0a] px-3 py-1.5 rounded-sm border border-[#d4af3744]">
                GOLD10
              </div>
            </div>

            {/* Quick Sizing Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { label: '1 Token (10g)', val: 1 },
                { label: '2 Tokens (20g)', val: 2 },
                { label: '5 Tokens (50g)', val: 5 },
                { label: '10 Tokens (100g)', val: 10 },
                { label: '50 Tokens (0.5kg)', val: 50 }
              ].map((p) => (
                <button
                  type="button"
                  key={p.val}
                  onClick={() => setTokenAmount(p.val)}
                  className={`px-3 py-2.5 text-xs font-serif rounded-sm border transition-all ${
                    tokenAmount === p.val
                      ? 'bg-[#d4af37] text-black font-bold border-[#d4af37]'
                      : 'bg-[#050505] text-[#d4af37] border-[#d4af3733] hover:border-[#d4af37]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3">
            <label className="block text-[11px] uppercase tracking-widest text-[#d4af37aa] font-medium">
              Settlement & Funding Channel
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              <button
                type="button"
                onClick={() => setPaymentMethod('USDC_INSTANT')}
                className={`p-4 rounded-sm border text-left transition-all flex flex-col justify-between ${
                  paymentMethod === 'USDC_INSTANT'
                    ? 'bg-[#050505] border-[#d4af37] shadow-lg'
                    : 'bg-[#050505] border-[#d4af3722] hover:border-[#d4af3744]'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="font-serif text-sm font-semibold text-white">USDC Instant</span>
                  <Wallet className="w-4 h-4 text-sky-400" />
                </div>
                <p className="text-[11px] text-zinc-400">Zero slippage, immediate vault bar allocation</p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('BANK_WIRE')}
                className={`p-4 rounded-sm border text-left transition-all flex flex-col justify-between ${
                  paymentMethod === 'BANK_WIRE'
                    ? 'bg-[#050505] border-[#d4af37] shadow-lg'
                    : 'bg-[#050505] border-[#d4af3722] hover:border-[#d4af3744]'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="font-serif text-sm font-semibold text-white">Swiss / FedWire</span>
                  <Building className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-[11px] text-zinc-400">Direct fiat settlement to custodian account</p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CREDIT_CARD')}
                className={`p-4 rounded-sm border text-left transition-all flex flex-col justify-between ${
                  paymentMethod === 'CREDIT_CARD'
                    ? 'bg-[#050505] border-[#d4af37] shadow-lg'
                    : 'bg-[#050505] border-[#d4af3722] hover:border-[#d4af3744]'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="font-serif text-sm font-semibold text-white">Card / Apple Pay</span>
                  <CreditCard className="w-4 h-4 text-[#d4af37]" />
                </div>
                <p className="text-[11px] text-zinc-400">Instant consumer checkout simulation</p>
              </button>

            </div>
          </div>

          {/* EVM Recipient Wallet */}
          <div className="space-y-2">
            <label className="block text-[11px] uppercase tracking-widest text-[#d4af37aa] font-medium">
              EVM Blockchain Mint Recipient Address
            </label>
            <input
              type="text"
              required
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="w-full bg-[#050505] border border-[#d4af3733] focus:border-[#d4af37] rounded-sm px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none"
              placeholder="0x..."
            />
            <div className="text-[11px] text-[#d4af37aa]">
              The Cloud Function will encode this address into the smart contract mint calldata signed by the backend vault authority.
            </div>
          </div>

          {/* Order Summary Breakdown */}
          <div className="p-6 rounded-sm bg-[#050505] border border-[#d4af3722] space-y-3 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Physical Gold Backing:</span>
              <span className="font-mono text-zinc-200">{grams.toFixed(1)} grams 24K ({(grams / 31.1034768).toFixed(3)} oz t)</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Spot Gold Price (LBMA):</span>
              <span className="font-mono text-zinc-200">${spotData.pricePerGram.toFixed(2)} / gram</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Vault Allocation & Mint Fee (0.5%):</span>
              <span className="font-mono text-zinc-200">${mintFee.toFixed(2)} USD</span>
            </div>
            <div className="pt-3 border-t border-[#d4af3722] flex justify-between items-baseline text-white">
              <span className="font-serif uppercase tracking-widest text-sm text-[#d4af37]">Total Estimated Payment:</span>
              <span className="font-serif text-2xl text-white font-bold">
                ${totalCostUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs font-normal font-sans opacity-70">USD</span>
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing || tokenAmount <= 0}
            className="w-full py-4 bg-[#d4af37] text-black font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-white text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Executing Node.js Cloud Function & Admin SDK Transaction...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Execute Purchase & Mint ({tokenAmount} GOLD10)
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
};
