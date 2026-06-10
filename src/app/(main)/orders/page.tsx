'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, Package, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { formatDate, formatPrice } from '@/lib/utils';
import { IOrder } from '@/types';

const statusColors: Record<string, any> = {
  pending: 'warning',
  processing: 'default',
  shipped: 'secondary',
  delivered: 'success',
  cancelled: 'destructive',
};

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated') {
      fetch('/api/orders')
        .then((r) => r.json())
        .then((d) => { if (d.success) setOrders(d.data); })
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
          <Skeleton className="h-10 w-48" />
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
            <Package className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Orders</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{orders.length} orders placed</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24">
            <div className="w-24 h-24 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-12 w-12 text-orange-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No orders yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Start shopping to see your orders here</p>
            <Link href="/products"><Button>Browse Products <ArrowRight className="h-4 w-4 ml-2" /></Button></Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-base font-bold text-gray-900 dark:text-white">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      Placed on {formatDate(order.createdAt)} • {order.products.length} items
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{formatPrice(order.totalAmount)}</p>
                    <Badge variant={statusColors[order.orderStatus]} className="mt-1 capitalize">
                      {order.orderStatus}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {order.products.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">{item.name?.slice(0, 2)}</div>
                      )}
                    </div>
                  ))}
                  {order.products.length > 4 && (
                    <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 font-medium flex-shrink-0">
                      +{order.products.length - 4}
                    </div>
                  )}
                  <div className="ml-auto">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Payment: <span className="capitalize font-medium text-gray-700 dark:text-gray-300">{order.paymentStatus}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Method: <span className="uppercase font-medium text-gray-700 dark:text-gray-300">{order.paymentMethod}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
