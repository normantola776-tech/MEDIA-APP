import React, { useState } from 'react';
import { X, Sparkles, Coins, Plus, Heart, Rocket, Award, Star } from 'lucide-react';
import { User, Video, VirtualGift } from '../types';
import { VIRTUAL_GIFTS } from '../data/seedData';

interface GiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCreator: User | null;
  targetVideo?: Video | null;
  currentUser: User | null;
  onSendGift: (gift: VirtualGift, creator: User, video?: Video) => { success: boolean; message: string };
  onTopUpCoins: (amountCoins: number, costUsd: number) => void;
  onRequireAuth: (reason: string) => void;
}

const COIN_PACKS = [
  { coins: 100, priceUsd: 0.99, bonus: '' },
  { coins: 500, priceUsd: 4.99, bonus: '+50 Bonus' },
  { coins: 1200, priceUsd: 9.99, bonus: '+200 Bonus' },
  { coins: 3000, priceUsd: 24.99, bonus: '+600 Bonus' },
];

export const GiftModal: React.FC<GiftModalProps> = ({
  isOpen,
  onClose,
  targetCreator,
  targetVideo,
  currentUser,
  onSendGift,
  onTopUpCoins,
  onRequireAuth,
}) => {
  const [selectedGift, setSelectedGift] = useState<VirtualGift>(VIRTUAL_GIFTS[0]);
  const [showTopUp, setShowTopUp] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen || !targetCreator) return null;

  const userCoins = currentUser?.coinBalance || 0;

  const handleSend = () => {
    if (!currentUser) {
      onRequireAuth('Please log in to send virtual gifts.');
      return;
    }
    if (userCoins < selectedGift.coinCost) {
      setShowTopUp(true);
      setStatusMsg({
        type: 'error',
        text: `You need ${selectedGift.coinCost - userCoins} more coins to send ${selectedGift.name}. Top up below!`,
      });
      return;
    }

    const res = onSendGift(selectedGift, targetCreator, targetVideo || undefined);
    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message });
      setTimeout(() => {
        onClose();
        setStatusMsg(null);
      }, 1500);
    } else {
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  const handleBuyCoins = (coins: number, price: number) => {
    if (!currentUser) {
      onRequireAuth('Please log in to purchase coins.');
      return;
    }
    onTopUpCoins(coins, price);
    setShowTopUp(false);
    setStatusMsg({
      type: 'success',
      text: `Successfully added ${coins} coins to your wallet!`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#151515] border-t sm:border border-slate-200 dark:border-white/10 shadow-2xl p-5 text-slate-900 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎁</span>
            <div>
              <h3 className="font-display font-bold text-sm">Send Gift to @{targetCreator.username}</h3>
              <p className="text-[11px] text-slate-400">Support your favorite creators & rank up</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {statusMsg && (
          <div
            className={`my-3 p-2.5 rounded-xl text-xs font-semibold text-center ${
              statusMsg.type === 'success'
                ? 'bg-emerald-500/15 text-emerald-500'
                : 'bg-red-500/15 text-red-500'
            }`}
          >
            {statusMsg.text}
          </div>
        )}

        {/* User Coin Balance & Top Up */}
        <div className="flex items-center justify-between my-3 p-3 rounded-2xl bg-slate-50 dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-400">Your Coin Balance:</span>
            <span className="font-display font-bold text-sm font-mono text-amber-400">
              {userCoins.toLocaleString()}
            </span>
          </div>

          <button
            onClick={() => setShowTopUp((v) => !v)}
            className="px-2.5 py-1 rounded-lg bg-amber-400/20 text-amber-500 hover:bg-amber-400/30 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Top Up</span>
          </button>
        </div>

        {/* Top Up Coin Store Drawer */}
        {showTopUp && (
          <div className="mb-4 p-3 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 space-y-2">
            <p className="text-xs font-bold text-[#8B5CF6]">Select a Coin Package:</p>
            <div className="grid grid-cols-2 gap-2">
              {COIN_PACKS.map((p) => (
                <button
                  key={p.coins}
                  onClick={() => handleBuyCoins(p.coins, p.priceUsd)}
                  className="p-2.5 rounded-xl bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/10 text-left hover:border-[#8B5CF6] transition-colors cursor-pointer"
                >
                  <p className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" />
                    <span>{p.coins} Coins</span>
                  </p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs font-mono font-semibold">${p.priceUsd}</span>
                    {p.bonus && (
                      <span className="text-[10px] text-emerald-500 font-semibold">{p.bonus}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Gift Grid */}
        <div className="grid grid-cols-5 gap-2 my-4">
          {VIRTUAL_GIFTS.map((g) => {
            const isSelected = selectedGift.id === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setSelectedGift(g)}
                className={`p-2.5 rounded-2xl flex flex-col items-center text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#8B5CF6]/15 border-2 border-[#8B5CF6] scale-105 shadow-md'
                    : 'bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-[#8B5CF6]/50'
                }`}
              >
                <span className="text-2xl mb-1">{g.icon}</span>
                <span className="text-[10px] font-bold truncate w-full">{g.name}</span>
                <span className="text-[10px] font-mono font-semibold text-amber-400 mt-0.5">
                  {g.coinCost} 🪙
                </span>
              </button>
            );
          })}
        </div>

        {/* Send Action */}
        <button
          onClick={handleSend}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#FF2D75] text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 transition-opacity"
        >
          <span>Send {selectedGift.name} ({selectedGift.coinCost} Coins)</span>
          <Sparkles className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
