'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Store, Bell, LogOut, ChevronRight } from 'lucide-react';

// Map pathnames to page titles
const pageTitles: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/products': 'Products',
  '/admin/products/add': 'Add Product',
  '/admin/users': 'Users',
  '/admin/orders': 'Orders',
  '/admin/reviews': 'Reviews',
  '/admin/analytics': 'Analytics',
  '/admin/settings': 'Settings',
};

export default function AdminHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Get page title, handle dynamic routes like /admin/products/edit/[id]
  let pageTitle = 'Admin';
  for (const [key, value] of Object.entries(pageTitles)) {
    if (pathname === key || pathname.startsWith(key + '/')) {
      pageTitle = value;
      break;
    }
  }
  if (pathname.includes('/edit/')) pageTitle = 'Edit Product';
  if (pathname.includes('/users/') && pathname !== '/admin/users') pageTitle = 'User Details';

  return (
    <header className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 px-6 lg:px-8 py-3.5">
      <div className="flex items-center justify-between">
        {/* Left: breadcrumb */}
        <div className="flex items-center gap-2 text-sm min-w-0">
          {/* Mobile spacer for hamburger button */}
          <div className="w-10 lg:hidden flex-shrink-0" />

          <span className="text-gray-500 hidden sm:inline">Admin</span>
          <ChevronRight className="h-3.5 w-3.5 text-gray-600 hidden sm:inline flex-shrink-0" />
          <span className="font-semibold text-white truncate">{pageTitle}</span>
        </div>

        {/* Right: quick actions */}
        <div className="flex items-center gap-2">
          {/* View Store button */}
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-lg transition-all"
          >
            <Store className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">View Store</span>
          </Link>

          {/* User avatar */}
          {session?.user && (
            <div className="flex items-center gap-2 pl-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {session.user.name?.[0]?.toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
