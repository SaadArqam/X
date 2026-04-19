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

  const primaryTag = blog.tags.length > 0 ? blog.tags[0] : 'GENERAL UPDATE';

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, amount: 0.1 }}
      className="bg-newsprint hover:bg-white border-b border-r border-[#111111] overflow-hidden transition-colors flex flex-col group relative hard-shadow-hover"
    >
      <Link href={`/blog/${blog.id}`} className="flex-1 w-full flex flex-col p-6">
        <motion.div className="w-full h-52 overflow-hidden relative border border-[#111111] mb-6 sharp-corners bg-neutral-100">
          {blog.coverImage ? (
            <motion.img
              layoutId={`post-image-${blog.id}`}
              src={blog.coverImage}
              alt={blog.title}
              className="w-full h-full object-cover  group-hover:sepia group-hover:scale-105 transition-all duration-700 ease-out"
            />
          ) : (
            <motion.div layoutId={`post-image-${blog.id}`} className="w-full h-full bg-divider flex items-center justify-center">
              <span className="font-mono text-xs uppercase text-neutral-400">NO IMAGE PROVIDED</span>
            </motion.div>
          )}
        </motion.div>

        <div className="flex-1 flex flex-col">
          <motion.div variants={fadeUp} className="mb-2">
            <span className="font-mono text-xs uppercase tracking-widest text-editorial font-bold">● {primaryTag}</span>
          </motion.div>

          <motion.h2 variants={fadeUp} layoutId={`post-title-${blog.id}`} className="text-2xl font-serif font-bold italic text-ink mb-3 leading-tight line-clamp-2">
            {blog.title}
          </motion.h2>

          <motion.p variants={fadeUp} className="text-neutral-700 font-body text-sm mb-6 line-clamp-3 text-justify leading-relaxed">
            {blog.excerpt || blog.content.substring(0, 150) + '...'}
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col space-y-1 mt-auto border-t-2 border-ink pt-4">
            <span className="text-xs font-sans uppercase tracking-widest font-bold text-ink">BY {blog.author.name}</span>
            <span className="text-xs font-mono text-neutral-500 uppercase">{relativeTime}</span>
          </motion.div>
        </div>
      </Link>

      <motion.div variants={fadeUp} className="px-6 py-4 border-t border-[#111111] bg-white flex items-center justify-between z-10 relative">
        <div className="flex items-center space-x-6">
          <LikeButton blogId={blog.id} initialLiked={blog.isLiked} initialCount={blog.likesCount} />
          <Link href={`/blog/${blog.id}#comments`} className="flex items-center space-x-2 text-ink hover:text-editorial transition-colors group/comments">
            <MessageSquare size={16} strokeWidth={1.5} className="group-hover/comments:-translate-y-1 transition-transform" />
            <span className="text-xs font-mono font-bold mt-0.5">{blog.commentsCount}</span>
          </Link>
        </div>
        <BookmarkButton blogId={blog.id} initialBookmarked={blog.isBookmarked} />
      </motion.div>
    </motion.div>
  );
};
