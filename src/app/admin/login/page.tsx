'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, LayoutDashboard, Shield, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { data: session, status } = useSession();

  // If already logged in as admin, redirect to dashboard
  useEffect(() => {
    if (status === 'authenticated' && (session?.user as any)?.role === 'admin') {
      router.replace('/admin/dashboard');
    }
  }, [session, status, router]);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: 'admin@example.com',
      password: 'Admin@123',
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: data.email.trim().toLowerCase(),
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        // Map error codes to user-friendly messages
        if (result.error.includes('No account') || result.error.includes('No user')) {
          setError('No admin account found with this email.');
        } else if (result.error.includes('Incorrect password') || result.error.includes('Invalid password')) {
          setError('Incorrect password. Please try again.');
        } else if (result.error.includes('Database') || result.error.includes('ECONNREFUSED')) {
          setError('Database connection error. Please try again in a moment.');
        } else if (result.error === 'CredentialsSignin') {
          setError('Invalid email or password.');
        } else {
          setError(result.error || 'Login failed. Please try again.');
        }
        return;
      }

      if (result?.ok) {
        // Wait for session to update, then check role
        // Use router.refresh() to trigger middleware re-evaluation
        toast.success('Welcome, Admin! 👋');
        router.refresh();
        // Small delay to allow session to propagate
        setTimeout(() => {
          router.replace('/admin/dashboard');
        }, 300);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking existing session
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-8 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-900/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        <div className="bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/60 p-8">

          {/* Logo & Title */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
              className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-orange-500/30"
            >
              <LayoutDashboard className="h-10 w-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-black text-white">Admin Panel</h1>
            <p className="text-gray-400 text-sm mt-1.5">Sign in to manage ShopHub</p>
          </div>

          {/* Security notice */}
          <div className="flex items-center gap-2.5 p-3.5 bg-orange-500/10 border border-orange-500/25 rounded-xl mb-6">
            <Shield className="h-4 w-4 text-orange-400 flex-shrink-0" />
            <span className="text-xs text-orange-300 font-medium">
              Restricted area. Authorized personnel only.
            </span>
          </div>

          {/* Error alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/25 rounded-xl mb-5"
            >
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-300">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  className={`w-full h-12 pl-11 pr-4 bg-gray-800/60 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm transition-colors ${
                    errors.email ? 'border-red-500' : 'border-gray-600 hover:border-gray-500'
                  }`}
                  {...register('email')}
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400 pointer-events-none" style={{ width: 18, height: 18 }} />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className={`w-full h-12 pl-11 pr-11 bg-gray-800/60 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm transition-colors ${
                    errors.password ? 'border-red-500' : 'border-gray-600 hover:border-gray-500'
                  }`}
                  {...register('password')}
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" style={{ width: 18, height: 18 }} />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:from-orange-700 active:to-amber-700 text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/25 mt-2"
            >
              {loading ? (
                <>
                  <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <LayoutDashboard className="h-5 w-5" />
                  Access Dashboard
                </>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
            <p className="text-xs text-gray-400 font-semibold mb-2 uppercase tracking-wider">Demo Credentials</p>
            <div className="space-y-1">
              <p className="text-xs text-gray-300">
                <span className="text-gray-500">Email:</span>{' '}
                <span className="font-mono font-medium">admin@example.com</span>
              </p>
              <p className="text-xs text-gray-300">
                <span className="text-gray-500">Password:</span>{' '}
                <span className="font-mono font-medium">Admin@123</span>
              </p>
            </div>
          </div>

          {/* Back to store */}
          <div className="mt-5 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-400 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Store
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
