'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { instantSignOut } from '@/hooks/useSignOut';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Package, LogOut, Camera, Calendar, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatPrice } from '@/lib/utils';
import { IOrder } from '@/types';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(8, 'Must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const statusColors: Record<string, string> = {
  pending: 'warning',
  processing: 'default',
  shipped: 'secondary',
  delivered: 'success',
  cancelled: 'destructive',
};

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'security'>('profile');
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register: regProfile, handleSubmit: handleProfile, formState: { errors: profileErrors }, reset: resetProfile } =
    useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });

  const { register: regPwd, handleSubmit: handlePwd, formState: { errors: pwdErrors }, reset: resetPwd } =
    useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    if (session?.user) {
      resetProfile({ name: session.user.name || '', email: session.user.email || '' });
    }
  }, [session, resetProfile]);

  useEffect(() => {
    if (activeTab === 'orders') {
      setLoadingOrders(true);
      fetch('/api/orders')
        .then((r) => r.json())
        .then((d) => { if (d.success) setOrders(d.data); })
        .finally(() => setLoadingOrders(false));
    }
  }, [activeTab]);

  const onProfileSave = async (data: ProfileForm) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${session?.user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        await update({ name: data.name });
        toast.success('Profile updated successfully!');
      } else {
        toast.error(result.error);
      }
    } finally {
      setSaving(false);
    }
  };

  const onPasswordSave = async (data: PasswordForm) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${session?.user?.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Password changed successfully!');
        resetPwd();
      } else {
        toast.error(result.error);
      }
    } finally {
      setSaving(false);
    }
  };

  if (!session) { router.push('/login'); return null; }

  const tabs = [
    { key: 'profile', label: 'My Profile', icon: User },
    { key: 'orders', label: 'My Orders', icon: Package },
    { key: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm"
            >
              {/* Avatar */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
                    {session.user?.name?.[0]?.toUpperCase()}
                  </div>
                  <button className="absolute bottom-0 right-0 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                    <Camera className="h-3.5 w-3.5 text-white" />
                  </button>
                </div>
                <h2 className="mt-3 font-bold text-gray-900 dark:text-white">{session.user?.name}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{session.user?.email}</p>
                {(session.user as any)?.role === 'admin' && (
                  <Badge variant="default" className="mt-2">Admin</Badge>
                )}
              </div>

              <nav className="space-y-1">
                {tabs.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as any)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      activeTab === key
                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
                <button
                  onClick={() => instantSignOut('/')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </nav>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm"
            >
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Profile Information</h2>
                  <form onSubmit={handleProfile(onProfileSave)} className="space-y-5 max-w-md">
                    <Input
                      label="Full Name"
                      leftIcon={<User className="h-4 w-4" />}
                      error={profileErrors.name?.message}
                      {...regProfile('name')}
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      leftIcon={<Mail className="h-4 w-4" />}
                      error={profileErrors.email?.message}
                      {...regProfile('email')}
                    />
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3">
                      <Calendar className="h-4 w-4" />
                      <span>Member since {session.user && new Date().getFullYear()}</span>
                    </div>
                    <Button type="submit" isLoading={saving}>Save Changes</Button>
                  </form>
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">My Orders</h2>
                  {loadingOrders ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-16">
                      <ShoppingBag className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No orders yet</p>
                      <Button onClick={() => router.push('/products')} variant="outline" className="mt-4">Start Shopping</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order._id} className="border border-gray-100 dark:border-gray-800 rounded-xl p-4 hover:border-orange-200 dark:hover:border-orange-900 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Order #{order._id.slice(-8).toUpperCase()}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {formatDate(order.createdAt)} • {order.products.length} items
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900 dark:text-white">{formatPrice(order.totalAmount)}</p>
                              <Badge variant={statusColors[order.orderStatus] as any} className="mt-1 capitalize">
                                {order.orderStatus}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {order.products.slice(0, 3).map((item, i) => (
                              <div key={i} className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                    {item.name?.slice(0, 2)}
                                  </div>
                                )}
                              </div>
                            ))}
                            {order.products.length > 3 && (
                              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                                +{order.products.length - 3}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Change Password</h2>
                  <form onSubmit={handlePwd(onPasswordSave)} className="space-y-5 max-w-md">
                    <Input
                      label="Current Password"
                      type="password"
                      leftIcon={<Lock className="h-4 w-4" />}
                      error={pwdErrors.currentPassword?.message}
                      {...regPwd('currentPassword')}
                    />
                    <Input
                      label="New Password"
                      type="password"
                      leftIcon={<Lock className="h-4 w-4" />}
                      error={pwdErrors.newPassword?.message}
                      {...regPwd('newPassword')}
                    />
                    <Input
                      label="Confirm New Password"
                      type="password"
                      leftIcon={<Lock className="h-4 w-4" />}
                      error={pwdErrors.confirmPassword?.message}
                      {...regPwd('confirmPassword')}
                    />
                    <Button type="submit" isLoading={saving}>Update Password</Button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
