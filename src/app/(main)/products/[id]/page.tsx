'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Heart, Star, Truck, Shield, RefreshCw,
  ChevronLeft, ChevronRight, Minus, Plus, Share2
} from 'lucide-react';
import { IProduct } from '@/types';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { useCartStore } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/products/ProductCard';
import StarRating from '@/components/products/StarRating';
import ReviewSection from '@/components/products/ReviewSection';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [related, setRelated] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  const [liveRating, setLiveRating] = useState<{ rating: number; count: number } | null>(null);
  const reviewSectionRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCartStore();

  const isAdmin = (session?.user as any)?.role === 'admin';

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      if (data.success) {
        setProduct(data.data);
        const relRes = await fetch(`/api/products?category=${data.data.category}&limit=5`);
        const relData = await relRes.json();
        if (relData.success) {
          setRelated(relData.data.filter((p: IProduct) => p._id !== id).slice(0, 4));
        }
      } else {
        router.push('/products');
      }
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  const handleAddToCart = () => {
    if (!product || isAdmin) return;
    addItem(product, quantity);
    toast.success(`${product.name} added to cart!`, { icon: '🛒' });
  };

  const handleBuyNow = () => {
    if (!product || isAdmin) return;
    addItem(product, quantity);
    router.push('/cart');
  };

  const handleWishlist = async () => {
    if (isAdmin) return;
    setIsWishlisted((w) => !w);
    try {
      if (!isWishlisted) {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product?._id }),
        });
        toast.success('Added to wishlist!');
      } else {
        await fetch(`/api/wishlist?productId=${product?._id}`, { method: 'DELETE' });
        toast.success('Removed from wishlist');
      }
    } catch {
      setIsWishlisted((w) => !w);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: product?.name, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleRatingUpdate = useCallback((rating: number, count: number) => {
    setLiveRating({ rating, count });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <Skeleton className="aspect-square w-full rounded-3xl" />
              <div className="flex gap-3">
                {[...Array(4)].map((_, i) => <Skeleton key={`thumb-${i}`} className="w-20 h-20 rounded-xl" />)}
              </div>
            </div>
            <div className="space-y-5">
              {[80, 40, 60, 40, 100, 120].map((w, i) => (
                <Skeleton key={`skel-${i}`} className={`h-${i === 0 ? 10 : i === 4 ? 14 : 6} w-${w < 100 ? `[${w}%]` : 'full'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const images = product.images?.length
    ? product.images
    : [`https://placehold.co/600x600/f97316/white?text=${encodeURIComponent(product.name.slice(0, 2).toUpperCase())}`];

  const discount = product.discountPrice ? calculateDiscount(product.price, product.discountPrice) : 0;
  const displayRating = liveRating?.rating ?? product.rating;
  const displayCount = liveRating?.count ?? product.reviews?.length ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-1.5 mb-8 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
          <Link href="/" className="hover:text-orange-500 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-orange-500 transition-colors">Products</Link>
          <span>/</span>
          <Link href={`/${product.category}`} className="hover:text-orange-500 transition-colors capitalize">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white line-clamp-1 max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* ── Image Gallery ── */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-lg group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-full h-full"
                >
                  <Image
                    src={images[activeImage]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    onError={() => {}}
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {discount > 0 && (
                  <Badge variant="destructive" className="text-sm px-3 py-1 font-bold shadow-md">
                    -{discount}% OFF
                  </Badge>
                )}
                {product.featured && (
                  <Badge variant="default" className="text-xs px-2.5 py-1 font-semibold shadow-md">
                    ✨ Featured
                  </Badge>
                )}
              </div>

              {/* Share button */}
              <button
                onClick={handleShare}
                className="absolute top-4 right-4 w-9 h-9 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-gray-800"
              >
                <Share2 className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </button>

              {/* Prev/Next */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage((p) => (p - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center shadow-md hover:bg-white dark:hover:bg-gray-800 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  </button>
                  <button
                    onClick={() => setActiveImage((p) => (p + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center shadow-md hover:bg-white dark:hover:bg-gray-800 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={`img-${i}`}
                    onClick={() => setActiveImage(i)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                      i === activeImage
                        ? 'border-orange-500 ring-2 ring-orange-200 dark:ring-orange-900 shadow-md'
                        : 'border-transparent opacity-70 hover:opacity-100 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Image src={img} alt={`View ${i + 1}`} fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ── */}
          <div className="space-y-6">
            {/* Category & Name */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="capitalize">{product.category}</Badge>
                {product.subcategory && <Badge variant="outline">{product.subcategory}</Badge>}
                {product.stock === 0 && <Badge variant="destructive">Out of Stock</Badge>}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                {product.name}
              </h1>
              <p className="text-sm text-orange-500 font-semibold mt-1.5">{product.brand}</p>
            </div>

            {/* Live Rating — click to scroll to reviews */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => {
                  setActiveTab('reviews');
                  setTimeout(() => {
                    reviewSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }}
                className="flex items-center gap-2 group cursor-pointer"
              >
                <StarRating rating={displayRating} size="md" showValue />
              </button>
              <button
                onClick={() => {
                  setActiveTab('reviews');
                  setTimeout(() => {
                    reviewSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }}
                className="text-sm text-orange-500 hover:text-orange-600 hover:underline transition-colors font-medium"
              >
                {displayCount} review{displayCount !== 1 ? 's' : ''}
              </button>
              {product.stock > 0 && (
                <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-full">
                  ✓ {product.stock} in stock
                </span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-4xl font-black text-gray-900 dark:text-white">
                {formatPrice(product.discountPrice || product.price)}
              </span>
              {product.discountPrice && (
                <>
                  <span className="text-xl text-gray-400 line-through">{formatPrice(product.price)}</span>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-lg">
                    Save {formatPrice(product.price - product.discountPrice)}
                  </span>
                </>
              )}
            </div>

            {/* Quantity — hide for admin */}
            {!isAdmin && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quantity</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-14 text-center text-sm font-bold text-gray-900 dark:text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      disabled={quantity >= product.stock}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-30 text-gray-600 dark:text-gray-400"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Max {product.stock} units
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons — hide for admin */}
            {!isAdmin ? (
              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  variant="outline"
                  size="lg"
                  className="flex-1 border-orange-500 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 font-semibold"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  size="lg"
                  className="flex-1 font-semibold"
                >
                  Buy Now
                </Button>
                <button
                  onClick={handleWishlist}
                  className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
                    isWishlisted
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-400 text-red-500'
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-red-300 hover:text-red-400'
                  }`}
                  title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>
            ) : (
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900 rounded-xl">
                <p className="text-sm text-orange-700 dark:text-orange-400 font-medium text-center">
                  👑 Admin View — Shopping disabled for admin accounts
                </p>
              </div>
            )}

            {/* Delivery Benefits */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Truck, label: 'Free Delivery', sub: 'Above ₹999' },
                { icon: Shield, label: 'Secure Pay', sub: '100% safe' },
                { icon: RefreshCw, label: 'Easy Return', sub: '30 days' },
              ].map((b) => (
                <div key={b.label} className="flex flex-col items-center text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                  <b.icon className="h-5 w-5 text-orange-500 mb-1" />
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{b.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{b.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="mt-16" ref={reviewSectionRef}>
          <div className="flex border-b border-gray-200 dark:border-gray-800 mb-8 gap-1">
            {(['description', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3.5 text-sm font-semibold capitalize transition-all duration-200 rounded-t-xl ${
                  activeTab === tab
                    ? 'text-orange-500 border-b-2 border-orange-500 bg-orange-50/50 dark:bg-orange-900/10'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                {tab === 'reviews'
                  ? `Reviews (${displayCount})`
                  : 'Description'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'description' ? (
              <motion.div
                key="description"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base mb-6">
                  {product.description}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Category', value: product.category },
                    { label: 'Brand', value: product.brand },
                    { label: 'Stock', value: `${product.stock} units` },
                    { label: 'Rating', value: `${displayRating}/5 ⭐` },
                  ].map((spec) => (
                    <div key={spec.label} className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">{spec.label}</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white capitalize">{spec.value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ReviewSection
                  productId={product._id}
                  productName={product.name}
                  onRatingUpdate={handleRatingUpdate}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Related Products ── */}
        {related.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Related Products</h2>
              <Link
                href={`/${product.category}`}
                className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
