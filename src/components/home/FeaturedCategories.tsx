'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const categories = [
  {
    id: 'mens',
    label: "Men's Fashion",
    description: "Shirts, Jeans, Jackets & more",
    href: '/mens',
    image: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600',
    color: 'from-blue-500 to-indigo-600',
    items: '2,500+ Items',
  },
  {
    id: 'womens',
    label: "Women's Fashion",
    description: "Dresses, Sarees, Jewelry & more",
    href: '/womens',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600',
    color: 'from-pink-500 to-rose-600',
    items: '3,200+ Items',
  },
  {
    id: 'kids',
    label: "Kids' Fashion",
    description: "Toys, Clothes, Shoes & more",
    href: '/kids',
    image: 'https://images.unsplash.com/photo-1473362795849-26b45f7d9524?w=600',
    color: 'from-green-400 to-emerald-600',
    items: '1,800+ Items',
  },
];

export default function FeaturedCategories() {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-sm font-medium rounded-full mb-4">
            Shop by Category
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Featured Categories
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Explore our wide range of fashion categories and find your perfect style
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -8 }}
              className="group relative"
            >
              <Link href={cat.href}>
                <div className="relative h-80 rounded-3xl overflow-hidden shadow-lg cursor-pointer">
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-60 group-hover:opacity-70 transition-opacity`} />

                  <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                    <span className="text-xs font-medium opacity-80 mb-1">{cat.items}</span>
                    <h3 className="text-2xl font-bold mb-1">{cat.label}</h3>
                    <p className="text-sm opacity-90 mb-4">{cat.description}</p>
                    <div className="flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all">
                      Shop Now
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
