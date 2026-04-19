'use client';

import { useBlog } from '@/hooks/api';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { LikeButton } from '@/components/blog/LikeButton';
import { BookmarkButton } from '@/components/blog/BookmarkButton';
import { CommentThread } from '@/components/blog/CommentThread';
import { scaleIn, fadeUp } from '@/lib/animations';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { redirect } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function PostDetailPage({ params }: { params: { id: string } }) {
  // Guard: /blog/create conflicts with this dynamic route — redirect to the real create page
  if (params.id === 'create') redirect('/create');
  const { data: blog, isLoading, isError } = useBlog(Number(params.id));
  const [relativeTime, setRelativeTime] = useState<string>('');

  useEffect(() => {
    if (blog?.createdAt) {
      setRelativeTime(formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true }));
    }
  }, [blog?.createdAt]);

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;
  if (isError || !blog) return <div className="p-20 text-center text-red-500">Post not found.</div>;

  return (
    <div className="pb-20">
      <div className="w-full h-72 md:h-96 relative bg-gradient-to-tr from-gray-800 to-gray-900 overflow-hidden">
        {blog.coverImage && (
          <motion.img
            layoutId={`post-image-${blog.id}`}
            src={blog.coverImage}
            alt={blog.title}
            className="w-full h-full object-cover opacity-60"
          />
        )}
        <Link href="/" className="absolute top-6 left-6 z-10 bg-black/50 backdrop-blur hover:bg-black/80 text-white p-2 rounded-full transition-colors border border-white/10">
          <ArrowLeft size={20} />
        </Link>
        <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#0a0f1c] to-transparent pt-32">
          <motion.div variants={fadeUp} initial="initial" animate="animate" className="max-w-3xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-4">
              {blog.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-blue-900/80 backdrop-blur text-blue-300 text-xs rounded-md font-medium border border-blue-500/30">#{tag}</span>
              ))}
            </div>
            <motion.h1 layoutId={`post-title-${blog.id}`} className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {blog.title}
            </motion.h1>
            <div className="flex items-center space-x-4">
              <Link href={`/profile/${blog.author.id}`} className="flex items-center space-x-3 group animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
                <div className="w-10 h-10 rounded-full bg-gray-800 border-2 border-transparent group-hover:border-blue-500 overflow-hidden transition-colors">
                  {blog.author.avatar ? <img src={blog.author.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-blue-900/50 flex items-center justify-center text-blue-300 font-bold">{blog.author.name.charAt(0)}</div>}
                </div>
                <div>
                  <p className="text-white font-semibold group-hover:text-blue-400 transition-colors">{blog.author.name}</p>
                  <p className="text-xs text-gray-400">{relativeTime}</p>
                </div>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 mt-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center justify-between py-6 border-b border-gray-800 mb-8"
        >
          <div className="flex space-x-6">
            <LikeButton blogId={blog.id} initialLiked={blog.isLiked} initialCount={blog.likesCount} />
            <div className="flex items-center space-x-2 text-gray-400">
              <span>{blog.commentsCount} comments</span>
            </div>
          </div>
          <BookmarkButton blogId={blog.id} initialBookmarked={blog.isBookmarked} />
        </motion.div>

        <motion.article 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="prose prose-invert prose-lg max-w-none prose-a:text-blue-500 hover:prose-a:text-blue-400 prose-img:rounded-xl"
        >
          {/* Simple render of plain text/markdown */}
          <div className="whitespace-pre-wrap text-gray-300 leading-relaxed font-sans">{blog.content}</div>
        </motion.article>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          className="mt-16 bg-gray-900 border border-gray-800 rounded-2xl p-8 flex items-center space-x-6"
        >
          <div className="w-20 h-20 rounded-full bg-gray-800 overflow-hidden shrink-0">
             {blog.author.avatar ? <img src={blog.author.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-blue-900/50 flex items-center justify-center text-blue-300 font-bold text-xl">{blog.author.name.charAt(0)}</div>}
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Written by</p>
            <h3 className="text-xl font-bold text-white"><Link href={`/profile/${blog.author.id}`} className="hover:text-blue-400">{blog.author.name}</Link></h3>
            {/* The mock doesn't strictly pass author bio in the minimal Blog type, but if it did we'd show it here. */}
            <p className="text-gray-400 mt-2 text-sm">Developer & Contributor</p>
          </div>
        </motion.div>

        {/* Comment Thread Component */}
        <div id="comments" className="mt-16">
          <CommentThread blogId={blog.id} />
        </div>
      </div>
    </div>
  );
}
