'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Package, ShoppingCart, DollarSign, TrendingUp,
  ArrowUpRight, ArrowDownRight, Eye
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { formatPrice, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface DashboardData {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  revenueData: { date: string; revenue: number }[];
  userGrowth: { date: string; users: number }[];
  recentOrders: any[];
  topProducts: any[];
}

const statColors: Record<string, string> = {
  pending: 'warning',
  processing: 'default',
  shipped: 'secondary',
  delivered: 'success',
  cancelled: 'destructive',
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((r) => r.json())
      .then((d) => { if (d.success) setData(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const statCards = data ? [
    {
      label: 'Total Users',
      value: data.totalUsers.toLocaleString(),
      icon: Users,
      change: '+12%',
      up: true,
      color: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Total Products',
      value: data.totalProducts.toLocaleString(),
      icon: Package,
      change: '+5%',
      up: true,
      color: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-600 dark:text-purple-400',
    },
    {
      label: 'Total Orders',
      value: data.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      change: '+18%',
      up: true,
      color: 'from-orange-500 to-orange-600',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      text: 'text-orange-600 dark:text-orange-400',
    },
    {
      label: 'Total Revenue',
      value: formatPrice(data.totalRevenue),
      icon: DollarSign,
      change: '-2%',
      up: false,
      color: 'from-green-500 to-green-600',
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-600 dark:text-green-400',
    },
  ] : [];

  if (loading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-72 bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs text-gray-500">Last updated</p>
          <p className="text-sm text-gray-300">{new Date().toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 ${stat.text}`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                stat.up ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
              }`}>
                {stat.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {stat.change}
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-sm text-gray-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-white">Revenue (Last 7 Days)</h3>
            <TrendingUp className="h-5 w-5 text-orange-500" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data?.revenueData || []}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                formatter={(v: number) => [formatPrice(v), 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} fill="url(#revenueGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* User Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-white">User Growth (Last 7 Days)</h3>
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.userGrowth || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
              />
              <Bar dataKey="users" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-white">Recent Orders</h3>
            <Link href="/admin/orders" className="text-xs text-orange-400 hover:text-orange-300">View all →</Link>
          </div>
          {data?.recentOrders?.length ? (
            <div className="space-y-3">
              {data.recentOrders.map((order: any) => (
                <div key={order._id} className="flex items-center justify-between py-2.5 border-b border-gray-800 last:border-0">
                  <div>
                    <p className="text-sm text-white font-medium">#{order._id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-gray-400">{order.userId?.name || 'Unknown'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-white">{formatPrice(order.totalAmount)}</span>
                    <Badge variant={statColors[order.orderStatus] as any} className="capitalize text-xs">
                      {order.orderStatus}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">No orders yet</p>
          )}
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-white">Top Selling Products</h3>
            <Link href="/admin/products" className="text-xs text-orange-400 hover:text-orange-300">View all →</Link>
          </div>
          {data?.topProducts?.length ? (
            <div className="space-y-3">
              {data.topProducts.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0">
                  <span className="w-6 h-6 bg-orange-500/10 text-orange-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium line-clamp-1">{item.product?.name}</p>
                    <p className="text-xs text-gray-400">{item.sold} sold</p>
                  </div>
                  <span className="text-sm font-medium text-green-400">{formatPrice(item.revenue || 0)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">No sales data yet</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
