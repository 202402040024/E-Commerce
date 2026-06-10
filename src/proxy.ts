import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Next.js 16+ requires the function to be named "proxy" (previously "middleware")
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Detect if running on HTTPS (production) or HTTP (development)
  const isSecure = req.headers.get('x-forwarded-proto') === 'https'
    || req.url.startsWith('https://');

  // Try both cookie names — next-auth v5 uses different names for HTTP vs HTTPS
  let token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: isSecure
      ? '__Secure-authjs.session-token'
      : 'authjs.session-token',
  });

  // Fallback: try the alternate cookie name
  if (!token) {
    token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: isSecure
        ? 'authjs.session-token'
        : '__Secure-authjs.session-token',
    });
  }

  const isLoggedIn = !!token;
  const isAdmin = token?.role === 'admin';

  // ── Admin routes ─────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      if (isLoggedIn && isAdmin) {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      }
      if (isLoggedIn && !isAdmin) {
        return NextResponse.redirect(new URL('/', req.url));
      }
      return NextResponse.next();
    }

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
  // /cart is NOT protected — guests can view cart (Zustand localStorage)
  // Only checkout and account pages require login
  const protectedRoutes = ['/profile', '/orders', '/checkout', '/wishlist'];
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
      return NextResponse.redirect(
        new URL(isAdmin ? '/admin/dashboard' : '/', req.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
