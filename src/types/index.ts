export type UserRole = 'user' | 'creator' | 'verified_creator' | 'moderator' | 'admin';

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  password?: string;
  avatar: string;
  bio: string;
  createdAt: string;
  verified: boolean;
  role: UserRole;
  suspended?: boolean;
  canGoLive: boolean;
  coinBalance: number; // For gifting creators
  phoneNumber?: string;
  phoneVerified?: boolean;
  region?: string; // e.g., 'Uganda', 'East Africa', 'Global'
  subscribedCreatorIds: string[]; // Creator IDs this user has active VIP subscriptions to
  subscriptionPrice?: number; // Creator's monthly VIP sub price (e.g. $4.99)
  isMonetized?: boolean;
  followers: string[]; // user IDs
  following: string[]; // user IDs
  blockedUsers: string[]; // user IDs
  privacy: {
    privateAccount: boolean;
    allowComments: 'everyone' | 'followers' | 'nobody';
    allowMessages: 'everyone' | 'followers' | 'nobody';
    showActivityStatus: boolean;
  };
  notificationPrefs: {
    likes: boolean;
    comments: boolean;
    follows: boolean;
    messages: boolean;
    mentions: boolean;
    earnings: boolean;
    subscriptions: boolean;
  };
  online?: boolean;
}

export type VideoSceneType =
  | 'cyber_dance'
  | 'tokyo_drift'
  | 'synth_studio'
  | 'culinary_fire'
  | 'alpine_drone'
  | 'street_skate'
  | 'shader_art'
  | 'aurora_sky'
  | 'kampala_beats'
  | 'uploaded_video';

export type VideoFilterType =
  | 'none'
  | 'grayscale'
  | 'sepia'
  | 'vivid'
  | 'cyber'
  | 'noir'
  | 'warm'
  | 'cool'
  | 'vintage'
  | 'dramatic'
  | 'emerald';

export type VideoVisibility = 'public' | 'followers' | 'private' | 'subscribers_only';

export type VideoTransitionEffect =
  | 'none'
  | 'fade'
  | 'dissolve'
  | 'slide-left'
  | 'slide-right'
  | 'zoom'
  | 'glitch'
  | 'flash';

export interface SoundEffectItem {
  id: string;
  name: string;
  category: 'Impact' | 'Cinematic' | 'Whoosh' | 'Crowd' | 'Beats';
  icon: string;
  duration: number; // in seconds
  description: string;
}

export type WatermarkType = 'none' | 'text' | 'image';

export type WatermarkPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'center';

export type WatermarkStyle = 'shadow' | 'pill' | 'solid' | 'glow' | 'outline';

export interface VideoWatermark {
  type: WatermarkType;
  text?: string;
  imageUrl?: string;
  position: WatermarkPosition;
  opacity: number; // 10 to 100
  scale: number; // 0.6 to 1.5
  color?: string;
  style?: WatermarkStyle;
  includeBrandIcon?: boolean;
}

export interface SoundTrack {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  duration: number;
  category: string;
  usageCount: number;
  region?: string;
  notes: number[];
}

export interface VideoGiftEvent {
  giftId: string;
  senderId: string;
  senderName: string;
  coinCost: number;
  sentAt: string;
}

export interface Video {
  id: string;
  creatorId: string;
  caption: string;
  hashtags: string[];
  mentions: string[];
  category: string;
  region?: string; // 'Uganda', 'East Africa', 'Global'
  soundId: string;
  soundTitle: string;
  soundArtist: string;
  sceneType: VideoSceneType;
  videoUrl?: string;
  thumbnailColor: string;
  filter: VideoFilterType;
  trimStart: number; // in seconds
  trimEnd: number;   // in seconds
  duration: number;  // in seconds
  playbackSpeed?: number; // 0.25 to 2.0x
  clipVolume?: number; // 0 - 150% (default 100)
  bgMusicVolume?: number; // 0 - 150% (default 80)
  customAudioUrl?: string;
  customAudioName?: string;
  soundEffectId?: string;
  transitionEffect?: VideoTransitionEffect;
  transitionDuration?: number; // 0.2 to 1.5s
  visibility: VideoVisibility;
  likes: string[];   // user IDs
  saves: string[];   // user IDs
  views: number;
  shares: number;
  commentsCount: number;
  giftEarningsCoins?: number;
  giftsReceived?: VideoGiftEvent[];
  featured?: boolean;
  watermark?: VideoWatermark;
  isSponsored?: boolean;
  sponsorName?: string;
  sponsorCta?: string;
  createdAt: string;
}

export interface VirtualGift {
  id: string;
  name: string;
  coinCost: number;
  icon: string;
  color: string;
  animation: 'sparkle' | 'heart_burst' | 'rocket' | 'diamond' | 'crown';
}

export interface DraftVideo {
  id: string;
  creatorId: string;
  caption: string;
  hashtags: string[];
  category: string;
  soundId: string;
  sceneType: VideoSceneType;
  videoUrl?: string;
  filter: VideoFilterType;
  trimStart: number;
  trimEnd: number;
  playbackSpeed?: number;
  clipVolume?: number;
  bgMusicVolume?: number;
  customAudioUrl?: string;
  customAudioName?: string;
  soundEffectId?: string;
  transitionEffect?: VideoTransitionEffect;
  transitionDuration?: number;
  visibility: VideoVisibility;
  watermark?: VideoWatermark;
  updatedAt: string;
}

export interface CommentReply {
  id: string;
  commentId: string;
  userId: string;
  text: string;
  likes: string[];
  createdAt: string;
}

export interface Comment {
  id: string;
  videoId: string;
  userId: string;
  text: string;
  likes: string[];
  replies: CommentReply[];
  createdAt: string;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  sharedVideoId?: string;
  imageUrl?: string;
  createdAt: string;
  read: boolean;
}

export type NotificationType =
  | 'follow'
  | 'like'
  | 'comment'
  | 'reply'
  | 'mention'
  | 'message'
  | 'gift'
  | 'subscription'
  | 'earnings';

export interface NotificationItem {
  id: string;
  userId: string;
  actorId: string;
  type: NotificationType;
  videoId?: string;
  text: string;
  amountCoins?: number;
  amountUsd?: number;
  createdAt: string;
  read: boolean;
}

export interface ReportItem {
  id: string;
  reporterId: string;
  targetType: 'video' | 'comment' | 'user' | 'livestream';
  targetId: string;
  reason: string;
  details: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface LiveChatMessage {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  text: string;
  isGift?: boolean;
  giftName?: string;
  createdAt: string;
}

export interface LiveStream {
  id: string;
  hostId: string;
  title: string;
  category: string;
  sceneType: VideoSceneType;
  viewerCount: number;
  likesCount: number;
  giftsTotalCoins: number;
  isLive: boolean;
  startedAt: string;
  slowMode?: boolean;
  chatMessages: LiveChatMessage[];
}

export type TransactionType =
  | 'coin_purchase'
  | 'gift_sent'
  | 'gift_received'
  | 'subscription_payment'
  | 'subscription_earned'
  | 'video_rewards'
  | 'ad_revenue'
  | 'withdrawal';

export interface FinancialTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  amountUsd: number;
  coins?: number;
  description: string;
  status: 'completed' | 'pending' | 'rejected';
  createdAt: string;
}

export type PayoutMethod = 'mobile_money_mtn' | 'mobile_money_airtel' | 'bank_transfer' | 'paypal';

export interface WithdrawalRequest {
  id: string;
  creatorId: string;
  creatorUsername: string;
  amountUsd: number;
  amountUgx?: number; // Currency conversion for Uganda MTN/Airtel Money
  method: PayoutMethod;
  accountDetails: string; // phone number or IBAN / paypal email
  accountName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
}

export interface CreatorEarningsLedger {
  lifetimeUsd: number;
  availableUsd: number;
  pendingUsd: number;
  giftEarningsUsd: number;
  subscriptionEarningsUsd: number;
  videoRewardsUsd: number;
  adEarningsUsd: number;
}

export interface AdvertisementCampaign {
  id: string;
  brandName: string;
  sponsorName?: string;
  brandLogo: string;
  headline: string;
  body?: string;
  ctaText?: string;
  ctaUrl?: string;
  category: string;
  budgetUsd: number;
  spentUsd: number;
  impressions: number;
  clicks: number;
  targetRegion: string;
  active: boolean;
  status?: 'active' | 'paused' | 'completed';
}

export type NavTab = 'home' | 'discover' | 'create' | 'inbox' | 'profile' | 'live' | 'admin' | 'creator_studio';
