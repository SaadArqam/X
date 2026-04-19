'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { CreatePost } from '@/components/blog/CreatePost';
import { Loader2 } from 'lucide-react';

export default function CreatePage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Redirect unauthenticated users to login, preserving the destination
    if (!isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, router]);

  // While zustand rehydrates from localStorage, show a spinner
  // (avoids flash of redirect on hard refresh)
  if (!isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return <CreatePost />;
}
