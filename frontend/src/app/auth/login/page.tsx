'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { scaleIn } from '@/lib/animations';
import { useAuthStore } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { Loader2, CheckCircle2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();
  const { toast } = useToast();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', data);
      setIsSuccess(true);
      setAuth(res.data.user, res.data.accessToken);
      setTimeout(() => router.push('/'), 1000);
    } catch (error: any) {
      toast(error.response?.data?.message || 'Login failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key="login-card"
          variants={scaleIn}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full max-w-md p-8 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h2>
            <p className="text-gray-400 mt-2">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="relative">
              <input
                {...register('email')}
                type="email"
                placeholder=" "
                className="peer w-full bg-transparent border-b-2 border-gray-700 pb-2 pt-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                disabled={isLoading || isSuccess}
              />
              <label className="absolute left-0 top-0 text-sm text-gray-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:text-sm peer-focus:text-blue-500">
                Email
              </label>
              {errors.email && (
                <motion.p initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </motion.p>
              )}
            </div>

            <div className="relative">
              <input
                {...register('password')}
                type="password"
                placeholder=" "
                className="peer w-full bg-transparent border-b-2 border-gray-700 pb-2 pt-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                disabled={isLoading || isSuccess}
              />
              <label className="absolute left-0 top-0 text-sm text-gray-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:text-sm peer-focus:text-blue-500">
                Password
              </label>
              {errors.password && (
                <motion.p initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </motion.p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={isLoading || isSuccess}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md shadow-blue-900/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSuccess ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center space-x-2">
                  <CheckCircle2 size={20} />
                  <span>Success!</span>
                </motion.div>
              ) : isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <span>Sign In</span>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Register here
              </Link>
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
