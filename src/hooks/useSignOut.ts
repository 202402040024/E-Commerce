'use client';

import { signOut } from 'next-auth/react';

/**
 * Reliable sign-out that works in both development and production.
 * Uses window.location redirect after sign-out to avoid CSRF/URL issues.
 */
export function useSignOut() {
  const handleSignOut = async (callbackUrl = '/') => {
    try {
      await signOut({ redirect: false });
    } catch {
      // ignore errors from signOut itself
    } finally {
      // Always do a hard redirect — clears React state, cookies, and avoids
      // NEXTAUTH_URL mismatch issues in production
      window.location.href = callbackUrl;
    }
  };

  return handleSignOut;
}
