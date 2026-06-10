'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { MapPin, CreditCard, CheckCircle, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

const checkoutSchema = z.object({
  street: z.string().min(5, 'Please enter a valid address'),
  city: z.string().min(2, 'Please enter a valid city'),
  state: z.string().min(2, 'Please enter a valid state'),
  zipCode: z.string().min(5, 'Please enter a valid zip code').max(10),
  country: z.string().default('India'),
  paymentMethod: z.enum(['cod', 'card', 'upi']),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { data: session } = useSession();
  const { items, getTotal, clearCart } = useCartStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: 'cod', country: 'India' },
  });

  const paymentMethod = watch('paymentMethod');
  const subtotal = getTotal();
  const delivery = subtotal >= 999 ? 0 : 99;
  const total = subtotal + delivery;

  const onSubmit = async (data: CheckoutForm) => {
    if (!session?.user) { router.push('/login'); return; }
    if (items.length === 0) { toast.error('Cart is empty'); return; }

    setIsLoading(true);
    try {
      const orderData = {
        products: items.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
          price: item.product.discountPrice || item.product.price,
          name: item.product.name,
          image: item.product.images?.[0] || '',
        })),
        totalAmount: total,
        shippingAddress: {
          street: data.street,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
        },
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentMethod === 'cod' ? 'pending' : 'paid',
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const result = await res.json();
      if (result.success) {
        clearCart();
        setOrderPlaced(true);
        toast.success('Order placed successfully!');
      } else {
        toast.error(result.error || 'Failed to place order');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md px-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="h-12 w-12 text-green-500" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Order Placed!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Your order has been placed successfully. We'll send you an update when it's on its way.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => router.push('/orders')} variant="outline">View Orders</Button>
            <Button onClick={() => router.push('/')}>Continue Shopping</Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Checkout</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-orange-500" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Shipping Address</h2>
                </div>
                <div className="space-y-4">
                  <Input
                    label="Street Address"
                    placeholder="Enter your street address"
                    error={errors.street?.message}
                    {...register('street')}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="City" placeholder="City" error={errors.city?.message} {...register('city')} />
                    <Input label="State" placeholder="State" error={errors.state?.message} {...register('state')} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="ZIP Code" placeholder="PIN Code" error={errors.zipCode?.message} {...register('zipCode')} />
                    <Input label="Country" placeholder="Country" error={errors.country?.message} {...register('country')} />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-orange-500" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Payment Method</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { value: 'cod', label: 'Cash on Delivery', icon: '💰' },
                    { value: 'card', label: 'Credit/Debit Card', icon: '💳' },
                    { value: 'upi', label: 'UPI Payment', icon: '📱' },
                  ].map((method) => (
                    <label
                      key={method.value}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === method.value
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <input type="radio" value={method.value} className="sr-only" {...register('paymentMethod')} />
                      <span className="text-xl">{method.icon}</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">
                  <ShoppingBag className="h-5 w-5 inline mr-2 text-orange-500" />
                  Order Summary
                </h2>
                <div className="space-y-3 mb-5">
                  {items.slice(0, 3).map((item) => (
                    <div key={item.product._id} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400 line-clamp-1 flex-1 mr-3">
                        {item.product.name} ×{item.quantity}
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium whitespace-nowrap">
                        {formatPrice((item.product.discountPrice || item.product.price) * item.quantity)}
                      </span>
                    </div>
                  ))}
                  {items.length > 3 && (
                    <p className="text-xs text-gray-400">+{items.length - 3} more items</p>
                  )}
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Delivery</span>
                    <span className={delivery === 0 ? 'text-green-500' : ''}>{delivery === 0 ? 'FREE' : formatPrice(delivery)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 dark:text-white text-base pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span>Total</span><span>{formatPrice(total)}</span>
                  </div>
                </div>
                <Button type="submit" size="lg" className="w-full mt-5" isLoading={isLoading}>
                  Place Order • {formatPrice(total)}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
