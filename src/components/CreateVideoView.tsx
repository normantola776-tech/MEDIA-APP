import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Camera,
  Sparkles,
  Music,
  Scissors,
  Eye,
  Save,
  Trash2,
  CheckCircle2,
  Hash,
  AtSign,
  Film,
  StopCircle,
  Play,
  RotateCcw,
  Clock,
  Sliders,
  SlidersHorizontal,
  ChevronRight,
  Maximize2,
  Wand2,
  Layers,
  Check,
  Palette,
  Type,
  Image as ImageIcon,
  Stamp,
  Move,
  ShieldCheck,
  Award,
} from 'lucide-react';
import {
  DraftVideo,
  SoundTrack,
  User,
  Video,
  VideoFilterType,
  VideoSceneType,
  VideoVisibility,
  VideoWatermark,
  WatermarkPosition,
  WatermarkStyle,
  WatermarkType,
} from '../types';
import { VIDEO_CATEGORIES } from '../data/seedData';
import { CanvasVideoPlayer, getVideoFilterStyle, VideoWatermarkOverlay } from './CanvasVideoPlayer';

interface CreateVideoViewProps {
  currentUser: User | null;
  sounds: SoundTrack[];
  drafts: DraftVideo[];
  preselectedSoundId?: string | null;
  onPublishVideo: (newVideo: Video) => void;
  onSaveDraft: (draft: DraftVideo) => void;
  onDeleteDraft: (draftId: string) => void;
  onRequireAuth: (reason: string) => void;
}

const STUDIO_SCENES: { id: VideoSceneType; label: string; color: string }[] = [
  { id: 'cyber_dance', label: 'Neon Stage', color: '#FF2D75' },
  { id: 'tokyo_drift', label: 'Midnight Run', color: '#38BDF8' },
  { id: 'synth_studio', label: 'Synth Galaxy', color: '#8B5CF6' },
  { id: 'culinary_fire', label: 'Wok Flame', color: '#F59E0B' },
  { id: 'alpine_drone', label: 'Alpine FPV', color: '#10B981' },
  { id: 'street_skate', label: 'Sunset Skate', color: '#EC4899' },
  { id: 'shader_art', label: 'Sacred Shader', color: '#6366F1' },
];

export type FilterCategory = 'All' | 'Vibrant' | 'Monochrome' | 'Retro' | 'Cinematic';

export interface VisualFilterItem {
  id: VideoFilterType;
  label: string;
  category: FilterCategory;
  description: string;
  badge: string;
  swatchGradient: string;
}

export const VISUAL_FILTERS: VisualFilterItem[] = [
  {
    id: 'none',
    label: 'Original',
    category: 'All',
    description: 'Clean raw video with natural color balance',
    badge: 'RAW',
    swatchGradient: 'from-slate-600 to-slate-400',
  },
  {
    id: 'grayscale',
    label: 'Grayscale',
    category: 'Monochrome',
    description: 'Crisp studio black & white with smooth tonal roll-off',
    badge: 'B&W',
    swatchGradient: 'from-zinc-900 via-zinc-600 to-zinc-300',
  },
  {
    id: 'sepia',
    label: 'Sepia',
    category: 'Retro',
    description: 'Warm antique bronze and nostalgic timeless glow',
    badge: '1890s',
    swatchGradient: 'from-amber-900 via-amber-600 to-yellow-200',
  },
  {
    id: 'vivid',
    label: 'Vivid Pop',
    category: 'Vibrant',
    description: 'Boosted saturation & punchy colors for high-energy clips',
    badge: 'POP',
    swatchGradient: 'from-[#FF2D75] via-[#8B5CF6] to-[#06B6D4]',
  },
  {
    id: 'cyber',
    label: 'Cyberpunk',
    category: 'Cinematic',
    description: 'Electric neon violet & magenta tint for nightlife atmosphere',
    badge: 'NEON',
    swatchGradient: 'from-purple-600 via-pink-500 to-cyan-400',
  },
  {
    id: 'noir',
    label: 'Noir Cinema',
    category: 'Monochrome',
    description: 'Deep theatrical black shadows with hard dramatic highlights',
    badge: 'NOIR',
    swatchGradient: 'from-black via-zinc-800 to-white',
  },
  {
    id: 'warm',
    label: 'Golden Hour',
    category: 'Cinematic',
    description: 'Sun-drenched sunset warmth with soft radiant skin glow',
    badge: 'GOLD',
    swatchGradient: 'from-amber-600 via-orange-500 to-yellow-300',
  },
  {
    id: 'cool',
    label: 'Cool Glacier',
    category: 'Cinematic',
    description: 'Crisp glacial cyan & deep oceanic blue styling',
    badge: 'COOL',
    swatchGradient: 'from-blue-700 via-cyan-500 to-sky-300',
  },
  {
    id: 'vintage',
    label: 'Vintage 90s',
    category: 'Retro',
    description: 'Authentic 90s camcorder film emulation with lifted blacks',
    badge: 'FILM',
    swatchGradient: 'from-stone-700 via-amber-800 to-stone-400',
  },
  {
    id: 'dramatic',
    label: 'Dramatic HDR',
    category: 'Cinematic',
    description: 'High-contrast cinema curve with vivid punch & rich shadows',
    badge: 'HDR',
    swatchGradient: 'from-indigo-900 via-rose-700 to-amber-400',
  },
  {
    id: 'emerald',
    label: 'Emerald Lush',
    category: 'Vibrant',
    description: 'Tropical rainforest jade with intense botanical vibrance',
    badge: 'LUSH',
    swatchGradient: 'from-emerald-900 via-emerald-500 to-teal-300',
  },
];

export const WATERMARK_LOGO_PRESETS: {
  id: string;
  name: string;
  presetKey: string;
  description: string;
  badge: string;
}[] = [
  {
    id: 'starmedia',
    name: 'StarMedia Hologram',
    presetKey: 'preset:starmedia',
    description: 'Official cyberpunk holographic brand logo',
    badge: 'STAR',
  },
  {
    id: 'verified',
    name: 'Verified Creator',
    presetKey: 'preset:verified',
    description: 'Gold star certified authentic stamp',
    badge: 'VERIFIED',
  },
  {
    id: 'exclusive',
    name: 'Exclusive Premiere',
    presetKey: 'preset:exclusive',
    description: 'Vibrant neon premiere ribbon badge',
    badge: 'EXCLUSIVE',
  },
  {
    id: 'copyright',
    name: 'Copyright Protected',
    presetKey: 'preset:copyright',
    description: 'Clean monochrome all-rights-reserved seal',
    badge: 'LEGAL',
  },
];

export const WATERMARK_COLOR_SWATCHES = [
  { name: 'Crisp White', value: '#FFFFFF' },
  { name: 'Star Pink', value: '#FF2D75' },
  { name: 'Neon Violet', value: '#8B5CF6' },
  { name: 'Glacier Cyan', value: '#38BDF8' },
  { name: 'Gold Amber', value: '#F59E0B' },
  { name: 'Slate Gray', value: '#94A3B8' },
];

export const WATERMARK_TEXT_STYLES: { id: WatermarkStyle; label: string; desc: string }[] = [
  { id: 'shadow', label: 'Shadow', desc: 'Clean high-contrast drop shadow' },
  { id: 'pill', label: 'Frosted Pill', desc: 'Glassmorphic frosted rounded pill' },
  { id: 'solid', label: 'Dark Solid', desc: 'Deep black background with sharp contrast' },
  { id: 'glow', label: 'Neon Glow', desc: 'Electric magenta vibrant backlight glow' },
  { id: 'outline', label: 'Outlined', desc: 'Bordered athletic badge with translucency' },
];

export const CreateVideoView: React.FC<CreateVideoViewProps> = ({
  currentUser,
  sounds,
  drafts,
  preselectedSoundId,
  onPublishVideo,
  onSaveDraft,
  onDeleteDraft,
  onRequireAuth,
}) => {
  const [sourceMode, setSourceMode] = useState<'studio' | 'upload' | 'camera'>('studio');
  const [sceneType, setSceneType] = useState<VideoSceneType>('cyber_dance');
  const [uploadedUrl, setUploadedUrl] = useState<string | undefined>(undefined);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [hashtagInput, setHashtagInput] = useState<string>('starmedia viral');
  const [category, setCategory] = useState<string>('Dance');
  const [soundId, setSoundId] = useState<string>(preselectedSoundId || sounds[0]?.id || 'snd-1');
  const [filter, setFilter] = useState<VideoFilterType>('none');
  const [filterIntensity, setFilterIntensity] = useState<number>(100);
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('All');
  const [isComparingOriginal, setIsComparingOriginal] = useState<boolean>(false);

  // Watermark customization state
  const [watermark, setWatermark] = useState<VideoWatermark>({
    type: 'none',
    text: `@${currentUser?.username || 'creator'}`,
    imageUrl: 'preset:starmedia',
    position: 'bottom-right',
    opacity: 85,
    scale: 1,
    color: '#FFFFFF',
    style: 'shadow',
    includeBrandIcon: true,
  });
  const [watermarkUploadName, setWatermarkUploadName] = useState<string | null>(null);
  const watermarkFileInputRef = useRef<HTMLInputElement | null>(null);

  // Video duration & trimming controls
  const [rawDuration, setRawDuration] = useState<number>(15);
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(15);
  const [currentPlayheadTime, setCurrentPlayheadTime] = useState<number>(0);
  const [isTrimLocked, setIsTrimLocked] = useState<boolean>(false);

  const [visibility, setVisibility] = useState<VideoVisibility>('public');
  const [previewMuted, setPreviewMuted] = useState<boolean>(false);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  // Camera recording states
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordSeconds, setRecordSeconds] = useState<number>(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (preselectedSoundId) {
      setSoundId(preselectedSoundId);
    }
  }, [preselectedSoundId]);

  // Clean up camera stream
  useEffect(() => {
    if (sourceMode !== 'camera' && cameraVideoRef.current?.srcObject) {
      const stream = cameraVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      cameraVideoRef.current.srcObject = null;
    }
  }, [sourceMode]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setStatusBanner('Please select a valid MP4, MOV, or WebM video file.');
      return;
    }
    const blobUrl = URL.createObjectURL(file);
    setUploadedUrl(blobUrl);
    setUploadedFileName(file.name);
    setSceneType('uploaded_video');

    // Probe duration from uploaded video
    const tempVid = document.createElement('video');
    tempVid.src = blobUrl;
    tempVid.onloadedmetadata = () => {
      const vidDur = Math.round(tempVid.duration) || 15;
      const safeDur = Math.max(3, Math.min(180, vidDur));
      setRawDuration(safeDur);
      setTrimStart(0);
      setTrimEnd(safeDur);
      setStatusBanner(`Loaded "${file.name}" (${safeDur}s total duration). Use the trimmer below to crop.`);
    };
  };

  const startCameraPreview = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 720, height: 1280 },
        audio: true,
      });
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
        cameraVideoRef.current.play().catch(() => {});
      }
    } catch {
      setCameraError(
        'Camera hardware unavailable in this browser sandbox. Using Studio Virtual Camera feed so you can still record and publish!'
      );
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      } else {
        const dur = Math.max(3, recordSeconds);
        setRawDuration(dur);
        setTrimStart(0);
        setTrimEnd(dur);
        setStatusBanner(`Recorded ${recordSeconds}s clip ready to edit & trim!`);
      }
      return;
    }

    setRecordSeconds(0);
    setIsRecording(true);
    const stream = cameraVideoRef.current?.srcObject as MediaStream | null;
    if (stream && typeof MediaRecorder !== 'undefined') {
      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) recordedChunksRef.current.push(ev.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setUploadedUrl(url);
        setUploadedFileName('camera_capture.webm');
        setSceneType('uploaded_video');
        const dur = Math.max(3, recordSeconds);
        setRawDuration(dur);
        setTrimStart(0);
        setTrimEnd(dur);
        setStatusBanner('Camera recording captured! Adjust start and end points below.');
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
    }
  };

  useEffect(() => {
    if (!isRecording) return;
    const timer = window.setInterval(() => {
      setRecordSeconds((s) => {
        if (s >= 60) {
          setIsRecording(false);
          return 60;
        }
        return s + 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isRecording]);

  // Trim value adjustments with clamping
  const handleStartChange = (val: number) => {
    const clamped = Math.max(0, Math.min(val, trimEnd - 1));
    setTrimStart(clamped);
  };

  const handleEndChange = (val: number) => {
    const clamped = Math.max(trimStart + 1, Math.min(val, rawDuration));
    setTrimEnd(clamped);
  };

  const applyPreset = (type: 'full' | 'first5' | 'first10' | 'last10') => {
    if (type === 'full') {
      setTrimStart(0);
      setTrimEnd(rawDuration);
    } else if (type === 'first5') {
      setTrimStart(0);
      setTrimEnd(Math.min(5, rawDuration));
    } else if (type === 'first10') {
      setTrimStart(0);
      setTrimEnd(Math.min(10, rawDuration));
    } else if (type === 'last10') {
      setTrimStart(Math.max(0, rawDuration - 10));
      setTrimEnd(rawDuration);
    }
  };

  const parseTags = () =>
    hashtagInput
      .split(/[\s,#]+/)
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireAuth('Please log in to publish videos.');
      return;
    }
    const selectedSound = sounds.find((s) => s.id === soundId) || sounds[0];
    const tags = parseTags();
    const mentions = (caption.match(/@([a-zA-Z0-9_]+)/g) || []).map((m) => m.slice(1));
    const tagString = tags.map((t) => `#${t}`).join(' ');
    const fullCaption = `${caption.trim() || 'Check out my new video on ☆MEDIA APP!'} ${tagString}`.trim();
    const finalDuration = Math.max(1, trimEnd - trimStart);

    const newVideo: Video = {
      id: `v-${Date.now()}`,
      creatorId: currentUser.id,
      caption: fullCaption,
      hashtags: tags,
      mentions,
      category,
      soundId: selectedSound.id,
      soundTitle: selectedSound.title,
      soundArtist: selectedSound.artist,
      sceneType,
      videoUrl: uploadedUrl,
      thumbnailColor: '#8B5CF6',
      filter,
      watermark: watermark.type !== 'none' ? watermark : undefined,
      trimStart,
      trimEnd,
      duration: finalDuration,
      visibility,
      likes: [],
      saves: [],
      views: 1,
      shares: 0,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
    };

    onPublishVideo(newVideo);
  };

  const handleWatermarkImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setStatusBanner('Please upload a valid image file (PNG, SVG, JPG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setWatermark((prev) => ({
        ...prev,
        type: 'image',
        imageUrl: result,
      }));
      setWatermarkUploadName(file.name);
      setStatusBanner(`Custom watermark logo "${file.name}" applied!`);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDraftClick = () => {
    if (!currentUser) {
      onRequireAuth('Please log in to save drafts.');
      return;
    }
    const draft: DraftVideo = {
      id: `draft-${Date.now()}`,
      creatorId: currentUser.id,
      caption,
      hashtags: parseTags(),
      category,
      soundId,
      sceneType,
      videoUrl: uploadedUrl,
      filter,
      watermark: watermark.type !== 'none' ? watermark : undefined,
      trimStart,
      trimEnd,
      visibility,
      updatedAt: new Date().toISOString(),
    };
    onSaveDraft(draft);
    setStatusBanner('Draft saved with current start/end trim points & watermark!');
  };

  const loadDraft = (d: DraftVideo) => {
    setCaption(d.caption);
    setHashtagInput(d.hashtags.join(' '));
    setCategory(d.category);
    setSoundId(d.soundId);
    setSceneType(d.sceneType);
    setUploadedUrl(d.videoUrl);
    setFilter(d.filter);
    if (d.watermark) {
      setWatermark(d.watermark);
    } else {
      setWatermark({
        type: 'none',
        text: `@${currentUser?.username || 'creator'}`,
        imageUrl: 'preset:starmedia',
        position: 'bottom-right',
        opacity: 85,
        scale: 1,
        color: '#FFFFFF',
        style: 'shadow',
        includeBrandIcon: true,
      });
    }
    setTrimStart(d.trimStart);
    setTrimEnd(d.trimEnd);
    setVisibility(d.visibility);
    setStatusBanner('Loaded saved draft into studio editor.');
  };

  const userDrafts = drafts.filter((d) => !currentUser || d.creatorId === currentUser.id);
  const activeClipLength = Math.max(1, trimEnd - trimStart);
  const activeFilterItem = VISUAL_FILTERS.find((f) => f.id === filter) || VISUAL_FILTERS[0];
  const displayedFilters =
    filterCategory === 'All'
      ? VISUAL_FILTERS
      : VISUAL_FILTERS.filter((f) => f.category === filterCategory || f.id === 'none');

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-50 dark:bg-[#080808] text-slate-900 dark:text-white pb-24 sm:pb-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight">
              Creator Studio & Video Trimmer
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
              Upload MP4/MOV clips, record with camera, trim start/end timestamps, and add effects.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/80 dark:bg-[#151515] border border-slate-300 dark:border-white/10 self-start">
            <button
              type="button"
              onClick={() => {
                setSourceMode('studio');
                setRawDuration(15);
                setTrimStart(0);
                setTrimEnd(15);
              }}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                sourceMode === 'studio'
                  ? 'bg-white dark:bg-[#8B5CF6] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Studio Scenes</span>
            </button>
            <button
              type="button"
              onClick={() => setSourceMode('upload')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                sourceMode === 'upload'
                  ? 'bg-white dark:bg-[#8B5CF6] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Video</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSourceMode('camera');
                startCameraPreview();
              }}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                sourceMode === 'camera'
                  ? 'bg-white dark:bg-[#8B5CF6] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Camera</span>
            </button>
          </div>
        </div>

        {statusBanner && (
          <div className="mb-5 px-4 py-3 rounded-2xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-xs font-medium text-[#8B5CF6] dark:text-[#A78BFA] flex items-center justify-between">
            <span>{statusBanner}</span>
            <button onClick={() => setStatusBanner(null)} className="text-xs underline ml-4 cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Live 9:16 Vertical Preview Stage */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-[320px] aspect-[9/16] rounded-3xl overflow-hidden bg-[#080808] border-2 border-slate-200 dark:border-white/15 shadow-2xl">
              {sourceMode === 'camera' && !cameraError ? (
                <>
                  <video
                    ref={cameraVideoRef}
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    style={getVideoFilterStyle(isComparingOriginal ? 'none' : filter, filterIntensity)}
                  />
                  <VideoWatermarkOverlay watermark={watermark} />
                </>
              ) : (
                <CanvasVideoPlayer
                  sceneType={sceneType}
                  videoUrl={uploadedUrl}
                  filter={isComparingOriginal ? 'none' : filter}
                  filterIntensity={filterIntensity}
                  watermark={watermark}
                  soundId={soundId}
                  isActive={true}
                  isMuted={previewMuted}
                  trimStart={trimStart}
                  trimEnd={trimEnd}
                  duration={rawDuration}
                  onTimeUpdate={(t) => setCurrentPlayheadTime(Math.round(t * 10) / 10)}
                />
              )}

              {/* Top Time & Sound Controls */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-[11px] font-mono text-white flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-[#FF2D75]" />
                  <span>
                    {trimStart.toFixed(1)}s – {trimEnd.toFixed(1)}s ({activeClipLength.toFixed(1)}s)
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewMuted((m) => !m)}
                  className="pointer-events-auto px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-[11px] font-medium text-white hover:bg-black/90 cursor-pointer"
                >
                  {previewMuted ? 'Muted' : 'Sound On'}
                </button>
              </div>

              {/* Floating Filter Overlay Pill */}
              <div className="absolute top-12 left-3 z-20 pointer-events-none">
                <span
                  className={`px-2.5 py-1 rounded-full backdrop-blur-md border text-[10px] font-bold text-white flex items-center gap-1.5 shadow-lg transition-colors ${
                    isComparingOriginal
                      ? 'bg-amber-500/85 border-amber-400 text-black font-extrabold'
                      : filter !== 'none'
                      ? 'bg-black/75 border-[#8B5CF6]/60 text-white'
                      : 'bg-black/50 border-white/15 text-zinc-300'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>
                    {isComparingOriginal ? 'RAW (Comparing)' : activeFilterItem.label}
                  </span>
                  {!isComparingOriginal && filter !== 'none' && (
                    <span className="text-[#A78BFA] font-mono">({filterIntensity}%)</span>
                  )}
                </span>
              </div>

              {/* Floating Watermark Overlay Pill */}
              {watermark.type !== 'none' && (
                <div className="absolute top-12 right-3 z-20 pointer-events-none">
                  <span className="px-2.5 py-1 rounded-full backdrop-blur-md border border-[#38BDF8]/40 bg-black/75 text-[10px] font-bold text-white flex items-center gap-1.5 shadow-lg">
                    <Stamp className="w-3 h-3 text-[#38BDF8]" />
                    <span className="truncate max-w-[85px]">
                      {watermark.type === 'text' ? (watermark.text || '@creator') : 'Logo'}
                    </span>
                    <span className="text-[#38BDF8] font-mono text-[9px] uppercase">
                      {watermark.position.replace('-', ' ')}
                    </span>
                  </span>
                </div>
              )}

              {/* Camera Record Button */}
              {sourceMode === 'camera' && (
                <div className="absolute bottom-6 inset-x-0 flex flex-col items-center gap-2 z-30">
                  {cameraError && (
                    <p className="px-3 py-1.5 mx-3 rounded-lg bg-black/75 text-[11px] text-amber-300 text-center">
                      {cameraError}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleToggleRecording}
                    className={`w-16 h-16 rounded-full border-4 border-white flex items-center justify-center shadow-xl transition-transform active:scale-95 cursor-pointer ${
                      isRecording ? 'bg-red-600 animate-pulse' : 'bg-[#FF2D75]'
                    }`}
                  >
                    {isRecording ? (
                      <StopCircle className="w-7 h-7 text-white" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-white" />
                    )}
                  </button>
                  <span className="text-xs font-mono text-white bg-black/50 px-2.5 py-0.5 rounded-full">
                    {isRecording ? `REC 00:${recordSeconds.toString().padStart(2, '0')}` : 'Tap to Record'}
                  </span>
                </div>
              )}
            </div>

            {/* Filter Comparison & Status bar */}
            {filter !== 'none' && (
              <div className="mt-3 w-full max-w-[320px] flex items-center justify-between gap-2 px-1">
                <button
                  type="button"
                  onMouseDown={() => setIsComparingOriginal(true)}
                  onMouseUp={() => setIsComparingOriginal(false)}
                  onMouseLeave={() => setIsComparingOriginal(false)}
                  onTouchStart={() => setIsComparingOriginal(true)}
                  onTouchEnd={() => setIsComparingOriginal(false)}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer select-none ${
                    isComparingOriginal
                      ? 'bg-amber-400 text-black border-amber-400 shadow-md font-bold'
                      : 'bg-white dark:bg-[#151515] border-slate-200 dark:border-white/10 hover:border-[#8B5CF6] text-slate-700 dark:text-zinc-200 shadow-sm'
                  }`}
                  title="Press and hold to compare with unfiltered original video"
                >
                  <Eye className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  <span>{isComparingOriginal ? 'Showing RAW Original' : 'Hold to View Original'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFilter('none');
                    setFilterIntensity(100);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-xs font-semibold text-slate-500 dark:text-zinc-400 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Reset Filter to Original"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            )}

            {/* Current Playhead indicator below stage */}
            <div className="mt-2.5 flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-zinc-400">
              <span>Playhead: {currentPlayheadTime.toFixed(1)}s</span>
              <span>·</span>
              <span>Total Source: {rawDuration}s</span>
            </div>
          </div>

          {/* Right Column: Video Trimmer & Metadata Form */}
          <form onSubmit={handlePublish} className="lg:col-span-7 space-y-5">
            {/* Dedicated Simple Video Trimmer UI Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/15 text-[#8B5CF6] flex items-center justify-center">
                    <Scissors className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm">
                      Video Clip Trimmer
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Set start and end time range values before publishing.
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-[#FF2D75] font-mono tabular-nums">
                    {activeClipLength.toFixed(1)}s clip
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    of {rawDuration}s total
                  </span>
                </div>
              </div>

              {/* Visual Timeline Track with Trim Window */}
              <div className="space-y-2">
                <div className="relative h-10 w-full bg-slate-100 dark:bg-[#0c0c0c] rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 flex items-center">
                  {/* Waveform/Frames background simulation */}
                  <div className="absolute inset-0 flex items-center justify-around opacity-25 px-2">
                    {Array.from({ length: 32 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-[#8B5CF6] rounded-full"
                        style={{ height: `${20 + ((i * 17) % 60)}%` }}
                      />
                    ))}
                  </div>

                  {/* Active Selected Trim Region */}
                  <div
                    style={{
                      left: `${(trimStart / rawDuration) * 100}%`,
                      width: `${((trimEnd - trimStart) / rawDuration) * 100}%`,
                    }}
                    className="absolute inset-y-0 bg-gradient-to-r from-[#8B5CF6]/30 via-[#C026D3]/35 to-[#FF2D75]/30 border-y-2 border-x-4 border-[#8B5CF6] dark:border-[#FF2D75] rounded-lg pointer-events-none transition-all duration-75"
                  />

                  {/* Playhead position tick */}
                  <div
                    style={{
                      left: `${Math.min(100, Math.max(0, (currentPlayheadTime / rawDuration) * 100))}%`,
                    }}
                    className="absolute inset-y-0 w-0.5 bg-white shadow-lg pointer-events-none z-10"
                  />
                </div>

                <div className="flex justify-between text-[10px] font-mono text-slate-400 px-1">
                  <span>0.0s</span>
                  <span>Playhead: {currentPlayheadTime.toFixed(1)}s</span>
                  <span>{rawDuration.toFixed(1)}s</span>
                </div>
              </div>

              {/* Quick Set via Current Playhead Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStartChange(currentPlayheadTime)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-[#8B5CF6] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Set Start Time at current playhead position"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Set Start ({currentPlayheadTime.toFixed(1)}s)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleEndChange(currentPlayheadTime)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-[#FF2D75] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Set End Time at current playhead position"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Set End ({currentPlayheadTime.toFixed(1)}s)</span>
                </button>

                <div className="ml-auto flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => applyPreset('full')}
                    className="px-2 py-1 rounded bg-slate-100 dark:bg-white/5 text-[11px] font-medium hover:bg-slate-200 dark:hover:bg-white/10 cursor-pointer"
                  >
                    Full
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('first5')}
                    className="px-2 py-1 rounded bg-slate-100 dark:bg-white/5 text-[11px] font-medium hover:bg-slate-200 dark:hover:bg-white/10 cursor-pointer"
                  >
                    5s
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('first10')}
                    className="px-2 py-1 rounded bg-slate-100 dark:bg-white/5 text-[11px] font-medium hover:bg-slate-200 dark:hover:bg-white/10 cursor-pointer"
                  >
                    10s
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('last10')}
                    className="px-2 py-1 rounded bg-slate-100 dark:bg-white/5 text-[11px] font-medium hover:bg-slate-200 dark:hover:bg-white/10 cursor-pointer"
                  >
                    End 10s
                  </button>
                </div>
              </div>

              {/* Start & End Dual Controls (Numeric Inputs + Sliders) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10">
                {/* START TIME CONTROL */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-200 flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
                      Start Time
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={trimEnd - 1}
                        step={0.5}
                        value={trimStart}
                        onChange={(e) => handleStartChange(parseFloat(e.target.value) || 0)}
                        className="w-16 px-2 py-1 rounded-md bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/15 text-xs font-mono tabular-nums text-center font-bold focus:outline-none focus:border-[#8B5CF6]"
                      />
                      <span className="text-xs text-slate-400">sec</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={Math.max(1, trimEnd - 1)}
                    step={0.5}
                    value={trimStart}
                    onChange={(e) => handleStartChange(parseFloat(e.target.value))}
                    className="w-full accent-[#8B5CF6] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0.0s</span>
                    <span>Max: {(trimEnd - 1).toFixed(1)}s</span>
                  </div>
                </div>

                {/* END TIME CONTROL */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-200 flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FF2D75]" />
                      End Time
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={trimStart + 1}
                        max={rawDuration}
                        step={0.5}
                        value={trimEnd}
                        onChange={(e) => handleEndChange(parseFloat(e.target.value) || rawDuration)}
                        className="w-16 px-2 py-1 rounded-md bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/15 text-xs font-mono tabular-nums text-center font-bold focus:outline-none focus:border-[#FF2D75]"
                      />
                      <span className="text-xs text-slate-400">sec</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={trimStart + 1}
                    max={rawDuration}
                    step={0.5}
                    value={trimEnd}
                    onChange={(e) => handleEndChange(parseFloat(e.target.value))}
                    className="w-full accent-[#FF2D75] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Min: {(trimStart + 1).toFixed(1)}s</span>
                    <span>{rawDuration.toFixed(1)}s</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Source Selection Card (Studio Scene or Uploaded Video) */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 space-y-4">
              {sourceMode === 'upload' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
                    Upload Video File (MP4, MOV, WebM)
                  </label>
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-white/15 rounded-2xl hover:border-[#8B5CF6] transition-colors cursor-pointer bg-slate-50 dark:bg-[#0c0c0c]">
                    <Film className="w-8 h-8 text-[#8B5CF6] mb-2" />
                    <span className="text-sm font-semibold">
                      {uploadedFileName || 'Click to select MP4 or MOV video from device'}
                    </span>
                    <span className="text-xs text-slate-400 mt-1">
                      Auto-detects file duration & enables precision trimming
                    </span>
                    <input
                      type="file"
                      accept="video/mp4,video/quicktime,video/webm,video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {sourceMode !== 'upload' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-300 mb-2">
                    Visual Scene / Animated Backdrop
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {STUDIO_SCENES.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setUploadedUrl(undefined);
                          setSceneType(s.id);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          sceneType === s.id && !uploadedUrl
                            ? 'border-[#FF2D75] bg-[#FF2D75]/10'
                            : 'border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5'
                        }`}
                      >
                        <div
                          className="w-full h-3 rounded-md mb-1.5"
                          style={{ backgroundColor: s.color }}
                        />
                        <span className="text-xs font-semibold block truncate">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Visual Color Filter & Grading Studio Card */}
              <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-200 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                      <span>Visual Color Filters & Grading</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#8B5CF6] font-semibold">
                        {VISUAL_FILTERS.length} Looks
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Select a visual filter to color-grade your video clip. Adjust intensity to match your creative style.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {filter !== 'none' && (
                      <button
                        type="button"
                        onClick={() => {
                          setFilter('none');
                          setFilterIntensity(100);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-xs font-medium text-slate-500 dark:text-zinc-400 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Reset to Original"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const nonNone = VISUAL_FILTERS.filter((f) => f.id !== 'none');
                        const random = nonNone[Math.floor(Math.random() * nonNone.length)];
                        setFilter(random.id);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#FF2D75]/10 hover:bg-[#FF2D75]/20 text-[#FF2D75] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Try a random cinematic look"
                    >
                      <Wand2 className="w-3 h-3" />
                      <span>Random Look</span>
                    </button>
                  </div>
                </div>

                {/* Filter Category Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {(['All', 'Vibrant', 'Monochrome', 'Retro', 'Cinematic'] as FilterCategory[]).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFilterCategory(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        filterCategory === cat
                          ? 'bg-[#8B5CF6] text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-[#1a1a1a] text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-white/10'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Filter Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                  {displayedFilters.map((f) => {
                    const isSelected = filter === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFilter(f.id)}
                        className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer group relative overflow-hidden ${
                          isSelected
                            ? 'border-[#8B5CF6] bg-[#8B5CF6]/15 ring-2 ring-[#8B5CF6]/30 shadow-md'
                            : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#0e0e0e] hover:border-slate-400 dark:hover:border-white/20 hover:bg-slate-100 dark:hover:bg-white/5'
                        }`}
                      >
                        {/* Top Preview Swatch */}
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${f.swatchGradient} shadow-inner flex items-center justify-center border border-white/20`}
                          >
                            <Palette className="w-3.5 h-3.5 text-white/90 drop-shadow" />
                          </div>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider font-mono uppercase ${
                              isSelected
                                ? 'bg-[#8B5CF6] text-white'
                                : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-zinc-300'
                            }`}
                          >
                            {f.badge}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-display font-bold text-xs truncate">
                              {f.label}
                            </span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-[#8B5CF6] shrink-0 stroke-[3]" />
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-zinc-400 line-clamp-2 mt-0.5 leading-tight">
                            {f.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Filter Intensity Slider & Presets (Visible when active filter != 'none') */}
                {filter !== 'none' && (
                  <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-[#8B5CF6]" />
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-200">
                          {activeFilterItem.label} Intensity
                        </label>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#8B5CF6]">
                        {filterIntensity}%
                      </span>
                    </div>

                    <div className="space-y-1">
                      <input
                        type="range"
                        min={10}
                        max={100}
                        step={5}
                        value={filterIntensity}
                        onChange={(e) => setFilterIntensity(parseInt(e.target.value, 10) || 100)}
                        className="w-full accent-[#8B5CF6] cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>10% (Subtle)</span>
                        <span>50% (Medium)</span>
                        <span>100% (Full Look)</span>
                      </div>
                    </div>

                    {/* Quick Intensity Presets */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 mr-1">Presets:</span>
                      {[
                        { label: 'Subtle', val: 35 },
                        { label: 'Natural', val: 65 },
                        { label: 'Balanced', val: 85 },
                        { label: 'Maximum', val: 100 },
                      ].map((preset) => (
                        <button
                          key={preset.val}
                          type="button"
                          onClick={() => setFilterIntensity(preset.val)}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                            filterIntensity === preset.val
                              ? 'bg-[#8B5CF6] text-white'
                              : 'bg-white dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-600 dark:text-zinc-300'
                          }`}
                        >
                          {preset.label} ({preset.val}%)
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Custom Video Watermark & Branding Studio */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 space-y-4 shadow-sm">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FF2D75]/15 text-[#FF2D75] flex items-center justify-center">
                    <Stamp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm flex items-center gap-2">
                      <span>Custom Video Watermark & Branding</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                          watermark.type !== 'none'
                            ? 'bg-[#FF2D75]/15 text-[#FF2D75]'
                            : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-zinc-400'
                        }`}
                      >
                        {watermark.type === 'none'
                          ? 'OFF'
                          : watermark.type === 'text'
                          ? 'TEXT'
                          : 'IMAGE / LOGO'}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Add a custom text handle or brand logo watermark to protect and brand your clip.
                    </p>
                  </div>
                </div>

                {watermark.type !== 'none' && (
                  <button
                    type="button"
                    onClick={() => {
                      setWatermark((prev) => ({ ...prev, type: 'none' }));
                      setWatermarkUploadName(null);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-xs font-semibold text-slate-600 dark:text-zinc-300 flex items-center gap-1 transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Disable</span>
                  </button>
                )}
              </div>

              {/* Watermark Type Selector */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setWatermark((prev) => ({ ...prev, type: 'none' }))}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    watermark.type === 'none'
                      ? 'border-[#8B5CF6] bg-[#8B5CF6]/15 text-[#8B5CF6] dark:text-[#A78BFA] shadow-sm'
                      : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  <span>No Watermark</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setWatermark((prev) => ({
                      ...prev,
                      type: 'text',
                      text: prev.text || `@${currentUser?.username || 'creator'}`,
                    }))
                  }
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    watermark.type === 'text'
                      ? 'border-[#FF2D75] bg-[#FF2D75]/15 text-[#FF2D75] shadow-sm'
                      : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  <Type className="w-3.5 h-3.5" />
                  <span>Custom Text</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWatermark((prev) => ({ ...prev, type: 'image' }))}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    watermark.type === 'image'
                      ? 'border-[#38BDF8] bg-[#38BDF8]/15 text-[#38BDF8] shadow-sm'
                      : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Image / Logo</span>
                </button>
              </div>

              {/* TEXT WATERMARK CONFIGURATION */}
              {watermark.type === 'text' && (
                <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-white/10">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-zinc-200">
                        Watermark Text String
                      </label>
                      <span className="text-[10px] font-mono text-slate-400">
                        {(watermark.text || '').length}/30 max
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={30}
                      value={watermark.text || ''}
                      onChange={(e) =>
                        setWatermark((prev) => ({ ...prev, text: e.target.value }))
                      }
                      placeholder="e.g. @your_name, Exclusive Drop, Studio Reel"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10 text-sm font-medium focus:outline-none focus:border-[#FF2D75]"
                    />
                    {/* Quick text presets */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-slate-400 mr-1">Quick Fill:</span>
                      <button
                        type="button"
                        onClick={() =>
                          setWatermark((prev) => ({
                            ...prev,
                            text: `@${currentUser?.username || 'creator'}`,
                          }))
                        }
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 hover:bg-[#FF2D75]/15 text-[#FF2D75] text-[11px] font-mono font-semibold transition-colors cursor-pointer"
                      >
                        @{currentUser?.username || 'creator'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setWatermark((prev) => ({
                            ...prev,
                            text: '☆ STAR MEDIA',
                          }))
                        }
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 hover:bg-[#8B5CF6]/15 text-[#8B5CF6] text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        ☆ STAR MEDIA
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setWatermark((prev) => ({
                            ...prev,
                            text: `© ${currentUser?.displayName || 'Creator'}`,
                          }))
                        }
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-600 dark:text-zinc-300 text-[11px] font-mono transition-colors cursor-pointer"
                      >
                        © {currentUser?.displayName || 'Creator'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setWatermark((prev) => ({
                            ...prev,
                            text: '✦ EXCLUSIVE',
                          }))
                        }
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 hover:bg-amber-400/20 text-amber-500 text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        ✦ EXCLUSIVE
                      </button>
                    </div>
                  </div>

                  {/* Style & Star Icon */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-200 mb-1.5">
                        Badge Style
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {WATERMARK_TEXT_STYLES.map((st) => (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => setWatermark((prev) => ({ ...prev, style: st.id }))}
                            className={`px-2 py-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                              (watermark.style || 'shadow') === st.id
                                ? 'border-[#FF2D75] bg-[#FF2D75]/10 text-[#FF2D75] font-bold shadow-sm'
                                : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/5'
                            }`}
                          >
                            <span className="block text-[11px]">{st.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-zinc-200">
                          Text Color
                        </label>
                        <label className="text-[11px] flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-zinc-300">
                          <input
                            type="checkbox"
                            checked={watermark.includeBrandIcon !== false}
                            onChange={(e) =>
                              setWatermark((prev) => ({
                                ...prev,
                                includeBrandIcon: e.target.checked,
                              }))
                            }
                            className="accent-[#FF2D75] rounded cursor-pointer"
                          />
                          <span>Prefix ☆ Star</span>
                        </label>
                      </div>
                      <div className="grid grid-cols-6 gap-2">
                        {WATERMARK_COLOR_SWATCHES.map((swatch) => (
                          <button
                            key={swatch.value}
                            type="button"
                            onClick={() => setWatermark((prev) => ({ ...prev, color: swatch.value }))}
                            title={swatch.name}
                            className={`h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                              watermark.color === swatch.value
                                ? 'ring-2 ring-[#FF2D75] scale-105 border-white'
                                : 'border-slate-300 dark:border-white/20 hover:scale-105'
                            }`}
                            style={{ backgroundColor: swatch.value }}
                          >
                            {watermark.color === swatch.value && (
                              <Check
                                className={`w-4 h-4 stroke-[3] ${
                                  swatch.value === '#FFFFFF' || swatch.value === '#94A3B8'
                                    ? 'text-black'
                                    : 'text-white'
                                }`}
                              />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* IMAGE WATERMARK CONFIGURATION */}
              {watermark.type === 'image' && (
                <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-white/10">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-200 mb-2">
                      Upload Custom Logo / Graphic (PNG, SVG, Transparent JPG)
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <label className="flex-1 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-white/15 hover:border-[#38BDF8] bg-slate-50 dark:bg-[#0c0c0c] cursor-pointer transition-colors text-center">
                        <Upload className="w-4 h-4 text-[#38BDF8]" />
                        <span className="text-xs font-semibold">
                          {watermarkUploadName
                            ? `Uploaded: ${watermarkUploadName}`
                            : 'Choose Custom Logo File'}
                        </span>
                        <input
                          ref={watermarkFileInputRef}
                          type="file"
                          accept="image/png,image/svg+xml,image/jpeg,image/webp"
                          onChange={handleWatermarkImageUpload}
                          className="hidden"
                        />
                      </label>

                      {watermark.imageUrl && !watermark.imageUrl.startsWith('preset:') && (
                        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-[#0e0e0e] border border-slate-200 dark:border-white/10">
                          <img
                            src={watermark.imageUrl}
                            alt="Uploaded watermark"
                            className="w-10 h-10 object-contain rounded bg-black/40 p-1"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setWatermark((prev) => ({
                                ...prev,
                                imageUrl: 'preset:starmedia',
                              }));
                              setWatermarkUploadName(null);
                              if (watermarkFileInputRef.current)
                                watermarkFileInputRef.current.value = '';
                            }}
                            className="text-[11px] text-red-400 hover:underline px-1 cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 1-Click Graphic Badge Presets */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-200 mb-2">
                      Or Select Instant Holographic / Vector Badge Presets
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {WATERMARK_LOGO_PRESETS.map((lp) => {
                        const isSelected = watermark.imageUrl === lp.presetKey;
                        return (
                          <button
                            key={lp.id}
                            type="button"
                            onClick={() => {
                              setWatermark((prev) => ({ ...prev, imageUrl: lp.presetKey }));
                              setWatermarkUploadName(null);
                            }}
                            className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#38BDF8] bg-[#38BDF8]/15 ring-2 ring-[#38BDF8]/30 shadow-sm'
                                : 'border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5'
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-black/75 flex items-center justify-center border border-white/20 shrink-0 mt-0.5">
                              {lp.id === 'starmedia' && (
                                <span className="text-white text-xs font-black">☆</span>
                              )}
                              {lp.id === 'verified' && (
                                <span className="text-amber-400 text-sm">★</span>
                              )}
                              {lp.id === 'exclusive' && (
                                <span className="text-[#FF2D75] text-xs font-bold">✦</span>
                              )}
                              {lp.id === 'copyright' && (
                                <span className="text-zinc-300 text-xs font-mono">©</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-display font-bold text-xs truncate">
                                  {lp.name}
                                </span>
                                {isSelected && (
                                  <Check className="w-3.5 h-3.5 text-[#38BDF8] stroke-[3] shrink-0" />
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                                {lp.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* POSITION & SLIDERS (Shown when watermark != none) */}
              {watermark.type !== 'none' && (
                <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-white/10">
                  {/* 5-Position Placement Grid */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-700 dark:text-zinc-200 flex items-center gap-1.5">
                        <Move className="w-3.5 h-3.5 text-[#8B5CF6]" />
                        <span>Watermark Placement Position</span>
                      </label>
                      <span className="text-[11px] font-mono text-[#8B5CF6] font-bold uppercase">
                        {watermark.position.replace('-', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto p-2 rounded-xl bg-slate-100 dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10">
                      <button
                        type="button"
                        onClick={() =>
                          setWatermark((prev) => ({ ...prev, position: 'top-left' }))
                        }
                        className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                          watermark.position === 'top-left'
                            ? 'bg-[#FF2D75] text-white shadow-md'
                            : 'bg-white dark:bg-white/10 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-white/20'
                        }`}
                      >
                        ↖ Top Left
                      </button>
                      <div className="flex items-center justify-center text-[10px] text-slate-400 font-mono">
                        SAFE ZONE
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setWatermark((prev) => ({ ...prev, position: 'top-right' }))
                        }
                        className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                          watermark.position === 'top-right'
                            ? 'bg-[#FF2D75] text-white shadow-md'
                            : 'bg-white dark:bg-white/10 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-white/20'
                        }`}
                      >
                        ↗ Top Right
                      </button>

                      <div className="col-span-1" />
                      <button
                        type="button"
                        onClick={() =>
                          setWatermark((prev) => ({ ...prev, position: 'center' }))
                        }
                        className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                          watermark.position === 'center'
                            ? 'bg-[#8B5CF6] text-white shadow-md'
                            : 'bg-white dark:bg-white/10 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-white/20'
                        }`}
                      >
                        ⊙ Center
                      </button>
                      <div className="col-span-1" />

                      <button
                        type="button"
                        onClick={() =>
                          setWatermark((prev) => ({ ...prev, position: 'bottom-left' }))
                        }
                        className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                          watermark.position === 'bottom-left'
                            ? 'bg-[#FF2D75] text-white shadow-md'
                            : 'bg-white dark:bg-white/10 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-white/20'
                        }`}
                      >
                        ↙ Bottom Left
                      </button>
                      <div className="flex items-center justify-center text-[10px] text-slate-400 font-mono">
                        CAPTION AREA
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setWatermark((prev) => ({ ...prev, position: 'bottom-right' }))
                        }
                        className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                          watermark.position === 'bottom-right'
                            ? 'bg-[#FF2D75] text-white shadow-md'
                            : 'bg-white dark:bg-white/10 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-white/20'
                        }`}
                      >
                        ↘ Bottom Right
                      </button>
                    </div>
                  </div>

                  {/* Opacity & Scale Sliders */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {/* Opacity */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-700 dark:text-zinc-200">
                          Transparency / Opacity
                        </label>
                        <span className="text-xs font-mono font-bold text-[#FF2D75]">
                          {watermark.opacity}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={15}
                        max={100}
                        step={5}
                        value={watermark.opacity}
                        onChange={(e) =>
                          setWatermark((prev) => ({
                            ...prev,
                            opacity: parseInt(e.target.value, 10) || 85,
                          }))
                        }
                        className="w-full accent-[#FF2D75] cursor-pointer"
                      />
                      <div className="flex items-center justify-between gap-1 pt-1">
                        {[
                          { label: 'Subtle', val: 35 },
                          { label: 'Medium', val: 65 },
                          { label: 'Clear', val: 85 },
                          { label: 'Solid', val: 100 },
                        ].map((p) => (
                          <button
                            key={p.val}
                            type="button"
                            onClick={() => setWatermark((prev) => ({ ...prev, opacity: p.val }))}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold cursor-pointer ${
                              watermark.opacity === p.val
                                ? 'bg-[#FF2D75] text-white'
                                : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-zinc-300'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Scale / Size */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-700 dark:text-zinc-200">
                          Watermark Size / Scale
                        </label>
                        <span className="text-xs font-mono font-bold text-[#8B5CF6]">
                          {watermark.scale}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0.6}
                        max={1.5}
                        step={0.1}
                        value={watermark.scale}
                        onChange={(e) =>
                          setWatermark((prev) => ({
                            ...prev,
                            scale: parseFloat(e.target.value) || 1,
                          }))
                        }
                        className="w-full accent-[#8B5CF6] cursor-pointer"
                      />
                      <div className="flex items-center justify-between gap-1 pt-1">
                        {[
                          { label: 'Mini 0.7x', val: 0.7 },
                          { label: 'Default 1.0x', val: 1.0 },
                          { label: 'Large 1.3x', val: 1.3 },
                          { label: 'Max 1.5x', val: 1.5 },
                        ].map((p) => (
                          <button
                            key={p.val}
                            type="button"
                            onClick={() => setWatermark((prev) => ({ ...prev, scale: p.val }))}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold cursor-pointer ${
                              Math.abs(watermark.scale - p.val) < 0.05
                                ? 'bg-[#8B5CF6] text-white'
                                : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-zinc-300'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Caption, Hashtags, Sound & Visibility Form */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-zinc-300">
                    Video Caption & @Mentions
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCaption((c) => `${c} @alex_nova `)}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-[#8B5CF6] flex items-center gap-0.5 cursor-pointer"
                    >
                      <AtSign className="w-3 h-3" /> alex_nova
                    </button>
                    <button
                      type="button"
                      onClick={() => setCaption((c) => `${c} @mia_kinetics `)}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-[#FF2D75] flex items-center gap-0.5 cursor-pointer"
                    >
                      <AtSign className="w-3 h-3" /> mia_kinetics
                    </button>
                  </div>
                </div>
                <textarea
                  rows={2}
                  required
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Describe your video clip... tag creators with @username"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-300 mb-1.5">
                    <Hash className="w-3.5 h-3.5 inline mr-1 text-[#FF2D75]" />
                    Hashtags
                  </label>
                  <input
                    type="text"
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    placeholder="starmedia viral dance"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-white/10 text-xs focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-300 mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-white/10 text-xs focus:outline-none focus:border-[#8B5CF6]"
                  >
                    {VIDEO_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-300 mb-1.5">
                    <Music className="w-3.5 h-3.5 inline mr-1 text-[#8B5CF6]" />
                    Featured Sound
                  </label>
                  <select
                    value={soundId}
                    onChange={(e) => setSoundId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-white/10 text-xs focus:outline-none focus:border-[#8B5CF6]"
                  >
                    {sounds.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title} — {s.artist} ({s.bpm} BPM)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-300 mb-1.5">
                    <Eye className="w-3.5 h-3.5 inline mr-1 text-emerald-500" />
                    Visibility
                  </label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as VideoVisibility)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-white/10 text-xs focus:outline-none focus:border-[#8B5CF6]"
                  >
                    <option value="public">Public (Everyone)</option>
                    <option value="followers">Followers Only</option>
                    <option value="private">Private (Only Me)</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSaveDraftClick}
                  className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Draft</span>
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#FF2D75] text-white font-semibold text-sm shadow-lg shadow-[#8B5CF6]/25 hover:opacity-95 flex items-center justify-center gap-2 transition-opacity cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publish Trimmed Video ({activeClipLength.toFixed(1)}s)</span>
                </button>
              </div>
            </div>

            {/* Saved Drafts Manager */}
            {userDrafts.length > 0 && (
              <div className="p-5 rounded-2xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10">
                <h3 className="font-display font-bold text-sm mb-3">
                  Saved Drafts · {userDrafts.length}
                </h3>
                <div className="space-y-2">
                  {userDrafts.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-white/10"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate">
                          {d.caption || 'Untitled Draft Clip'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {d.category} · Trim: {d.trimStart}s - {d.trimEnd}s · {d.visibility}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => loadDraft(d)}
                          className="px-2.5 py-1 rounded-lg bg-[#8B5CF6]/15 text-[#8B5CF6] text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Play className="w-3 h-3" /> Load
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteDraft(d.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 cursor-pointer"
                          title="Delete draft"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
