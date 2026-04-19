'use client';

import { useComments, useCreateComment, useDeleteComment } from '@/hooks/api';
import { Comment } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '@/lib/auth';
import { ChevronDown, MessageSquare, Trash2, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { slideInLeft } from '@/lib/animations';

const CommentItem = ({ comment, blogId }: { comment: Comment; blogId: string }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [relativeTime, setRelativeTime] = useState('');
  const { user } = useAuthStore();
  const { mutate: createComment, isPending: isCreating } = useCreateComment();
  const { mutate: deleteComment, isPending: isDeleting } = useDeleteComment();
  const { toast } = useToast();

  const isAuthor = user?.id === comment.author.id;
  const isDeleted = !!comment.deletedAt;

  useEffect(() => {
    if (comment.createdAt) {
      setRelativeTime(formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }));
    }
  }, [comment.createdAt]);

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    createComment(
      { blogId, content: replyContent, parentId: comment.id },
      {
        onSuccess: () => {
          setReplyContent('');
          setIsReplying(false);
          setIsExpanded(true);
        },
      }
    );
  };

  const handleDelete = () => {
    if (confirm('Delete this comment?')) {
      deleteComment({ id: comment.id, blogId });
    }
  };

  return (
    <motion.div variants={slideInLeft} layout className="flex flex-col mb-4">
      <div className="flex space-x-3">
        <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center shrink-0 overflow-hidden">
          {isDeleted ? (
            <div className="w-full h-full bg-gray-800" />
          ) : comment.author.avatar ? (
            <img src={comment.author.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400 font-bold text-xs">{comment.author.name.charAt(0)}</span>
          )}
        </div>
        
        <div className="flex-1">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl rounded-tl-none p-4">
            <div className="flex justify-between items-start mb-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm text-gray-200">
                  {isDeleted ? 'Deleted User' : comment.author.name}
                </span>
                <span className="text-xs text-gray-500">
                  {relativeTime}
                </span>
              </div>
              {isAuthor && !isDeleted && (
                <button disabled={isDeleting} onClick={handleDelete} className="text-gray-500 hover:text-red-400 transition">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <p className={`text-sm ${isDeleted ? 'text-gray-500 italic' : 'text-gray-300'}`}>
              {isDeleted ? 'This comment has been deleted.' : comment.content}
            </p>
          </div>

          {!isDeleted && (
            <div className="flex items-center space-x-4 mt-2 ml-2">
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="text-xs text-gray-400 hover:text-white flex items-center space-x-1 transition"
              >
                <MessageSquare size={12} />
                <span>Reply</span>
              </button>
              {comment.replies && comment.replies.length > 0 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs text-gray-400 hover:text-white flex items-center space-x-1 transition"
                >
                  <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                    <ChevronDown size={14} />
                  </motion.div>
                  <span>{comment.replies.length} Replies</span>
                </button>
              )}
            </div>
          )}

          <AnimatePresence>
            {isReplying && (
              <motion.form
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                className="mt-3 relative"
                onSubmit={handleReply}
              >
                <input
                  autoFocus
                  type="text"
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-full py-2 px-4 pr-10 text-sm text-white focus:outline-none focus:border-blue-500"
                  disabled={isCreating}
                />
                <button
                  type="submit"
                  disabled={isCreating || !replyContent.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 disabled:text-gray-600 p-1"
                >
                  {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && comment.replies && comment.replies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="ml-8 mt-4 border-l-2 border-gray-800 pl-4 space-y-4"
          >
            {comment.replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} blogId={blogId} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const CommentThread = ({ blogId }: { blogId: string }) => {
  const { data: comments, isLoading } = useComments(blogId);
  const { mutate: createComment, isPending } = useCreateComment();
  const { isAuthenticated } = useAuthStore();
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    createComment({ blogId, content }, { onSuccess: () => setContent('') });
  };

  if (isLoading) {
    return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
        <span>Comments</span>
        <span className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded-full">{comments?.length || 0}</span>
      </h3>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-8 relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add to the discussion..."
            className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 pr-12 text-white focus:outline-none focus:border-blue-500 resize-none min-h-[100px]"
            disabled={isPending}
          />
          <button
            type="submit"
            disabled={isPending || !content.trim()}
            className="absolute right-3 bottom-4 p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white rounded-lg transition"
          >
            {isPending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center mb-8">
          <p className="text-gray-400 mb-2">Join the conversation</p>
          <a href="/auth/login" className="text-blue-500 hover:text-blue-400 font-medium">Log in to comment</a>
        </div>
      )}

      <div className="space-y-4">
        {comments?.map((comment) => (
          <CommentItem key={comment.id} comment={comment} blogId={blogId} />
        ))}
        {comments?.length === 0 && <p className="text-gray-500 text-center py-8">No comments yet. Be the first!</p>}
      </div>
    </div>
  );
};
