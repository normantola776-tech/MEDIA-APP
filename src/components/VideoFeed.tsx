import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Volume2,
  VolumeX,
  Music,
  Plus,
  Check,
  Eye,
  BadgeCheck,
  MoreHorizontal,
  Flag,
  Ban,
  Trash2,
  ChevronUp,
  ChevronDown,
  Radio,
  Copy,
  Send,
  X,
  Gift,
  Award,
} from 'lucide-react';
import { Comment, User, Video } from '../types';
import { CanvasVideoPlayer } from './CanvasVideoPlayer';

interface VideoFeedProps {
  videos: Video[];
  users: User[];
  comments: Comment[];
  currentUser: User | null;
  isMuted: boolean;
  onToggleMute: () => void;
  onToggleLike: (videoId: string) => void;
  onToggleSave: (videoId: string) => void;
  onToggleFollow: (targetUserId: string) => void;
  onOpenComments: (video: Video) => void;
  onShareToChat: (videoId: string, recipientId: string) => void;
  onIncrementShare: (videoId: string) => void;
  onSelectUser: (userId: string) => void;
  onSelectHashtag: (tag: string) => void;
  onSelectSound: (soundId: string) => void;
  onReportVideo: (videoId: string, reason: string) => void;
  onBlockUser: (userId: string) => void;
  onDeleteVideo: (videoId: string) => void;
  onOpenLive: () => void;
  onOpenGiftModal?: (creator: User, video?: Video) => void;
  onToggleSubscribe?: (creatorId: string) => void;
  onRequireAuth: (reason: string) => void;
  onAddComment: (videoId: string, text: string) => void;
}

export const VideoFeed: React.FC<VideoFeedProps> = ({
  videos,
  users,
  comments,
  currentUser,
  isMuted,
  onToggleMute,
  onToggleLike,
  onToggleSave,
  onToggleFollow,
  onOpenComments,
  onShareToChat,
  onIncrementShare,
  onSelectUser,
  onSelectHashtag,
  onSelectSound,
  onReportVideo,
  onBlockUser,
  onDeleteVideo,
  onOpenLive,
  onOpenGiftModal,
  onToggleSubscribe,
  onRequireAuth,
  onAddComment,
}) => {
  const [feedTab, setFeedTab] = useState<'forYou' | 'following' | 'trending'>('forYou');
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [shareModalVideo, setShareModalVideo] = useState<Video | null>(null);
  const [moreMenuVideoId, setMoreMenuVideoId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [quickComment, setQuickComment] = useState<string>('');
  const feedContainerRef = useRef<HTMLDivElement | null>(null);

  const baseVisible = videos.filter((v) => {
    if (currentUser?.blockedUsers.includes(v.creatorId)) return false;
    if (v.visibility === 'private' && v.creatorId !== currentUser?.id) return false;
    if (
      v.visibility === 'followers' &&
      v.creatorId !== currentUser?.id &&
      !currentUser?.following.includes(v.creatorId)
    ) {
      return false;
    }
    if (
      v.visibility === 'subscribers_only' &&
      v.creatorId !== currentUser?.id &&
      !currentUser?.subscribedCreatorIds?.includes(v.creatorId)
    ) {
      return false;
    }
    if (feedTab === 'following') {
      if (!currentUser) return false;
      return currentUser.following.includes(v.creatorId) || v.creatorId === currentUser.id;
    }
    return true;
  });

  const visibleVideos = feedTab === 'trending'
    ? [...baseVisible].sort((a, b) => (b.views + b.likes.length * 50) - (a.views + a.likes.length * 50))
    : baseVisible;

  useEffect(() => {
    setActiveIndex(0);
    if (feedContainerRef.current) {
      feedContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [feedTab]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(null), 2600);
  };

  const scrollToIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= visibleVideos.length) return;
      setActiveIndex(index);
      const container = feedContainerRef.current;
      if (container) {
        container.scrollTo({
          top: index * container.clientHeight,
          behavior: 'smooth',
        });
      }
    },
    [visibleVideos.length]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        scrollToIndex(activeIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        scrollToIndex(activeIndex - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, scrollToIndex]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.clientHeight === 0) return;
    const idx = Math.round(el.scrollTop / el.clientHeight);
    if (idx !== activeIndex && idx >= 0 && idx < visibleVideos.length) {
      setActiveIndex(idx);
      setMoreMenuVideoId(null);
    }
  };

  const formatNumber = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  const activeVideo = visibleVideos[activeIndex] || visibleVideos[0] || null;
  const activeCreator = activeVideo
    ? users.find((u) => u.id === activeVideo.creatorId) || users[0]
    : null;
  const activeVideoComments = activeVideo
    ? comments.filter((c) => c.videoId === activeVideo.id)
    : [];

  const renderRichCaption = (caption: string) => {
    const words = caption.split(' ');
    return words.map((word, idx) => {
      if (word.startsWith('#') && word.length > 1) {
        const cleanTag = word.slice(1).replace(/[^a-zA-Z0-9_]/g, '');
        return (
          <button
            key={idx}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectHashtag(cleanTag);
            }}
            className="font-semibold text-white hover:text-[#FF2D75] mr-1.5 cursor-pointer"
          >
            {word}
          </button>
        );
      }
      if (word.startsWith('@') && word.length > 1) {
        const cleanName = word.slice(1).replace(/[^a-zA-Z0-9_]/g, '');
        const target = users.find((u) => u.username.toLowerCase() === cleanName.toLowerCase());
        return (
          <button
            key={idx}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (target) onSelectUser(target.id);
            }}
            className="font-semibold text-[#A78BFA] hover:underline mr-1.5 cursor-pointer"
          >
            {word}
          </button>
        );
      }
      return <span key={idx}>{word} </span>;
    });
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#080808] overflow-hidden">
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#8B5CF6] text-white text-xs font-semibold shadow-xl">
          {toastMessage}
        </div>
      )}

      {/* Main Feed Column */}
      <div className="relative w-full sm:w-[430px] lg:w-[450px] h-full bg-[#080808] sm:rounded-2xl sm:h-[calc(100%-24px)] overflow-hidden shadow-2xl border-0 sm:border sm:border-white/10 shrink-0">
        {/* Top Header (LIVE | Following | For You | Trending | Mute) */}
        <div className="absolute top-0 inset-x-0 z-30 px-3 pt-3 pb-2 flex items-center justify-between gap-1">
          <button
            onClick={onOpenLive}
            className="min-h-[38px] px-2.5 rounded-full bg-black/50 backdrop-blur-md border border-white/15 flex items-center gap-1.5 text-xs font-bold text-white hover:bg-[#FF2D75] transition-colors cursor-pointer shrink-0"
          >
            <Radio className="w-3.5 h-3.5 text-[#FF2D75]" />
            <span className="hidden xs:inline">LIVE</span>
          </button>

          {/* 3 Main Categories: Following, For You, Trending */}
          <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-1 py-1 rounded-full border border-white/15">
            <button
              onClick={() => setFeedTab('following')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                feedTab === 'following'
                  ? 'bg-white text-[#080808]'
                  : 'text-white/75 hover:text-white'
              }`}
            >
              Following
            </button>
            <button
              onClick={() => setFeedTab('forYou')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                feedTab === 'forYou'
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#FF2D75] text-white shadow-sm'
                  : 'text-white/75 hover:text-white'
              }`}
            >
              For You
            </button>
            <button
              onClick={() => setFeedTab('trending')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                feedTab === 'trending'
                  ? 'bg-[#FF2D75] text-white shadow-sm'
                  : 'text-white/75 hover:text-white'
              }`}
            >
              Trending
            </button>
          </div>

          <button
            onClick={onToggleMute}
            className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/15 flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer shrink-0"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-[#FF2D75]" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {visibleVideos.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 text-white">
            <p className="font-display font-bold text-lg">No videos in this feed yet</p>
            <p className="text-xs text-zinc-400 mt-1.5 max-w-xs">
              Follow creators to populate your Following feed or switch to For You!
            </p>
            {feedTab === 'following' && (
              <button
                onClick={() => setFeedTab('forYou')}
                className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#FF2D75] text-xs font-semibold text-white cursor-pointer"
              >
                Go to For You Feed
              </button>
            )}
          </div>
        ) : (
          <div
            ref={feedContainerRef}
            onScroll={handleScroll}
            className="w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
          >
            {visibleVideos.map((video, idx) => {
              const creator =
                users.find((u) => u.id === video.creatorId) || {
                  id: video.creatorId,
                  username: 'creator',
                  displayName: 'Creator',
                  avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Creator',
                  verified: false,
                  isMonetized: true,
                  subscriptionPrice: 4.99,
                };
              const isLiked = currentUser ? video.likes.includes(currentUser.id) : false;
              const isSaved = currentUser ? video.saves.includes(currentUser.id) : false;
              const isFollowing = currentUser
                ? currentUser.following.includes(creator.id)
                : false;
              const isSubscribed = currentUser?.subscribedCreatorIds?.includes(creator.id);
              const videoCommentCount = comments
                .filter((c) => c.videoId === video.id)
                .reduce((acc, c) => acc + 1 + c.replies.length, 0);

              return (
                <div
                  key={video.id}
                  className="relative w-full h-full snap-start snap-always shrink-0 overflow-hidden"
                >
                  <CanvasVideoPlayer
                    sceneType={video.sceneType}
                    videoUrl={video.videoUrl}
                    filter={video.filter}
                    watermark={video.watermark}
                    soundId={video.soundId}
                    isActive={idx === activeIndex}
                    isMuted={isMuted}
                    trimStart={video.trimStart}
                    trimEnd={video.trimEnd}
                    duration={video.duration}
                    playbackSpeed={video.playbackSpeed}
                    clipVolume={video.clipVolume}
                    bgMusicVolume={video.bgMusicVolume}
                    customAudioUrl={video.customAudioUrl}
                    transitionEffect={video.transitionEffect}
                    transitionDuration={video.transitionDuration}
                    onDoubleTapLike={() => {
                      if (!currentUser) {
                        onRequireAuth('Log in to like videos.');
                        return;
                      }
                      if (!isLiked) onToggleLike(video.id);
                    }}
                  />

                  {/* Right Vertical Action Rail */}
                  <div className="absolute right-3 bottom-20 sm:bottom-8 z-20 flex flex-col items-center gap-3.5">
                    {/* Avatar */}
                    <div className="relative mb-1">
                      <button
                        onClick={() => onSelectUser(creator.id)}
                        className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-[#8B5CF6] to-[#FF2D75] block cursor-pointer"
                      >
                        <img
                          src={creator.avatar}
                          alt={creator.displayName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full rounded-full object-cover bg-[#080808]"
                        />
                      </button>
                      {currentUser?.id !== creator.id && (
                        <button
                          onClick={() => {
                            if (!currentUser) {
                              onRequireAuth('Log in to follow creators.');
                              return;
                            }
                            onToggleFollow(creator.id);
                          }}
                          className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center text-white shadow-md cursor-pointer ${
                            isFollowing ? 'bg-emerald-500' : 'bg-[#FF2D75]'
                          }`}
                        >
                          {isFollowing ? (
                            <Check className="w-3 h-3 stroke-[3]" />
                          ) : (
                            <Plus className="w-3.5 h-3.5 stroke-[3]" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Virtual Gift Button */}
                    <button
                      onClick={() => {
                        if (!currentUser) {
                          onRequireAuth('Log in to send virtual gifts.');
                          return;
                        }
                        onOpenGiftModal?.(creator as User, video);
                      }}
                      className="flex flex-col items-center gap-1 group cursor-pointer"
                      title="Send Virtual Gift"
                    >
                      <div className="w-11 h-11 rounded-full bg-black/45 backdrop-blur-md border border-amber-400/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Gift className="w-5 h-5 text-amber-400" />
                      </div>
                      <span className="text-[11px] font-mono tabular-nums font-bold text-amber-400 drop-shadow">
                        {video.giftEarningsCoins || 0}
                      </span>
                    </button>

                    {/* Like */}
                    <button
                      onClick={() => {
                        if (!currentUser) {
                          onRequireAuth('Log in to like videos.');
                          return;
                        }
                        onToggleLike(video.id);
                      }}
                      className="flex flex-col items-center gap-1 cursor-pointer"
                    >
                      <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center">
                        <Heart
                          className={`w-6 h-6 ${
                            isLiked ? 'text-[#FF2D75] fill-[#FF2D75]' : 'text-white'
                          }`}
                        />
                      </div>
                      <span className="text-xs font-mono tabular-nums font-semibold text-white drop-shadow">
                        {formatNumber(video.likes.length)}
                      </span>
                    </button>

                    {/* Comments */}
                    <button
                      onClick={() => onOpenComments(video)}
                      className="flex flex-col items-center gap-1 cursor-pointer"
                    >
                      <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-xs font-mono tabular-nums font-semibold text-white drop-shadow">
                        {formatNumber(videoCommentCount)}
                      </span>
                    </button>

                    {/* Bookmark */}
                    <button
                      onClick={() => {
                        if (!currentUser) {
                          onRequireAuth('Log in to save videos.');
                          return;
                        }
                        onToggleSave(video.id);
                        showToast(isSaved ? 'Removed from Favourites' : 'Saved to Favourites ☆');
                      }}
                      className="flex flex-col items-center gap-1 cursor-pointer"
                    >
                      <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center">
                        <Bookmark
                          className={`w-5 h-5 ${
                            isSaved ? 'text-amber-400 fill-amber-400' : 'text-white'
                          }`}
                        />
                      </div>
                      <span className="text-xs font-mono tabular-nums font-semibold text-white drop-shadow">
                        {formatNumber(video.saves.length)}
                      </span>
                    </button>

                    {/* Share */}
                    <button
                      onClick={() => setShareModalVideo(video)}
                      className="flex flex-col items-center gap-1 cursor-pointer"
                    >
                      <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center">
                        <Share2 className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-mono tabular-nums font-semibold text-white drop-shadow">
                        {formatNumber(video.shares)}
                      </span>
                    </button>

                    {/* More */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setMoreMenuVideoId(moreMenuVideoId === video.id ? null : video.id)
                        }
                        className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white cursor-pointer"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>

                      {moreMenuVideoId === video.id && (
                        <div className="absolute right-12 bottom-0 w-44 rounded-2xl bg-[#151515]/95 backdrop-blur-md border border-white/15 shadow-2xl p-1.5 text-xs text-white z-40">
                          <button
                            onClick={() => {
                              onReportVideo(video.id, 'Inappropriate video content');
                              setMoreMenuVideoId(null);
                              showToast('Video reported.');
                            }}
                            className="w-full px-3 py-2 rounded-xl hover:bg-white/10 flex items-center gap-2 text-amber-400 cursor-pointer"
                          >
                            <Flag className="w-3.5 h-3.5" />
                            <span>Report Video</span>
                          </button>
                          {currentUser && currentUser.id !== creator.id && (
                            <button
                              onClick={() => {
                                onBlockUser(creator.id);
                                setMoreMenuVideoId(null);
                                showToast(`Blocked @${creator.username}`);
                              }}
                              className="w-full px-3 py-2 rounded-xl hover:bg-white/10 flex items-center gap-2 text-red-400 cursor-pointer"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Block User</span>
                            </button>
                          )}
                          {currentUser &&
                            (currentUser.id === creator.id || currentUser.role === 'admin') && (
                              <button
                                onClick={() => {
                                  onDeleteVideo(video.id);
                                  setMoreMenuVideoId(null);
                                  showToast('Video deleted');
                                }}
                                className="w-full px-3 py-2 rounded-xl hover:bg-white/10 flex items-center gap-2 text-red-500 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete Video</span>
                              </button>
                            )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Video Details */}
                  <div className="absolute left-4 right-20 bottom-20 sm:bottom-6 z-20 text-white pointer-events-auto">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <button
                        onClick={() => onSelectUser(creator.id)}
                        className="font-display font-bold text-base hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>@{creator.username}</span>
                        {creator.verified && (
                          <BadgeCheck className="w-4 h-4 text-[#8B5CF6]" />
                        )}
                      </button>

                      {video.region && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-semibold">
                          📍 {video.region}
                        </span>
                      )}

                      {currentUser && currentUser.id !== creator.id && creator.isMonetized && (
                        <button
                          onClick={() => {
                            if (!currentUser) {
                              onRequireAuth('Log in to subscribe to creators.');
                              return;
                            }
                            onToggleSubscribe?.(creator.id);
                          }}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                            isSubscribed
                              ? 'bg-amber-400 text-black'
                              : 'bg-amber-400/20 text-amber-400 hover:bg-amber-400 hover:text-black'
                          }`}
                        >
                          <Award className="w-3 h-3" />
                          <span>{isSubscribed ? 'VIP Sub' : `Subscribe $${creator.subscriptionPrice || 4.99}`}</span>
                        </button>
                      )}

                      <span className="text-white/50">·</span>
                      <span className="text-xs font-mono tabular-nums text-white/80 flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-[#A78BFA]" />
                        {formatNumber(video.views)}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-white/95 leading-relaxed line-clamp-3 mb-2">
                      {renderRichCaption(video.caption)}
                    </p>

                    <button
                      onClick={() => onSelectSound(video.soundId)}
                      className="flex items-center gap-2 max-w-[260px] overflow-hidden text-xs text-white/90 hover:text-[#FF2D75] transition-colors cursor-pointer"
                    >
                      <Music className="w-3.5 h-3.5 text-[#FF2D75] shrink-0" />
                      <span className="truncate">
                        {video.soundTitle} — {video.soundArtist}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop Up/Down Navigation Controls */}
      <div className="hidden sm:flex flex-col gap-3 ml-4">
        <button
          onClick={() => scrollToIndex(activeIndex - 1)}
          disabled={activeIndex <= 0}
          className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 border border-white/10 flex items-center justify-center text-white transition-colors cursor-pointer"
          aria-label="Previous video"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        <button
          onClick={() => scrollToIndex(activeIndex + 1)}
          disabled={activeIndex >= visibleVideos.length - 1}
          className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 border border-white/10 flex items-center justify-center text-white transition-colors cursor-pointer"
          aria-label="Next video"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* Desktop Side Panel */}
      {activeVideo && activeCreator && (
        <div className="hidden xl:flex flex-col w-80 h-[calc(100%-24px)] ml-6 rounded-2xl bg-[#151515] border border-white/10 overflow-hidden text-white shrink-0">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => onSelectUser(activeCreator.id)}
                className="flex items-center gap-3 text-left min-w-0 cursor-pointer"
              >
                <img
                  src={activeCreator.avatar}
                  alt={activeCreator.displayName}
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-full object-cover shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-display font-bold text-sm truncate">
                      {activeCreator.displayName}
                    </span>
                    {activeCreator.verified && (
                      <BadgeCheck className="w-4 h-4 text-[#8B5CF6] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 truncate">@{activeCreator.username}</p>
                </div>
              </button>

              {currentUser?.id !== activeCreator.id && (
                <button
                  onClick={() => {
                    if (!currentUser) {
                      onRequireAuth('Log in to follow creators.');
                      return;
                    }
                    onToggleFollow(activeCreator.id);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                    currentUser?.following.includes(activeCreator.id)
                      ? 'bg-white/10 text-white'
                      : 'bg-[#FF2D75] text-white'
                  }`}
                >
                  {currentUser?.following.includes(activeCreator.id) ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
            <p className="text-xs text-zinc-300 mt-3 line-clamp-2">{activeCreator.bio}</p>
          </div>

          <div className="px-4 py-2.5 border-b border-white/10 flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300">
              Comments · {activeVideoComments.length}
            </span>
            <button
              onClick={() => onOpenComments(activeVideo)}
              className="text-xs text-[#A78BFA] hover:underline cursor-pointer"
            >
              Expand
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {activeVideoComments.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-8">
                No comments yet. Start the conversation!
              </p>
            ) : (
              activeVideoComments.map((c) => {
                const cUser = users.find((u) => u.id === c.userId) || users[0];
                return (
                  <div key={c.id} className="flex items-start gap-2.5">
                    <img
                      src={cUser.avatar}
                      alt={cUser.displayName}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-zinc-300">
                        @{cUser.username}
                      </span>
                      <p className="text-xs text-zinc-100 mt-0.5 break-words">{c.text}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!currentUser) {
                onRequireAuth('Log in to comment.');
                return;
              }
              if (!quickComment.trim()) return;
              onAddComment(activeVideo.id, quickComment.trim());
              setQuickComment('');
            }}
            className="p-3 border-t border-white/10 bg-[#0c0c0c] flex items-center gap-2"
          >
            <input
              type="text"
              value={quickComment}
              onChange={(e) => setQuickComment(e.target.value)}
              placeholder="Quick comment..."
              className="flex-1 px-3 py-2 rounded-xl bg-[#181818] border border-white/10 text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
            />
            <button
              type="submit"
              disabled={!quickComment.trim()}
              className="p-2 rounded-xl bg-[#8B5CF6] disabled:opacity-40 text-white cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Share Modal */}
      {shareModalVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 p-6 text-slate-900 dark:text-white shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-base">Share Video</h3>
              <button
                onClick={() => setShareModalVideo(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-3">Send directly in Private Messages:</p>
            <div className="grid grid-cols-4 gap-2 mb-5">
              {users
                .filter((u) => u.id !== currentUser?.id)
                .slice(0, 4)
                .map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      if (!currentUser) {
                        setShareModalVideo(null);
                        onRequireAuth('Log in to share videos in direct messages.');
                        return;
                      }
                      onShareToChat(shareModalVideo.id, u.id);
                      setShareModalVideo(null);
                      showToast(`Shared with @${u.username}!`);
                    }}
                    className="flex flex-col items-center p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <img
                      src={u.avatar}
                      alt={u.displayName}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover mb-1"
                    />
                    <span className="text-[10px] font-medium truncate w-full text-center">
                      @{u.username}
                    </span>
                  </button>
                ))}
            </div>

            <button
              onClick={() => {
                navigator.clipboard?.writeText(
                  `${window.location.origin}/?video=${shareModalVideo.id}`
                );
                onIncrementShare(shareModalVideo.id);
                setShareModalVideo(null);
                showToast('Video link copied to clipboard!');
              }}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Direct Link</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
