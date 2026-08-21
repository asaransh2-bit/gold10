import React, { useState } from 'react';
import {
  Cpu,
  ShieldCheck,
  ExternalLink,
  Layers,
  FileCode,
  Copy,
  Check,
  CheckCircle2,
  Lock,
  Hash,
  Database
} from 'lucide-react';
import { TransactionRecord } from '../types';

interface BlockchainExplorerProps {
  transactions: TransactionRecord[];
  onViewContractCode: () => void;
}

export const BlockchainExplorer: React.FC<BlockchainExplorerProps> = ({
  transactions,
  onViewContractCode
}) => {
  const [copiedContract, setCopiedContract] = useState<boolean>(false);

  const contractAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
  const authoritySigner = '0x918276604919EaF39B8F20392019481900192801';

  const copyContract = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  const onChainTxs = transactions.filter((t) => t.blockchainTx);

  return (
    <div id="blockchain-explorer-container" className="space-y-6">
      
      {/* Top Banner: EVM Bridge Status */}
      <div className="bg-[#0a0a0a] border border-[#d4af3722] rounded-sm p-6 sm:p-8 text-[#d4af37] space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[#d4af3722]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37aa]">
                EVM Smart Contract Bridge (Base Mainnet)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif text-white uppercase tracking-widest mt-1">
              GOLD10 On-Chain Token Ledger
            </h2>
            <p className="text-xs text-[#d4af37aa] mt-0.5">
              Smart contract verifies backend Cloud Function cryptographic signatures before minting ERC-20 tokens.
            </p>
          </div>

          <button
            onClick={onViewContractCode}
            className="px-4 py-2.5 bg-[#050505] hover:bg-[#d4af37] hover:text-black border border-[#d4af3744] text-[#d4af37] rounded-sm text-xs uppercase tracking-widest font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FileCode className="w-4 h-4" />
            Solidity Source
          </button>
        </div>

        {/* Contract & Authority Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 rounded-sm bg-[#050505] border border-[#d4af3722] space-y-1">
            <span className="text-[#d4af37aa] font-sans text-[10px] uppercase tracking-wider">EVM Contract Address:</span>
            <div className="flex items-center justify-between">
              <span className="text-white font-bold truncate">
                {contractAddress.slice(0, 10)}...{contractAddress.slice(-8)}
              </span>
              <button
                onClick={copyContract}
                className="p-1 text-[#d4af37aa] hover:text-white"
                title="Copy Address"
              >
                {copiedContract ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="text-[10px] text-zinc-500 font-sans">
              ERC-20 (10g 24K Physical Backing)
            </div>
          </div>

          <div className="p-4 rounded-sm bg-[#050505] border border-[#d4af3722] space-y-1">
            <span className="text-[#d4af37aa] font-sans text-[10px] uppercase tracking-wider">Backend Authority Signer:</span>
            <div className="text-sky-300 font-bold truncate">
              {authoritySigner.slice(0, 10)}...{authoritySigner.slice(-8)}
            </div>
            <div className="text-[10px] text-emerald-400 font-sans flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Cloud Function Key (EIP-712 Verified)
            </div>
          </div>

          <div className="p-4 rounded-sm bg-[#050505] border border-[#d4af3722] space-y-1">
            <span className="text-[#d4af37aa] font-sans text-[10px] uppercase tracking-wider">Consensus & Security:</span>
            <div className="text-white font-bold font-sans">
              Base L2 / Ethereum L1 Rollup
            </div>
            <div className="text-[10px] text-zinc-400 font-sans">
              Replay-Protected Vault Receipts
            </div>
          </div>
        </div>
      </div>

      {/* On-Chain Events Ledger */}
      <div className="bg-[#0a0a0a] border border-[#d4af3722] rounded-sm p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#d4af3722]">
          <div>
            <h3 className="text-base font-serif uppercase tracking-widest text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#d4af37]" />
              Decoded Smart Contract Events ({onChainTxs.length})
            </h3>
            <p className="text-xs text-[#d4af37aa]">
              Real-time on-chain mint and burn events triggered after Cloud Function execution.
            </p>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">
            Interface: mint(to, amount, vaultReceiptHash, signature)
          </span>
        </div>

        {onChainTxs.length === 0 ? (
          <div className="text-center py-8 text-xs text-zinc-500">
            No on-chain mint transactions recorded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {onChainTxs.map((tx) => (
              <div
                key={tx.id}
                className="p-5 rounded-sm bg-[#050505] border border-[#d4af3722] space-y-3 text-xs font-mono"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#d4af3711]">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-sm bg-[#0a0a0a] text-emerald-400 font-bold font-sans text-[10px] border border-emerald-500/30 uppercase tracking-wider">
                      event GoldMinted
                    </span>
                    <span className="text-zinc-400">Block #{tx.blockchainTx?.blockNumber}</span>
                  </div>
                  <span className="text-zinc-500 font-sans text-[11px]">
                    {new Date(tx.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-[#0a0a0a] p-3 rounded-sm border border-[#d4af3722]">
                    <span className="text-[#d4af37aa] block font-sans text-[10px] uppercase tracking-wider">Tx Hash:</span>
                    <span className="text-white break-all">{tx.blockchainTx?.txHash}</span>
                  </div>

                  <div className="bg-[#0a0a0a] p-3 rounded-sm border border-[#d4af3722]">
                    <span className="text-[#d4af37aa] block font-sans text-[10px] uppercase tracking-wider">Vault Receipt Hash (Keccak256):</span>
                    <span className="text-sky-300 break-all">{tx.blockchainTx?.vaultReceiptHash}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] font-sans text-[#d4af37aa] pt-1">
                  <div>
                    Minted: <strong className="text-white font-bold font-serif">{tx.tokenAmount} GOLD10</strong> ({tx.goldGrams}g 24K pure gold)
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Confirmed by Cloud Function Authority
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
