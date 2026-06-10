import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Get JWT token — works for both HTTP (dev) and HTTPS (production)
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    // In production (HTTPS), next-auth uses __Secure- prefixed cookies
    // getToken handles this automatically via cookieName detection
  });

  const isLoggedIn = !!token;
  const isAdmin = token?.role === 'admin';

  // ── Admin routes ────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    // Admin login page
    if (pathname === '/admin/login') {
      // Already logged in as admin → redirect to dashboard
      if (isLoggedIn && isAdmin) {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      }
      // Logged in but not admin → redirect to home
      if (isLoggedIn && !isAdmin) {
        return NextResponse.redirect(new URL('/', req.url));
      }
      return NextResponse.next();
    }

    // All other /admin/* routes require admin
    if (!isLoggedIn) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  }

  // ── Protected user routes ────────────────────────────────────
  const protectedRoutes = ['/cart', '/profile', '/orders', '/checkout', '/wishlist'];
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Admin should not access user shopping routes
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }
  }

  // ── Auth pages: redirect if already logged in ────────────────
  if (pathname === '/login' || pathname === '/register') {
    if (isLoggedIn) {
      if (isAdmin) {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      }
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (images, icons, etc.)
     * - api routes (handled separately)
     */
    '/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
