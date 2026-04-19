'use client';

import { useProfile, useUserBlogs, useUserBookmarks } from '@/hooks/api';
import { motion, useInView, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { scaleIn } from '@/lib/animations';
import { Loader2 } from 'lucide-react';
import { PostCard } from '@/components/blog/PostCard';
import { Blog } from '@/types';

const CountUp = ({ value = 0 }: { value?: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    if (inView) {
      const controls = animate(count, value, { duration: 1.5, ease: 'easeOut' });
      return controls.stop;
    }
  }, [inView, value, count]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
};

export default function ProfilePage({ params }: { params: { id: string } }) {
  const [tab, setTab] = useState<'posts' | 'bookmarks'>('posts');
  const { data: profileData, isLoading: isLoadingProfile, isError: profileError } = useProfile();
  const { data: blogs, isLoading: isLoadingBlogs, isError: blogsError } = useUserBlogs(params.id);
  const { data: bookmarkedBlogs, isLoading: isLoadingBookmarks, isError: bookmarksError } = useUserBookmarks(params.id);

  if (isLoadingProfile || isLoadingBlogs || isLoadingBookmarks) {
    return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;
  }

  if (profileError || blogsError || bookmarksError || !profileData) {
    return <div className="p-20 text-center text-red-500">Failed to load profile</div>;
  }

  const user = profileData?.data || profileData;

  console.log("PROFILE:", user);
  console.log("BLOGS:", blogs);
  console.log("BOOKMARKS:", bookmarkedBlogs);

  const blogsData = blogs ?? [];
  const bookmarkedData = bookmarkedBlogs?.map((b: any) => b.blog || b) ?? [];

  const currentBlogs = tab === 'posts' ? blogsData : bookmarkedData;

  const slideVariants = {
    hidden: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeOut' as const }
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -50 : 50,
      opacity: 0,
    })
  };

  const direction = tab === 'posts' ? -1 : 1;

  return (
    <div className="py-12 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-6 mb-12 bg-gray-900 border border-gray-800 p-8 rounded-2xl"
      >
        <div className="w-24 h-24 rounded-full bg-blue-900/50 border-2 border-blue-500 flex items-center justify-center text-blue-300 font-bold text-3xl shrink-0 overflow-hidden">
          {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : user.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{user.name}</h1>
          <p className="text-gray-400 font-medium">@{user.username}</p>
          {user.bio && <p className="text-gray-300 mt-2 text-sm max-w-lg">{user.bio}</p>}
        </div>
      </motion.div>

      <div className="grid grid-cols-3 gap-4 mb-12">
        {[
          { label: 'Posts', value: user.postsCount },
          { label: 'Likes', value: user.likesCount },
          { label: 'Followers', value: user.followersCount }
        ].map(stat => (
          <div key={stat.label} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl text-center">
            <p className="text-gray-400 text-sm font-medium mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-white">
              <CountUp value={stat.value} />
            </p>
          </div>
        ))}
      </div>

      <div className="flex border-b border-gray-800 mb-8 relative">
        <button 
          onClick={() => setTab('posts')}
          className={`flex-1 py-4 text-sm font-bold transition-colors ${tab === 'posts' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
        >
          My Posts
        </button>
        <button 
          onClick={() => setTab('bookmarks')}
          className={`flex-1 py-4 text-sm font-bold transition-colors ${tab === 'bookmarks' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
        >
          Bookmarks
        </button>
        <motion.div 
          className="absolute bottom-0 h-0.5 bg-blue-500 w-1/2"
          initial={false}
          animate={{ x: tab === 'posts' ? '0%' : '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </div>

      <div className="relative min-h-[400px]">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={tab}
            custom={direction}
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full flex flex-col space-y-6 pb-20"
          >
            {currentBlogs.length > 0 ? currentBlogs.map((blog: Blog, i: number) => (
              <motion.div 
                key={blog.id}
                variants={scaleIn}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, amount: 0.1 }}
                className="opacity-100"
              >
                <PostCard blog={blog} />
              </motion.div>
            )) : (
              <p className="text-center text-gray-500 py-20 font-medium">No {tab} found.</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
