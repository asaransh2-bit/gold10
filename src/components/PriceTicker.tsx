import React from 'react';
import { TrendingUp, TrendingDown, Scale, Shield, Sparkles, RefreshCw } from 'lucide-react';
import { GoldSpotData } from '../types';

interface PriceTickerProps {
  spotData: GoldSpotData;
  onRefresh?: () => void;
}

export const PriceTicker: React.FC<PriceTickerProps> = ({ spotData, onRefresh }) => {
  const isPositive = spotData.change24hPercent >= 0;

  return (
    <div id="gold-price-ticker" className="bg-[#0a0a0a] border border-[#d4af3722] p-6 sm:p-7 rounded-sm shadow-xl relative overflow-hidden">
      
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        
        {/* Left: 1 GOLD10 Primary Benchmark */}
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 border border-[#d4af37] rotate-45 flex items-center justify-center text-[#d4af37] bg-[#050505] shrink-0">
            <span className="-rotate-45 font-serif font-bold text-sm">24K</span>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] uppercase tracking-[0.25em] text-[#d4af37aa] font-medium">
                1 GOLD10 Backing Index
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-sm bg-[#050505] text-[#d4af37] border border-[#d4af3733]">
                <Scale className="w-3 h-3 text-[#d4af37]" />
                10.00g LBMA Fine 999.9
              </span>
            </div>
            <div className="flex items-baseline gap-4 mt-1">
              <span className="text-3xl sm:text-4xl font-serif font-light text-white tracking-tight">
                ${spotData.pricePerToken10g.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-sm font-mono ${
                isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}>
                {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {isPositive ? '+' : ''}{spotData.change24hPercent}% (${spotData.change24hUsd})
              </span>
            </div>
          </div>
        </div>

        {/* Center/Right: Metrics with Luxury Border Divider */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full lg:w-auto">
          
          <div className="border-l border-[#d4af3744] pl-4">
            <p className="text-[10px] uppercase tracking-widest text-[#d4af37aa] mb-1">Spot (Per Gram)</p>
            <p className="text-lg font-serif text-[#d4af37] font-semibold">
              ${spotData.pricePerGram.toFixed(2)} <span className="text-[10px] font-sans opacity-60 ml-0.5">USD</span>
            </p>
            <p className="text-[9px] uppercase tracking-wider text-zinc-500">999.9 Fine 24K</p>
          </div>

          <div className="border-l border-[#d4af3744] pl-4">
            <p className="text-[10px] uppercase tracking-widest text-[#d4af37aa] mb-1">Troy Ounce (XAU)</p>
            <p className="text-lg font-serif text-[#d4af37] font-semibold">
              ${spotData.pricePerOunce.toFixed(2)} <span className="text-[10px] font-sans opacity-60 ml-0.5">USD</span>
            </p>
            <p className="text-[9px] uppercase tracking-wider text-zinc-500">31.1035g / oz t</p>
          </div>

          <div className="col-span-2 sm:col-span-1 border-l border-[#d4af3744] pl-4 flex flex-col justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#d4af37aa] mb-1">Vault Standard</p>
              <p className="text-sm font-serif text-emerald-400 font-semibold flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                100% Allocated
              </p>
            </div>
            <p className="text-[9px] uppercase tracking-wider text-zinc-500">Zurich & Singapore</p>
          </div>

        </div>

      </div>

      {/* Real-Time Market Index Bar Graph from Design HTML */}
      <div className="mt-6 pt-5 border-t border-[#d4af3722]">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#d4af37aa]">
            Market Depth & Spot Variance (XAU/USD Real-time Feed)
          </span>
          <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            Firestore Real-time Stream
          </span>
        </div>
        <div className="h-10 w-full flex items-end gap-1.5">
          <div className="flex-1 bg-[#d4af3722] h-[55%] rounded-none transition-all hover:bg-[#d4af37]"></div>
          <div className="flex-1 bg-[#d4af3722] h-[65%] rounded-none transition-all hover:bg-[#d4af37]"></div>
          <div className="flex-1 bg-[#d4af3744] h-[80%] rounded-none transition-all hover:bg-[#d4af37]"></div>
          <div className="flex-1 bg-[#d4af3722] h-[70%] rounded-none transition-all hover:bg-[#d4af37]"></div>
          <div className="flex-1 bg-[#d4af37] h-[92%] rounded-none transition-all hover:bg-[#d4af37]"></div>
          <div className="flex-1 bg-[#d4af37] h-[85%] rounded-none transition-all hover:bg-[#d4af37]"></div>
          <div className="flex-1 bg-[#d4af3766] h-[72%] rounded-none transition-all hover:bg-[#d4af37]"></div>
          <div className="flex-1 bg-[#d4af3722] h-[60%] rounded-none transition-all hover:bg-[#d4af37]"></div>
          <div className="flex-1 bg-[#d4af3733] h-[68%] rounded-none transition-all hover:bg-[#d4af37]"></div>
          <div className="flex-1 bg-[#d4af37aa] h-[88%] rounded-none transition-all hover:bg-[#d4af37]"></div>
          <div className="flex-1 bg-[#d4af3744] h-[75%] rounded-none transition-all hover:bg-[#d4af37]"></div>
          <div className="flex-1 bg-[#d4af3766] h-[82%] rounded-none transition-all hover:bg-[#d4af37]"></div>
          <div className="flex-1 bg-[#d4af37] h-[95%] rounded-none transition-all hover:bg-[#d4af37]"></div>
          <div className="flex-1 bg-[#d4af37aa] h-[86%] rounded-none transition-all hover:bg-[#d4af37]"></div>
        </div>
      </div>

    </div>
  );
};
