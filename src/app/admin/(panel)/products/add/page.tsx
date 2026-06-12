'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Package, Plus, X, Upload, PenLine } from 'lucide-react';
import BulkImport from '@/components/admin/BulkImport';
import toast from 'react-hot-toast';

const productSchema = z.object({
  name: z.string().min(2, 'Name required'),
  description: z.string().min(10, 'Description too short'),
  price: z.number({ invalid_type_error: 'Price required' }).positive('Price must be positive'),
  discountPrice: z.number().optional().nullable(),
  category: z.enum(['mens', 'womens', 'kids'], { required_error: 'Category required' }),
  subcategory: z.string().optional(),
  brand: z.string().min(1, 'Brand required'),
  stock: z.number({ invalid_type_error: 'Stock required' }).int().min(0),
  featured: z.boolean().default(false),
});

type ProductForm = z.infer<typeof productSchema>;

const subcategories = {
  mens: ['T-Shirts', 'Shirts', 'Jeans', 'Jackets', 'Shoes', 'Watches'],
  womens: ['Dresses', 'Sarees', 'Handbags', 'Heels', 'Jewelry'],
  kids: ['Toys', 'T-Shirts', 'Shoes', 'School Bags', 'Caps'],
};

const inputClass =
  'w-full h-10 px-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors hover:border-gray-600';

const errorClass = 'mt-1 text-xs text-red-400';

type Tab = 'manual' | 'import';

export default function AddProductPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('manual');
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>(['']);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: { featured: false, stock: 0 },
  });

  const category = watch('category');

  const addImageField = () => setImages((prev) => [...prev, '']);
  const removeImage = (i: number) => setImages((prev) => prev.filter((_, idx) => idx !== i));
  const updateImage = (i: number, val: string) =>
    setImages((prev) => prev.map((v, idx) => (idx === i ? val : v)));

  const onSubmit = async (data: ProductForm) => {
    setLoading(true);
    try {
      const validImages = images.filter((img) => img.trim() !== '');
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          images: validImages,
          discountPrice: data.discountPrice || undefined,
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Product added successfully!');
        reset();
        setImages(['']);
        router.push('/admin/products');
      } else {
        toast.error(result.error || 'Failed to add product');
      }
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactElement; desc: string }[] = [
    {
      id: 'manual',
      label: 'Add Manually',
      icon: <PenLine className="h-4 w-4" />,
      desc: 'Fill in product details one by one',
    },
    {
      id: 'import',
      label: 'Bulk Import',
      icon: <Upload className="h-4 w-4" />,
      desc: 'Upload CSV / Excel / JSON file',
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 bg-gray-800 rounded-xl text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Add Products</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              Add a single product manually or import many at once
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                activeTab === tab.id
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-gray-800 bg-gray-900 hover:border-gray-700 hover:bg-gray-800/50'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                {tab.icon}
              </div>
              <div>
                <p
                  className={`text-sm font-bold ${
                    activeTab === tab.id ? 'text-orange-400' : 'text-gray-300'
                  }`}
                >
                  {tab.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{tab.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'manual' ? (
            <motion.div
              key="manual"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                {/* ── Basic Info ── */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2.5 mb-1">
                    <Package className="h-4.5 w-4.5 text-orange-500" style={{ width: 18, height: 18 }} />
                    <h2 className="text-sm font-bold text-white">Basic Information</h2>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                      Product Name *
                    </label>
                    <input {...register('name')} placeholder="e.g. Classic White Cotton T-Shirt" className={inputClass} />
                    {errors.name && <p className={errorClass}>{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                      Description *
                    </label>
                    <textarea
                      {...register('description')}
                      rows={3}
                      placeholder="Describe the product, materials, and key features..."
                      className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none transition-colors hover:border-gray-600"
                    />
                    {errors.description && <p className={errorClass}>{errors.description.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Brand *</label>
                      <input {...register('brand')} placeholder="Brand name" className={inputClass} />
                      {errors.brand && <p className={errorClass}>{errors.brand.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Stock *</label>
                      <input type="number" {...register('stock', { valueAsNumber: true })} placeholder="0" className={inputClass} />
                      {errors.stock && <p className={errorClass}>{errors.stock.message}</p>}
                    </div>
                  </div>
                </div>

                {/* ── Pricing ── */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
                  <h2 className="text-sm font-bold text-white">Pricing</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        {...register('price', { valueAsNumber: true })}
                        placeholder="0"
                        className={inputClass}
                      />
                      {errors.price && <p className={errorClass}>{errors.price.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                        Discount Price (₹)
                      </label>
                      <input
                        type="number"
                        {...register('discountPrice', { valueAsNumber: true })}
                        placeholder="Optional"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                {/* ── Category ── */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
                  <h2 className="text-sm font-bold text-white">Category</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                        Category *
                      </label>
                      <select {...register('category')} className={inputClass}>
                        <option value="">Select category</option>
                        <option value="mens">Men's</option>
                        <option value="womens">Women's</option>
                        <option value="kids">Kids</option>
                      </select>
                      {errors.category && <p className={errorClass}>{errors.category.message}</p>}
                    </div>
                    {category && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                          Subcategory
                        </label>
                        <select {...register('subcategory')} className={inputClass}>
                          <option value="">Select subcategory</option>
                          {subcategories[category as keyof typeof subcategories]?.map((sub) => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" {...register('featured')} className="w-4 h-4 accent-orange-500 rounded" />
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                      Mark as Featured Product
                    </span>
                  </label>
                </div>

                {/* ── Images ── */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white">Product Images</h2>
                    <button
                      type="button"
                      onClick={addImageField}
                      className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add URL
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {images.map((img, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="url"
                          value={img}
                          onChange={(e) => updateImage(i, e.target.value)}
                          placeholder={`https://example.com/image-${i + 1}.jpg`}
                          className={`flex-1 ${inputClass}`}
                        />
                        {images.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors flex-shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600">
                    Paste image URLs from Unsplash, Cloudinary, or any CDN
                  </p>
                </div>

                {/* ── Submit ── */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 px-5 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all"
                  >
                    {loading ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Add Product
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="import"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <BulkImport
                  onSuccess={(count) => {
                    setTimeout(() => router.push('/admin/products'), 2000);
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
