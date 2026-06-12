'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { IProduct } from '@/types';
import { CATEGORIES } from '@/lib/utils';
import { ChevronDown, SlidersHorizontal, Package } from 'lucide-react';

interface CategoryPageProps {
  category: 'mens' | 'womens' | 'kids';
  title: string;
  description: string;
}

const heroImages = {
  mens: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1400&q=80',
  womens: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&q=80',
  kids: 'https://images.unsplash.com/photo-1473362795849-26b45f7d9524?w=1400&q=80',
};

const heroGradients = {
  mens: 'from-blue-900/80 via-blue-900/50 to-transparent',
  womens: 'from-pink-900/80 via-pink-900/50 to-transparent',
  kids: 'from-green-900/80 via-green-900/50 to-transparent',
};

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating', label: 'Top Rated' },
];

export default function CategoryPage({ category, title, description }: CategoryPageProps) {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubcategory, setActiveSubcategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const subcategories = CATEGORIES[category]?.subcategories || [];
  const limit = 12;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        category,
        sortBy,
        page: String(page),
        limit: String(limit),
      });
      if (activeSubcategory) {
        params.set('subcategory', activeSubcategory);
      }

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setProducts(data.data);
        setTotal(data.pagination?.total ?? 0);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [category, activeSubcategory, sortBy, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSubcategoryClick = (sub: string) => {
    // Toggle off if already active, otherwise set
    setActiveSubcategory(prev => prev === sub ? '' : sub);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ── Hero Banner ── */}
      <div className="relative h-56 sm:h-72 overflow-hidden">
        <img
          src={heroImages[category]}
          alt={title}
          className="w-full h-full object-cover object-center"
        />
        {/* Gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-r ${heroGradients[category]}`} />
        <div className="absolute inset-0 bg-black/20" />

        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-white max-w-xl"
            >
              <p className="text-orange-400 text-sm font-semibold mb-2 uppercase tracking-widest">
                ShopHub Collection
              </p>
              <h1 className="text-4xl sm:text-5xl font-black mb-3 leading-tight">
                {title}
              </h1>
              <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
                {description}
              </p>
              <div className="flex items-center gap-3 mt-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-sm font-semibold text-white border border-white/20">
                  <Package className="h-3.5 w-3.5" />
                  {loading ? '...' : total} Products
                </span>
                {activeSubcategory && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/80 backdrop-blur-sm rounded-full text-sm font-semibold text-white">
                    {activeSubcategory}
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Sticky Filter Bar ── */}
      <div className="sticky top-16 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-3">

            {/* Subcategory pills — scrollable on mobile */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1 pb-0.5">
              {/* All button */}
              <button
                onClick={() => { setActiveSubcategory(''); setPage(1); }}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  activeSubcategory === ''
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-200 dark:shadow-orange-900/40 scale-105'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 border border-transparent hover:border-orange-200 dark:hover:border-orange-800'
                }`}
              >
                All
              </button>

              {subcategories.map((sub) => (
                <motion.button
                  key={sub}
                  onClick={() => handleSubcategoryClick(sub)}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    activeSubcategory === sub
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-200 dark:shadow-orange-900/40 scale-105'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 border border-transparent hover:border-orange-200 dark:hover:border-orange-800'
                  }`}
                >
                  {sub}
                </motion.button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="relative flex-shrink-0">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="h-9 pl-3 pr-8 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none cursor-pointer min-w-[140px]"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Products Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Active filter label */}
        <AnimatePresence>
          {activeSubcategory && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-2 mb-6"
            >
              <span className="text-sm text-gray-500 dark:text-gray-400">Showing:</span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-sm font-semibold rounded-full">
                {activeSubcategory}
                <button
                  onClick={() => { setActiveSubcategory(''); setPage(1); }}
                  className="ml-0.5 hover:text-orange-900 dark:hover:text-orange-200"
                  aria-label="Remove filter"
                >
                  ×
                </button>
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                · {loading ? '...' : total} result{total !== 1 ? 's' : ''}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-64 w-full rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-5 w-1/3" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <div className="w-20 h-20 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-5">
              <Package className="h-10 w-10 text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No {activeSubcategory || title} found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {activeSubcategory
                ? `No products in the "${activeSubcategory}" subcategory yet.`
                : 'No products available in this category yet.'}
            </p>
            {activeSubcategory && (
              <button
                onClick={() => setActiveSubcategory('')}
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-full transition-colors"
              >
                View All {title}
              </button>
            )}
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              <AnimatePresence mode="popLayout">
                {products.map((product, i) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: Math.min(i * 0.05, 0.4), duration: 0.3 }}
                    layout
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-medium border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors"
                >
                  ← Prev
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = totalPages <= 5
                      ? i + 1
                      : page <= 3
                      ? i + 1
                      : page >= totalPages - 2
                      ? totalPages - 4 + i
                      : page - 2 + i;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                          pageNum === page
                            ? 'bg-orange-500 text-white shadow-md'
                            : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-sm font-medium border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
