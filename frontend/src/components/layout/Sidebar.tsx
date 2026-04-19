'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Edit3, User, Bookmark, LogOut, LogIn } from 'lucide-react';
import { useAuthStore } from '@/lib/auth';

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    router.push('/auth/login');
  };

  const navLinks = [
    { name: 'Feed', href: '/', icon: Home, show: true },
    { name: 'Create Post', href: '/create', icon: Edit3, show: isAuthenticated },
    { name: 'Profile', href: user ? `/profile/${user.id}` : '#', icon: User, show: isAuthenticated },
    { name: 'Bookmarks', href: user ? `/profile/${user.id}?tab=bookmarks` : '#', icon: Bookmark, show: isAuthenticated },
  ];

  return (
    <aside className="w-64 fixed top-0 left-0 h-screen border-r border-gray-800 bg-[#030712] p-6 flex-col justify-between hidden md:flex z-40">
      <div>
        <h1 className="text-2xl font-bold text-white mb-8 tracking-tighter">DevBlog<span className="text-blue-500">.</span></h1>
        <nav className="flex flex-col space-y-2">
          {navLinks.filter((link) => link.show).map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link key={link.name} href={link.href} className="relative flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-900 group">
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute left-0 w-1 h-full bg-blue-500 rounded-r-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
                <Icon size={20} className={isActive ? 'text-blue-500' : 'group-hover:text-gray-300'} />
                <span className={`font-medium ${isActive ? 'text-white' : ''}`}>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-6 border-t border-gray-800">
        {isAuthenticated && user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 w-3/4">
              <div className="w-10 h-10 rounded-full bg-blue-900/50 border border-blue-500 flex items-center justify-center text-blue-300 font-bold shrink-0">
                {user.avatar ? <img src={user.avatar} alt="Avatar" className="rounded-full w-full h-full object-cover" /> : user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">@{user.username}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition p-2">
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <Link href="/auth/login" className="flex items-center justify-center space-x-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
            <LogIn size={18} />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </aside>
  );
};
