'use client';

import { Blog } from '@/types';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { staggerContainer, fadeUp } from '@/lib/animations';
import Link from 'next/link';
import { LikeButton } from './LikeButton';
import { BookmarkButton } from './BookmarkButton';
import { MessageSquare } from 'lucide-react';

import { useState, useEffect } from 'react';

export const PostCard = ({ blog }: { blog: Blog }) => {
  const [relativeTime, setRelativeTime] = useState<string>('');

  useEffect(() => {
    setRelativeTime(formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true }));
  }, [blog.createdAt]);

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, amount: 0.1 }}
      className="bg-[#0a0f1c] hover:bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden transition-colors flex flex-col group"
      whileHover={{ y: -2 }}
    >
      <Link href={`/blog/${blog.id}`} className="flex-1 w-full flex flex-col">
        <motion.div className="w-full h-48 overflow-hidden relative bg-gradient-to-tr from-gray-800 to-gray-900 border-b border-gray-800">
          {blog.coverImage ? (
            <motion.img
              layoutId={`post-image-${blog.id}`}
              src={blog.coverImage}
              alt={blog.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
             <motion.div layoutId={`post-image-${blog.id}`} className="w-full h-full bg-gradient-to-tr from-gray-800 to-gray-900" />
          )}
        </motion.div>
        <div className="p-5 flex-1 flex flex-col">
          <motion.div variants={fadeUp} className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-900/50 border border-blue-500/50 flex items-center justify-center text-blue-300 font-bold overflow-hidden shrink-0">
              {blog.author.avatar ? <img src={blog.author.avatar} alt="Avatar" className="w-full h-full object-cover" /> : blog.author.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0 flex items-center space-x-2">
              <span className="text-sm font-semibold text-gray-200 truncate">{blog.author.name}</span>
              <span className="text-xs text-gray-500 shrink-0">•</span>
              <span className="text-xs text-gray-500 truncate">{relativeTime}</span>
            </div>
          </motion.div>

          <motion.h2 variants={fadeUp} layoutId={`post-title-${blog.id}`} className="text-xl font-bold text-white mb-2 line-clamp-2">
            {blog.title}
          </motion.h2>

          <motion.p variants={fadeUp} className="text-gray-400 text-sm mb-4 line-clamp-3">
            {blog.excerpt}
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-wrap gap-2 mb-4 mt-auto">
            {blog.tags.map(tag => (
              <span key={tag} className="px-2 py-1 bg-blue-900/20 text-blue-400 text-xs rounded-md font-medium">#{tag}</span>
            ))}
          </motion.div>
        </div>
      </Link>
      
      <motion.div variants={fadeUp} className="px-5 py-4 border-t border-gray-800 flex items-center justify-between z-10 relative">
        <div className="flex items-center space-x-4">
          <LikeButton blogId={blog.id} initialLiked={blog.isLiked} initialCount={blog.likesCount} />
          <Link href={`/blog/${blog.id}#comments`} className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors">
            <MessageSquare size={18} />
            <span className="text-sm font-medium">{blog.commentsCount}</span>
          </Link>
        </div>
        <BookmarkButton blogId={blog.id} initialBookmarked={blog.isBookmarked} />
      </motion.div>
    </motion.div>
  );
};
