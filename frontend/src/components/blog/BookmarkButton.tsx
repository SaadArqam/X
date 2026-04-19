'use client';

import { useBookmarkBlog } from '@/hooks/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark } from 'lucide-react';
import { useAuthStore } from '@/lib/auth';
import { useToast } from '@/hooks/useToast';
import { useState } from 'react';

interface BookmarkButtonProps {
  blogId: string;
  initialBookmarked?: boolean;
}

export const BookmarkButton = ({ blogId, initialBookmarked = false }: BookmarkButtonProps) => {
  const { mutate, isPending } = useBookmarkBlog();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  
  const [localBookmarked, setLocalBookmarked] = useState(initialBookmarked);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast('Please login to bookmark posts', 'error');
      return;
    }
    
    if (isPending) return;

    const newValue = !localBookmarked;
    setLocalBookmarked(newValue);
    mutate(blogId);

    if (newValue) {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 1500);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleBookmark}
        className={`transition-colors relative overflow-hidden ${
          localBookmarked ? 'text-blue-500' : 'text-gray-400 hover:text-blue-400'
        }`}
      >
        <Bookmark size={18} />
        
        {/* Animated fill overlay using clip-path */}
        {localBookmarked && (
          <motion.div
            initial={{ clipPath: 'inset(100% 0 0 0)' }}
            animate={{ clipPath: 'inset(0% 0 0 0)' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute inset-0 text-blue-500"
          >
            <Bookmark size={18} fill="currentColor" />
          </motion.div>
        )}
      </button>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: -25, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap"
          >
            Saved!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
