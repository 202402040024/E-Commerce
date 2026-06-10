import CategoryPage from '@/components/products/CategoryPage';

export const metadata = { title: "Men's Fashion - ShopHub", description: "Shop premium men's fashion" };

export default function MensPage() {
  return <CategoryPage category="mens" title="Men's Fashion" description="Explore our premium collection for men — shirts, jeans, jackets, shoes and more." />;
}
