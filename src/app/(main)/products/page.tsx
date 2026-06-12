'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, Search, ChevronDown, Star } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { IProduct } from '@/types';

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'mens', label: "Men's" },
  { value: 'womens', label: "Women's" },
  { value: 'kids', label: "Kids" },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating', label: 'Top Rated' },
];

const RATING_OPTIONS = [4, 3, 2, 1];

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
          <div className="h-10 w-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // ── Filter state ─────────────────────────────────────────────
  const [category, setCategory] = useState(() => searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState('newest');
  const [minRating, setMinRating] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Search with local state (debounced before sending to API)
  const [searchInput, setSearchInput] = useState(() => searchParams.get('search') || '');
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '');

  // Price inputs (debounced)
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // ── Products state ───────────────────────────────────────────
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const limit = 12;

  // Sync URL params → state on mount / URL change
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlCategory = searchParams.get('category') || '';
    setSearchInput(urlSearch);
    setSearchQuery(urlSearch);
    setCategory(urlCategory);
    setPage(1);
  }, [searchParams]);

  // Debounce search input (500ms)
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setSearchQuery(val);
      setPage(1);
    }, 500);
  };

  // Debounce price inputs (600ms)
  const priceDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handlePriceChange = (min: string, max: string) => {
    setMinPriceInput(min);
    setMaxPriceInput(max);
    if (priceDebounceRef.current) clearTimeout(priceDebounceRef.current);
    priceDebounceRef.current = setTimeout(() => {
      setMinPrice(min);
      setMaxPrice(max);
      setPage(1);
    }, 600);
  };

  // ── Fetch products ───────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (searchQuery) params.set('search', searchQuery);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (minRating) params.set('minRating', minRating);
      params.set('sortBy', sortBy);
      params.set('page', String(page));
      params.set('limit', String(limit));

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
        setTotal(data.pagination?.total ?? 0);
      }
    } catch (err) {
      console.error('Fetch products error:', err);
    } finally {
      setLoading(false);
    }
  }, [category, searchQuery, minPrice, maxPrice, minRating, sortBy, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ── Clear all filters ────────────────────────────────────────
  const clearFilters = () => {
    setCategory('');
    setSearchInput('');
    setSearchQuery('');
    setMinPriceInput('');
    setMaxPriceInput('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setSortBy('newest');
    setPage(1);
  };

  const activeFiltersCount = [
    category,
    searchQuery,
    minPrice,
    maxPrice,
    minRating,
  ].filter(Boolean).length;

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16">

      {/* ── Sticky Header ── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

          {/* Top row */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">All Products</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {loading
                  ? 'Searching...'
                  : `${total} product${total !== 1 ? 's' : ''} found`}
                {activeFiltersCount > 0 && (
                  <span className="ml-1 text-orange-500">({activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active)</span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              {/* Search */}
              <div className="relative flex-1 sm:flex-none sm:w-60">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search products..."
                  className="w-full h-9 pl-9 pr-8 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white transition-colors"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                {searchInput && (
                  <button
                    onClick={() => handleSearchChange('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                  className="h-9 pl-3 pr-8 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Filter toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`relative flex items-center gap-2 h-9 px-4 rounded-full border text-sm font-medium transition-all ${
                  showFilters || activeFiltersCount > 0
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-orange-300'
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ── Filter Panel ── */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-4 pb-2 border-t border-gray-100 dark:border-gray-800 mt-3 flex flex-wrap gap-6 items-end">

                  {/* Category */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Category
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.value || 'all'}
                          onClick={() => { setCategory(cat.value); setPage(1); }}
                          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                            category === cat.value
                              ? 'bg-orange-500 text-white shadow-md shadow-orange-200 dark:shadow-orange-900/30'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Price Range (₹)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={minPriceInput}
                        min={0}
                        onChange={(e) => handlePriceChange(e.target.value, maxPriceInput)}
                        className="w-24 h-9 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      />
                      <span className="text-gray-400 text-sm">to</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxPriceInput}
                        min={0}
                        onChange={(e) => handlePriceChange(minPriceInput, e.target.value)}
                        className="w-24 h-9 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      />
                      {(minPriceInput || maxPriceInput) && (
                        <button
                          onClick={() => handlePriceChange('', '')}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                          title="Clear price filter"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Min Rating
                    </label>
                    <div className="flex gap-1.5">
                      {RATING_OPTIONS.map((r) => (
                        <button
                          key={r}
                          onClick={() => { setMinRating(minRating === String(r) ? '' : String(r)); setPage(1); }}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                            minRating === String(r)
                              ? 'bg-yellow-400 text-white shadow-md'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-600'
                          }`}
                        >
                          <Star className="h-3 w-3 fill-current" />
                          {r}+
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear All */}
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-1.5 px-4 py-1.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors border border-red-200 dark:border-red-800 font-medium"
                    >
                      <X className="h-3.5 w-3.5" />
                      Clear All Filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active filter chips */}
          {activeFiltersCount > 0 && !showFilters && (
            <div className="flex gap-2 flex-wrap mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              {category && (
                <span className="flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-medium rounded-full">
                  {CATEGORIES.find(c => c.value === category)?.label}
                  <button onClick={() => { setCategory(''); setPage(1); }}><X className="h-3 w-3" /></button>
                </span>
              )}
              {searchQuery && (
                <span className="flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-medium rounded-full">
                  "{searchQuery}"
                  <button onClick={() => handleSearchChange('')}><X className="h-3 w-3" /></button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-medium rounded-full">
                  ₹{minPrice || '0'} – ₹{maxPrice || '∞'}
                  <button onClick={() => handlePriceChange('', '')}><X className="h-3 w-3" /></button>
                </span>
              )}
              {minRating && (
                <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-medium rounded-full">
                  ★ {minRating}+ stars
                  <button onClick={() => { setMinRating(''); setPage(1); }}><X className="h-3 w-3" /></button>
                </span>
              )}
              <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 px-2 py-1 hover:underline">
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Products Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
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
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-5">
              <Search className="h-9 w-9 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No products found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              Try adjusting your filters or search with different keywords.
            </p>
            <Button onClick={clearFilters} variant="outline" size="lg">
              Clear All Filters
            </Button>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((product, i) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.4) }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  ← Previous
                </Button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                          pageNum === page
                            ? 'bg-orange-500 text-white shadow-md shadow-orange-200 dark:shadow-orange-900/30'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next →
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
