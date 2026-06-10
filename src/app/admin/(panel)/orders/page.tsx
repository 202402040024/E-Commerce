'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingCart, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatPrice } from '@/lib/utils';
import { IOrder } from '@/types';
import toast from 'react-hot-toast';

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const statusVariants: Record<string, string> = {
  pending: 'warning',
  processing: 'default',
  shipped: 'secondary',
  delivered: 'success',
  cancelled: 'destructive',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/orders?page=${page}&limit=10`);
    const data = await res.json();
    if (data.success) { setOrders(data.data); setTotal(data.pagination.total); }
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (orderId: string, status: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Order status updated!');
        fetchOrders();
      } else {
        toast.error(data.error);
      }
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-gray-400 text-sm mt-1">{total} total orders</p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase">Order ID</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase hidden sm:table-cell">Customer</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase hidden md:table-cell">Date</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase">Amount</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase">Payment</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td className="px-6 py-4" colSpan={7}><Skeleton className="h-12 bg-gray-800" /></td></tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <ShoppingCart className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500">No orders yet</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <motion.tr key={order._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-mono text-orange-400">#{order._id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{order.products.length} items</p>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <p className="text-sm text-white">{(order.userId as any)?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-400">{(order.userId as any)?.email || ''}</p>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-sm text-gray-400">{formatDate(order.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-white">{formatPrice(order.totalAmount)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={order.paymentStatus === 'paid' ? 'success' : order.paymentStatus === 'failed' ? 'destructive' : 'warning'} className="capitalize text-xs">
                        {order.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariants[order.orderStatus] as any} className="capitalize text-xs">
                        {order.orderStatus}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => updateStatus(order._id, e.target.value)}
                          disabled={updatingId === order._id}
                          className="h-8 pl-2 pr-7 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 appearance-none disabled:opacity-50"
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-500 pointer-events-none" />
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {total > 10 && (
          <div className="px-6 py-4 border-t border-gray-800 flex justify-between items-center">
            <p className="text-sm text-gray-400">Page {page} of {Math.ceil(total / 10)}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm bg-gray-800 text-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-700">Prev</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page * 10 >= total} className="px-3 py-1.5 text-sm bg-gray-800 text-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-700">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
