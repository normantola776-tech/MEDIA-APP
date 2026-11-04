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

  if (!isOpen) return null;

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
