import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  AtSign,
  FileText,
  CheckCircle2,
  ArrowRight,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { User } from '../types';
import { StarLogo } from './StarLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onLoginSuccess: (user: User) => void;
  onRegisterUser: (newUser: User) => void;
  onResetPassword: (email: string, newPass: string) => boolean;
  onGoogleSignIn?: () => Promise<void>;
  reasonMessage?: string;
}

const AVATAR_PRESETS = [
  'https://api.dicebear.com/9.x/avataaars/svg?seed=StarCreator1&backgroundColor=8b5cf6',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=StarCreator2&backgroundColor=ff2d75',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=StarCreator3&backgroundColor=0ea5e9',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=StarCreator4&backgroundColor=10b981',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  users,
  onLoginSuccess,
  onRegisterUser,
  onResetPassword,
  onGoogleSignIn,
  reasonMessage,
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0]);
  const [requestVerified, setRequestVerified] = useState(true);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    if (!onGoogleSignIn) return;
    setError('');
    setIsGoogleLoading(true);
    try {
      await onGoogleSignIn();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const clean = identifier.trim().toLowerCase().replace(/^@/, '');
    const found = users.find(
      (u) => u.email.toLowerCase() === clean || u.username.toLowerCase() === clean
    );
    if (!found) {
      setError('No account found with that email or username.');
      return;
    }
    if (found.suspended) {
      setError('This account has been suspended by an administrator.');
      return;
    }
    if (found.password && found.password !== password && password !== 'password123') {
      setError('Incorrect password. Try "password123" for demo accounts.');
      return;
    }
    onLoginSuccess(found);
    onClose();
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanUsername = username
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '');

    if (cleanUsername.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      setError('That username is already taken. Please choose another.');
      return;
    }
    if (!identifier.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const newUser: User = {
      id: `u-${Date.now()}`,
      username: cleanUsername,
      displayName: displayName.trim() || cleanUsername,
      email: identifier.trim(),
      password,
      avatar: selectedAvatar,
      bio: bio.trim() || 'Creator on ☆MEDIA APP ☆ Create. Share. Connect.',
      createdAt: new Date().toISOString(),
      verified: requestVerified,
      role: 'creator',
      canGoLive: true,
      coinBalance: 250,
      subscribedCreatorIds: [],
      followers: ['u-1', 'u-2'],
      following: ['u-1'],
      blockedUsers: [],
      online: true,
      privacy: {
        privateAccount: false,
        allowComments: 'everyone',
        allowMessages: 'everyone',
        showActivityStatus: true,
      },
      notificationPrefs: {
        likes: true,
        comments: true,
        follows: true,
        messages: true,
        mentions: true,
        earnings: true,
        subscriptions: true,
      },
    };

    onRegisterUser(newUser);
    onLoginSuccess(newUser);
    onClose();
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const updated = onResetPassword(resetEmail.trim(), newPassword);
    if (!updated) {
      setError('No registered account matches that email address.');
      return;
    }
    setSuccessMsg('Password reset successfully! Logging you in...');
    setTimeout(() => {
      setMode('login');
      setIdentifier(resetEmail.trim());
      setPassword(newPassword);
      setSuccessMsg('');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 shadow-2xl p-6 sm:p-8 text-slate-900 dark:text-white my-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <StarLogo size="lg" showTagline />
          {reasonMessage && (
            <p className="mt-3 text-xs font-medium text-[#FF2D75] bg-[#FF2D75]/10 px-3 py-1.5 rounded-lg">
              {reasonMessage}
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#080808] mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === 'login'
                ? 'bg-white dark:bg-[#1e1e1e] text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-white'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError('');
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === 'signup'
                ? 'bg-white dark:bg-[#1e1e1e] text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-white'
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('forgot');
              setError('');
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === 'forgot'
                ? 'bg-white dark:bg-[#1e1e1e] text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-white'
            }`}
          >
            Reset
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-500">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-500">
            {successMsg}
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1.5">
                Email or @username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="alex@starmedia.app or @alex_nova"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#FF2D75] text-white font-semibold text-sm shadow-lg shadow-[#8B5CF6]/25 hover:opacity-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Log In</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onGoogleSignIn && (
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isGoogleLoading}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-white/20 bg-white dark:bg-[#1a1a1a] hover:bg-slate-50 dark:hover:bg-white/10 text-slate-800 dark:text-white font-semibold text-xs flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google (Firebase)'}</span>
              </button>
            )}

            {/* Instant Demo Switcher */}
            <div className="pt-3 border-t border-slate-200 dark:border-white/10">
              <p className="text-[11px] font-medium text-slate-400 mb-2">Instant Demo Accounts:</p>
              <div className="grid grid-cols-3 gap-2">
                {users.slice(0, 2).map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      onLoginSuccess(u);
                      onClose();
                    }}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center cursor-pointer"
                  >
                    <span className="text-[11px] font-bold block truncate">@{u.username}</span>
                    <span className="text-[10px] text-slate-400">Creator</span>
                  </button>
                ))}
                {users
                  .filter((u) => u.role === 'admin')
                  .map((admin) => (
                    <button
                      key={admin.id}
                      type="button"
                      onClick={() => {
                        onLoginSuccess(admin);
                        onClose();
                      }}
                      className="p-2 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-center cursor-pointer"
                    >
                      <span className="text-[11px] font-bold text-[#8B5CF6] block truncate">
                        @{admin.username}
                      </span>
                      <span className="text-[10px] text-[#8B5CF6]">Admin</span>
                    </button>
                  ))}
              </div>
            </div>
          </form>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="star_fan"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-white/10 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Star Fan"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-white/10 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Email</label>
              <input
                type="email"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="fan@starmedia.app"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-white/10 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-white/10 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#FF2D75] text-white font-semibold text-xs shadow-lg cursor-pointer"
            >
              Create Account
            </button>

            {onGoogleSignIn && (
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isGoogleLoading}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-white/20 bg-white dark:bg-[#1a1a1a] hover:bg-slate-50 dark:hover:bg-white/10 text-slate-800 dark:text-white font-semibold text-xs flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{isGoogleLoading ? 'Connecting...' : 'Sign Up with Google (Firebase)'}</span>
              </button>
            )}
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1">Registered Email</label>
              <input
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="alex@starmedia.app"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-white/10 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-white/10 text-xs"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#8B5CF6] text-white font-semibold text-xs cursor-pointer"
            >
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
