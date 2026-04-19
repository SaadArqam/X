'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { format } from 'date-fns';

export const Layout = ({ children }: { children: ReactNode }) => {
  const today = format(new Date(), 'EEEE, MMMM do, yyyy');

  return (
    <div className="min-h-screen bg-[#F9F9F7] text-ink newsprint-texture flex flex-col">
      <header className="fixed top-0 left-0 w-full z-50 bg-[#111111] text-white border-b-4 border-[#111111] h-[60px] flex items-center justify-between px-6">
        <h1 className="text-2xl font-serif italic tracking-tight">DevBlog.</h1>
        <div className="hidden md:flex items-center space-x-4 font-mono text-xs text-neutral-400">
          <span>VOL. 1</span>
          <span>|</span>
          <span className="uppercase">{today}</span>
          <span>|</span>
          <span className="text-white">DEVELOPER EDITION</span>
        </div>
      </header>

      <div className="flex flex-1 pt-[60px]">
        <Sidebar />

        <main className="flex-1 md:ml-64 relative flex min-h-screen">
          <div className="flex-1 max-w-4xl mx-auto w-full border-x border-[#111111] bg-newsprint min-h-screen shadow-[20px_0_40px_-20px_rgba(0,0,0,0.05)]">
            {children}
          </div>
          <aside className="w-[280px] hidden xl:block border-r border-[#111111] bg-newsprint">
            <div className="sticky top-[60px] p-6">
              <div className="border border-[#111111] sharp-corners bg-white p-5 hard-shadow-hover relative group">
                <h3 className="font-sans font-bold uppercase tracking-widest text-ink text-sm mb-4 border-b border-[#111111] pb-2">Trending Keywords</h3>
                {[
                  { tag: '#React', count: 8.4 },
                  { tag: '#Nextjs14', count: 5.2 },
                  { tag: '#FramerMotion', count: 3.1 },
                  { tag: '#TailwindCSS', count: 7.9 },
                  { tag: '#TypeScript', count: 6.5 }
                ].map(({ tag, count }) => (
                  <div key={tag} className="mb-3 flex justify-between items-center group/tag border-b border-dashed border-divider pb-2 last:border-0 last:pb-0">
                    <p className="text-sm font-serif font-semibold text-ink group-hover/tag:text-editorial cursor-pointer transition">{tag}</p>
                    <p className="text-xs font-mono text-neutral-600">{count}K</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
};
