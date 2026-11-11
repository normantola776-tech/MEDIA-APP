import React, { useState, useEffect } from 'react';
import {
  Home,
  Compass,
  Plus,
  MessageSquare,
  User as UserIcon,
  Radio,
  Shield,
  Sun,
  Moon,
  LogIn,
  BadgeCheck,
  DollarSign,
  Gift,
  Coins,
  Smartphone,
  Download,
} from 'lucide-react';
import {
  AdvertisementCampaign,
  Comment,
  DirectMessage,
  DraftVideo,
  FinancialTransaction,
  LiveStream,
  NavTab,
  NotificationItem,
  PayoutMethod,
  ReportItem,
  User,
  Video,
  VideoSceneType,
  VirtualGift,
  WithdrawalRequest,
} from './types';
import {
  INITIAL_AD_CAMPAIGNS,
  INITIAL_COMMENTS,
  INITIAL_LIVE_STREAMS,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_REPORTS,
  INITIAL_SOUNDS,
  INITIAL_TRANSACTIONS,
  INITIAL_USERS,
  INITIAL_VIDEOS,
  INITIAL_WITHDRAWALS,
} from './data/seedData';
import { StarLogo } from './components/StarLogo';
import { VideoFeed } from './components/VideoFeed';
import { DiscoverView } from './components/DiscoverView';
import { CreateVideoView } from './components/CreateVideoView';
import { InboxView } from './components/InboxView';
import { ProfileView } from './components/ProfileView';
import { LiveStreamView } from './components/LiveStreamView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { CreatorStudioView } from './components/CreatorStudioView';
import { CommentsDrawer } from './components/CommentsDrawer';
import { AuthModal } from './components/AuthModal';
import { GiftModal } from './components/GiftModal';
import { InstallAppModal } from './components/InstallAppModal';
import {
  auth,
  seedFirestoreIfEmpty,
  subscribeToVideos,
  subscribeToUsers,
  subscribeToComments,
  subscribeToLiveStreams,
  syncPublishVideo,
  syncUpdateVideo,
  syncDeleteVideo,
  syncAddComment,
  syncUpdateComment,
  syncDeleteComment,
  syncUpdateUser,
  syncSaveDraft,
  syncDeleteDraft,
  signInWithGoogle,
  logoutFirebase,
} from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const STORAGE_KEY = 'starmedia_app_db_v1';

export function App() {
  // Load persisted state or fallback to seed data
  const loadState = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // Ignore storage parse error
    }
    return null;
  };

  const saved = loadState();

  const [users, setUsers] = useState<User[]>(saved?.users || INITIAL_USERS);
  const [videos, setVideos] = useState<Video[]>(saved?.videos || INITIAL_VIDEOS);
  const [comments, setComments] = useState<Comment[]>(saved?.comments || INITIAL_COMMENTS);
  const [messages, setMessages] = useState<DirectMessage[]>(saved?.messages || INITIAL_MESSAGES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    saved?.notifications || INITIAL_NOTIFICATIONS
  );
  const [reports, setReports] = useState<ReportItem[]>(saved?.reports || INITIAL_REPORTS);
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>(
    saved?.liveStreams || INITIAL_LIVE_STREAMS
  );
  const [drafts, setDrafts] = useState<DraftVideo[]>(saved?.drafts || []);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(
    saved?.transactions || INITIAL_TRANSACTIONS
  );
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(
    saved?.withdrawals || INITIAL_WITHDRAWALS
  );
  const [adCampaigns, setAdCampaigns] = useState<AdvertisementCampaign[]>(
    saved?.adCampaigns || INITIAL_AD_CAMPAIGNS
  );
  const [currentUserId, setCurrentUserId] = useState<string | null>(
    saved?.currentUserId !== undefined ? saved.currentUserId : INITIAL_USERS[0].id
  );
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    saved?.isDarkMode !== undefined ? saved.isDarkMode : true
  );

  // Navigation & UI Modal States
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [viewedProfileId, setViewedProfileId] = useState<string>(INITIAL_USERS[0].id);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [activeCommentVideoId, setActiveCommentVideoId] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authReason, setAuthReason] = useState<string | undefined>(undefined);
  const [installModalOpen, setInstallModalOpen] = useState<boolean>(false);

  // Virtual Gifting Modal state
  const [giftModalState, setGiftModalState] = useState<{
    isOpen: boolean;
    targetCreator: User | null;
    targetVideo?: Video | null;
  }>({
    isOpen: false,
    targetCreator: null,
    targetVideo: null,
  });

  // Contextual cross-page filters
  const [discoverHashtagFilter, setDiscoverHashtagFilter] = useState<string | null>(null);
  const [discoverSoundFilter, setDiscoverSoundFilter] = useState<string | null>(null);
  const [studioSoundId, setStudioSoundId] = useState<string | null>(null);
  const [inboxPartnerId, setInboxPartnerId] = useState<string | null>(null);

  const currentUser = users.find((u) => u.id === currentUserId) || null;

  // Sync dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Persist database state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          users,
          videos,
          comments,
          messages,
          notifications,
          reports,
          liveStreams,
          drafts,
          transactions,
          withdrawals,
          adCampaigns,
          currentUserId,
          isDarkMode,
        })
      );
    } catch {
      // Ignore quota errors
    }
  }, [
    users,
    videos,
    comments,
    messages,
    notifications,
    reports,
    liveStreams,
    drafts,
    transactions,
    withdrawals,
    adCampaigns,
    currentUserId,
    isDarkMode,
  ]);

  // 1. Initial Firestore seed if empty
  useEffect(() => {
    seedFirestoreIfEmpty(INITIAL_USERS, INITIAL_VIDEOS, INITIAL_COMMENTS, INITIAL_LIVE_STREAMS);
  }, []);

  // 2. Real-time subscriptions to live Firestore collections
  useEffect(() => {
    const unsubVideos = subscribeToVideos((remoteVideos) => {
      if (remoteVideos && remoteVideos.length > 0) {
        setVideos(remoteVideos);
      }
    });
    const unsubUsers = subscribeToUsers((remoteUsers) => {
      if (remoteUsers && remoteUsers.length > 0) {
        setUsers(remoteUsers);
      }
    });
    const unsubComments = subscribeToComments((remoteComments) => {
      setComments(remoteComments);
    });
    const unsubLive = subscribeToLiveStreams((remoteLive) => {
      if (remoteLive && remoteLive.length > 0) {
        setLiveStreams(remoteLive);
      }
    });

    return () => {
      unsubVideos();
      unsubUsers();
      unsubComments();
      unsubLive();
    };
  }, []);

  // 3. Listen to Firebase Auth state
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setCurrentUserId(fbUser.uid);
      }
    });
    return () => unsubAuth();
  }, []);

  const handleGoogleSignIn = async () => {
    const googleUser = await signInWithGoogle();
    setUsers((prev) => {
      if (prev.some((u) => u.id === googleUser.id)) {
        return prev.map((u) => (u.id === googleUser.id ? googleUser : u));
      }
      return [googleUser, ...prev];
    });
    setCurrentUserId(googleUser.id);
    setViewedProfileId(googleUser.id);
  };

  const handleLogout = () => {
    logoutFirebase();
    setCurrentUserId(null);
  };

  const requireAuth = (reason: string) => {
    setAuthReason(reason);
    setAuthModalOpen(true);
  };

  const pushNotification = (
    recipientId: string,
    actorId: string,
    type: NotificationItem['type'],
    text: string,
    videoId?: string
  ) => {
    if (recipientId === actorId) return;
    const newNotif: NotificationItem = {
      id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId: recipientId,
      actorId,
      type,
      videoId,
      text,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Creator Monetization, Virtual Gifting & MoMo Payouts
  const handleOpenGiftModal = (creator: User, video?: Video) => {
    setGiftModalState({
      isOpen: true,
      targetCreator: creator,
      targetVideo: video || null,
    });
  };

  const handleSendGift = (
    gift: VirtualGift,
    creator: User,
    video?: Video
  ): { success: boolean; message: string } => {
    if (!currentUser) {
      requireAuth('Please log in to send virtual gifts.');
      return { success: false, message: 'Authentication required' };
    }
    if ((currentUser.coinBalance || 0) < gift.coinCost) {
      return { success: false, message: 'Insufficient coins in your wallet.' };
    }

    // Deduct coins from sender
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) {
          return { ...u, coinBalance: (u.coinBalance || 0) - gift.coinCost };
        }
        return u;
      })
    );

    const giftEarningsUsd = gift.coinCost * 0.01;

    // Record transactions for sender and creator
    const senderTx: FinancialTransaction = {
      id: `tx-${Date.now()}-send`,
      userId: currentUser.id,
      type: 'gift_sent',
      amountUsd: -giftEarningsUsd,
      coins: gift.coinCost,
      description: `Sent ${gift.name} ${gift.icon} to @${creator.username}`,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    const creatorTx: FinancialTransaction = {
      id: `tx-${Date.now()}-recv`,
      userId: creator.id,
      type: 'gift_received',
      amountUsd: giftEarningsUsd,
      coins: gift.coinCost,
      description: `Received ${gift.name} ${gift.icon} from @${currentUser.username}`,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [senderTx, creatorTx, ...prev]);

    // Update video gift earnings if attached
    if (video) {
      setVideos((prev) =>
        prev.map((v) =>
          v.id === video.id
            ? {
                ...v,
                giftEarningsCoins: (v.giftEarningsCoins || 0) + gift.coinCost,
                giftsReceived: [
                  ...(v.giftsReceived || []),
                  {
                    giftId: gift.id,
                    senderId: currentUser.id,
                    senderName: currentUser.username,
                    coinCost: gift.coinCost,
                    sentAt: new Date().toISOString(),
                  },
                ],
              }
            : v
        )
      );
    }

    pushNotification(
      creator.id,
      currentUser.id,
      'gift',
      `sent you a ${gift.name} ${gift.icon} (${gift.coinCost} Coins)!`,
      video?.id
    );

    return {
      success: true,
      message: `Sent ${gift.name} to @${creator.username}! 🎉`,
    };
  };

  const handleTopUpCoins = (amountCoins: number, costUsd: number) => {
    if (!currentUser) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? { ...u, coinBalance: (u.coinBalance || 0) + amountCoins }
          : u
      )
    );

    const purchaseTx: FinancialTransaction = {
      id: `tx-${Date.now()}-topup`,
      userId: currentUser.id,
      type: 'coin_purchase',
      amountUsd: -costUsd,
      coins: amountCoins,
      description: `Purchased coin pack: +${amountCoins} Coins ($${costUsd})`,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [purchaseTx, ...prev]);
  };

  const handleRequestWithdrawal = (
    amountUsd: number,
    method: PayoutMethod,
    accountDetails: string,
    accountName: string
  ): { success: boolean; message: string } => {
    if (!currentUser) {
      return { success: false, message: 'Authentication required' };
    }

    const newWd: WithdrawalRequest = {
      id: `wd-${Date.now()}`,
      creatorId: currentUser.id,
      creatorUsername: currentUser.username,
      amountUsd,
      amountUgx: method.includes('mobile_money') ? amountUsd * 3700 : undefined,
      method,
      accountDetails,
      accountName,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setWithdrawals((prev) => [newWd, ...prev]);

    const wdTx: FinancialTransaction = {
      id: `tx-${Date.now()}-wd`,
      userId: currentUser.id,
      type: 'withdrawal',
      amountUsd: -amountUsd,
      description: `Payout request to ${method.replace(/_/g, ' ').toUpperCase()} (${accountDetails})`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [wdTx, ...prev]);

    return {
      success: true,
      message: `Withdrawal request for $${amountUsd.toFixed(2)} submitted successfully! Admin will disburse via ${method.replace(/_/g, ' ')}.`,
    };
  };

  const handleApproveWithdrawal = (withdrawalId: string) => {
    setWithdrawals((prev) =>
      prev.map((w) =>
        w.id === withdrawalId
          ? { ...w, status: 'approved', processedAt: new Date().toISOString() }
          : w
      )
    );
    const targetWd = withdrawals.find((w) => w.id === withdrawalId);
    if (targetWd) {
      pushNotification(
        targetWd.creatorId,
        currentUser?.id || 'admin',
        'earnings',
        `Your payout of $${targetWd.amountUsd.toFixed(2)} (${targetWd.method.replace(/_/g, ' ')}) has been approved and sent!`
      );
    }
  };

  const handleRejectWithdrawal = (withdrawalId: string, reason: string) => {
    setWithdrawals((prev) =>
      prev.map((w) =>
        w.id === withdrawalId ? { ...w, status: 'rejected' } : w
      )
    );
    const targetWd = withdrawals.find((w) => w.id === withdrawalId);
    if (targetWd) {
      pushNotification(
        targetWd.creatorId,
        currentUser?.id || 'admin',
        'earnings',
        `Your withdrawal request for $${targetWd.amountUsd.toFixed(2)} was rejected: ${reason}. Funds remain available.`
      );
    }
  };

  const handleToggleSubscribe = (creatorId: string) => {
    if (!currentUser) {
      requireAuth('Log in to subscribe to creators.');
      return;
    }
    const isSubscribed = currentUser.subscribedCreatorIds?.includes(creatorId);
    const creator = users.find((u) => u.id === creatorId);
    const price = creator?.subscriptionPrice || 4.99;

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) {
          const subs = u.subscribedCreatorIds || [];
          return {
            ...u,
            subscribedCreatorIds: isSubscribed
              ? subs.filter((id) => id !== creatorId)
              : [...subs, creatorId],
          };
        }
        return u;
      })
    );

    if (!isSubscribed && creator) {
      const userTx: FinancialTransaction = {
        id: `tx-${Date.now()}-sub-pay`,
        userId: currentUser.id,
        type: 'subscription_payment',
        amountUsd: -price,
        description: `Monthly VIP Subscription to @${creator.username}`,
        status: 'completed',
        createdAt: new Date().toISOString(),
      };
      const creatorTx: FinancialTransaction = {
        id: `tx-${Date.now()}-sub-earn`,
        userId: creatorId,
        type: 'subscription_earned',
        amountUsd: price * 0.8, // 80% creator cut
        description: `New VIP Subscriber @${currentUser.username}`,
        status: 'completed',
        createdAt: new Date().toISOString(),
      };
      setTransactions((prev) => [userTx, creatorTx, ...prev]);
      pushNotification(
        creatorId,
        currentUser.id,
        'subscription',
        `became your VIP Subscriber ($${price}/mo)!`
      );
    }
  };

  const handleUpdateSubscriptionPrice = (newPrice: number) => {
    if (!currentUser) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, subscriptionPrice: newPrice } : u))
    );
  };

  // Social Interactions
  const handleToggleLike = (videoId: string) => {
    if (!currentUser) {
      requireAuth('Log in to like videos.');
      return;
    }
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id !== videoId) return v;
        const alreadyLiked = v.likes.includes(currentUser.id);
        const updatedLikes = alreadyLiked
          ? v.likes.filter((id) => id !== currentUser.id)
          : [...v.likes, currentUser.id];

        syncUpdateVideo(videoId, { likes: updatedLikes }).catch(console.error);

        if (!alreadyLiked) {
          pushNotification(
            v.creatorId,
            currentUser.id,
            'like',
            `liked your video "${v.caption.slice(0, 32)}..."`,
            v.id
          );
        }
        return { ...v, likes: updatedLikes };
      })
    );
  };

  const handleToggleSave = (videoId: string) => {
    if (!currentUser) {
      requireAuth('Log in to bookmark videos.');
      return;
    }
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id !== videoId) return v;
        const alreadySaved = v.saves.includes(currentUser.id);
        const updatedSaves = alreadySaved
          ? v.saves.filter((id) => id !== currentUser.id)
          : [...v.saves, currentUser.id];

        syncUpdateVideo(videoId, { saves: updatedSaves }).catch(console.error);

        return {
          ...v,
          saves: updatedSaves,
        };
      })
    );
  };

  const handleToggleFollow = (targetUserId: string) => {
    if (!currentUser) {
      requireAuth('Log in to follow creators.');
      return;
    }
    if (currentUser.id === targetUserId) return;

    const isFollowing = currentUser.following.includes(targetUserId);
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) {
          return {
            ...u,
            following: isFollowing
              ? u.following.filter((id) => id !== targetUserId)
              : [...u.following, targetUserId],
          };
        }
        if (u.id === targetUserId) {
          return {
            ...u,
            followers: isFollowing
              ? u.followers.filter((id) => id !== currentUser.id)
              : [...u.followers, currentUser.id],
          };
        }
        return u;
      })
    );

    if (!isFollowing) {
      pushNotification(targetUserId, currentUser.id, 'follow', 'started following you');
    }
  };

  const handleAddComment = (videoId: string, text: string) => {
    if (!currentUser) {
      requireAuth('Log in to comment on videos.');
      return;
    }
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      videoId,
      userId: currentUser.id,
      text,
      likes: [],
      replies: [],
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [newComment, ...prev]);
    syncAddComment(newComment).catch(console.error);

    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === videoId) {
          const updatedCount = v.commentsCount + 1;
          syncUpdateVideo(videoId, { commentsCount: updatedCount }).catch(console.error);
          return { ...v, commentsCount: updatedCount };
        }
        return v;
      })
    );

    const targetVideo = videos.find((v) => v.id === videoId);
    if (targetVideo) {
      pushNotification(
        targetVideo.creatorId,
        currentUser.id,
        'comment',
        `commented: "${text.slice(0, 40)}"`,
        videoId
      );
    }

    // Check for @mentions
    const mentions = text.match(/@([a-zA-Z0-9_]+)/g) || [];
    mentions.forEach((m) => {
      const uname = m.slice(1).toLowerCase();
      const mentionedUser = users.find((u) => u.username.toLowerCase() === uname);
      if (mentionedUser) {
        pushNotification(
          mentionedUser.id,
          currentUser.id,
          'mention',
          `mentioned you in a comment: "${text.slice(0, 40)}"`,
          videoId
        );
      }
    });
  };

  const handleReplyComment = (commentId: string, text: string) => {
    if (!currentUser) return;
    setComments((prev) =>
      prev.map((c) => {
        if (c.id !== commentId) return c;
        const reply = {
          id: `r-${Date.now()}`,
          commentId,
          userId: currentUser.id,
          text,
          likes: [],
          createdAt: new Date().toISOString(),
        };
        const updatedReplies = [...c.replies, reply];
        syncUpdateComment(commentId, { replies: updatedReplies }).catch(console.error);
        pushNotification(
          c.userId,
          currentUser.id,
          'reply',
          `replied to your comment: "${text.slice(0, 40)}"`,
          c.videoId
        );
        return { ...c, replies: updatedReplies };
      })
    );
  };

  const handleToggleLikeComment = (commentId: string) => {
    if (!currentUser) return;
    setComments((prev) =>
      prev.map((c) => {
        if (c.id !== commentId) return c;
        const liked = c.likes.includes(currentUser.id);
        const updatedLikes = liked
          ? c.likes.filter((id) => id !== currentUser.id)
          : [...c.likes, currentUser.id];
        syncUpdateComment(commentId, { likes: updatedLikes }).catch(console.error);
        return {
          ...c,
          likes: updatedLikes,
        };
      })
    );
  };

  const handleDeleteComment = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    syncDeleteComment(commentId).catch(console.error);
  };

  // Messaging
  const handleSendMessage = (
    receiverId: string,
    text: string,
    imageUrl?: string,
    sharedVideoId?: string
  ) => {
    if (!currentUser) {
      requireAuth('Log in to send private messages.');
      return;
    }
    const newMsg: DirectMessage = {
      id: `m-${Date.now()}`,
      senderId: currentUser.id,
      receiverId,
      text,
      imageUrl,
      sharedVideoId,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setMessages((prev) => [...prev, newMsg]);
    pushNotification(
      receiverId,
      currentUser.id,
      'message',
      `sent you a message: "${text.slice(0, 35)}"`
    );

    // Simulated creator auto-reply for interactive feel
    const partner = users.find((u) => u.id === receiverId);
    if (partner && partner.online) {
      window.setTimeout(() => {
        const autoReply: DirectMessage = {
          id: `m-${Date.now()}-reply`,
          senderId: receiverId,
          receiverId: currentUser.id,
          text: sharedVideoId
            ? 'Just watched the clip you shared — the editing and rhythm are fire!! 🔥☆'
            : `Hey @${currentUser.username}! Appreciate the message — let's connect on my next live stream ☆`,
          createdAt: new Date().toISOString(),
          read: false,
        };
        setMessages((prev) => [...prev, autoReply]);
      }, 2200);
    }
  };

  const handleShareToChat = (videoId: string, recipientId: string) => {
    const vid = videos.find((v) => v.id === videoId);
    if (!vid) return;
    handleSendMessage(
      recipientId,
      `Shared a video with you: "${vid.caption.slice(0, 40)}..."`,
      undefined,
      videoId
    );
    setVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, shares: v.shares + 1 } : v))
    );
  };

  const handlePublishVideo = (newVideo: Video) => {
    setVideos((prev) => [newVideo, ...prev]);
    syncPublishVideo(newVideo).catch(console.error);

    // Notify mentioned users
    newVideo.mentions.forEach((uname) => {
      const target = users.find((u) => u.username.toLowerCase() === uname.toLowerCase());
      if (target && currentUser) {
        pushNotification(
          target.id,
          currentUser.id,
          'mention',
          `mentioned you in a new video: "${newVideo.caption.slice(0, 35)}..."`,
          newVideo.id
        );
      }
    });
    setActiveTab('home');
  };

  const handleDeleteVideo = (vidId: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== vidId));
    syncDeleteVideo(vidId).catch(console.error);
  };

  const handleSaveDraft = (draft: DraftVideo) => {
    setDrafts((prev) => [draft, ...prev]);
    syncSaveDraft(draft).catch(console.error);
  };

  const handleDeleteDraft = (draftId: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== draftId));
    syncDeleteDraft(draftId).catch(console.error);
  };

  const handleToggleBlockUser = (targetUserId: string) => {
    if (!currentUser) return;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== currentUser.id) return u;
        const blocked = u.blockedUsers.includes(targetUserId);
        return {
          ...u,
          blockedUsers: blocked
            ? u.blockedUsers.filter((id) => id !== targetUserId)
            : [...u.blockedUsers, targetUserId],
          following: u.following.filter((id) => id !== targetUserId),
        };
      })
    );
  };

  const handleReportContent = (
    targetType: ReportItem['targetType'],
    targetId: string,
    reason: string
  ) => {
    const newReport: ReportItem = {
      id: `rep-${Date.now()}`,
      reporterId: currentUser?.id || 'guest',
      targetType,
      targetId,
      reason,
      details: `User submitted ${targetType} moderation report (${reason}).`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setReports((prev) => [newReport, ...prev]);
  };

  const unreadInboxTotal = currentUser
    ? notifications.filter((n) => n.userId === currentUser.id && !n.read).length +
      messages.filter((m) => m.receiverId === currentUser.id && !m.read).length
    : 0;

  const activeCommentVideo =
    videos.find((v) => v.id === activeCommentVideoId) || null;

  const profileTargetUser =
    users.find((u) => u.id === viewedProfileId) || currentUser || users[0];

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-50 dark:bg-[#080808] text-slate-900 dark:text-white overflow-hidden select-none">
      {/* Top Bar Contract (Desktop & Tablet) */}
      <header className="h-14 px-4 sm:px-6 border-b border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#080808]/90 backdrop-blur-md flex items-center justify-between gap-8 shrink-0 z-30">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center cursor-pointer whitespace-nowrap shrink-0"
        >
          <StarLogo size="sm" />
        </button>

        {/* Zone 2: Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-zinc-400">
          <button
            onClick={() => setActiveTab('home')}
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'home' ? 'text-[#8B5CF6] dark:text-white underline underline-offset-8 decoration-2 decoration-[#8B5CF6]' : ''
            }`}
          >
            For You Feed
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'discover' ? 'text-[#8B5CF6] dark:text-white underline underline-offset-8 decoration-2 decoration-[#8B5CF6]' : ''
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'live' ? 'text-[#FF2D75] dark:text-white underline underline-offset-8 decoration-2 decoration-[#FF2D75]' : ''
            }`}
          >
            Live Streams
          </button>
          <button
            onClick={() => setActiveTab('creator_studio')}
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'creator_studio' ? 'text-emerald-400 dark:text-emerald-400 underline underline-offset-8 decoration-2 decoration-emerald-400' : ''
            }`}
          >
            Creator Studio
          </button>
          <button
            onClick={() => setActiveTab('inbox')}
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'inbox' ? 'text-[#8B5CF6] dark:text-white underline underline-offset-8 decoration-2 decoration-[#8B5CF6]' : ''
            }`}
          >
            Inbox {unreadInboxTotal > 0 ? `(${unreadInboxTotal})` : ''}
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'admin' ? 'text-[#8B5CF6] dark:text-white underline underline-offset-8 decoration-2 decoration-[#8B5CF6]' : ''
            }`}
          >
            Admin
          </button>
        </nav>

        {/* Zone 3: Primary Action & Coin Wallet */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 text-[11px] font-semibold" title="Connected to Google Firebase Firestore & Auth">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Firebase Live</span>
          </div>

          {/* Universal Install App / APK Button */}
          <button
            onClick={() => setInstallModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-[#8B5CF6]/15 to-[#FF2D75]/15 border border-[#8B5CF6]/30 hover:border-[#8B5CF6]/60 text-slate-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            title="Install APK for Android / iOS / Desktop"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#FF2D75]" />
            <span className="hidden sm:inline">Install App</span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-[#FF2D75] text-white font-bold">APK</span>
          </button>

          {currentUser && (
            <button
              onClick={() => {
                setGiftModalState({ isOpen: true, targetCreator: currentUser, targetVideo: null });
              }}
              className="px-2.5 py-1.5 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-500 hover:bg-amber-400/25 flex items-center gap-1.5 text-xs font-bold font-mono transition-colors cursor-pointer"
              title="Coin Balance · Click to Top Up"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>{(currentUser.coinBalance || 0).toLocaleString()}</span>
            </button>
          )}

          <button
            onClick={() => setIsDarkMode((d) => !d)}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {currentUser ? (
            <button
              onClick={() => {
                setViewedProfileId(currentUser.id);
                setActiveTab('profile');
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 flex items-center gap-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.displayName}
                referrerPolicy="no-referrer"
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="hidden sm:inline">@{currentUser.username}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleGoogleSignIn}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/15 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-800 dark:text-white text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-sm transition-all cursor-pointer"
                title="Sign in directly with your Google account"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google Sign In</span>
              </button>

              <button
                onClick={() => {
                  setAuthReason(undefined);
                  setAuthModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#FF2D75] text-white text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-md cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Workspace Container (Desktop Left Rail + Content Stage) */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Desktop Left Navigation Rail */}
        <aside className="hidden lg:flex flex-col justify-between w-60 border-r border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d0d0d] p-4 shrink-0">
          <div className="space-y-1.5">
            <button
              onClick={() => setActiveTab('home')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#FF2D75] text-white shadow-md'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>For You Feed</span>
            </button>

            <button
              onClick={() => setActiveTab('discover')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors cursor-pointer ${
                activeTab === 'discover'
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#FF2D75] text-white shadow-md'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Discover & Search</span>
            </button>

            <button
              onClick={() => setActiveTab('create')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#FF2D75] text-white shadow-md'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Create & Upload (+)</span>
            </button>

            <button
              onClick={() => setActiveTab('live')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'live'
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#FF2D75] text-white shadow-md'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-3">
                <Radio className="w-4 h-4 text-[#FF2D75]" />
                <span>LIVE Streams</span>
              </span>
              <span className="text-[10px] font-mono tabular-nums opacity-80">
                {liveStreams.filter((s) => s.isLive).length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('creator_studio')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors cursor-pointer ${
                activeTab === 'creator_studio'
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#FF2D75] text-white shadow-md'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Creator Studio & MoMo</span>
            </button>

            <button
              onClick={() => setActiveTab('inbox')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'inbox'
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#FF2D75] text-white shadow-md'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4" />
                <span>Inbox & Activity</span>
              </span>
              {unreadInboxTotal > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#FF2D75] text-white text-[10px] font-mono">
                  {unreadInboxTotal}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                if (currentUser) setViewedProfileId(currentUser.id);
                setActiveTab('profile');
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#FF2D75] text-white shadow-md'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>My Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#FF2D75] text-white shadow-md'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Shield className="w-4 h-4 text-[#8B5CF6]" />
              <span>Admin Dashboard</span>
            </button>
          </div>

          {/* Suggested Creators in Sidebar */}
          <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-2.5">
            <p className="text-[11px] font-semibold text-slate-400 px-1">
              Top Verified Creators
            </p>
            {users.slice(0, 4).map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  setViewedProfileId(u.id);
                  setActiveTab('profile');
                }}
                className="w-full p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-2.5 text-left transition-colors cursor-pointer"
              >
                <img
                  src={u.avatar}
                  alt={u.displayName}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate flex items-center gap-1">
                    <span>{u.displayName}</span>
                    {u.verified && <BadgeCheck className="w-3.5 h-3.5 text-[#8B5CF6] shrink-0" />}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">@{u.username}</p>
                </div>
              </button>
            ))}

            {/* Install App / APK Banner */}
            <button
              onClick={() => setInstallModalOpen(true)}
              className="w-full mt-2 p-2.5 rounded-2xl bg-gradient-to-r from-[#8B5CF6]/15 to-[#FF2D75]/15 border border-[#8B5CF6]/30 hover:border-[#8B5CF6]/60 flex items-center gap-2.5 text-left transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#8B5CF6] to-[#FF2D75] text-white flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate flex items-center gap-1.5">
                  <span>Install App</span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#FF2D75] text-white font-bold">APK</span>
                </p>
                <p className="text-[10px] text-slate-400 truncate">Android, iOS & Desktop</p>
              </div>
            </button>
          </div>
        </aside>

        {/* Active View Stage */}
        <main className="flex-1 h-full overflow-hidden relative">
          {activeTab === 'home' && (
            <VideoFeed
              videos={videos}
              users={users}
              comments={comments}
              currentUser={currentUser}
              isMuted={isMuted}
              onToggleMute={() => setIsMuted((m) => !m)}
              onToggleLike={handleToggleLike}
              onToggleSave={handleToggleSave}
              onToggleFollow={handleToggleFollow}
              onOpenComments={(video) => setActiveCommentVideoId(video.id)}
              onShareToChat={handleShareToChat}
              onIncrementShare={(videoId) =>
                setVideos((prev) =>
                  prev.map((v) => (v.id === videoId ? { ...v, shares: v.shares + 1 } : v))
                )
              }
              onSelectUser={(uid) => {
                setViewedProfileId(uid);
                setActiveTab('profile');
              }}
              onSelectHashtag={(tag) => {
                setDiscoverHashtagFilter(tag);
                setActiveTab('discover');
              }}
              onSelectSound={(sid) => {
                setDiscoverSoundFilter(sid);
                setActiveTab('discover');
              }}
              onReportVideo={(vidId, reason) => handleReportContent('video', vidId, reason)}
              onBlockUser={handleToggleBlockUser}
              onDeleteVideo={handleDeleteVideo}
              onOpenLive={() => setActiveTab('live')}
              onOpenGiftModal={handleOpenGiftModal}
              onToggleSubscribe={handleToggleSubscribe}
              onRequireAuth={requireAuth}
              onAddComment={handleAddComment}
            />
          )}

          {activeTab === 'discover' && (
            <DiscoverView
              videos={videos}
              users={users}
              sounds={INITIAL_SOUNDS}
              currentUser={currentUser}
              initialHashtagFilter={discoverHashtagFilter}
              initialSoundFilter={discoverSoundFilter}
              onClearInitialFilters={() => {
                setDiscoverHashtagFilter(null);
                setDiscoverSoundFilter(null);
              }}
              onSelectUser={(uid) => {
                setViewedProfileId(uid);
                setActiveTab('profile');
              }}
              onToggleFollow={handleToggleFollow}
              onToggleLike={handleToggleLike}
              onUseSoundInStudio={(sid) => {
                setStudioSoundId(sid);
                setActiveTab('create');
              }}
              onRequireAuth={requireAuth}
            />
          )}

          {activeTab === 'create' && (
            <CreateVideoView
              currentUser={currentUser}
              sounds={INITIAL_SOUNDS}
              drafts={drafts}
              preselectedSoundId={studioSoundId}
              onPublishVideo={handlePublishVideo}
              onSaveDraft={handleSaveDraft}
              onDeleteDraft={handleDeleteDraft}
              onRequireAuth={requireAuth}
            />
          )}

          {activeTab === 'inbox' && (
            <InboxView
              currentUser={currentUser}
              users={users}
              videos={videos}
              messages={messages}
              notifications={notifications}
              initialPartnerId={inboxPartnerId}
              onSendMessage={handleSendMessage}
              onDeleteMessage={(msgId) =>
                setMessages((prev) => prev.filter((m) => m.id !== msgId))
              }
              onMarkConversationRead={(partnerId) => {
                if (!currentUser) return;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.senderId === partnerId && m.receiverId === currentUser.id
                      ? { ...m, read: true }
                      : m
                  )
                );
              }}
              onMarkAllNotificationsRead={() => {
                if (!currentUser) return;
                setNotifications((prev) =>
                  prev.map((n) =>
                    n.userId === currentUser.id ? { ...n, read: true } : n
                  )
                );
              }}
              onMarkNotificationRead={(notifId) =>
                setNotifications((prev) =>
                  prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
                )
              }
              onToggleBlockUser={handleToggleBlockUser}
              onSelectUser={(uid) => {
                setViewedProfileId(uid);
                setActiveTab('profile');
              }}
              onRequireAuth={requireAuth}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              profileUser={profileTargetUser}
              currentUser={currentUser}
              users={users}
              videos={videos}
              isDarkMode={isDarkMode}
              onToggleTheme={() => setIsDarkMode((d) => !d)}
              onUpdateProfile={(updates) => {
                if (!currentUser) return;
                setUsers((prev) =>
                  prev.map((u) => (u.id === currentUser.id ? { ...u, ...updates } : u))
                );
                syncUpdateUser(currentUser.id, updates).catch(console.error);
              }}
              onToggleFollow={handleToggleFollow}
              onToggleBlock={handleToggleBlockUser}
              onDeleteVideo={handleDeleteVideo}
              onMessageUser={(uid) => {
                setInboxPartnerId(uid);
                setActiveTab('inbox');
              }}
              onSelectUser={(uid) => {
                setViewedProfileId(uid);
                setActiveTab('profile');
              }}
              onLogout={() => {
                handleLogout();
                setActiveTab('home');
              }}
              onDeleteAccount={() => {
                if (!currentUser) return;
                const deletedId = currentUser.id;
                setUsers((prev) => prev.filter((u) => u.id !== deletedId));
                setVideos((prev) => prev.filter((v) => v.creatorId !== deletedId));
                setCurrentUserId(null);
                setActiveTab('home');
              }}
              onOpenAdmin={() => setActiveTab('admin')}
              onOpenCreatorStudio={() => setActiveTab('creator_studio')}
              onOpenGiftModal={handleOpenGiftModal}
              onRequireAuth={requireAuth}
            />
          )}

          {activeTab === 'live' && (
            <LiveStreamView
              liveStreams={liveStreams}
              users={users}
              currentUser={currentUser}
              onSendLiveComment={(streamId, text) => {
                if (!currentUser) return;
                setLiveStreams((prev) =>
                  prev.map((s) =>
                    s.id === streamId
                      ? {
                          ...s,
                          chatMessages: [
                            ...s.chatMessages,
                            {
                              id: `lc-${Date.now()}`,
                              userId: currentUser.id,
                              username: currentUser.username,
                              avatar: currentUser.avatar,
                              text,
                              createdAt: 'Just now',
                            },
                          ],
                        }
                      : s
                  )
                );
              }}
              onLikeLiveStream={(streamId) =>
                setLiveStreams((prev) =>
                  prev.map((s) =>
                    s.id === streamId ? { ...s, likesCount: s.likesCount + 1 } : s
                  )
                )
              }
              onStartLiveStream={(title, category, sceneType: VideoSceneType) => {
                const newStream: LiveStream = {
                  id: `live-${Date.now()}`,
                  hostId: currentUser?.id || users[0].id,
                  title,
                  category,
                  sceneType,
                  viewerCount: 124,
                  likesCount: 18,
                  giftsTotalCoins: 0,
                  isLive: true,
                  startedAt: new Date().toISOString(),
                  chatMessages: [
                    {
                      id: `lc-init-${Date.now()}`,
                      userId: 'u-2',
                      username: 'mia_kinetics',
                      avatar: users[1].avatar,
                      text: 'Joined your live broadcast! ☆🔥',
                      createdAt: 'Just now',
                    },
                  ],
                };
                setLiveStreams((prev) => [newStream, ...prev]);
                return newStream;
              }}
              onEndLiveStream={(streamId) =>
                setLiveStreams((prev) =>
                  prev.map((s) => (s.id === streamId ? { ...s, isLive: false } : s))
                )
              }
              onToggleFollow={handleToggleFollow}
              onReportLiveStream={(streamId, reason) =>
                handleReportContent('livestream', streamId, reason)
              }
              onSelectUser={(uid) => {
                setViewedProfileId(uid);
                setActiveTab('profile');
              }}
              onOpenGiftModal={(creator) => handleOpenGiftModal(creator)}
              onRequireAuth={requireAuth}
            />
          )}

          {activeTab === 'creator_studio' && (
            <CreatorStudioView
              currentUser={currentUser}
              videos={videos}
              transactions={transactions}
              withdrawals={withdrawals}
              onRequestWithdrawal={handleRequestWithdrawal}
              onUpdateSubscriptionPrice={handleUpdateSubscriptionPrice}
              onRequireAuth={requireAuth}
            />
          )}

          {activeTab === 'admin' && (
            <AdminDashboardView
              currentUser={currentUser}
              users={users}
              videos={videos}
              comments={comments}
              reports={reports}
              withdrawals={withdrawals}
              transactions={transactions}
              adCampaigns={adCampaigns}
              onSwitchToAdmin={() => {
                const admin = users.find((u) => u.role === 'admin') || users[users.length - 1];
                if (admin) setCurrentUserId(admin.id);
              }}
              onToggleSuspendUser={(uid) =>
                setUsers((prev) =>
                  prev.map((u) => (u.id === uid ? { ...u, suspended: !u.suspended } : u))
                )
              }
              onToggleVerifyUser={(uid) =>
                setUsers((prev) =>
                  prev.map((u) => (u.id === uid ? { ...u, verified: !u.verified } : u))
                )
              }
              onToggleFeatureVideo={(vidId) =>
                setVideos((prev) =>
                  prev.map((v) => (v.id === vidId ? { ...v, featured: !v.featured } : v))
                )
              }
              onDeleteVideo={handleDeleteVideo}
              onDeleteComment={handleDeleteComment}
              onResolveReport={(repId, action) =>
                setReports((prev) =>
                  prev.map((r) => (r.id === repId ? { ...r, status: action } : r))
                )
              }
              onApproveWithdrawal={handleApproveWithdrawal}
              onRejectWithdrawal={handleRejectWithdrawal}
            />
          )}
        </main>
      </div>

      {/* Fixed Bottom Navigation Bar (5 Tabs: HOME, DISCOVER, CREATE (+), INBOX, PROFILE) */}
      <nav
        aria-label="Bottom Navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 h-16 bg-white/95 dark:bg-[#080808]/95 backdrop-blur-md border-t border-slate-200 dark:border-white/10 grid grid-cols-5 items-center px-2"
      >
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors cursor-pointer ${
            activeTab === 'home'
              ? 'text-[#8B5CF6] dark:text-white'
              : 'text-slate-400 dark:text-zinc-500'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold tracking-tight mt-0.5">HOME</span>
        </button>

        <button
          onClick={() => setActiveTab('discover')}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors cursor-pointer ${
            activeTab === 'discover'
              ? 'text-[#8B5CF6] dark:text-white'
              : 'text-slate-400 dark:text-zinc-500'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] font-bold tracking-tight mt-0.5">DISCOVER</span>
        </button>

        {/* Center CREATE (+) Button */}
        <div className="flex items-center justify-center">
          <button
            onClick={() => setActiveTab('create')}
            aria-label="Create or upload video"
            className="w-12 h-9 rounded-xl bg-gradient-to-r from-[#8B5CF6] via-[#C026D3] to-[#FF2D75] text-white flex items-center justify-center shadow-lg shadow-[#8B5CF6]/30 active:scale-95 transition-transform cursor-pointer"
          >
            <Plus className="w-5 h-5 stroke-[2.8]" />
          </button>
        </div>

        <button
          onClick={() => setActiveTab('inbox')}
          className={`relative flex flex-col items-center justify-center min-h-[44px] transition-colors cursor-pointer ${
            activeTab === 'inbox'
              ? 'text-[#8B5CF6] dark:text-white'
              : 'text-slate-400 dark:text-zinc-500'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            {unreadInboxTotal > 0 && (
              <span className="absolute -top-1.5 -right-2.5 px-1 min-w-[16px] h-4 rounded-full bg-[#FF2D75] text-white text-[9px] font-mono flex items-center justify-center">
                {unreadInboxTotal}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold tracking-tight mt-0.5">INBOX</span>
        </button>

        <button
          onClick={() => {
            if (currentUser) setViewedProfileId(currentUser.id);
            setActiveTab('profile');
          }}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors cursor-pointer ${
            activeTab === 'profile'
              ? 'text-[#8B5CF6] dark:text-white'
              : 'text-slate-400 dark:text-zinc-500'
          }`}
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[10px] font-bold tracking-tight mt-0.5">PROFILE</span>
        </button>
      </nav>

      {/* Slide-up Comments Drawer */}
      <CommentsDrawer
        video={activeCommentVideo}
        isOpen={Boolean(activeCommentVideo)}
        onClose={() => setActiveCommentVideoId(null)}
        comments={comments}
        users={users}
        currentUser={currentUser}
        onAddComment={handleAddComment}
        onReplyComment={handleReplyComment}
        onToggleLikeComment={handleToggleLikeComment}
        onDeleteComment={handleDeleteComment}
        onReportContent={handleReportContent}
        onSelectUser={(uid) => {
          setActiveCommentVideoId(null);
          setViewedProfileId(uid);
          setActiveTab('profile');
        }}
        onRequireAuth={requireAuth}
      />

      {/* Authentication & Registration Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        users={users}
        onLoginSuccess={(u) => {
          setCurrentUserId(u.id);
          setViewedProfileId(u.id);
        }}
        onRegisterUser={(newUser) => {
          setUsers((prev) => [newUser, ...prev]);
          syncUpdateUser(newUser.id, newUser).catch(console.error);
        }}
        onGoogleSignIn={handleGoogleSignIn}
        onResetPassword={(email, newPass) => {
          const exists = users.some(
            (u) => u.email.toLowerCase() === email.toLowerCase()
          );
          if (!exists) return false;
          setUsers((prev) =>
            prev.map((u) =>
              u.email.toLowerCase() === email.toLowerCase()
                ? { ...u, password: newPass }
                : u
            )
          );
          return true;
        }}
        reasonMessage={authReason}
      />

      {/* Virtual Gifts Modal */}
      <GiftModal
        isOpen={giftModalState.isOpen}
        onClose={() => setGiftModalState({ isOpen: false, targetCreator: null, targetVideo: null })}
        targetCreator={giftModalState.targetCreator}
        targetVideo={giftModalState.targetVideo}
        currentUser={currentUser}
        onSendGift={handleSendGift}
        onTopUpCoins={handleTopUpCoins}
        onRequireAuth={requireAuth}
      />

      {/* Universal PWA & Android APK Installation Modal */}
      <InstallAppModal
        isOpen={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
      />
    </div>
  );
}

export default App;
