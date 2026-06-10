import CategoryPage from '@/components/products/CategoryPage';

export const metadata = { title: "Kids' Fashion - ShopHub", description: "Shop fun kids fashion" };

export default function KidsPage() {
  return <CategoryPage category="kids" title="Kids' Fashion" description="Fun and comfortable clothing, shoes, toys, and accessories for your little ones." />;
}
