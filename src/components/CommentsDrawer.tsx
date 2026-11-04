import React, { useState } from 'react';
import {
  X,
  Heart,
  Send,
  CornerDownRight,
  Flag,
  Trash2,
  BadgeCheck,
  AtSign,
} from 'lucide-react';
import { Comment, User, Video } from '../types';

interface CommentsDrawerProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
  comments: Comment[];
  users: User[];
  currentUser: User | null;
  onAddComment: (videoId: string, text: string) => void;
  onReplyComment: (commentId: string, text: string) => void;
  onToggleLikeComment: (commentId: string) => void;
  onDeleteComment: (commentId: string) => void;
  onReportContent: (targetType: 'comment', targetId: string, reason: string) => void;
  onSelectUser: (userId: string) => void;
  onRequireAuth: (reason: string) => void;
}

export const CommentsDrawer: React.FC<CommentsDrawerProps> = ({
  video,
  isOpen,
  onClose,
  comments,
  users,
  currentUser,
  onAddComment,
  onReplyComment,
  onToggleLikeComment,
  onDeleteComment,
  onReportContent,
  onSelectUser,
  onRequireAuth,
}) => {
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null);
  const [reportedToast, setReportedToast] = useState<string | null>(null);

  if (!isOpen || !video) return null;

  const videoComments = comments.filter((c) => c.videoId === video.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireAuth('Please log in to post comments.');
      return;
    }
    if (!commentText.trim()) return;

    if (replyingTo) {
      onReplyComment(replyingTo.id, commentText.trim());
      setReplyingTo(null);
    } else {
      onAddComment(video.id, commentText.trim());
    }
    setCommentText('');
  };

  const getUser = (uid: string) =>
    users.find((u) => u.id === uid) || {
      id: uid,
      username: 'user',
      displayName: 'User',
      avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Fallback',
      verified: false,
    };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full sm:max-w-lg h-[75vh] sm:h-[640px] bg-white dark:bg-[#151515] text-slate-900 dark:text-white rounded-t-3xl sm:rounded-3xl border-t sm:border border-slate-200 dark:border-white/10 flex flex-col overflow-hidden shadow-2xl">
        <div className="w-10 h-1.5 bg-slate-300 dark:bg-zinc-700 rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-base">Comments</h3>
            <span className="text-xs font-mono tabular-nums text-slate-500">
              · {videoComments.reduce((acc, c) => acc + 1 + c.replies.length, 0)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {reportedToast && (
          <div className="px-4 py-2 bg-amber-500/15 text-amber-500 text-xs font-medium text-center">
            {reportedToast}
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {videoComments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
              <p className="text-sm font-medium">No comments yet</p>
              <p className="text-xs mt-1">Be the first to share your thoughts ☆</p>
            </div>
          ) : (
            videoComments.map((comment) => {
              const author = getUser(comment.userId);
              const isLiked = currentUser ? comment.likes.includes(currentUser.id) : false;

              return (
                <div key={comment.id} className="space-y-3">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => {
                        onClose();
                        onSelectUser(author.id);
                      }}
                      className="shrink-0 cursor-pointer"
                    >
                      <img
                        src={author.avatar}
                        alt={author.displayName}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-full object-cover bg-slate-800"
                      />
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            onClose();
                            onSelectUser(author.id);
                          }}
                          className="text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>@{author.username}</span>
                          {author.verified && (
                            <BadgeCheck className="w-3.5 h-3.5 text-[#8B5CF6]" />
                          )}
                        </button>
                      </div>

                      <p className="text-sm text-slate-800 dark:text-zinc-200 mt-1 break-words">
                        {comment.text}
                      </p>

                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <button
                          onClick={() =>
                            setReplyingTo({ id: comment.id, username: author.username })
                          }
                          className="font-medium hover:text-[#8B5CF6] cursor-pointer"
                        >
                          Reply
                        </button>
                        <button
                          onClick={() => {
                            onReportContent('comment', comment.id, 'Inappropriate comment');
                            setReportedToast('Comment reported.');
                            setTimeout(() => setReportedToast(null), 2500);
                          }}
                          className="hover:text-amber-500 flex items-center gap-1 cursor-pointer"
                        >
                          <Flag className="w-3 h-3" />
                          <span>Report</span>
                        </button>
                        {currentUser &&
                          (currentUser.id === comment.userId || currentUser.role === 'admin') && (
                            <button
                              onClick={() => onDeleteComment(comment.id)}
                              className="hover:text-red-500 flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (!currentUser) {
                          onRequireAuth('Log in to like comments.');
                          return;
                        }
                        onToggleLikeComment(comment.id);
                      }}
                      className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-[#FF2D75] cursor-pointer"
                    >
                      <Heart
                        className={`w-4 h-4 ${isLiked ? 'text-[#FF2D75] fill-[#FF2D75]' : ''}`}
                      />
                      <span className="text-[11px] font-mono tabular-nums">
                        {comment.likes.length}
                      </span>
                    </button>
                  </div>

                  {/* Replies */}
                  {comment.replies.length > 0 && (
                    <div className="pl-11 space-y-2">
                      {comment.replies.map((reply) => {
                        const rAuthor = getUser(reply.userId);
                        return (
                          <div
                            key={reply.id}
                            className="flex items-start gap-2.5 bg-slate-50 dark:bg-white/5 p-2 rounded-xl"
                          >
                            <CornerDownRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-1" />
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-semibold">@{rAuthor.username}</span>
                              <p className="text-xs text-slate-700 dark:text-zinc-300">
                                {reply.text}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Input */}
        <div className="p-3.5 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0c0c0c]">
          {replyingTo && (
            <div className="flex items-center justify-between text-xs text-[#8B5CF6] mb-2">
              <span>Replying to @{replyingTo.username}</span>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="hover:underline font-semibold"
              >
                Cancel
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={replyingTo ? 'Write a reply...' : 'Add comment...'}
              className="flex-1 px-4 py-2.5 rounded-full bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:border-[#8B5CF6]"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#FF2D75] disabled:opacity-40 text-white flex items-center justify-center shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
