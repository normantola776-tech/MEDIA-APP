import React, { useState, useRef } from 'react';
import {
  Bell,
  MessageSquare,
  Send,
  Image as ImageIcon,
  Trash2,
  Ban,
  CheckCheck,
  Heart,
  MessageCircle,
  UserPlus,
  AtSign,
  Film,
  BadgeCheck,
  Check,
} from 'lucide-react';
import { DirectMessage, NotificationItem, User, Video } from '../types';
import { CanvasVideoPlayer } from './CanvasVideoPlayer';

interface InboxViewProps {
  currentUser: User | null;
  users: User[];
  videos: Video[];
  messages: DirectMessage[];
  notifications: NotificationItem[];
  initialPartnerId?: string | null;
  onSendMessage: (receiverId: string, text: string, imageUrl?: string, sharedVideoId?: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onMarkConversationRead: (partnerId: string) => void;
  onMarkAllNotificationsRead: () => void;
  onMarkNotificationRead: (notifId: string) => void;
  onToggleBlockUser: (targetUserId: string) => void;
  onSelectUser: (userId: string) => void;
  onRequireAuth: (reason: string) => void;
}

export const InboxView: React.FC<InboxViewProps> = ({
  currentUser,
  users,
  videos,
  messages,
  notifications,
  initialPartnerId,
  onSendMessage,
  onDeleteMessage,
  onMarkConversationRead,
  onMarkAllNotificationsRead,
  onMarkNotificationRead,
  onToggleBlockUser,
  onSelectUser,
  onRequireAuth,
}) => {
  const [activeSection, setActiveSection] = useState<'messages' | 'notifications'>(
    initialPartnerId ? 'messages' : 'messages'
  );
  const [notifFilter, setNotifFilter] = useState<'all' | 'like' | 'comment' | 'follow' | 'mention'>('all');
  const otherUsers = users.filter((u) => u.id !== currentUser?.id);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(
    initialPartnerId || otherUsers[0]?.id || ''
  );
  const [msgText, setMsgText] = useState<string>('');
  const [shareVideoPickerOpen, setShareVideoPickerOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (initialPartnerId) {
      setSelectedPartnerId(initialPartnerId);
      setActiveSection('messages');
    }
  }, [initialPartnerId]);

  React.useEffect(() => {
    if (currentUser && selectedPartnerId && activeSection === 'messages') {
      onMarkConversationRead(selectedPartnerId);
    }
  }, [currentUser, selectedPartnerId, activeSection]);

  if (!currentUser) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-[#080808] text-slate-900 dark:text-white">
        <MessageSquare className="w-12 h-12 text-[#8B5CF6] mb-3" />
        <h2 className="font-display font-bold text-xl">Inbox & Notifications</h2>
        <p className="text-xs text-slate-500 max-w-xs mt-1.5 mb-5">
          Log in to send private 1-on-1 messages and see activity notifications.
        </p>
        <button
          onClick={() => onRequireAuth('Log in to access your Inbox.')}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#FF2D75] text-white text-xs font-semibold shadow-lg cursor-pointer"
        >
          Log In / Sign Up
        </button>
      </div>
    );
  }

  const myNotifications = notifications.filter((n) => n.userId === currentUser.id);
  const unreadNotifCount = myNotifications.filter((n) => !n.read).length;
  const unreadMsgCount = messages.filter(
    (m) => m.receiverId === currentUser.id && !m.read
  ).length;

  const partnerUser = users.find((u) => u.id === selectedPartnerId) || otherUsers[0];
  const isBlocked = partnerUser ? currentUser.blockedUsers.includes(partnerUser.id) : false;

  const conversationMessages = messages.filter(
    (m) =>
      (m.senderId === currentUser.id && m.receiverId === partnerUser?.id) ||
      (m.senderId === partnerUser?.id && m.receiverId === currentUser.id)
  );

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerUser || !msgText.trim() || isBlocked) return;
    onSendMessage(partnerUser.id, msgText.trim());
    setMsgText('');
  };

  const filteredNotifs = myNotifications.filter((n) =>
    notifFilter === 'all' ? true : n.type === notifFilter
  );

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-50 dark:bg-[#080808] text-slate-900 dark:text-white pb-24 sm:pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight">
              Inbox & Activity Centre
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Direct chats, shared videos, and real-time alerts.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start">
            <button
              onClick={() => setActiveSection('messages')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer ${
                activeSection === 'messages'
                  ? 'bg-[#8B5CF6] text-white shadow-md'
                  : 'bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Messages</span>
              {unreadMsgCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#FF2D75] text-white text-[10px] font-mono">
                  {unreadMsgCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSection('notifications')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer ${
                activeSection === 'notifications'
                  ? 'bg-[#8B5CF6] text-white shadow-md'
                  : 'bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
              {unreadNotifCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#FF2D75] text-white text-[10px] font-mono">
                  {unreadNotifCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {activeSection === 'messages' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[620px]">
            {/* Contacts */}
            <div className="lg:col-span-4 rounded-3xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-white/10">
                <h2 className="font-display font-bold text-sm">Direct Messages</h2>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
                {otherUsers.map((u) => {
                  const isSelected = partnerUser?.id === u.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        setSelectedPartnerId(u.id);
                        onMarkConversationRead(u.id);
                      }}
                      className={`w-full p-3.5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                        isSelected ? 'bg-[#8B5CF6]/10' : 'hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={u.avatar}
                          alt={u.displayName}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-xs truncate">@{u.username}</p>
                          <p className="text-[11px] text-slate-400 truncate">{u.displayName}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chat Room */}
            {partnerUser && (
              <div className="lg:col-span-8 rounded-3xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 flex flex-col overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={partnerUser.avatar}
                      alt={partnerUser.displayName}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-bold text-sm">{partnerUser.displayName}</p>
                      <p className="text-[10px] text-slate-400">@{partnerUser.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleBlockUser(partnerUser.id)}
                    className="text-xs text-red-500 font-semibold cursor-pointer"
                  >
                    {isBlocked ? 'Unblock' : 'Block'}
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {conversationMessages.map((m) => {
                    const isMine = m.senderId === currentUser.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl p-3 text-xs leading-relaxed ${
                            isMine
                              ? 'bg-gradient-to-r from-[#8B5CF6] to-[#FF2D75] text-white'
                              : 'bg-slate-100 dark:bg-white/10'
                          }`}
                        >
                          <p>{m.text}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1">
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <form
                  onSubmit={handleSendText}
                  className="p-3.5 border-t border-slate-200 dark:border-white/10 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={msgText}
                    onChange={(e) => setMsgText(e.target.value)}
                    placeholder={`Message @${partnerUser.username}...`}
                    className="flex-1 px-4 py-2.5 rounded-full bg-slate-100 dark:bg-[#181818] border border-slate-200 dark:border-white/10 text-xs focus:outline-none focus:border-[#8B5CF6]"
                  />
                  <button
                    type="submit"
                    disabled={!msgText.trim()}
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#FF2D75] disabled:opacity-40 text-white flex items-center justify-center cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          /* Notifications */
          <div className="rounded-3xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 overflow-hidden divide-y divide-slate-100 dark:divide-white/5">
            <div className="p-4 flex items-center justify-between">
              <span className="text-xs font-bold">Activity Notifications</span>
              <button
                onClick={onMarkAllNotificationsRead}
                className="text-xs text-[#8B5CF6] font-semibold hover:underline cursor-pointer"
              >
                Mark all as read
              </button>
            </div>
            {filteredNotifs.map((n) => (
              <div key={n.id} className="p-4 flex items-center gap-3">
                <Bell className="w-4 h-4 text-[#FF2D75]" />
                <div className="flex-1 text-xs">
                  <p>{n.text}</p>
                  <span className="text-[10px] text-slate-400">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
