'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      router.push('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F9F7] px-4">
      <div className="w-full max-w-md border border-[#111111] bg-[#F9F9F7] p-8">
        <h1 className="font-serif text-4xl font-bold text-[#111111] text-center mb-2">
          Dev<span className="text-editorial">X</span>
        </h1>
        <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 text-center mb-8">
          Sign in to continue
        </p>
        {error && (
          <div className="mb-4 p-3 border-l-4 border-[#CC0000] bg-red-50 text-[#CC0000] text-sm font-sans">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest font-sans text-[#111111] mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ borderRadius: 0 }}
              className="w-full border-b-2 border-[#111111] bg-transparent px-0 py-2 font-mono text-sm focus:outline-none focus:bg-[#F0F0F0]"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest font-sans text-[#111111] mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ borderRadius: 0 }}
              className="w-full border-b-2 border-[#111111] bg-transparent px-0 py-2 font-mono text-sm focus:outline-none focus:bg-[#F0F0F0]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ borderRadius: 0 }}
            className="w-full bg-[#111111] text-[#F9F9F7] py-3 font-sans text-xs uppercase tracking-widest hover:bg-white hover:text-[#111111] hover:border hover:border-[#111111] transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-neutral-500 mt-6 text-xs font-sans uppercase tracking-widest">
          No account?{' '}
          <Link href="/auth/register" className="text-[#111111] hover:text-[#CC0000] transition-colors">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
