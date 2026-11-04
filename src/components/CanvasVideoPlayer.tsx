import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Heart } from 'lucide-react';
import { VideoFilterType, VideoSceneType, VideoWatermark } from '../types';
import { INITIAL_SOUNDS } from '../data/seedData';

interface CanvasVideoPlayerProps {
  sceneType: VideoSceneType;
  videoUrl?: string;
  filter?: VideoFilterType;
  filterIntensity?: number; // 0 to 100
  watermark?: VideoWatermark;
  soundId?: string;
  isActive: boolean;
  isMuted: boolean;
  trimStart?: number;
  trimEnd?: number;
  duration?: number;
  onTimeUpdate?: (currTime: number) => void;
  onDoubleTapLike?: () => void;
  className?: string;
  showControls?: boolean;
  compact?: boolean;
}

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
}

export const getVideoFilterStyle = (
  filter: VideoFilterType = 'none',
  intensity: number = 100
): React.CSSProperties => {
  if (filter === 'none') return {};
  const factor = Math.max(0.1, Math.min(1, (intensity || 100) / 100));

  switch (filter) {
    case 'grayscale':
      return { filter: `grayscale(${100 * factor}%) contrast(${100 + 15 * factor}%)` };
    case 'sepia':
      return {
        filter: `sepia(${95 * factor}%) contrast(${100 + 10 * factor}%) brightness(${100 - 5 * factor}%)`,
      };
    case 'vivid':
      return {
        filter: `saturate(${100 + 120 * factor}%) contrast(${100 + 20 * factor}%) brightness(${100 + 5 * factor}%)`,
      };
    case 'cyber':
      return {
        filter: `saturate(${100 + 70 * factor}%) contrast(${100 + 30 * factor}%) hue-rotate(${20 * factor}deg)`,
      };
    case 'noir':
      return {
        filter: `grayscale(100%) contrast(${100 + 60 * factor}%) brightness(${100 - 15 * factor}%)`,
      };
    case 'warm':
      return {
        filter: `sepia(${40 * factor}%) saturate(${100 + 60 * factor}%) contrast(${100 + 10 * factor}%) hue-rotate(${-12 * factor}deg)`,
      };
    case 'cool':
      return {
        filter: `saturate(${100 + 30 * factor}%) contrast(${100 + 12 * factor}%) hue-rotate(${185 * factor}deg) brightness(${100 + 3 * factor}%)`,
      };
    case 'vintage':
      return {
        filter: `sepia(${45 * factor}%) contrast(${100 - 10 * factor}%) brightness(${100 + 8 * factor}%) saturate(${100 - 20 * factor}%)`,
      };
    case 'dramatic':
      return {
        filter: `contrast(${100 + 50 * factor}%) saturate(${100 + 35 * factor}%) brightness(${100 - 10 * factor}%)`,
      };
    case 'emerald':
      return {
        filter: `hue-rotate(${85 * factor}deg) saturate(${100 + 75 * factor}%) contrast(${100 + 15 * factor}%)`,
      };
    default:
      return {};
  }
};

export const VideoWatermarkOverlay: React.FC<{
  watermark?: VideoWatermark;
  compact?: boolean;
}> = ({ watermark, compact = false }) => {
  if (!watermark || watermark.type === 'none') return null;

  const positionClasses: Record<string, string> = {
    'top-left': compact ? 'top-2.5 left-2.5' : 'top-4 left-4',
    'top-right': compact ? 'top-2.5 right-2.5' : 'top-4 right-4',
    'bottom-left': compact ? 'bottom-8 left-2.5' : 'bottom-16 left-4',
    'bottom-right': compact ? 'bottom-8 right-2.5' : 'bottom-16 right-4',
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  };

  const posClass = positionClasses[watermark.position || 'bottom-right'] || positionClasses['bottom-right'];
  const opacityVal = Math.max(0.1, Math.min(1, (watermark.opacity ?? 85) / 100));
  const scaleVal = (watermark.scale ?? 1) * (compact ? 0.75 : 1);

  const getTextStyle = () => {
    switch (watermark.style) {
      case 'pill':
        return 'bg-black/65 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-lg';
      case 'solid':
        return 'bg-black/90 px-2.5 py-1 rounded-md border border-white/10 shadow-xl';
      case 'glow':
        return 'drop-shadow-[0_0_12px_rgba(255,45,117,0.9)] tracking-wider';
      case 'outline':
        return 'bg-black/40 backdrop-blur-sm border-2 border-white/80 px-2 py-0.5 rounded-lg shadow-md';
      case 'shadow':
      default:
        return 'drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]';
    }
  };

  const getOrigin = () => {
    switch (watermark.position) {
      case 'top-left':
        return 'top left';
      case 'top-right':
        return 'top right';
      case 'bottom-left':
        return 'bottom left';
      case 'center':
        return 'center center';
      case 'bottom-right':
      default:
        return 'bottom right';
    }
  };

  return (
    <div
      style={{
        opacity: opacityVal,
        transform: `scale(${scaleVal})`,
        transformOrigin: getOrigin(),
      }}
      className={`pointer-events-none absolute z-25 select-none transition-all duration-150 ${posClass}`}
    >
      {watermark.type === 'text' && (
        <div
          className={`flex items-center gap-1.5 font-bold font-display ${getTextStyle()}`}
          style={{ color: watermark.color || '#FFFFFF' }}
        >
          {watermark.includeBrandIcon !== false && (
            <span className="text-xs sm:text-sm font-black text-[#FF2D75] drop-shadow-sm select-none">
              ☆
            </span>
          )}
          <span className="text-xs sm:text-sm tracking-wide whitespace-nowrap">
            {watermark.text || '@creator'}
          </span>
        </div>
      )}

      {watermark.type === 'image' && (
        <div>
          {watermark.imageUrl === 'preset:starmedia' ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-[#8B5CF6]/50 shadow-2xl">
              <span className="w-5 h-5 rounded-lg bg-gradient-to-tr from-[#8B5CF6] to-[#FF2D75] flex items-center justify-center text-white text-[11px] font-black shadow-md">
                ☆
              </span>
              <div className="text-left leading-tight">
                <span className="block text-[10px] font-black tracking-widest text-white uppercase font-display">
                  STAR MEDIA
                </span>
                <span className="block text-[8px] font-bold tracking-wider text-[#FF2D75]">
                  OFFICIAL
                </span>
              </div>
            </div>
          ) : watermark.imageUrl === 'preset:verified' ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-amber-400/50 shadow-2xl">
              <span className="text-amber-400 text-sm leading-none">★</span>
              <span className="text-[10px] font-black tracking-wider text-amber-300 font-display uppercase">
                VERIFIED CREATOR
              </span>
            </div>
          ) : watermark.imageUrl === 'preset:exclusive' ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#FF2D75] to-[#8B5CF6] text-white shadow-xl border border-white/25">
              <span className="text-[10px] font-black tracking-widest uppercase font-display px-1">
                ✦ EXCLUSIVE
              </span>
            </div>
          ) : watermark.imageUrl === 'preset:copyright' ? (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/85 backdrop-blur-sm border border-white/20 text-white shadow-lg">
              <span className="text-[10px] font-mono tracking-wider text-zinc-300">
                © ALL RIGHTS RESERVED
              </span>
            </div>
          ) : watermark.imageUrl ? (
            <img
              src={watermark.imageUrl}
              alt="Watermark"
              className="max-h-12 max-w-[130px] object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] rounded"
            />
          ) : (
            <div className="px-2.5 py-1 rounded-lg bg-black/70 text-white text-xs font-bold border border-white/20">
              ☆ Watermark
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const CanvasVideoPlayer: React.FC<CanvasVideoPlayerProps> = ({
  sceneType,
  videoUrl,
  filter = 'none',
  filterIntensity = 100,
  watermark,
  soundId = 'snd-1',
  isActive,
  isMuted,
  trimStart = 0,
  trimEnd = 15,
  duration = 15,
  onTimeUpdate,
  onDoubleTapLike,
  className = '',
  showControls = true,
  compact = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(isActive);
  const [progress, setProgress] = useState<number>(0);
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const lastTapRef = useRef<number>(0);
  const singleTapTimeoutRef = useRef<number | null>(null);
  const elapsedRef = useRef<number>(trimStart);

  // Sync play state with active feed slide
  useEffect(() => {
    setIsPlaying(isActive);
    if (!isActive) {
      elapsedRef.current = trimStart;
      setProgress(0);
    }
  }, [isActive, trimStart]);

  // Keep elapsed clamped inside trim range
  useEffect(() => {
    if (elapsedRef.current < trimStart || elapsedRef.current > trimEnd) {
      elapsedRef.current = trimStart;
    }
  }, [trimStart, trimEnd]);

  // WebAudio procedural soundtrack when unmuted & playing
  useEffect(() => {
    if (!isActive || !isPlaying || isMuted || compact || videoUrl) return;

    const sound = INITIAL_SOUNDS.find((s) => s.id === soundId) || INITIAL_SOUNDS[0];
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    let ctx: AudioContext | null = null;
    let intervalId: number | null = null;
    let step = 0;

    try {
      ctx = new AudioCtx();
      const beatMs = Math.max(180, Math.round((60 / sound.bpm) * 500));

      const playStep = () => {
        if (!ctx || ctx.state === 'closed') return;
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        const freq = sound.notes[step % sound.notes.length];
        osc.type = step % 2 === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.04, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + beatMs / 1000);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + beatMs / 1000);
        step++;
      };

      playStep();
      intervalId = window.setInterval(playStep, beatMs);
    } catch {
      // Ignore audio block
    }

    return () => {
      if (intervalId) window.clearInterval(intervalId);
      if (ctx && ctx.state !== 'closed') {
        ctx.close().catch(() => {});
      }
    };
  }, [isActive, isPlaying, isMuted, soundId, compact, videoUrl]);

  // Handle native HTML5 <video> element if videoUrl is provided
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !videoUrl) return;

    vid.muted = isMuted;
    if (isActive && isPlaying) {
      if (vid.currentTime < trimStart || vid.currentTime >= trimEnd) {
        vid.currentTime = trimStart;
      }
      vid.play().catch(() => {});
    } else {
      vid.pause();
    }
  }, [videoUrl, isActive, isPlaying, isMuted, trimStart, trimEnd]);

  // Canvas procedural render loop
  useEffect(() => {
    if (videoUrl) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();
    const effectiveDuration = Math.max(1, (trimEnd || duration) - trimStart);

    const render = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (isPlaying) {
        elapsedRef.current += dt;
        if (elapsedRef.current >= (trimEnd || duration)) {
          elapsedRef.current = trimStart;
        }
        const pct = ((elapsedRef.current - trimStart) / effectiveDuration) * 100;
        setProgress(Math.min(100, Math.max(0, pct)));
        if (onTimeUpdate) {
          onTimeUpdate(elapsedRef.current);
        }
      }

      const t = elapsedRef.current;
      const w = canvas.width;
      const h = canvas.height;

      ctx.save();
      ctx.clearRect(0, 0, w, h);

      if (sceneType === 'cyber_dance') {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#090414');
        grad.addColorStop(0.55, '#1e0b36');
        grad.addColorStop(1, '#080808');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = 'rgba(255, 45, 117, 0.28)';
        ctx.lineWidth = 1.5;
        const horizon = h * 0.62;
        for (let i = -8; i <= 8; i++) {
          ctx.beginPath();
          ctx.moveTo(w / 2 + i * 18, horizon);
          ctx.lineTo(w / 2 + i * 95, h);
          ctx.stroke();
        }
        for (let j = 0; j < 8; j++) {
          const offset = ((t * 1.8 + j * 0.12) % 1);
          const yPos = horizon + Math.pow(offset, 2) * (h - horizon);
          ctx.beginPath();
          ctx.moveTo(0, yPos);
          ctx.lineTo(w, yPos);
          ctx.stroke();
        }

        const cx = w / 2 + Math.sin(t * 3.2) * 34;
        const cy = h * 0.44 + Math.cos(t * 6.4) * 14;
        for (let r = 3; r >= 1; r--) {
          ctx.beginPath();
          const radius = 48 * r + Math.sin(t * 8 + r) * 14;
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.strokeStyle = r % 2 === 0 ? 'rgba(139, 92, 246, 0.65)' : 'rgba(255, 45, 117, 0.75)';
          ctx.lineWidth = 4;
          ctx.stroke();
        }

        ctx.fillStyle = '#FF2D75';
        ctx.beginPath();
        ctx.arc(cx, cy, 32 + Math.sin(t * 10) * 6, 0, Math.PI * 2);
        ctx.fill();
      } else if (sceneType === 'tokyo_drift') {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#040711');
        grad.addColorStop(0.5, '#0f172a');
        grad.addColorStop(1, '#090d16');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        const vx = w * 0.5 + Math.sin(t * 1.7) * 45;
        const vy = h * 0.42;

        for (let i = 0; i < 12; i++) {
          const z = ((t * 2.5 + i / 12) % 1);
          const spread = Math.pow(z, 2.2);
          const lx1 = vx - spread * w * 0.7;
          const lx2 = vx + spread * w * 0.7;
          const ly = vy - spread * h * 0.38;
          const size = Math.max(2, spread * 18);

          ctx.fillStyle = `rgba(56, 189, 248, ${spread * 0.85})`;
          ctx.fillRect(lx1, ly, size * 2, size * 0.6);
          ctx.fillRect(lx2, ly, size * 2, size * 0.6);
        }

        for (let s = 0; s < 25; s++) {
          const p = s / 25;
          const curve = Math.sin(t * 3 - p * 4) * 38 * p;
          const y = vy + 20 + p * (h * 0.52);
          const spread = 26 + p * 120;

          ctx.fillStyle = `rgba(255, 45, 117, ${0.15 + p * 0.5})`;
          ctx.beginPath();
          ctx.arc(vx - spread + curve, y, 4 + p * 10, 0, Math.PI * 2);
          ctx.arc(vx + spread + curve, y, 4 + p * 10, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (sceneType === 'synth_studio') {
        ctx.fillStyle = '#070712';
        ctx.fillRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h * 0.44;
        for (let i = 0; i < 72; i++) {
          const angle = i * 0.35 + t * 1.4;
          const dist = 18 + i * 2.9 + Math.sin(t * 5 + i) * 12;
          const px = cx + Math.cos(angle) * dist;
          const py = cy + Math.sin(angle) * dist * 0.85;
          const rad = 2.5 + (i % 4) * 1.5;

          ctx.fillStyle = i % 3 === 0 ? '#8B5CF6' : i % 3 === 1 ? '#FF2D75' : '#38BDF8';
          ctx.beginPath();
          ctx.arc(px, py, rad, 0, Math.PI * 2);
          ctx.fill();
        }

        const bars = 28;
        const barW = (w * 0.76) / bars;
        const startX = w * 0.12;
        for (let b = 0; b < bars; b++) {
          const amp = Math.abs(Math.sin(t * 7 + b * 0.45)) * 75 + 12;
          ctx.fillStyle = b % 2 === 0 ? '#8B5CF6' : '#FF2D75';
          ctx.fillRect(startX + b * barW, h * 0.68 - amp / 2, barW - 3, amp);
        }
      } else {
        ctx.fillStyle = '#090614';
        ctx.fillRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h * 0.45;
        for (let ring = 1; ring <= 7; ring++) {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(t * (ring % 2 === 0 ? 0.6 : -0.6) + ring * 0.3);
          ctx.strokeStyle = ring % 2 === 0 ? '#8B5CF6' : '#FF2D75';
          ctx.lineWidth = 2.2;
          const size = ring * 22 + Math.sin(t * 3 + ring) * 10;
          ctx.strokeRect(-size, -size, size * 2, size * 2);
          ctx.restore();
        }
      }

      ctx.restore();

      if (isActive || compact) {
        animId = requestAnimationFrame(render);
      }
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [sceneType, videoUrl, isPlaying, isActive, trimStart, trimEnd, duration, compact, onTimeUpdate]);




  const handleSurfaceClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!showControls) return;
      const now = Date.now();
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (now - lastTapRef.current < 280) {
        if (singleTapTimeoutRef.current) {
          window.clearTimeout(singleTapTimeoutRef.current);
          singleTapTimeoutRef.current = null;
        }
        const newHeart: FloatingHeart = { id: now + Math.random(), x, y };
        setHearts((prev) => [...prev, newHeart]);
        window.setTimeout(() => {
          setHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
        }, 1200);
        if (onDoubleTapLike) onDoubleTapLike();
      } else {
        singleTapTimeoutRef.current = window.setTimeout(() => {
          setIsPlaying((prev) => !prev);
        }, 240);
      }
      lastTapRef.current = now;
    },
    [showControls, onDoubleTapLike]
  );

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const effectiveDuration = Math.max(1, (trimEnd || duration) - trimStart);
    const targetTime = trimStart + ratio * effectiveDuration;
    elapsedRef.current = targetTime;
    setProgress(ratio * 100);
    if (videoRef.current && videoUrl) {
      videoRef.current.currentTime = targetTime;
    }
  };

  return (
    <div
      onClick={handleSurfaceClick}
      className={`relative w-full h-full overflow-hidden bg-[#080808] select-none ${
        showControls ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          playsInline
          loop
          muted={isMuted}
          onTimeUpdate={(e) => {
            const vid = e.currentTarget;
            if (vid.currentTime >= (trimEnd || vid.duration || 15)) {
              vid.currentTime = trimStart;
            }
            const effDur = Math.max(1, (trimEnd || vid.duration || 15) - trimStart);
            setProgress(
              Math.min(100, Math.max(0, ((vid.currentTime - trimStart) / effDur) * 100))
            );
            if (onTimeUpdate) {
              onTimeUpdate(vid.currentTime);
            }
          }}
          className="w-full h-full object-cover"
          style={getVideoFilterStyle(filter, filterIntensity)}
        />
      ) : (
        <canvas
          ref={canvasRef}
          width={compact ? 240 : 480}
          height={compact ? 420 : 854}
          className="w-full h-full object-cover"
          style={getVideoFilterStyle(filter, filterIntensity)}
        />
      )}

      {!compact && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/70 via-black/25 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />
        </>
      )}

      <VideoWatermarkOverlay watermark={watermark} compact={compact} />

      {showControls && !isPlaying && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl">
            <Play className="w-8 h-8 text-white fill-white ml-1" />
          </div>
        </div>
      )}

      {hearts.map((h) => (
        <div
          key={h.id}
          style={{ left: h.x - 40, top: h.y - 40 }}
          className="pointer-events-none absolute z-30 animate-float-up"
        >
          <Heart className="w-20 h-20 text-[#FF2D75] fill-[#FF2D75] drop-shadow-[0_4px_24px_rgba(255,45,117,0.8)]" />
        </div>
      ))}

      {showControls && !compact && (
        <div
          onClick={handleScrub}
          className="absolute bottom-0 inset-x-0 h-3 flex items-end z-30 group cursor-ew-resize"
          title="Scrub video timeline"
        >
          <div className="w-full h-1 group-hover:h-2 bg-white/20 transition-all">
            <div
              style={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#FF2D75] relative"
            >
              <div className="w-3 h-3 rounded-full bg-white shadow-md absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
