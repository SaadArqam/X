'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-[#030712] text-gray-100 flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 relative flex min-h-screen">
        <div className="flex-1 max-w-3xl mx-auto w-full border-x border-gray-800 bg-[#0a0f1c] min-h-screen">
          {children}
        </div>
        <aside className="w-80 hidden lg:block p-6 border-r border-gray-800">
          <div className="sticky top-6">
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 shadow-xl">
              <h3 className="font-bold text-white mb-4">Trending Tech</h3>
              {[
                { tag: '#React', count: 8.4 },
                { tag: '#Nextjs14', count: 5.2 },
                { tag: '#FramerMotion', count: 3.1 },
                { tag: '#TailwindCSS', count: 7.9 },
                { tag: '#TypeScript', count: 6.5 }
              ].map(({ tag, count }) => (
                <div key={tag} className="mb-3">
                  <p className="text-sm font-semibold text-gray-200 hover:text-blue-400 cursor-pointer transition">{tag}</p>
                  <p className="text-xs text-gray-500">{count}k posts</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};
