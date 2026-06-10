'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail('');
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-sm">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Stay in the Loop
          </h2>
          <p className="text-lg text-orange-100 max-w-xl mx-auto">
            Subscribe to our newsletter and get exclusive deals, new arrivals, and styling tips delivered to your inbox.
          </p>

          {subscribed ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center justify-center gap-3 py-4 px-6 bg-white/20 rounded-2xl backdrop-blur-sm"
            >
              <CheckCircle className="h-6 w-6 text-white" />
              <span className="text-white font-medium">You're subscribed! Welcome aboard.</span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="flex-1 px-4 py-3.5 rounded-full bg-white/20 backdrop-blur-sm text-white placeholder-orange-200 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
              />
              <button
                type="submit"
                className="px-6 py-3.5 bg-white text-orange-600 font-semibold rounded-full hover:bg-orange-50 transition-colors flex items-center gap-2 whitespace-nowrap shadow-lg"
              >
                Subscribe <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          <p className="text-sm text-orange-200">
            Join 50,000+ fashion enthusiasts. No spam, ever.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
