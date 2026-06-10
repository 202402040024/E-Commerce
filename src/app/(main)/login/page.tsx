'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ShoppingBag, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

// Map NextAuth error codes to human-readable messages
const authErrors: Record<string, string> = {
  CredentialsSignin: 'Invalid email or password.',
  CallbackRouteError: 'Login failed. Please check your credentials and try again.',
  OAuthSignInError: 'Sign in failed. Please try again.',
  Default: 'Something went wrong. Please try again.',
};

function LoginFormInner() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  // Show error from URL if redirected from NextAuth error
  const urlError = searchParams.get('error');
  const errorMessage = urlError ? (authErrors[urlError] || authErrors['Default']) : '';

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setFormError('');
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        // Map common errors to friendly messages
        if (result.error.includes('Database connection failed') || result.error.includes('ECONNREFUSED') || result.error.includes('querySrv')) {
          setFormError('Cannot connect to database. Please ensure MongoDB Atlas IP whitelist includes your IP address (0.0.0.0/0 allows all).');
        } else if (result.error.includes('No account found') || result.error.includes('No user found')) {
          setFormError('No account found with this email. Please register first.');
        } else if (result.error.includes('Incorrect password') || result.error.includes('Invalid password')) {
          setFormError('Incorrect password. Please try again.');
        } else if (result.error === 'CredentialsSignin') {
          setFormError('Invalid email or password. Please try again.');
        } else {
          setFormError(result.error || 'Login failed. Please try again.');
        }
      } else if (result?.ok) {
        toast.success('Welcome back!', { icon: '👋' });
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: any) {
      setFormError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-800">
      <div className="mb-6">
        <div className="lg:hidden mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Shop<span className="text-orange-500">Hub</span>
            </span>
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sign in</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
          Welcome back! Please enter your details.
        </p>
      </div>

      {/* Show URL error (from NextAuth redirect) */}
      {errorMessage && (
        <div className="mb-4 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
        </div>
      )}

      {/* Show form error */}
      {formError && (
        <div className="mb-4 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{formError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          autoComplete="email"
          {...register('email')}
        />
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
          leftIcon={<Lock className="h-4 w-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          error={errors.password?.message}
          autoComplete="current-password"
          {...register('password')}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              {...register('rememberMe')}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
          </label>
          <button type="button" className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors">
            Forgot password?
          </button>
        </div>

        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link href="/register" className="text-orange-500 hover:text-orange-600 font-semibold transition-colors">
            Create one free
          </Link>
        </p>
      </div>

      <div className="mt-5 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-900">
        <p className="text-xs font-semibold text-orange-700 dark:text-orange-400 mb-1.5">Demo Credentials</p>
        <p className="text-xs text-orange-600 dark:text-orange-300">
          Admin: <span className="font-mono font-medium">admin@example.com</span> / <span className="font-mono font-medium">Admin@123</span>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Decorative Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">ShopHub</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Welcome back to ShopHub
          </h2>
          <p className="text-orange-100 text-lg leading-relaxed">
            Your one-stop destination for premium fashion. Sign in to continue shopping.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {['10K+ Products', '50K+ Customers', 'Free Returns'].map((stat) => (
              <div key={stat} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-white text-center border border-white/10">
                <p className="text-sm font-semibold">{stat}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex gap-4">
          {[
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80',
            'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=200&q=80',
            'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200&q=80',
          ].map((src, i) => (
            <div key={`fashion-img-${i}`} className="w-24 h-28 rounded-2xl overflow-hidden shadow-xl border-2 border-white/20">
              <img src={src} alt={`Fashion ${i + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gray-50 dark:bg-gray-950">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Suspense fallback={
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800">
              <div className="space-y-4 animate-pulse">
                <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-xl w-1/2" />
                <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl" />
                <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl" />
                <div className="h-12 bg-orange-100 dark:bg-orange-900/20 rounded-xl" />
              </div>
            </div>
          }>
            <LoginFormInner />
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
}
