import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Panel - ShopHub',
  description: 'ShopHub Admin Dashboard',
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
