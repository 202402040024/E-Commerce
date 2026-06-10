'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Calendar, ShoppingCart, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatPrice } from '@/lib/utils';
import { IUser, IOrder } from '@/types';

export default function UserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<{ user: IUser; orders: IOrder[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${id}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setData(d.data); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return <div className="p-8 text-gray-400">User not found</div>;

  const { user, orders } = data;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 bg-gray-800 rounded-xl text-gray-400 hover:text-white hover:bg-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-white">User Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-3">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-white">{user.name}</h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">{user.role}</Badge>
              <Badge variant={user.isBlocked ? 'destructive' : 'success'}>{user.isBlocked ? 'Blocked' : 'Active'}</Badge>
            </div>
          </div>
          <div className="space-y-3 pt-2 border-t border-gray-800">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-gray-300">{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-gray-300">Joined {formatDate(user.createdAt)}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <ShoppingCart className="h-4 w-4 text-gray-500" />
              <span className="text-gray-300">{orders.length} total orders</span>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-4">Order History</h3>
          {orders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ShoppingCart className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order._id} className="flex items-center justify-between p-4 bg-gray-800 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-white">#{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(order.createdAt)} • {order.products.length} items
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{formatPrice(order.totalAmount)}</p>
                    <Badge
                      variant={order.orderStatus === 'delivered' ? 'success' : order.orderStatus === 'cancelled' ? 'destructive' : 'secondary'}
                      className="mt-1 capitalize text-xs"
                    >
                      {order.orderStatus}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
