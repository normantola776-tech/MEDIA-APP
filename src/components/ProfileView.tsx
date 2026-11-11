import React, { useState } from 'react';
import {
  BadgeCheck,
  Settings,
  Share2,
  Edit3,
  Heart,
  Bookmark,
  Grid,
  Calendar,
  MessageSquare,
  UserPlus,
  UserCheck,
  Ban,
  Trash2,
  Eye,
  X,
  Download,
  Moon,
  Sun,
  LogOut,
  Shield,
  Lock,
  DollarSign,
  Gift,
  Coins,
  Camera,
  Upload,
} from 'lucide-react';
import { User, Video } from '../types';
import { CanvasVideoPlayer } from './CanvasVideoPlayer';

const AVATAR_PRESETS = [
  'https://api.dicebear.com/9.x/avataaars/svg?seed=StarCreator1&backgroundColor=8b5cf6',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=StarCreator2&backgroundColor=ff2d75',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=StarCreator3&backgroundColor=0ea5e9',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=StarCreator4&backgroundColor=10b981',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=StarCreator5&backgroundColor=f59e0b',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=AlexNova&backgroundColor=6366f1',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=MiaKinetics&backgroundColor=ec4899',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=KampalaRhythm&backgroundColor=14b8a6',
];

interface ProfileViewProps {
  profileUser: User;
  currentUser: User | null;
  users: User[];
  videos: Video[];
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onUpdateProfile: (updates: Partial<User>) => void;
  onToggleFollow: (targetUserId: string) => void;
  onToggleBlock: (targetUserId: string) => void;
  onDeleteVideo: (videoId: string) => void;
  onMessageUser: (targetUserId: string) => void;
  onSelectUser: (userId: string) => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
  onOpenAdmin: () => void;
  onOpenCreatorStudio?: () => void;
  onOpenGiftModal?: (creator: User) => void;
  onRequireAuth: (reason: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profileUser,
  currentUser,
  users,
  videos,
  isDarkMode,
  onToggleTheme,
  onUpdateProfile,
  onToggleFollow,
  onToggleBlock,
  onDeleteVideo,
  onMessageUser,
  onSelectUser,
  onLogout,
  onDeleteAccount,
  onOpenAdmin,
  onOpenCreatorStudio,
  onOpenGiftModal,
  onRequireAuth,
}) => {
  const isOwnProfile = currentUser?.id === profileUser.id;
  const [activeTab, setActiveTab] = useState<'videos' | 'liked' | 'saved'>('videos');
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [editDisplayName, setEditDisplayName] = useState(profileUser.displayName);
  const [editUsername, setEditUsername] = useState(profileUser.username);
  const [editBio, setEditBio] = useState(profileUser.bio);
  const [editAvatar, setEditAvatar] = useState(profileUser.avatar);
  const avatarFileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const uploadedVideos = videos.filter(
    (v) => v.creatorId === profileUser.id && (isOwnProfile || v.visibility === 'public')
  );
  const likedVideos = videos.filter((v) => v.likes.includes(profileUser.id));
  const savedVideos = videos.filter((v) => v.saves.includes(profileUser.id));

  const displayedVideos =
    activeTab === 'videos'
      ? uploadedVideos
      : activeTab === 'liked'
      ? likedVideos
      : savedVideos;

  const isFollowing = currentUser ? currentUser.following.includes(profileUser.id) : false;
  const isBlocked = currentUser ? currentUser.blockedUsers.includes(profileUser.id) : false;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      avatar: editAvatar,
      displayName: editDisplayName.trim() || profileUser.displayName,
      username: editUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') || profileUser.username,
      bio: editBio.trim(),
    });
    setEditModalOpen(false);
    showToast('Profile and avatar updated!');
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-50 dark:bg-[#080808] text-slate-900 dark:text-white pb-24 sm:pb-12">
      {toastMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#8B5CF6] text-white text-xs font-semibold shadow-xl">
          {toastMsg}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Profile Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-[#8B5CF6] to-[#FF2D75] shrink-0 group">
              <img
                src={profileUser.avatar}
                alt={profileUser.displayName}
                referrerPolicy="no-referrer"
                className="w-full h-full rounded-full object-cover bg-[#080808]"
              />
              {isOwnProfile && (
                <button
                  type="button"
                  onClick={() => setEditModalOpen(true)}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#FF2D75] text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-[#151515] cursor-pointer hover:scale-110 transition-transform"
                  title="Change profile avatar"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-1.5">
                    <h1 className="font-display font-extrabold text-xl sm:text-2xl truncate">
                      {profileUser.displayName}
                    </h1>
                    {profileUser.verified && (
                      <BadgeCheck className="w-5 h-5 text-[#8B5CF6] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500">@{profileUser.username}</p>
                </div>

                <div className="flex items-center justify-center sm:justify-end gap-2 flex-wrap">
                  {isOwnProfile ? (
                    <>
                      <button
                        onClick={onOpenCreatorStudio}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-[#8B5CF6] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Studio & Earnings</span>
                      </button>
                      <button
                        onClick={() => setEditModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => setSettingsModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Settings</span>
                      </button>
                      {profileUser.role === 'admin' && (
                        <button
                          onClick={onOpenAdmin}
                          className="px-4 py-2 rounded-xl bg-[#8B5CF6] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          <span>Admin</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      {profileUser.isMonetized && (
                        <button
                          onClick={() => {
                            if (!currentUser) {
                              onRequireAuth('Log in to send gifts.');
                              return;
                            }
                            onOpenGiftModal?.(profileUser);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-amber-400 text-black text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-105 transition-transform"
                        >
                          <Gift className="w-3.5 h-3.5" />
                          <span>Gift</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (!currentUser) {
                            onRequireAuth('Log in to follow creators.');
                            return;
                          }
                          onToggleFollow(profileUser.id);
                        }}
                        className={`px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                          isFollowing
                            ? 'bg-slate-100 dark:bg-white/10'
                            : 'bg-gradient-to-r from-[#8B5CF6] to-[#FF2D75] text-white'
                        }`}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                      <button
                        onClick={() => {
                          if (!currentUser) {
                            onRequireAuth('Log in to message creators.');
                            return;
                          }
                          onMessageUser(profileUser.id);
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 text-xs font-semibold cursor-pointer"
                      >
                        Message
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-center sm:justify-start gap-6 my-4">
                <div>
                  <span className="font-extrabold text-lg font-mono">
                    {profileUser.following.length}
                  </span>
                  <span className="text-xs text-slate-500 ml-1.5">Following</span>
                </div>
                <div>
                  <span className="font-extrabold text-lg font-mono">
                    {profileUser.followers.length}
                  </span>
                  <span className="text-xs text-slate-500 ml-1.5">Followers</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-200">
                {profileUser.bio}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-slate-200 dark:border-white/10">
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-6 py-3 text-xs font-bold flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'videos'
                ? 'border-[#8B5CF6] text-[#8B5CF6]'
                : 'border-transparent text-slate-500'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Videos ({uploadedVideos.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('liked')}
            className={`px-6 py-3 text-xs font-bold flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'liked'
                ? 'border-[#FF2D75] text-[#FF2D75]'
                : 'border-transparent text-slate-500'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Liked ({likedVideos.length})</span>
          </button>
          {isOwnProfile && (
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-6 py-3 text-xs font-bold flex items-center gap-2 border-b-2 cursor-pointer ${
                activeTab === 'saved'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-500'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Saved ({savedVideos.length})</span>
            </button>
          )}
        </div>

        {/* Video Gallery */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {displayedVideos.map((v) => (
            <div
              key={v.id}
              onClick={() => setSelectedVideo(v)}
              className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-[#080808] border border-slate-200 dark:border-white/10 cursor-pointer shadow-md"
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent p-3 flex flex-col justify-end text-white">
                <p className="text-xs line-clamp-2 mb-1">{v.caption}</p>
                <div className="flex items-center justify-between text-[11px] font-mono text-white/90">
                  <span>{v.views} views</span>
                  <span className="flex items-center gap-1 text-[#FF2D75]">
                    <Heart className="w-3 h-3 fill-current" />
                    {v.likes.length}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 p-6 text-slate-900 dark:text-white shadow-2xl">
            <h3 className="font-display font-bold text-lg mb-4">Edit Profile</h3>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Profile Photo / Avatar Editor */}
              <div>
                <label className="block text-xs font-semibold mb-2">Profile Photo / Avatar</label>
                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10">
                  <div className="relative w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-[#8B5CF6] to-[#FF2D75] shrink-0">
                    <img
                      src={editAvatar}
                      alt="Avatar Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full rounded-full object-cover bg-black"
                    />
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => avatarFileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#FF2D75] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo</span>
                      </button>
                      <input
                        ref={avatarFileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              if (ev.target?.result) {
                                setEditAvatar(ev.target.result as string);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const randomSeed = Math.random().toString(36).slice(2, 8);
                          setEditAvatar(`https://api.dicebear.com/9.x/avataaars/svg?seed=${randomSeed}&backgroundColor=8b5cf6`);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-white/10 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-300 dark:hover:bg-white/20 cursor-pointer"
                        title="Generate random creator avatar"
                      >
                        🎲 Random
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">
                      PNG, JPG, WebP or SVG format supported.
                    </span>
                  </div>
                </div>

                {/* Avatar Presets Grid */}
                <div className="mt-2.5">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">
                    Or choose from Creator Avatar Presets:
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setEditAvatar(preset)}
                        className={`w-9 h-9 rounded-full p-0.5 shrink-0 transition-transform cursor-pointer ${
                          editAvatar === preset
                            ? 'ring-2 ring-[#FF2D75] scale-110'
                            : 'opacity-70 hover:opacity-100 hover:scale-105'
                        }`}
                      >
                        <img
                          src={preset}
                          alt={`Preset ${idx + 1}`}
                          className="w-full h-full rounded-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-white/10 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-white/10 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-white/10 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-white/10 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#FF2D75] text-white text-xs font-semibold cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {settingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 p-6 space-y-4">
            <h3 className="font-display font-bold text-lg">Settings</h3>
            <button
              onClick={onToggleTheme}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 text-xs font-semibold cursor-pointer"
            >
              Toggle {isDarkMode ? 'Light' : 'Dark'} Mode
            </button>
            <button
              onClick={() => {
                setSettingsModalOpen(false);
                onLogout();
              }}
              className="w-full py-2.5 rounded-xl bg-red-500/15 text-red-500 text-xs font-semibold cursor-pointer"
            >
              Log Out
            </button>
            <button
              onClick={() => setSettingsModalOpen(false)}
              className="w-full py-2 text-xs text-slate-400 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="relative w-full max-w-[380px] aspect-[9/16] rounded-3xl overflow-hidden bg-[#080808] border border-white/15 shadow-2xl">
            <CanvasVideoPlayer
              sceneType={selectedVideo.sceneType}
              videoUrl={selectedVideo.videoUrl}
              filter={selectedVideo.filter}
              watermark={selectedVideo.watermark}
              soundId={selectedVideo.soundId}
              isActive={true}
              isMuted={false}
              trimStart={selectedVideo.trimStart}
              trimEnd={selectedVideo.trimEnd}
              duration={selectedVideo.duration}
              playbackSpeed={selectedVideo.playbackSpeed}
              clipVolume={selectedVideo.clipVolume}
              bgMusicVolume={selectedVideo.bgMusicVolume}
              customAudioUrl={selectedVideo.customAudioUrl}
              transitionEffect={selectedVideo.transitionEffect}
              transitionDuration={selectedVideo.transitionDuration}
            />
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
