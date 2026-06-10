'use client';

import { motion } from 'framer-motion';
import { Shield, Truck, CreditCard, Headphones, Star, Users, ShoppingBag, Award } from 'lucide-react';

const team = [
  { name: 'Arjun Sharma', role: 'Founder & CEO', avatar: 'A', color: 'from-orange-400 to-pink-500' },
  { name: 'Priya Patel', role: 'Head of Design', avatar: 'P', color: 'from-blue-400 to-indigo-500' },
  { name: 'Rahul Kumar', role: 'CTO', avatar: 'R', color: 'from-green-400 to-teal-500' },
  { name: 'Sneha Gupta', role: 'Head of Operations', avatar: 'S', color: 'from-purple-400 to-pink-500' },
];

const stats = [
  { icon: ShoppingBag, label: 'Products', value: '10,000+' },
  { icon: Users, label: 'Happy Customers', value: '50,000+' },
  { icon: Award, label: 'Brands', value: '200+' },
  { icon: Star, label: 'Average Rating', value: '4.8/5' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-orange-500 to-amber-600">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              Our Story
            </span>
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
              Redefining Fashion<br />for Everyone
            </h1>
            <p className="text-xl text-orange-100 max-w-2xl mx-auto leading-relaxed">
              ShopHub was founded with a simple mission: to make premium fashion accessible to everyone, 
              everywhere. We believe great style shouldn't cost a fortune.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm"
              >
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="h-6 w-6 text-orange-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <span className="inline-block px-4 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-sm font-medium rounded-full">
                Our Mission
              </span>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                Fashion That Tells Your Story
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Founded in 2020, ShopHub started as a small boutique with a big dream — to bring the latest 
                fashion trends from runways to real people at affordable prices. Today, we're proud to serve 
                over 50,000 happy customers across India.
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                We carefully curate every product in our collection, partnering with top brands and 
                independent designers to ensure you get quality, style, and value with every purchase.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Founded', value: '2020' },
                  { label: 'HQ', value: 'Mumbai, India' },
                  { label: 'Employees', value: '500+' },
                  { label: 'Cities Served', value: '100+' },
                ].map((item) => (
                  <div key={item.label} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.label}</p>
                    <p className="text-base font-bold text-gray-900 dark:text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <img
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"
                  alt="Fashion"
                  className="w-full h-56 object-cover rounded-2xl"
                />
                <img
                  src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400"
                  alt="Fashion"
                  className="w-full h-56 object-cover rounded-2xl mt-8"
                />
                <img
                  src="https://images.unsplash.com/photo-1473362795849-26b45f7d9524?w=400"
                  alt="Kids"
                  className="w-full h-48 object-cover rounded-2xl"
                />
                <img
                  src="https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=400"
                  alt="Men's"
                  className="w-full h-48 object-cover rounded-2xl mt-4"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="inline-block px-4 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-sm font-medium rounded-full mb-4">
              Why Choose Us
            </span>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Our Core Values</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'Premium Quality', desc: 'Every product is quality-tested before listing', color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30' },
              { icon: Truck, title: 'Fast Delivery', desc: 'Express shipping within 2-3 business days', color: 'text-green-500 bg-green-100 dark:bg-green-900/30' },
              { icon: CreditCard, title: 'Secure Payment', desc: '256-bit SSL encrypted transactions', color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30' },
              { icon: Headphones, title: '24/7 Support', desc: 'Round-the-clock customer assistance', color: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30' },
            ].map((val, i) => (
              <motion.div
                key={val.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`w-14 h-14 ${val.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <val.icon className="h-7 w-7" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{val.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="inline-block px-4 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-sm font-medium rounded-full mb-4">
              The Team
            </span>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Meet Our Team</h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400">The passionate people behind ShopHub</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="text-center"
              >
                <div className={`w-24 h-24 bg-gradient-to-br ${member.color} rounded-3xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg`}>
                  {member.avatar}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">{member.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
