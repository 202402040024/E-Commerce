'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { IProduct } from '@/types';
import { CATEGORIES } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface CategoryPageProps {
  category: 'mens' | 'womens' | 'kids';
  title: string;
  description: string;
}

const heroImages = {
  mens: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1400',
  womens: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400',
  kids: 'https://images.unsplash.com/photo-1473362795849-26b45f7d9524?w=1400',
};

export default function CategoryPage({ category, title, description }: CategoryPageProps) {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [subcategory, setSubcategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [total, setTotal] = useState(0);

  const subcategories = CATEGORIES[category]?.subcategories || [];

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ category, sortBy, limit: '12' });
      if (subcategory) params.set('subcategory', subcategory);
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
        setTotal(data.pagination.total);
      }
    } finally {
      setLoading(false);
    }
  }, [category, subcategory, sortBy]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <img
          src={heroImages[category]}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white max-w-lg"
            >
              <p className="text-orange-400 text-sm font-medium mb-2">ShopHub Collection</p>
              <h1 className="text-4xl sm:text-5xl font-bold mb-3">{title}</h1>
              <p className="text-gray-300 text-sm sm:text-base">{description}</p>
              <p className="text-orange-300 text-sm mt-2 font-medium">{total} products available</p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSubcategory('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                subcategory === ''
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-200 dark:shadow-orange-900/30'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-orange-300'
              }`}
            >
              All
            </button>
            {subcategories.map((sub) => (
              <button
                key={sub}
                onClick={() => setSubcategory(sub === subcategory ? '' : sub)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  subcategory === sub
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-200 dark:shadow-orange-900/30'
                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-orange-300'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 pl-3 pr-8 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-64 w-full rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">
            <p className="text-lg">No products found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product, i) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
