import React, { useState } from 'react';
import {
  Shield,
  Users,
  Film,
  Flag,
  TrendingUp,
  CheckCircle2,
  Trash2,
  Ban,
  BadgeCheck,
  Star,
  AlertTriangle,
  Eye,
  Heart,
  MessageCircle,
  Search,
  DollarSign,
  Smartphone,
  Check,
  X,
  CreditCard,
  Megaphone,
} from 'lucide-react';
import {
  AdvertisementCampaign,
  Comment,
  FinancialTransaction,
  ReportItem,
  User,
  Video,
  WithdrawalRequest,
} from '../types';

interface AdminDashboardViewProps {
  currentUser: User | null;
  users: User[];
  videos: Video[];
  comments: Comment[];
  reports: ReportItem[];
  withdrawals: WithdrawalRequest[];
  transactions: FinancialTransaction[];
  adCampaigns: AdvertisementCampaign[];
  onSwitchToAdmin: () => void;
  onToggleSuspendUser: (userId: string) => void;
  onToggleVerifyUser: (userId: string) => void;
  onToggleFeatureVideo: (videoId: string) => void;
  onDeleteVideo: (videoId: string) => void;
  onDeleteComment: (commentId: string) => void;
  onResolveReport: (reportId: string, action: 'resolved' | 'dismissed') => void;
  onApproveWithdrawal: (withdrawalId: string) => void;
  onRejectWithdrawal: (withdrawalId: string, reason: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  currentUser,
  users,
  videos,
  comments,
  reports,
  withdrawals,
  transactions,
  adCampaigns,
  onSwitchToAdmin,
  onToggleSuspendUser,
  onToggleVerifyUser,
  onToggleFeatureVideo,
  onDeleteVideo,
  onDeleteComment,
  onResolveReport,
  onApproveWithdrawal,
  onRejectWithdrawal,
}) => {
  const [adminTab, setAdminTab] = useState<'overview' | 'users' | 'videos' | 'payouts' | 'reports' | 'ads'>('overview');
  const [userSearch, setUserSearch] = useState('');
  const [rejectReason, setRejectReason] = useState<string>('Account details mismatch');

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-[#080808] text-slate-900 dark:text-white">
        <div className="w-16 h-16 rounded-3xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] mb-4">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="font-display font-extrabold text-2xl">
          Restricted Administrator Dashboard
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mt-2 mb-6">
          Moderation and creator payout approvals are restricted to authorized administrators.
        </p>
        <button
          onClick={onSwitchToAdmin}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#FF2D75] text-white font-semibold text-xs shadow-lg cursor-pointer"
        >
          Switch to @star_admin
        </button>
      </div>
    );
  }

  const totalViews = videos.reduce((acc, v) => acc + v.views, 0);
  const pendingReports = reports.filter((r) => r.status === 'pending');
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending');
  const totalPlatformVolumeUsd = transactions.reduce((acc, t) => acc + Math.abs(t.amountUsd), 0);

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.displayName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-50 dark:bg-[#080808] text-slate-900 dark:text-white pb-24 sm:pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6]">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight">
                Admin Command Center
              </h1>
              <p className="text-xs text-slate-500">Moderation and platform overview.</p>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/70 dark:bg-[#151515] overflow-x-auto">
            {(['overview', 'payouts', 'users', 'videos', 'reports', 'ads'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setAdminTab(tab)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  adminTab === tab
                    ? 'bg-white dark:bg-[#8B5CF6] text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                <span>{tab === 'payouts' ? 'Creator Payouts' : tab === 'ads' ? 'Ad Campaigns' : tab}</span>
                {tab === 'payouts' && pendingWithdrawals.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-black text-[10px] font-bold font-mono">
                    {pendingWithdrawals.length}
                  </span>
                )}
                {tab === 'reports' && pendingReports.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#FF2D75] text-white text-[10px] font-bold font-mono">
                    {pendingReports.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10">
            <span className="text-xs text-slate-400">Total Users</span>
            <p className="font-extrabold text-2xl font-mono tabular-nums mt-1">{users.length}</p>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10">
            <span className="text-xs text-slate-400">Total Views</span>
            <p className="font-extrabold text-2xl font-mono tabular-nums mt-1">
              {totalViews.toLocaleString()}
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10">
            <span className="text-xs text-slate-400">Pending MoMo Payouts</span>
            <p className="font-extrabold text-2xl font-mono tabular-nums mt-1 text-amber-500">
              {pendingWithdrawals.length}
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10">
            <span className="text-xs text-slate-400">Open Moderation Reports</span>
            <p className="font-extrabold text-2xl font-mono tabular-nums mt-1 text-[#FF2D75]">
              {pendingReports.length}
            </p>
          </div>
        </div>

        {/* Payouts Approval Queue */}
        {(adminTab === 'overview' || adminTab === 'payouts') && (
          <div className="rounded-3xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 overflow-hidden space-y-4 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                <h2 className="font-display font-bold text-base">Creator Withdrawal Requests Queue</h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {pendingWithdrawals.length} pending approval
              </span>
            </div>

            {withdrawals.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No withdrawal requests found.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                {withdrawals.map((w) => {
                  const creator = users.find((u) => u.id === w.creatorId);
                  return (
                    <div key={w.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-sm text-emerald-500">
                            ${w.amountUsd.toFixed(2)}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            (≈ {(w.amountUsd * 3700).toLocaleString()} UGX)
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
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
                        <p className="text-xs font-semibold mt-1">
                          Creator: <span className="text-[#8B5CF6]">@{creator?.username || w.creatorId}</span> ({w.accountName})
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Method: <strong className="capitalize">{w.method.replace(/_/g, ' ')}</strong> · Destination: {w.accountDetails}
                        </p>
                      </div>

                      {w.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onApproveWithdrawal(w.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve & Disburse</span>
                          </button>
                          <button
                            onClick={() => onRejectWithdrawal(w.id, 'Information verification required')}
                            className="px-3 py-1.5 rounded-xl bg-red-500/15 text-red-500 hover:bg-red-500 hover:text-white font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">
                          {new Date(w.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Users Table */}
        {(adminTab === 'users') && (
          <div className="rounded-3xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <h2 className="font-display font-bold text-base">Users</h2>
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search..."
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-white/10 text-xs"
              />
            </div>
            <div className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
              {filteredUsers.map((u) => (
                <div key={u.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={u.avatar}
                      alt={u.displayName}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-bold flex items-center gap-1">
                        <span>{u.displayName}</span>
                        {u.verified && <BadgeCheck className="w-3 h-3 text-[#8B5CF6]" />}
                      </p>
                      <p className="text-slate-400">@{u.username} · {u.role} · {u.region || 'Global'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onToggleVerifyUser(u.id)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/10 text-[11px] font-semibold cursor-pointer"
                    >
                      {u.verified ? 'Unverify' : 'Verify'}
                    </button>
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => onToggleSuspendUser(u.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
                          u.suspended ? 'bg-emerald-500/15 text-emerald-500' : 'bg-red-500/15 text-red-500'
                        }`}
                      >
                        {u.suspended ? 'Activate' : 'Suspend'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Videos Table */}
        {adminTab === 'videos' && (
          <div className="rounded-3xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 overflow-hidden divide-y divide-slate-100 dark:divide-white/5">
            <div className="p-5 font-display font-bold text-base flex justify-between">
              <span>Published Videos ({videos.length})</span>
            </div>
            {videos.map((vid) => (
              <div key={vid.id} className="p-4 flex items-center justify-between text-xs">
                <div className="min-w-0 pr-4">
                  <p className="font-bold truncate">{vid.caption}</p>
                  <p className="text-slate-400 mt-0.5">
                    Category: {vid.category} · Views: {vid.views.toLocaleString()} · Likes: {vid.likes.length}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => onToggleFeatureVideo(vid.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
                      vid.featured ? 'bg-amber-400 text-black' : 'bg-slate-100 dark:bg-white/10'
                    }`}
                  >
                    {vid.featured ? 'Featured' : 'Feature'}
                  </button>
                  <button
                    onClick={() => onDeleteVideo(vid.id)}
                    className="p-1.5 rounded-lg bg-red-500/15 text-red-500 hover:bg-red-500 hover:text-white cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reports */}
        {(adminTab === 'overview' || adminTab === 'reports') && (
          <div className="rounded-3xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 overflow-hidden divide-y divide-slate-100 dark:divide-white/5">
            <div className="p-5 font-display font-bold text-base">Content Reports Queue</div>
            {reports.map((rep) => (
              <div key={rep.id} className="p-4 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#FF2D75] uppercase">{rep.targetType}: </span>
                  <span>{rep.reason}</span>
                  <p className="text-slate-400 mt-0.5">{rep.details}</p>
                </div>
                {rep.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (rep.targetType === 'video') onDeleteVideo(rep.targetId);
                        if (rep.targetType === 'comment') onDeleteComment(rep.targetId);
                        onResolveReport(rep.id, 'resolved');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-red-500 text-white font-semibold cursor-pointer"
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => onResolveReport(rep.id, 'dismissed')}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 font-semibold cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Ad Campaigns */}
        {(adminTab === 'ads') && (
          <div className="rounded-3xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#8B5CF6]" />
                <h2 className="font-display font-bold text-base">Sponsored Ad Campaigns</h2>
              </div>
              <span className="text-xs text-slate-400">Targeting Uganda & East Africa</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
              {adCampaigns.map((ad) => (
                <div key={ad.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{ad.sponsorName || ad.brandName}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-semibold text-[10px] uppercase">
                        {ad.status || (ad.active ? 'active' : 'paused')}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[#8B5CF6] mt-0.5">{ad.headline}</p>
                    {ad.body && <p className="text-[11px] text-slate-400">{ad.body}</p>}
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">
                      Category: {ad.category} · Target: {ad.targetRegion || 'All'}
                    </p>
                  </div>

                  <div className="text-right font-mono shrink-0">
                    <p className="text-xs font-bold text-emerald-500">
                      Budget: ${ad.budgetUsd.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {ad.impressions.toLocaleString()} views · {ad.clicks.toLocaleString()} clicks
                    </p>
                    <p className="text-[10px] text-slate-400">
                      CTR: {((ad.clicks / (ad.impressions || 1)) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
