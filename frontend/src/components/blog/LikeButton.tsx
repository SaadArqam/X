'use client';

import { useLikeBlog } from '@/hooks/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useAuthStore } from '@/lib/auth';
import { useToast } from '@/hooks/useToast';
import { useState } from 'react';

interface LikeButtonProps {
  blogId: string;
  initialLiked?: boolean;
  initialCount?: number;
}

export const LikeButton = ({ blogId, initialLiked = false, initialCount = 0 }: LikeButtonProps) => {
  const { mutate, isPending } = useLikeBlog();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const [isAnimating, setIsAnimating] = useState(false);

  // Fallback state if query cache isn't instantly available
  const [localLiked, setLocalLiked] = useState(initialLiked);
  const [localCount, setLocalCount] = useState(initialCount);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating if inside a Link
    if (!isAuthenticated) {
      toast('Please login to like posts', 'error');
      return;
    }
    
    if (isPending) return;

    if (!localLiked) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000); // 1s animation lock
    }

    setLocalLiked(!localLiked);
    setLocalCount(c => (localLiked ? c - 1 : c + 1));
    mutate(blogId);
  };

  return (
    <button
      onClick={handleLike}
      className={`flex items-center space-x-2 transition-colors relative group ${
        localLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
      }`}
    >
      <div className="relative">
        <motion.div
          animate={isAnimating ? { scale: [1, 1.4, 0.9, 1.1, 1] } : { scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Heart size={18} fill={localLiked ? 'currentColor' : 'none'} className={localLiked ? 'text-red-500' : ''} />
        </motion.div>

        {isAnimating && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-red-400 rounded-full"
                initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                animate={{
                  opacity: 0,
                  scale: 0,
                  x: Math.cos((i * 60 * Math.PI) / 180) * 20,
                  y: Math.sin((i * 60 * Math.PI) / 180) * 20,
                }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{ top: '40%', left: '40%' }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="h-5 overflow-hidden flex items-center">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={localCount}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-sm font-medium block"
          >
            {localCount}
          </motion.span>
        </AnimatePresence>
      </div>
    </button>
  );
};
