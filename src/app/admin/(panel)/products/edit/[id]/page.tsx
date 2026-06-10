'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, X, Plus } from 'lucide-react';
import { IProduct } from '@/types';
import toast from 'react-hot-toast';

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.number({ invalid_type_error: 'Required' }).positive(),
  discountPrice: z.number().optional().nullable(),
  category: z.enum(['mens', 'womens', 'kids']),
  subcategory: z.string().optional(),
  brand: z.string().min(1),
  stock: z.number().int().min(0),
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type ProductForm = z.infer<typeof productSchema>;

const subcategories = {
  mens: ['T-Shirts', 'Shirts', 'Jeans', 'Jackets', 'Shoes', 'Watches'],
  womens: ['Dresses', 'Sarees', 'Handbags', 'Heels', 'Jewelry'],
  kids: ['Toys', 'T-Shirts', 'Shoes', 'School Bags', 'Caps'],
};

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<string[]>(['']);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
  });

  const category = watch('category');

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setProduct(d.data);
          setImages(d.data.images?.length ? d.data.images : ['']);
          reset({
            name: d.data.name,
            description: d.data.description,
            price: d.data.price,
            discountPrice: d.data.discountPrice || null,
            category: d.data.category,
            subcategory: d.data.subcategory || '',
            brand: d.data.brand,
            stock: d.data.stock,
            featured: d.data.featured,
            isActive: d.data.isActive,
          });
        }
      })
      .finally(() => setLoading(false));
  }, [id, reset]);

  const onSubmit = async (data: ProductForm) => {
    setSaving(true);
    try {
      const validImages = images.filter((img) => img.trim() !== '');
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, images: validImages }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Product updated!');
        router.push('/admin/products');
      } else {
        toast.error(result.error);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="p-2 bg-gray-800 rounded-xl text-gray-400 hover:text-white hover:bg-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Edit Product</h1>
            <p className="text-gray-400 text-sm mt-0.5 line-clamp-1">{product?.name}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-white">Basic Info</h2>
            <div>
              <label className="text-sm text-gray-300 block mb-1.5">Name *</label>
              <input {...register('name')} className="w-full h-10 px-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-sm text-gray-300 block mb-1.5">Description *</label>
              <textarea {...register('description')} rows={4} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
              {errors.description && <p className="mt-1 text-xs text-red-400">{errors.description.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-300 block mb-1.5">Brand *</label>
                <input {...register('brand')} className="w-full h-10 px-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="text-sm text-gray-300 block mb-1.5">Stock *</label>
                <input type="number" {...register('stock', { valueAsNumber: true })} className="w-full h-10 px-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-white">Pricing</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-300 block mb-1.5">Price (₹) *</label>
                <input type="number" {...register('price', { valueAsNumber: true })} className="w-full h-10 px-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="text-sm text-gray-300 block mb-1.5">Discount Price (₹)</label>
                <input type="number" {...register('discountPrice', { valueAsNumber: true })} className="w-full h-10 px-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-white">Category</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-300 block mb-1.5">Category *</label>
                <select {...register('category')} className="w-full h-10 px-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="mens">Men's</option>
                  <option value="womens">Women's</option>
                  <option value="kids">Kids</option>
                </select>
              </div>
              {category && (
                <div>
                  <label className="text-sm text-gray-300 block mb-1.5">Subcategory</label>
                  <select {...register('subcategory')} className="w-full h-10 px-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="">Select</option>
                    {subcategories[category as keyof typeof subcategories]?.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('featured')} className="w-4 h-4 accent-orange-500" />
                <span className="text-sm text-gray-300">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('isActive')} className="w-4 h-4 accent-orange-500" />
                <span className="text-sm text-gray-300">Active</span>
              </label>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white">Images</h2>
              <button type="button" onClick={() => setImages([...images, ''])} className="text-xs text-orange-400 flex items-center gap-1">
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>
            {images.map((img, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="url"
                  value={img}
                  onChange={(e) => {
                    const updated = [...images];
                    updated[i] = e.target.value;
                    setImages(updated);
                  }}
                  placeholder={`Image URL ${i + 1}`}
                  className="flex-1 h-10 px-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {images.length > 1 && (
                  <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => router.back()} className="flex-1 px-6 py-3 bg-gray-800 text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-700">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> : <Save className="h-4 w-4" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
