import { NextRequest, NextResponse } from 'next/server';
import { signOut } from '@/lib/auth';

// Custom sign-out endpoint that handles both GET and POST
// This avoids CSRF issues with the default NextAuth signout in v5 beta
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  try {
    // Clear the session cookie manually
    const response = NextResponse.redirect(new URL(callbackUrl, req.url));

    // Delete NextAuth session cookies
    const cookiesToDelete = [
      'authjs.session-token',
      '__Secure-authjs.session-token',
      'authjs.csrf-token',
      '__Secure-authjs.csrf-token',
      'authjs.callback-url',
      '__Secure-authjs.callback-url',
      // Legacy next-auth cookie names
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      'next-auth.csrf-token',
      '__Secure-next-auth.csrf-token',
    ];

    cookiesToDelete.forEach((cookieName) => {
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
      });
    });

    return response;
  } catch (error) {
    console.error('Signout error:', error);
    return NextResponse.redirect(new URL('/', req.url));
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
