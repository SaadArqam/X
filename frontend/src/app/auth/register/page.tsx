'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      router.push('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F9F7] px-4">
      <div className="w-full max-w-md border border-[#111111] bg-[#F9F9F7] p-8">
        <h1 className="font-serif text-4xl font-bold text-[#111111] text-center mb-2">
          Dev<span className="text-editorial">X</span>
        </h1>
        <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 text-center mb-8">
          Create your account
        </p>
        {error && (
          <div className="mb-4 p-3 border-l-4 border-[#CC0000] bg-red-50 text-[#CC0000] text-sm font-sans">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {(['name', 'username', 'email', 'password'] as const).map((field) => (
            <div key={field}>
              <label className="block text-xs uppercase tracking-widest font-sans text-[#111111] mb-2">
                {field === 'name' ? 'Full Name' : field}
              </label>
              <input
                type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                value={form[field]}
                onChange={update(field)}
                required
                style={{ borderRadius: 0 }}
                className="w-full border-b-2 border-[#111111] bg-transparent px-0 py-2 font-mono text-sm focus:outline-none focus:bg-[#F0F0F0]"
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            style={{ borderRadius: 0 }}
            className="w-full bg-[#111111] text-[#F9F9F7] py-3 font-sans text-xs uppercase tracking-widest hover:bg-white hover:text-[#111111] border border-[#111111] transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="text-center text-neutral-500 mt-6 text-xs font-sans uppercase tracking-widest">
          Have an account?{' '}
          <Link href="/auth/login" className="text-[#111111] hover:text-[#CC0000] transition-colors">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
