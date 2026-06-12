'use client';

/**
 * Fast server-side sign-out.
 * Redirects to /api/auth/logout which deletes HttpOnly cookies server-side,
 * then redirects to callbackUrl. Single navigation = instant logout.
 */
export function instantSignOut(callbackUrl = '/') {
  window.location.href = `/api/auth/logout?callbackUrl=${encodeURIComponent(callbackUrl)}`;
}
