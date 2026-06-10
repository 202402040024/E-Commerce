import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;
  const isAdmin = (session?.user as any)?.role === 'admin';

  // Admin routes protection
  if (nextUrl.pathname.startsWith('/admin')) {
    // Admin login page is accessible to everyone
    if (nextUrl.pathname === '/admin/login') {
      if (isLoggedIn && isAdmin) {
        return NextResponse.redirect(new URL('/admin/dashboard', nextUrl));
      }
      return NextResponse.next();
    }

    // All other admin routes require admin role
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/admin/login', nextUrl));
    }

    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', nextUrl));
    }

    return NextResponse.next();
  }

  // Protected user routes
  const protectedRoutes = ['/cart', '/profile', '/orders', '/checkout', '/wishlist'];
  if (protectedRoutes.some((route) => nextUrl.pathname.startsWith(route))) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${nextUrl.pathname}`, nextUrl));
    }
  }

  // Redirect logged in users from auth pages
  if ((nextUrl.pathname === '/login' || nextUrl.pathname === '/register') && isLoggedIn) {
    return NextResponse.redirect(new URL('/', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
};
