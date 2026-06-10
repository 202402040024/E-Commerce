'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

/**
 * Reliable sign-out hook that handles both normal and error cases.
 * Falls back to manual cookie clearing if NextAuth signOut fails.
 */
export function useSignOut() {
  const router = useRouter();

  const handleSignOut = async (callbackUrl = '/') => {
    try {
      // Try NextAuth signOut first
      const result = await signOut({
        redirect: false,
        callbackUrl,
      });

      toast.success('Signed out successfully');
      // Force a hard redirect to clear all state
      window.location.href = callbackUrl;
    } catch (error) {
      console.error('SignOut error, using fallback:', error);
      // Fallback: call our custom signout endpoint
      window.location.href = `/api/auth/signout?callbackUrl=${encodeURIComponent(callbackUrl)}`;
    }
  };

  return handleSignOut;
}
