import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold">
                Shop<span className="text-orange-500">Hub</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your one-stop destination for premium fashion. Quality products, fast delivery, and exceptional customer service.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Facebook, label: 'facebook' },
                { Icon: Twitter, label: 'twitter' },
                { Icon: Instagram, label: 'instagram' },
                { Icon: Youtube, label: 'youtube' },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href={`#${label}`}
                  className="w-9 h-9 bg-gray-800 hover:bg-orange-500 rounded-full flex items-center justify-center transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-orange-500">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Home' },
                { href: '/mens', label: "Men's Fashion" },
                { href: '/womens', label: "Women's Fashion" },
                { href: '/kids', label: "Kids' Fashion" },
                { href: '/about', label: 'About Us' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-orange-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-orange-500">
              Customer Service
            </h3>
            <ul className="space-y-2">
              {[
                { href: '/profile', label: 'My Account' },
                { href: '/orders', label: 'Track Orders' },
                { href: '/cart', label: 'Shopping Cart' },
                { href: '/wishlist', label: 'Wishlist' },
                { href: '#privacy', label: 'Privacy Policy' },
                { href: '#terms', label: 'Terms & Conditions' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-orange-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-orange-500">
              Contact Us
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-orange-500 flex-shrink-0" />
                <span className="text-sm text-gray-400">123 Fashion Street, Mumbai, India 400001</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-orange-500 flex-shrink-0" />
                <span className="text-sm text-gray-400">+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-orange-500 flex-shrink-0" />
                <span className="text-sm text-gray-400">support@shophub.com</span>
              </div>
            </div>

            {/* Newsletter */}
            <div className="pt-2">
              <p className="text-sm font-medium text-gray-300 mb-2">Subscribe to Newsletter</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg border border-gray-700 focus:outline-none focus:border-orange-500"
                />
                <button className="px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © 2024 ShopHub. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500">We Accept:</span>
            {['Visa', 'Mastercard', 'PayPal', 'UPI'].map((method) => (
              <span
                key={method}
                className="px-2 py-1 bg-gray-800 text-xs text-gray-400 rounded"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
