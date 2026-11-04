import React, { useState, useMemo } from 'react';
import {
  Search,
  Hash,
  Flame,
  Music,
  BadgeCheck,
  Play,
  Heart,
  Eye,
  X,
  Plus,
  Check,
  Sparkles,
  MapPin,
  Gift,
} from 'lucide-react';
import { SoundTrack, User, Video, VirtualGift } from '../types';
import { VIDEO_CATEGORIES } from '../data/seedData';
import { CanvasVideoPlayer } from './CanvasVideoPlayer';

interface DiscoverViewProps {
  videos: Video[];
  users: User[];
  sounds: SoundTrack[];
  currentUser: User | null;
  initialHashtagFilter?: string | null;
  initialSoundFilter?: string | null;
  onClearInitialFilters: () => void;
  onSelectUser: (userId: string) => void;
  onToggleFollow: (targetUserId: string) => void;
  onToggleLike: (videoId: string) => void;
  onUseSoundInStudio: (soundId: string) => void;
  onOpenGiftModal?: (creator: User, video?: Video) => void;
  onRequireAuth: (reason: string) => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  videos,
  users,
  sounds,
  currentUser,
  initialHashtagFilter,
  initialSoundFilter,
  onClearInitialFilters,
  onSelectUser,
  onToggleFollow,
  onToggleLike,
  onUseSoundInStudio,
  onOpenGiftModal,
  onRequireAuth,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>(
    initialHashtagFilter ? `#${initialHashtagFilter}` : ''
  );
  const [searchTab, setSearchTab] = useState<'top' | 'videos' | 'users' | 'hashtags' | 'sounds' | 'regional'>(
    initialSoundFilter ? 'sounds' : 'top'
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [regionFilter, setRegionFilter] = useState<'all' | 'uganda_ea'>('all');
  const [previewVideo, setPreviewVideo] = useState<Video | null>(null);
  const [playingSoundId, setPlayingSoundId] = useState<string | null>(initialSoundFilter || null);

  React.useEffect(() => {
    if (initialHashtagFilter) {
      setSearchQuery(`#${initialHashtagFilter}`);
      setSearchTab('top');
    }
  }, [initialHashtagFilter]);

  React.useEffect(() => {
    if (initialSoundFilter) {
      setSearchTab('sounds');
      setPlayingSoundId(initialSoundFilter);
    }
  }, [initialSoundFilter]);

  const hashtagStats = useMemo(() => {
    const map = new Map<string, { tag: string; views: number; count: number; videos: Video[] }>();
    videos.forEach((v) => {
      if (v.visibility !== 'public') return;
      v.hashtags.forEach((tag) => {
        const clean = tag.toLowerCase();
        const existing = map.get(clean) || { tag: clean, views: 0, count: 0, videos: [] };
        existing.views += v.views;
        existing.count += 1;
        existing.videos.push(v);
        map.set(clean, existing);
      });
    });
    return Array.from(map.values()).sort((a, b) => b.views - a.views);
  }, [videos]);

  const cleanQ = searchQuery.trim().toLowerCase().replace(/^#|^@/, '');

  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      if (v.visibility !== 'public') return false;
      if (regionFilter === 'uganda_ea' && v.region !== 'Uganda' && v.region !== 'East Africa') return false;
      if (selectedCategory !== 'All' && v.category !== selectedCategory) return false;
      if (!cleanQ) return true;
      const creator = users.find((u) => u.id === v.creatorId);
      return (
        v.caption.toLowerCase().includes(cleanQ) ||
        v.hashtags.some((h) => h.toLowerCase().includes(cleanQ)) ||
        v.category.toLowerCase().includes(cleanQ) ||
        (v.region && v.region.toLowerCase().includes(cleanQ)) ||
        creator?.username.toLowerCase().includes(cleanQ) ||
        creator?.displayName.toLowerCase().includes(cleanQ)
      );
    });
  }, [videos, users, selectedCategory, regionFilter, cleanQ]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (regionFilter === 'uganda_ea' && u.region !== 'Uganda' && u.region !== 'East Africa') return false;
      if (!cleanQ) return true;
      return (
        u.username.toLowerCase().includes(cleanQ) ||
        u.displayName.toLowerCase().includes(cleanQ) ||
        u.bio.toLowerCase().includes(cleanQ) ||
        (u.region && u.region.toLowerCase().includes(cleanQ))
      );
    });
  }, [users, regionFilter, cleanQ]);

  const filteredSounds = useMemo(() => {
    return sounds.filter((s) => {
      if (regionFilter === 'uganda_ea' && s.region !== 'Uganda' && s.region !== 'East Africa') return false;
      if (!cleanQ) return true;
      return (
        s.title.toLowerCase().includes(cleanQ) ||
        s.artist.toLowerCase().includes(cleanQ) ||
        s.category.toLowerCase().includes(cleanQ) ||
        (s.region && s.region.toLowerCase().includes(cleanQ))
      );
    });
  }, [sounds, regionFilter, cleanQ]);

  const formatNum = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-50 dark:bg-[#080808] text-slate-900 dark:text-white pb-24 sm:pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Search Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight">
              Discover & Explore
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
              Trending hashtags, creators, original sounds, and East Africa regional spotlights.
            </p>
          </div>

          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (initialHashtagFilter) onClearInitialFilters();
              }}
              placeholder="Search videos, creators, #UgandaTok, sounds..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:border-[#8B5CF6] shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  onClearInitialFilters();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Regional Focus Banner / Toggle (Uganda & East Africa) */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-[#10b981]/15 via-[#8B5CF6]/15 to-[#FF2D75]/15 border border-emerald-500/25">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              🇺🇬
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Uganda & East Africa Discovery Hub</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500 text-white font-bold uppercase">
                  Featured
                </span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Explore creators, Afrobeats sounds, and viral culture from Kampala and beyond.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setRegionFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                regionFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-sm'
                  : 'bg-white/80 dark:bg-white/10 text-slate-600 dark:text-zinc-300'
              }`}
            >
              Global Feed
            </button>
            <button
              onClick={() => setRegionFilter('uganda_ea')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                regionFilter === 'uganda_ea'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-white/80 dark:bg-white/10 text-slate-600 dark:text-zinc-300'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Uganda & EA Spotlight</span>
            </button>
          </div>
        </div>

        {/* Search Type Tabs */}
        <div className="flex items-center justify-between gap-4 flex-wrap border-b border-slate-200 dark:border-white/10 pb-3">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/70 dark:bg-[#151515]">
            {(['top', 'videos', 'users', 'hashtags', 'sounds'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSearchTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                  searchTab === tab
                    ? 'bg-white dark:bg-[#8B5CF6] text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Categories Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {VIDEO_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#FF2D75] text-white'
                    : 'bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Creators */}
        {(searchTab === 'top' || searchTab === 'users') && (
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
              <span>Recommended Creators</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredUsers.map((creator) => {
                const isFollowing = currentUser
                  ? currentUser.following.includes(creator.id)
                  : false;

                return (
                  <div
                    key={creator.id}
                    className="p-4 rounded-2xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 flex items-center justify-between gap-3 shadow-sm hover:border-[#8B5CF6]/50 transition-colors"
                  >
                    <button
                      onClick={() => onSelectUser(creator.id)}
                      className="flex items-center gap-3 text-left min-w-0 flex-1 cursor-pointer"
                    >
                      <img
                        src={creator.avatar}
                        alt={creator.displayName}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-full object-cover bg-slate-800 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-display font-bold text-sm truncate">
                            {creator.displayName}
                          </span>
                          {creator.verified && (
                            <BadgeCheck className="w-4 h-4 text-[#8B5CF6] shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          @{creator.username} · {creator.followers.length} followers
                          {creator.region ? ` · ${creator.region}` : ''}
                        </p>
                      </div>
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
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer ${
                          isFollowing
                            ? 'bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white'
                            : 'bg-[#FF2D75] text-white'
                        }`}
                      >
                        {isFollowing ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Following</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Follow</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Trending Hashtags */}
        {(searchTab === 'top' || searchTab === 'hashtags') && (
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg flex items-center gap-2">
              <Hash className="w-4 h-4 text-[#FF2D75]" />
              <span>Trending Hashtags</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {hashtagStats.slice(0, 12).map((item) => (
                <button
                  key={item.tag}
                  onClick={() => setSearchQuery(`#${item.tag}`)}
                  className={`px-3.5 py-2 rounded-xl border text-left cursor-pointer flex items-center gap-2.5 ${
                    cleanQ === item.tag
                      ? 'bg-[#8B5CF6] text-white border-[#8B5CF6]'
                      : 'bg-white dark:bg-[#151515] border-slate-200 dark:border-white/10 hover:border-[#8B5CF6]'
                  }`}
                >
                  <span className="text-xs font-bold">#{item.tag}</span>
                  <span className="text-[11px] font-mono opacity-75">
                    {formatNum(item.views)} views
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Sounds */}
        {(searchTab === 'top' || searchTab === 'sounds') && (
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg flex items-center gap-2">
              <Music className="w-4 h-4 text-[#8B5CF6]" />
              <span>Trending Audio Library & Afrobeats</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredSounds.map((sound) => {
                const isPreviewing = playingSoundId === sound.id;
                return (
                  <div
                    key={sound.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => setPlayingSoundId(isPreviewing ? null : sound.id)}
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 cursor-pointer ${
                          isPreviewing
                            ? 'bg-[#FF2D75] text-white'
                            : 'bg-[#8B5CF6]/15 text-[#8B5CF6]'
                        }`}
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-bold truncate">{sound.title}</p>
                          {sound.region && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-500 font-semibold shrink-0">
                              {sound.region}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          {sound.artist} · {sound.category} · {formatNum(sound.usageCount)} clips
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onUseSoundInStudio(sound.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-[#8B5CF6] hover:text-white text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                    >
                      Use Sound
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Videos Grid */}
        {(searchTab === 'top' || searchTab === 'videos' || searchTab === 'hashtags') && (
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#FF2D75]" />
              <span>
                {regionFilter === 'uganda_ea' ? 'Uganda & East Africa Trending' : 'Trending Videos'}
              </span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredVideos.map((v) => {
                const creator = users.find((u) => u.id === v.creatorId) || users[0];
                return (
                  <div
                    key={v.id}
                    onClick={() => setPreviewVideo(v)}
                    className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-[#080808] border border-slate-200 dark:border-white/10 cursor-pointer shadow-md hover:border-[#8B5CF6] transition-all"
                  >
                    <CanvasVideoPlayer
                      sceneType={v.sceneType}
                      videoUrl={v.videoUrl}
                      filter={v.filter}
                      isActive={false}
                      isMuted={true}
                      showControls={false}
                      compact={true}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent p-3 flex flex-col justify-between text-white">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-emerald-400">
                          {v.region ? `📍 ${v.region}` : v.category}
                        </span>
                        <span className="font-mono tabular-nums flex items-center gap-1">
                          <Eye className="w-3 h-3 text-[#A78BFA]" />
                          {formatNum(v.views)}
                        </span>
                      </div>

                      <div>
                        <p className="text-xs line-clamp-2 font-medium mb-2">{v.caption}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold truncate">
                            @{creator.username}
                          </span>
                          <span className="text-[11px] font-mono tabular-nums flex items-center gap-1 text-[#FF2D75]">
                            <Heart className="w-3 h-3 fill-current" />
                            {v.likes.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-[380px] aspect-[9/16] rounded-3xl overflow-hidden bg-[#080808] border border-white/15 shadow-2xl">
            <CanvasVideoPlayer
              sceneType={previewVideo.sceneType}
              videoUrl={previewVideo.videoUrl}
              filter={previewVideo.filter}
              watermark={previewVideo.watermark}
              soundId={previewVideo.soundId}
              isActive={true}
              isMuted={false}
              trimStart={previewVideo.trimStart}
              trimEnd={previewVideo.trimEnd}
              duration={previewVideo.duration}
              onDoubleTapLike={() => onToggleLike(previewVideo.id)}
            />
            <button
              onClick={() => setPreviewVideo(null)}
              className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Gift button inside preview */}
            <div className="absolute right-4 bottom-16 z-30">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const targetUser = users.find((u) => u.id === previewVideo.creatorId);
                  if (targetUser) {
                    onOpenGiftModal?.(targetUser, previewVideo);
                  }
                }}
                className="w-11 h-11 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer"
                title="Send Gift"
              >
                <Gift className="w-5 h-5 fill-current" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
