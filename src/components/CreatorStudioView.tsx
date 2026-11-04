import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Gift,
  Users,
  Eye,
  Heart,
  CreditCard,
  Smartphone,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Film,
  Award,
  Globe,
  Sliders,
} from 'lucide-react';
import {
  CreatorEarningsLedger,
  FinancialTransaction,
  PayoutMethod,
  User,
  Video,
  WithdrawalRequest,
} from '../types';

interface CreatorStudioViewProps {
  currentUser: User | null;
  videos: Video[];
  transactions: FinancialTransaction[];
  withdrawals: WithdrawalRequest[];
  onRequestWithdrawal: (
    amountUsd: number,
    method: PayoutMethod,
    accountDetails: string,
    accountName: string
  ) => { success: boolean; message: string };
  onUpdateSubscriptionPrice: (newPrice: number) => void;
  onRequireAuth: (reason: string) => void;
}

const UGX_RATE = 3700; // 1 USD = 3,700 Ugandan Shillings (UGX)

export const CreatorStudioView: React.FC<CreatorStudioViewProps> = ({
  currentUser,
  videos,
  transactions,
  withdrawals,
  onRequestWithdrawal,
  onUpdateSubscriptionPrice,
  onRequireAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'earnings' | 'withdraw' | 'subscribers'>('overview');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(50);
  const [withdrawMethod, setWithdrawMethod] = useState<PayoutMethod>('mobile_money_mtn');
  const [accountNumber, setAccountNumber] = useState<string>(currentUser?.phoneNumber || '');
  const [accountName, setAccountName] = useState<string>(currentUser?.displayName || '');
  const [subPrice, setSubPrice] = useState<number>(currentUser?.subscriptionPrice || 4.99);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!currentUser) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-[#080808] text-slate-900 dark:text-white">
        <DollarSign className="w-12 h-12 text-[#8B5CF6] mb-3" />
        <h2 className="font-display font-extrabold text-2xl">Creator Studio & Earnings Centre</h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-2 mb-6">
          Log in with your creator account to track your video rewards, virtual gift revenue, subscriptions, and mobile money payouts.
        </p>
        <button
          onClick={() => onRequireAuth('Log in to access your Creator Studio.')}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#FF2D75] text-white text-xs font-semibold shadow-lg cursor-pointer"
        >
          Log In / Sign Up
        </button>
      </div>
    );
  }

  // Calculate Creator Performance
  const myVideos = videos.filter((v) => v.creatorId === currentUser.id);
  const totalViews = myVideos.reduce((sum, v) => sum + v.views, 0);
  const totalLikes = myVideos.reduce((sum, v) => sum + v.likes.length, 0);
  const totalShares = myVideos.reduce((sum, v) => sum + v.shares, 0);
  const engagementRate = totalViews > 0 ? (((totalLikes + totalShares) / totalViews) * 100).toFixed(2) : '4.85';

  // Calculate Creator Financial Ledger
  const myTransactions = transactions.filter((t) => t.userId === currentUser.id);
  const giftEarnings = myTransactions
    .filter((t) => t.type === 'gift_received')
    .reduce((sum, t) => sum + t.amountUsd, 0);
  const subscriptionEarnings = myTransactions
    .filter((t) => t.type === 'subscription_earned')
    .reduce((sum, t) => sum + t.amountUsd, 0);
  const videoRewardsEarnings = myTransactions
    .filter((t) => t.type === 'video_rewards')
    .reduce((sum, t) => sum + t.amountUsd, 0);
  const withdrawnTotal = myTransactions
    .filter((t) => t.type === 'withdrawal')
    .reduce((sum, t) => sum + Math.abs(t.amountUsd), 0);

  const lifetimeTotal = giftEarnings + subscriptionEarnings + videoRewardsEarnings;
  const availableBalance = Math.max(0, lifetimeTotal - withdrawnTotal);
  const pendingBalance = 42.5; // In-flight video reward milestone

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount < 25) {
      setNotification({
        type: 'error',
        message: 'Minimum withdrawal amount is $25.00 (approx. 92,500 UGX).',
      });
      return;
    }
    if (withdrawAmount > availableBalance) {
      setNotification({
        type: 'error',
        message: `Insufficient available balance ($${availableBalance.toFixed(2)}).`,
      });
      return;
    }
    if (!accountNumber.trim() || !accountName.trim()) {
      setNotification({
        type: 'error',
        message: 'Please provide valid account details and account holder name.',
      });
      return;
    }

    const res = onRequestWithdrawal(withdrawAmount, withdrawMethod, accountNumber, accountName);
    if (res.success) {
      setNotification({ type: 'success', message: res.message });
    } else {
      setNotification({ type: 'error', message: res.message });
    }
  };

  const handleSaveSubPrice = () => {
    onUpdateSubscriptionPrice(subPrice);
    setNotification({
      type: 'success',
      message: `VIP Subscriber tier price updated to $${subPrice.toFixed(2)}/month!`,
    });
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-50 dark:bg-[#080808] text-slate-900 dark:text-white pb-24 sm:pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight">
                Creator Studio & Earnings Centre
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Monetized Creator
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
              Track video rewards, virtual gifts, VIP subscriptions, and Mobile Money cashouts.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/80 dark:bg-[#151515] self-start">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-white dark:bg-[#8B5CF6] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400'
              }`}
            >
              Performance
            </button>
            <button
              onClick={() => setActiveTab('earnings')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'earnings'
                  ? 'bg-white dark:bg-[#8B5CF6] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400'
              }`}
            >
              Earnings Ledger
            </button>
            <button
              onClick={() => setActiveTab('withdraw')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'withdraw'
                  ? 'bg-white dark:bg-[#8B5CF6] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400'
              }`}
            >
              Payouts & MoMo
            </button>
            <button
              onClick={() => setActiveTab('subscribers')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'subscribers'
                  ? 'bg-white dark:bg-[#8B5CF6] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400'
              }`}
            >
              VIP Subs
            </button>
          </div>
        </div>

        {notification && (
          <div
            className={`p-3.5 rounded-2xl flex items-center justify-between text-xs font-semibold ${
              notification.type === 'success'
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 dark:text-emerald-400'
                : 'bg-red-500/15 border border-red-500/30 text-red-500'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-xs underline ml-4 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 4 Financial Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 shadow-sm">
            <span className="text-xs text-slate-500 dark:text-zinc-400 flex items-center justify-between">
              <span>Available Balance</span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </span>
            <p className="font-display font-extrabold text-2xl sm:text-3xl font-mono tabular-nums text-emerald-500 mt-2">
              ${availableBalance.toFixed(2)}
            </p>
            <p className="text-[11px] text-slate-400 font-mono mt-1">
              ≈ {(availableBalance * UGX_RATE).toLocaleString()} UGX
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 shadow-sm">
            <span className="text-xs text-slate-500 dark:text-zinc-400 flex items-center justify-between">
              <span>Lifetime Earnings</span>
              <TrendingUp className="w-4 h-4 text-[#8B5CF6]" />
            </span>
            <p className="font-display font-extrabold text-2xl sm:text-3xl font-mono tabular-nums mt-2">
              ${lifetimeTotal.toFixed(2)}
            </p>
            <p className="text-[11px] text-slate-400 font-mono mt-1">
              Rewards + Gifts + Subs
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 shadow-sm">
            <span className="text-xs text-slate-500 dark:text-zinc-400 flex items-center justify-between">
              <span>Virtual Gifts Revenue</span>
              <Gift className="w-4 h-4 text-[#FF2D75]" />
            </span>
            <p className="font-display font-extrabold text-2xl sm:text-3xl font-mono tabular-nums text-[#FF2D75] mt-2">
              ${giftEarnings.toFixed(2)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {(giftEarnings * 100).toFixed(0)} coins converted
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 shadow-sm">
            <span className="text-xs text-slate-500 dark:text-zinc-400 flex items-center justify-between">
              <span>Pending Clearance</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </span>
            <p className="font-display font-extrabold text-2xl sm:text-3xl font-mono tabular-nums text-amber-500 mt-2">
              ${pendingBalance.toFixed(2)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Settles every Sunday
            </p>
          </div>
        </div>

        {/* Tab 1: Video Analytics & Audience Insights */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#8B5CF6]" /> Total Video Views
                </span>
                <p className="font-display font-bold text-xl font-mono mt-1">
                  {totalViews.toLocaleString()}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-[#FF2D75]" /> Total Likes Received
                </span>
                <p className="font-display font-bold text-xl font-mono mt-1">
                  {totalLikes.toLocaleString()}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-500" /> Followers Growth
                </span>
                <p className="font-display font-bold text-xl font-mono mt-1">
                  {currentUser.followers.length}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-sky-400" /> Engagement Rate
                </span>
                <p className="font-display font-bold text-xl font-mono mt-1">
                  {engagementRate}%
                </p>
              </div>
            </div>

            {/* Audience Geography Insights */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-base flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#8B5CF6]" />
                  <span>Audience Demographics & Regional Reach</span>
                </h3>
                <span className="text-xs text-[#8B5CF6] font-semibold">East Africa & Global</span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Uganda (Kampala, Entebbe, Jinja)</span>
                    <span className="font-mono">52% of views</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#FF2D75] w-[52%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Kenya & Tanzania (Nairobi, Dar es Salaam)</span>
                    <span className="font-mono">26% of views</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[26%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Global & Diaspora (UK, USA, Europe)</span>
                    <span className="font-mono">22% of views</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                    <div className="h-full bg-sky-500 w-[22%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Published Videos Performance List */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10">
              <h3 className="font-display font-bold text-base mb-4 flex items-center gap-2">
                <Film className="w-4 h-4 text-[#FF2D75]" />
                <span>My Videos Performance & Monetization Status</span>
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {myVideos.map((v) => (
                  <div key={v.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold truncate">{v.caption}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {v.category} · {v.visibility} · Trim: {v.duration}s
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono tabular-nums shrink-0">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Eye className="w-3.5 h-3.5 text-[#8B5CF6]" />
                        {v.views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 text-emerald-500 font-bold">
                        <DollarSign className="w-3.5 h-3.5" />
                        ${((v.views / 1000) * 0.45 + (v.giftEarningsCoins || 0) * 0.01).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Financial Ledger */}
        {activeTab === 'earnings' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <h3 className="font-display font-bold text-base">Verified Financial Ledger</h3>
              <span className="text-xs text-slate-400 font-mono">
                {myTransactions.length} transactions recorded
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {myTransactions.map((tx) => (
                <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold capitalize">
                        {tx.type.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-semibold uppercase">
                        {tx.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                      {tx.description}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {new Date(tx.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={`font-display font-bold text-sm font-mono tabular-nums ${
                        tx.amountUsd >= 0 ? 'text-emerald-500' : 'text-red-500'
                      }`}
                    >
                      {tx.amountUsd >= 0 ? `+$${tx.amountUsd.toFixed(2)}` : `-$${Math.abs(tx.amountUsd).toFixed(2)}`}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      ≈ {(Math.abs(tx.amountUsd) * UGX_RATE).toLocaleString()} UGX
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Withdrawal Requests & Mobile Money Payouts */}
        {activeTab === 'withdraw' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Cashout Form */}
            <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 space-y-4">
              <div className="pb-3 border-b border-slate-200 dark:border-white/10">
                <h3 className="font-display font-bold text-base">Request Creator Payout</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct cashout to MTN Mobile Money (Uganda), Airtel Money, Bank, or PayPal.
                </p>
              </div>

              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Select Payout Method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setWithdrawMethod('mobile_money_mtn')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        withdrawMethod === 'mobile_money_mtn'
                          ? 'border-[#FFCC00] bg-[#FFCC00]/10 text-slate-900 dark:text-white'
                          : 'border-slate-200 dark:border-white/10'
                      }`}
                    >
                      <Smartphone className="w-4 h-4 text-[#FFCC00] mb-1" />
                      <p className="text-xs font-bold">MTN Mobile Money</p>
                      <p className="text-[10px] text-slate-400">Uganda (Instant)</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setWithdrawMethod('mobile_money_airtel')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        withdrawMethod === 'mobile_money_airtel'
                          ? 'border-[#ED1C24] bg-[#ED1C24]/10 text-slate-900 dark:text-white'
                          : 'border-slate-200 dark:border-white/10'
                      }`}
                    >
                      <Smartphone className="w-4 h-4 text-[#ED1C24] mb-1" />
                      <p className="text-xs font-bold">Airtel Money</p>
                      <p className="text-[10px] text-slate-400">Uganda & EA</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setWithdrawMethod('bank_transfer')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        withdrawMethod === 'bank_transfer'
                          ? 'border-[#8B5CF6] bg-[#8B5CF6]/10 text-slate-900 dark:text-white'
                          : 'border-slate-200 dark:border-white/10'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-[#8B5CF6] mb-1" />
                      <p className="text-xs font-bold">Bank Transfer</p>
                      <p className="text-[10px] text-slate-400">Direct Deposit</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setWithdrawMethod('paypal')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        withdrawMethod === 'paypal'
                          ? 'border-[#38BDF8] bg-[#38BDF8]/10 text-slate-900 dark:text-white'
                          : 'border-slate-200 dark:border-white/10'
                      }`}
                    >
                      <ArrowUpRight className="w-4 h-4 text-[#38BDF8] mb-1" />
                      <p className="text-xs font-bold">PayPal</p>
                      <p className="text-[10px] text-slate-400">International</p>
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold">Withdrawal Amount (USD)</label>
                    <span className="text-xs font-mono text-emerald-500 font-bold">
                      Available: ${availableBalance.toFixed(2)}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      min={25}
                      max={availableBalance}
                      step={5}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(parseFloat(e.target.value) || 25)}
                      className="w-full pl-8 pr-28 py-2.5 rounded-xl bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-white/10 text-sm font-bold font-mono focus:outline-none focus:border-[#8B5CF6]"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-slate-400">
                      ≈ {(withdrawAmount * UGX_RATE).toLocaleString()} UGX
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    * Minimum payout threshold: $25.00 (approx. 92,500 UGX). Zero platform fee on MoMo.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1">
                      {withdrawMethod.includes('mobile_money')
                        ? 'Registered MoMo Phone Number'
                        : 'Account / IBAN / PayPal Email'}
                    </label>
                    <input
                      type="text"
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder={withdrawMethod.includes('mobile_money') ? '+256 772 123456' : 'account@email.com'}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-white/10 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">Account Holder Full Name</label>
                    <input
                      type="text"
                      required
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="e.g. Kisa Namutebi"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-white/10 text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#FF2D75] text-white font-semibold text-xs shadow-lg cursor-pointer hover:opacity-95 transition-opacity"
                >
                  Submit Payout Request (${withdrawAmount.toFixed(2)})
                </button>
              </form>
            </div>

            {/* Past Cashout History */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 space-y-4">
              <h3 className="font-display font-bold text-base">Withdrawal History</h3>
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {withdrawals
                  .filter((w) => w.creatorId === currentUser.id)
                  .map((w) => (
                    <div key={w.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold">${w.amountUsd.toFixed(2)}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                              w.status === 'approved'
                                ? 'bg-emerald-500/15 text-emerald-500'
                                : w.status === 'pending'
                                ? 'bg-amber-500/15 text-amber-500'
                                : 'bg-red-500/15 text-red-500'
                            }`}
                          >
                            {w.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 capitalize">
                          {w.method.replace(/_/g, ' ')} · {w.accountDetails}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(w.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Subscriptions & VIP Tier Management */}
        {activeTab === 'subscribers' && (
          <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="font-display font-bold text-base">VIP Creator Subscriptions</h3>
              </div>
              <span className="text-xs font-semibold text-emerald-500">Active</span>
            </div>

            <p className="text-xs text-slate-500">
              Fans can subscribe monthly to your profile to unlock exclusive behind-the-scenes videos, VIP badges in live streams, and direct DM priority.
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10 space-y-3">
              <label className="block text-xs font-bold">Monthly Subscription Price</label>
              <div className="flex items-center gap-3">
                {[2.99, 4.99, 9.99, 14.99].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSubPrice(p)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer ${
                      subPrice === p
                        ? 'bg-[#8B5CF6] text-white shadow-md'
                        : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10'
                    }`}
                  >
                    ${p}/mo
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleSaveSubPrice}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#FF2D75] text-white font-semibold text-xs cursor-pointer"
              >
                Save Subscription Tier
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
