import React, { useState, useEffect } from 'react';
import {
  Radio,
  Users,
  Heart,
  Send,
  Flag,
  Plus,
  Check,
  ShieldAlert,
  Sparkles,
  BadgeCheck,
  Video as VideoIcon,
  StopCircle,
  Gift,
  Coins,
} from 'lucide-react';
import { LiveStream, User, VideoSceneType } from '../types';
import { VIDEO_CATEGORIES } from '../data/seedData';
import { CanvasVideoPlayer } from './CanvasVideoPlayer';

interface LiveStreamViewProps {
  liveStreams: LiveStream[];
  users: User[];
  currentUser: User | null;
  onSendLiveComment: (streamId: string, text: string) => void;
  onLikeLiveStream: (streamId: string) => void;
  onStartLiveStream: (title: string, category: string, sceneType: VideoSceneType) => LiveStream;
  onEndLiveStream: (streamId: string) => void;
  onToggleFollow: (targetUserId: string) => void;
  onReportLiveStream: (streamId: string, reason: string) => void;
  onSelectUser: (userId: string) => void;
  onOpenGiftModal?: (creator: User) => void;
  onRequireAuth: (reason: string) => void;
}

export const LiveStreamView: React.FC<LiveStreamViewProps> = ({
  liveStreams,
  users,
  currentUser,
  onSendLiveComment,
  onLikeLiveStream,
  onStartLiveStream,
  onEndLiveStream,
  onToggleFollow,
  onReportLiveStream,
  onSelectUser,
  onOpenGiftModal,
  onRequireAuth,
}) => {
  const activeStreams = liveStreams.filter((s) => s.isLive);
  const [selectedStreamId, setSelectedStreamId] = useState<string>(activeStreams[0]?.id || '');
  const [mode, setMode] = useState<'watch' | 'broadcast'>('watch');
  const [chatInput, setChatInput] = useState<string>('');
  const [floatingReactions, setFloatingReactions] = useState<{ id: number; left: number }[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [streamTitle, setStreamTitle] = useState<string>('LIVE Creator Studio Hangout ☆');
  const [streamCategory, setStreamCategory] = useState<string>('Music');
  const [streamScene, setStreamScene] = useState<VideoSceneType>('synth_studio');

  const currentStream =
    activeStreams.find((s) => s.id === selectedStreamId) || activeStreams[0] || null;
  const hostUser = currentStream
    ? users.find((u) => u.id === currentStream.hostId) || users[0]
    : null;

  useEffect(() => {
    if (!currentStream) return;
    const interval = window.setInterval(() => {
      setFloatingReactions((prev) => [
        ...prev.slice(-8),
        { id: Date.now() + Math.random(), left: 20 + Math.random() * 60 },
      ]);
    }, 2400);
    return () => window.clearInterval(interval);
  }, [currentStream]);

  const handleReactionTap = () => {
    if (!currentStream) return;
    onLikeLiveStream(currentStream.id);
    setFloatingReactions((prev) => [
      ...prev.slice(-10),
      { id: Date.now() + Math.random(), left: 30 + Math.random() * 50 },
    ]);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireAuth('Please log in to chat in live streams.');
      return;
    }
    if (!currentStream || !chatInput.trim()) return;
    onSendLiveComment(currentStream.id, chatInput.trim());
    setChatInput('');
  };

  const handleGoLive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireAuth('Please log in to go live.');
      return;
    }
    const created = onStartLiveStream(streamTitle, streamCategory, streamScene);
    setSelectedStreamId(created.id);
    setMode('watch');
    setToastMsg('You are now LIVE!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-50 dark:bg-[#080808] text-slate-900 dark:text-white pb-24 sm:pb-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF2D75]/15 border border-[#FF2D75]/30 flex items-center justify-center text-[#FF2D75]">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-2xl tracking-tight">
                ☆MEDIA LIVE Center
              </h1>
              <p className="text-xs text-slate-500">Real-time creator broadcasts & reactions.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode('watch')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                mode === 'watch'
                  ? 'bg-[#8B5CF6] text-white'
                  : 'bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10'
              }`}
            >
              Watch ({activeStreams.length})
            </button>
            <button
              onClick={() => setMode('broadcast')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                mode === 'broadcast'
                  ? 'bg-[#FF2D75] text-white'
                  : 'bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10'
              }`}
            >
              <VideoIcon className="w-3.5 h-3.5" />
              <span>Go Live Studio</span>
            </button>
          </div>
        </div>

        {toastMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-400">
            {toastMsg}
          </div>
        )}

        {mode === 'broadcast' ? (
          <div className="max-w-xl mx-auto p-6 rounded-3xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 space-y-4">
            <h2 className="font-display font-bold text-lg">Broadcast Setup</h2>
            <form onSubmit={handleGoLive} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Stream Title</label>
                <input
                  type="text"
                  required
                  value={streamTitle}
                  onChange={(e) => setStreamTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-white/10 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Category</label>
                  <select
                    value={streamCategory}
                    onChange={(e) => setStreamCategory(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-white/10 text-xs"
                  >
                    {VIDEO_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Visual Feed</label>
                  <select
                    value={streamScene}
                    onChange={(e) => setStreamScene(e.target.value as VideoSceneType)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-white/10 text-xs"
                  >
                    <option value="synth_studio">Synth Galaxy</option>
                    <option value="cyber_dance">Neon Stage</option>
                    <option value="tokyo_drift">Midnight Run</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF2D75] to-[#8B5CF6] text-white font-semibold text-sm cursor-pointer shadow-lg"
              >
                Go Live Now
              </button>
            </form>
          </div>
        ) : (
          currentStream && hostUser && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Stage */}
              <div className="lg:col-span-7 relative aspect-[9/16] max-h-[640px] mx-auto w-full max-w-[380px] rounded-3xl overflow-hidden bg-[#080808] border border-white/15 shadow-2xl">
                <CanvasVideoPlayer
                  sceneType={currentStream.sceneType}
                  isActive={true}
                  isMuted={false}
                  showControls={false}
                />

                <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-black/55 backdrop-blur-md p-1.5 pr-3 rounded-full border border-white/15">
                    <img
                      src={hostUser.avatar}
                      alt={hostUser.displayName}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <span className="text-xs font-bold text-white flex items-center gap-1">
                        @{hostUser.username}
                        {hostUser.verified && <BadgeCheck className="w-3 h-3 text-[#8B5CF6]" />}
                      </span>
                      <span className="text-[10px] text-zinc-300 flex items-center gap-1">
                        <Users className="w-3 h-3 text-emerald-400" />
                        {currentStream.viewerCount} watching
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-[#FF2D75] text-white text-[11px] font-bold animate-pulse">
                      LIVE
                    </span>
                    {(currentUser?.id === hostUser.id || currentUser?.role === 'admin') && (
                      <button
                        onClick={() => {
                          onEndLiveStream(currentStream.id);
                          setToastMsg('Live stream ended.');
                        }}
                        className="p-1.5 rounded-full bg-red-600/80 hover:bg-red-600 text-white cursor-pointer"
                        title="End Broadcast"
                      >
                        <StopCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {floatingReactions.map((r) => (
                  <div
                    key={r.id}
                    style={{ left: `${r.left}%` }}
                    className="absolute bottom-16 animate-float-up pointer-events-none"
                  >
                    <Heart className="w-6 h-6 text-[#FF2D75] fill-[#FF2D75]" />
                  </div>
                ))}

                <div className="absolute bottom-4 left-4 right-4 z-20 flex items-end justify-between text-white">
                  <div className="max-w-[70%]">
                    <span className="text-[11px] text-[#A78BFA] font-semibold">
                      {currentStream.category}
                    </span>
                    <h3 className="font-display font-bold text-sm leading-snug drop-shadow">
                      {currentStream.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (!currentUser) {
                          onRequireAuth('Please log in to send gifts to this live stream.');
                          return;
                        }
                        onOpenGiftModal?.(hostUser);
                      }}
                      className="w-11 h-11 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                      title="Send Virtual Gift"
                    >
                      <Gift className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleReactionTap}
                      className="w-11 h-11 rounded-full bg-[#FF2D75] text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                    >
                      <Heart className="w-5 h-5 fill-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Chat */}
              <div className="lg:col-span-5 flex flex-col h-[540px] lg:h-[640px] rounded-3xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                  <h3 className="font-display font-bold text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                    <span>Live Chat</span>
                  </h3>
                  <button
                    onClick={() => {
                      onReportLiveStream(currentStream.id, 'Reported broadcast');
                      setToastMsg('Report submitted.');
                      setTimeout(() => setToastMsg(null), 2000);
                    }}
                    className="text-xs text-slate-400 hover:text-amber-500 flex items-center gap-1 cursor-pointer"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Report</span>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {currentStream.chatMessages.map((msg) => (
                    <div key={msg.id} className="flex items-start gap-2.5">
                      <img
                        src={msg.avatar}
                        alt={msg.username}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                      />
                      <div>
                        <span className="text-xs font-bold text-[#8B5CF6]">@{msg.username}</span>
                        <p className="text-xs mt-0.5">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={handleChatSubmit}
                  className="p-3 border-t border-slate-200 dark:border-white/10 flex items-center gap-2"
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (!currentUser) {
                        onRequireAuth('Please log in to send gifts to this creator.');
                        return;
                      }
                      onOpenGiftModal?.(hostUser);
                    }}
                    className="p-2.5 rounded-full bg-amber-400/20 text-amber-500 hover:bg-amber-400 hover:text-black transition-colors cursor-pointer"
                    title="Send Gift"
                  >
                    <Gift className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Chat in stream..."
                    className="flex-1 px-4 py-2.5 rounded-full bg-slate-100 dark:bg-[#181818] border border-slate-200 dark:border-white/10 text-xs focus:outline-none focus:border-[#8B5CF6]"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="w-9 h-9 rounded-full bg-[#8B5CF6] disabled:opacity-40 text-white flex items-center justify-center cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};
