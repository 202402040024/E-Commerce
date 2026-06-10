'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>(['']);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: { featured: false, stock: 0 },
  });

  const category = watch('category');

  const addImageField = () => setImages([...images, '']);
  const removeImage = (i: number) => setImages(images.filter((_, idx) => idx !== i));
  const updateImage = (i: number, val: string) => {
    const updated = [...images];
    updated[i] = val;
    setImages(updated);
  };

  const onSubmit = async (data: ProductForm) => {
    setLoading(true);
    try {
      const validImages = images.filter((img) => img.trim() !== '');
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, images: validImages, discountPrice: data.discountPrice || undefined }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Product added successfully!');
        router.push('/admin/products');
      } else {
        toast.error(result.error || 'Failed to add product');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 bg-gray-800 rounded-xl text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Add New Product</h1>
            <p className="text-gray-400 text-sm mt-0.5">Fill in the details to add a new product</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Package className="h-5 w-5 text-orange-500" />
              <h2 className="text-base font-semibold text-white">Basic Information</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Product Name *</label>
              <input
                {...register('name')}
                placeholder="Enter product name"
                className="w-full h-10 px-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Description *</label>
              <textarea
                {...register('description')}
                rows={4}
                placeholder="Describe the product..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
              {errors.description && <p className="mt-1 text-xs text-red-400">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Brand *</label>
                <input
                  {...register('brand')}
                  placeholder="Brand name"
                  className="w-full h-10 px-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {errors.brand && <p className="mt-1 text-xs text-red-400">{errors.brand.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Stock *</label>
                <input
                  type="number"
                  {...register('stock', { valueAsNumber: true })}
                  placeholder="0"
                  className="w-full h-10 px-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {errors.stock && <p className="mt-1 text-xs text-red-400">{errors.stock.message}</p>}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-white">Pricing</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Price (₹) *</label>
                <input
                  type="number"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="0"
                  className="w-full h-10 px-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {errors.price && <p className="mt-1 text-xs text-red-400">{errors.price.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Discount Price (₹)</label>
                <input
                  type="number"
                  {...register('discountPrice', { valueAsNumber: true })}
                  placeholder="Optional"
                  className="w-full h-10 px-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-white">Category</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Category *</label>
                <select
                  {...register('category')}
                  className="w-full h-10 px-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select category</option>
                  <option value="mens">Men's</option>
                  <option value="womens">Women's</option>
                  <option value="kids">Kids</option>
                </select>
                {errors.category && <p className="mt-1 text-xs text-red-400">{errors.category.message}</p>}
              </div>
              {category && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Subcategory</label>
                  <select
                    {...register('subcategory')}
                    className="w-full h-10 px-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select subcategory</option>
                    {subcategories[category]?.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" {...register('featured')} className="w-4 h-4 accent-orange-500" />
              <span className="text-sm text-gray-300">Mark as Featured Product</span>
            </label>
          </div>

          {/* Images */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Product Images</h2>
              <button
                type="button"
                onClick={addImageField}
                className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300"
              >
                <Plus className="h-3.5 w-3.5" /> Add Image
              </button>
            </div>
            <div className="space-y-3">
              {images.map((img, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="url"
                    value={img}
                    onChange={(e) => updateImage(i, e.target.value)}
                    placeholder={`Image URL ${i + 1}`}
                    className="flex-1 h-10 px-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">Enter image URLs (from Unsplash, Cloudinary, etc.)</p>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 bg-gray-800 text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : <Plus className="h-4 w-4" />}
              {loading ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
