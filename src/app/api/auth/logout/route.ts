import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side logout — deletes all HttpOnly auth cookies and redirects.
 * This works because the server CAN delete HttpOnly cookies (JS cannot).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const res = NextResponse.redirect(new URL(callbackUrl, req.url));

  // All possible next-auth v5 + v4 cookie names
  const cookieNames = [
    'authjs.session-token',
    '__Secure-authjs.session-token',
    'authjs.csrf-token',
    '__Secure-authjs.csrf-token',
    'authjs.callback-url',
    '__Secure-authjs.callback-url',
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
    'next-auth.csrf-token',
    '__Secure-next-auth.csrf-token',
    'next-auth.callback-url',
    '__Secure-next-auth.callback-url',
  ];

  const isProduction = process.env.NODE_ENV === 'production';

  cookieNames.forEach((name) => {
    // Delete with standard options
    res.cookies.set(name, '', {
      maxAge: 0,
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
    });
  });

  return res;
}
