import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Apple,
  Monitor,
  Download,
  CheckCircle2,
  Share2,
  PlusSquare,
  ShieldCheck,
  Zap,
  Globe,
  HardDrive,
  Cpu,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { StarLogo } from './StarLogo';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'desktop' | 'apk'>(
    isIOS ? 'ios' : isAndroid ? 'android' : 'android'
  );
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstallSuccess(true);
        setTimeout(() => onClose(), 1800);
      }
    } else {
      // Manual fallback advice for browsers
      alert('To install, tap your browser menu (⋮ or Share) and select "Add to Home screen" or "Install App"');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#8B5CF6] to-[#FF2D75] p-0.5 shadow-md flex items-center justify-center">
              <img src="/pwa-192x192.png" alt="Star Media" className="w-full h-full rounded-[14px] object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-base sm:text-lg">Install ☆MEDIA APP</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
                  Universal APK / PWA
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Native app experience across Android, iOS, Windows, macOS & Linux
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 flex items-center justify-center text-slate-500 dark:text-zinc-400 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#0a0a0a] px-3 pt-2 gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'android', label: 'Android (APK)', icon: Smartphone },
            { id: 'ios', label: 'iPhone / iOS', icon: Apple },
            { id: 'desktop', label: 'PC / Mac / Linux', icon: Monitor },
            { id: 'apk', label: 'Standalone APK Info', icon: HardDrive },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border-b-2 ${
                  isSelected
                    ? 'border-[#8B5CF6] text-[#8B5CF6] bg-white dark:bg-[#121212]'
                    : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {installSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>App installed successfully! You can launch it from your home screen.</span>
            </div>
          )}

          {isInstalled && (
            <div className="p-3.5 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-500 flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>You are already running the installed standalone app.</span>
            </div>
          )}

          {/* Android Tab */}
          {activeTab === 'android' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#8B5CF6]/10 to-[#FF2D75]/10 border border-[#8B5CF6]/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-zinc-200">
                    <Smartphone className="w-4 h-4 text-[#8B5CF6]" />
                    <span>Android Direct 1-Click Install</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#8B5CF6] text-white">
                    Recommended
                  </span>
                </div>
                <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Installs as a native APK package directly onto your Android device home screen and app drawer with offline video caching and full-screen camera support.
                </p>
                <button
                  onClick={handleInstallClick}
                  className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#FF2D75] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:opacity-95 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Install App on Android</span>
                </button>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider text-[11px]">
                  Alternative Manual Steps:
                </h4>
                <ol className="space-y-2 text-slate-600 dark:text-zinc-400 pl-4 list-decimal">
                  <li>Open this URL in Google Chrome or Samsung Internet on your Android device.</li>
                  <li>Tap the <strong>three dots menu (⋮)</strong> in the top-right corner.</li>
                  <li>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                  <li>Tap <strong>Install</strong>. The ☆MEDIA APP icon will immediately appear on your home screen!</li>
                </ol>
              </div>
            </div>
          )}

          {/* iOS Tab */}
          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-[#181818] border border-slate-200 dark:border-white/10 space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-zinc-200">
                  <Apple className="w-4 h-4 text-[#FF2D75]" />
                  <span>How to Install on iPhone & iPad</span>
                </div>
                <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Apple Safari enables full standalone app mode with native gestures and no browser URL bar.
                </p>
              </div>

              <div className="space-y-3 pl-1">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#101010] border border-slate-200 dark:border-white/5">
                  <div className="w-6 h-6 rounded-lg bg-[#8B5CF6]/15 text-[#8B5CF6] font-bold flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <span className="font-bold block text-slate-800 dark:text-zinc-200">Open in Safari</span>
                    <span className="text-slate-500 dark:text-zinc-400">Ensure you are browsing this app in Apple Safari.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#101010] border border-slate-200 dark:border-white/5">
                  <div className="w-6 h-6 rounded-lg bg-[#8B5CF6]/15 text-[#8B5CF6] font-bold flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <span className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-zinc-200">
                      <span>Tap the Share Button</span>
                      <Share2 className="w-3.5 h-3.5 text-[#8B5CF6]" />
                    </span>
                    <span className="text-slate-500 dark:text-zinc-400">Located at the bottom toolbar of Safari (square with up arrow).</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#101010] border border-slate-200 dark:border-white/5">
                  <div className="w-6 h-6 rounded-lg bg-[#8B5CF6]/15 text-[#8B5CF6] font-bold flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <span className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-zinc-200">
                      <span>Tap "Add to Home Screen"</span>
                      <PlusSquare className="w-3.5 h-3.5 text-[#FF2D75]" />
                    </span>
                    <span className="text-slate-500 dark:text-zinc-400">Scroll down the menu list and tap "Add to Home Screen".</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Tab */}
          {activeTab === 'desktop' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-[#181818] border border-slate-200 dark:border-white/10 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-zinc-200">
                  <Monitor className="w-4 h-4 text-[#8B5CF6]" />
                  <span>Desktop App (Windows, macOS, Linux)</span>
                </div>
                <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Run ☆MEDIA APP as an isolated desktop window with dedicated taskbar pin, hardware acceleration, and keyboard navigation.
                </p>
                <button
                  onClick={handleInstallClick}
                  className="w-full mt-2 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Install Desktop Application</span>
                </button>
              </div>

              <div className="space-y-2 text-slate-600 dark:text-zinc-400">
                <p>
                  <strong>Chrome / Edge:</strong> Click the install icon (⊕ or computer with arrow) in your browser address bar.
                </p>
                <p>
                  <strong>Linux (Ubuntu, Fedora, Arch):</strong> Fully supported via Chromium / Chrome PWA desktop shortcuts.
                </p>
              </div>
            </div>
          )}

          {/* Standalone APK info tab */}
          {activeTab === 'apk' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-[#181818] border border-slate-200 dark:border-white/10 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-zinc-200">
                  <HardDrive className="w-4 h-4 text-emerald-500" />
                  <span>Generate Standalone .APK Package</span>
                </div>
                <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                  This app includes a complete Google-compliant <strong>Web App Manifest</strong> and <strong>Service Worker</strong> ready for direct Trusted Web Activity (TWA) APK packaging.
                </p>
              </div>

              <div className="space-y-2 bg-slate-50 dark:bg-[#0c0c0c] p-3.5 rounded-xl border border-slate-200 dark:border-white/10 font-mono text-[11px]">
                <div className="text-slate-400"># To generate a signing .apk file for Google Play / Sideloading:</div>
                <div className="text-[#8B5CF6]">1. Visit: https://www.pwabuilder.com</div>
                <div className="text-[#FF2D75]">2. Paste this app's URL: {window.location.origin}</div>
                <div className="text-emerald-500">3. Click "Build APK" -> Download signed .apk!</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>100% Android PWA Compliant</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Instant Offline Cache Ready</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-[#0c0c0c] border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400">
            <Globe className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>Universal Progressive Web App (PWA)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
