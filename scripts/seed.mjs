/**
 * Standalone seed script - run with: node scripts/seed.mjs
 * This directly connects to MongoDB and inserts all sample products.
 */

import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read env file manually
const envPath = resolve(__dirname, '../.env.local');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        process.env[key] = val;
      }
    }
  }
} catch (e) {
  console.error('Could not read .env.local:', e.message);
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not set in .env.local');
  process.exit(1);
}

// ─── Schemas ──────────────────────────────────────────────────────────────────
const ReviewSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  userName: String,
  rating: Number,
  comment: String,
  isApproved: { type: Boolean, default: false },
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  discountPrice: Number,
  images: [String],
  category: String,
  subcategory: String,
  brand: String,
  stock: Number,
  rating: { type: Number, default: 0 },
  reviews: [ReviewSchema],
  featured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'user' },
  isBlocked: { type: Boolean, default: false },
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// ─── Sample Products ──────────────────────────────────────────────────────────
const products = [
  // MEN'S - T-Shirts
  {
    name: 'Classic White Cotton T-Shirt',
    description: 'Premium 100% cotton t-shirt with a modern slim fit. Breathable, soft fabric perfect for everyday casual wear.',
    price: 1499, discountPrice: 899,
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80'],
    category: 'mens', subcategory: 'T-Shirts', brand: 'StyleCraft', stock: 150, rating: 4.5, featured: true, isActive: true,
  },
  {
    name: 'Graphic Print Round Neck Tee',
    description: 'Trendy graphic print t-shirt made from soft jersey fabric. Perfect for casual outings with jeans or shorts.',
    price: 1299, discountPrice: 799,
    images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80'],
    category: 'mens', subcategory: 'T-Shirts', brand: 'UrbanTrend', stock: 120, rating: 4.3, featured: false, isActive: true,
  },
  // MEN'S - Shirts
  {
    name: 'Formal Oxford Button-Down Shirt',
    description: 'Crisp formal shirt crafted from premium cotton blend. Perfect for office meetings and formal occasions.',
    price: 2499, discountPrice: 1799,
    images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80'],
    category: 'mens', subcategory: 'Shirts', brand: 'FormalEdge', stock: 80, rating: 4.6, featured: true, isActive: true,
  },
  {
    name: 'Casual Linen Check Shirt',
    description: 'Lightweight linen check shirt ideal for summer. Relaxed fit with a spread collar.',
    price: 1999, discountPrice: 1299,
    images: ['https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80'],
    category: 'mens', subcategory: 'Shirts', brand: 'LinenCo', stock: 90, rating: 4.4, featured: false, isActive: true,
  },
  // MEN'S - Jeans
  {
    name: 'Slim Fit Stretch Denim Jeans',
    description: 'Modern slim fit jeans with 2% elastane for comfort. Classic mid-wash blue denim that pairs with everything.',
    price: 3499, discountPrice: 2299,
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80'],
    category: 'mens', subcategory: 'Jeans', brand: 'DenimKing', stock: 100, rating: 4.7, featured: true, isActive: true,
  },
  {
    name: 'Relaxed Fit Dark Wash Jeans',
    description: 'Comfortable relaxed fit jeans in dark indigo wash. Five-pocket styling with straight leg cut.',
    price: 2999, discountPrice: 1999,
    images: ['https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=600&q=80'],
    category: 'mens', subcategory: 'Jeans', brand: 'DenimKing', stock: 85, rating: 4.5, featured: false, isActive: true,
  },
  // MEN'S - Jackets
  {
    name: 'Premium Leather Biker Jacket',
    description: 'Genuine leather biker jacket with quilted lining and asymmetric zip. A timeless wardrobe essential.',
    price: 8999, discountPrice: 6499,
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80'],
    category: 'mens', subcategory: 'Jackets', brand: 'LeatherCo', stock: 35, rating: 4.8, featured: true, isActive: true,
  },
  {
    name: 'Puffer Winter Jacket',
    description: 'Warm and lightweight puffer jacket with down fill. Water-resistant outer shell. Perfect for cold weather.',
    price: 5999, discountPrice: 3999,
    images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80'],
    category: 'mens', subcategory: 'Jackets', brand: 'WinterEdge', stock: 50, rating: 4.6, featured: false, isActive: true,
  },
  // MEN'S - Shoes
  {
    name: 'Running Sports Sneakers',
    description: 'High-performance running shoes with advanced cushioning, breathable mesh upper, and rubber outsole for superior grip.',
    price: 4999, discountPrice: 3499,
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'],
    category: 'mens', subcategory: 'Shoes', brand: 'SportStep', stock: 70, rating: 4.5, featured: true, isActive: true,
  },
  {
    name: 'Formal Oxford Leather Shoes',
    description: 'Premium genuine leather oxford shoes with memory foam insole. Cap-toe design with Goodyear welt construction.',
    price: 6499, discountPrice: 4999,
    images: ['https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600&q=80'],
    category: 'mens', subcategory: 'Shoes', brand: 'LeatherStep', stock: 45, rating: 4.7, featured: false, isActive: true,
  },
  // MEN'S - Watches
  {
    name: 'Luxury Chronograph Watch',
    description: 'Stainless steel chronograph watch with sapphire crystal glass, 50m water resistance, and Japanese quartz movement.',
    price: 12999, discountPrice: 9499,
    images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80'],
    category: 'mens', subcategory: 'Watches', brand: 'TimePiece', stock: 25, rating: 4.9, featured: true, isActive: true,
  },
  {
    name: 'Smart Fitness Tracker Watch',
    description: 'Smart watch with heart rate monitor, step counter, sleep tracking, and 7-day battery life. Waterproof design.',
    price: 7999, discountPrice: 5499,
    images: ['https://images.unsplash.com/photo-1544117519-31a4b719223d?w=600&q=80'],
    category: 'mens', subcategory: 'Watches', brand: 'TechWear', stock: 60, rating: 4.4, featured: false, isActive: true,
  },

  // WOMEN'S - Dresses
  {
    name: 'Floral Midi Summer Dress',
    description: 'Beautiful floral print midi dress with flowy silhouette. V-neck design with short sleeves. Perfect for summer.',
    price: 2999, discountPrice: 1899,
    images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80'],
    category: 'womens', subcategory: 'Dresses', brand: 'FloralBloom', stock: 80, rating: 4.6, featured: true, isActive: true,
  },
  {
    name: 'Elegant Black Evening Dress',
    description: 'Classic little black dress with fitted silhouette and subtle side slit. Ideal for parties and special occasions.',
    price: 4499, discountPrice: 2999,
    images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80'],
    category: 'womens', subcategory: 'Dresses', brand: 'EveningGlam', stock: 55, rating: 4.7, featured: true, isActive: true,
  },
  // WOMEN'S - Sarees
  {
    name: 'Pure Silk Banarasi Saree',
    description: 'Exquisite pure silk Banarasi saree with intricate zari weaving. Comes with matching blouse piece. Perfect for weddings.',
    price: 15999, discountPrice: 12499,
    images: ['https://images.unsplash.com/photo-1610030169161-6d89cbed0ef2?w=600&q=80'],
    category: 'womens', subcategory: 'Sarees', brand: 'SilkRoute', stock: 20, rating: 4.9, featured: true, isActive: true,
  },
  {
    name: 'Chiffon Floral Printed Saree',
    description: 'Light and elegant chiffon saree with beautiful floral prints. Easy to drape. Ideal for casual and semi-formal occasions.',
    price: 3999, discountPrice: 2499,
    images: ['https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&q=80'],
    category: 'womens', subcategory: 'Sarees', brand: 'ChiffonHouse', stock: 45, rating: 4.4, featured: false, isActive: true,
  },
  // WOMEN'S - Handbags
  {
    name: 'Designer Genuine Leather Handbag',
    description: 'Premium genuine leather tote bag with multiple compartments and gold-tone hardware. Spacious for daily essentials.',
    price: 5999, discountPrice: 4299,
    images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80'],
    category: 'womens', subcategory: 'Handbags', brand: 'BagLux', stock: 40, rating: 4.6, featured: false, isActive: true,
  },
  {
    name: 'Trendy Crossbody Sling Bag',
    description: 'Compact and stylish crossbody bag with adjustable strap. PU leather exterior with multiple pockets.',
    price: 2499, discountPrice: 1599,
    images: ['https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&q=80'],
    category: 'womens', subcategory: 'Handbags', brand: 'UrbanCarry', stock: 65, rating: 4.3, featured: false, isActive: true,
  },
  // WOMEN'S - Heels
  {
    name: 'Block Heel Strappy Sandals',
    description: 'Elegant strappy block heel sandals with cushioned footbed. 3-inch comfortable block heel. Perfect for parties.',
    price: 3499, discountPrice: 2299,
    images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80'],
    category: 'womens', subcategory: 'Heels', brand: 'HeelStyle', stock: 55, rating: 4.5, featured: true, isActive: true,
  },
  {
    name: 'Pointed Toe Stiletto Heels',
    description: 'Classic pointed toe stiletto heels in patent leather. 4-inch heel height with cushioned insole for comfort.',
    price: 4299, discountPrice: 2999,
    images: ['https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=600&q=80'],
    category: 'womens', subcategory: 'Heels', brand: 'GlamFeet', stock: 40, rating: 4.4, featured: false, isActive: true,
  },
  // WOMEN'S - Jewelry
  {
    name: 'Pearl Drop Earrings Set',
    description: 'Elegant freshwater pearl drop earrings in sterling silver with rhodium plating. Hypoallergenic. Perfect for gifting.',
    price: 2999, discountPrice: 1799,
    images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80'],
    category: 'womens', subcategory: 'Jewelry', brand: 'PearlGem', stock: 70, rating: 4.8, featured: true, isActive: true,
  },
  {
    name: 'Gold-Plated Kundan Necklace Set',
    description: 'Stunning kundan necklace set with matching earrings and maang tikka. Antique gold plating with colorful stone embellishments.',
    price: 4999, discountPrice: 3299,
    images: ['https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&q=80'],
    category: 'womens', subcategory: 'Jewelry', brand: 'EthnicGold', stock: 30, rating: 4.7, featured: false, isActive: true,
  },

  // KIDS - Toys
  {
    name: 'Creative Building Blocks Set (250 pcs)',
    description: 'Colorful 250-piece building blocks set that sparks creativity. Develops fine motor skills and logical thinking. Ages 4-12.',
    price: 1999, discountPrice: 1299,
    images: ['https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80'],
    category: 'kids', subcategory: 'Toys', brand: 'KidJoy', stock: 100, rating: 4.8, featured: true, isActive: true,
  },
  {
    name: 'Remote Control Racing Car',
    description: '1:16 scale remote control car with 2.4GHz technology. 30+ minutes play time on single charge. Works on all surfaces.',
    price: 2499, discountPrice: 1699,
    images: ['https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=600&q=80'],
    category: 'kids', subcategory: 'Toys', brand: 'SpeedKids', stock: 60, rating: 4.6, featured: false, isActive: true,
  },
  // KIDS - T-Shirts
  {
    name: 'Kids Superhero Graphic T-Shirt',
    description: 'Fun superhero graphic t-shirt made from 100% organic cotton. Soft and comfortable. Available in sizes 4-14 years.',
    price: 799, discountPrice: 499,
    images: ['https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600&q=80'],
    category: 'kids', subcategory: 'T-Shirts', brand: 'KidStyle', stock: 150, rating: 4.5, featured: false, isActive: true,
  },
  {
    name: 'Unicorn Print Girls T-Shirt',
    description: 'Adorable unicorn print t-shirt for girls. Super soft cotton jersey. Vibrant colors that stay bright after washing. Ages 3-12.',
    price: 699, discountPrice: 449,
    images: ['https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600&q=80'],
    category: 'kids', subcategory: 'T-Shirts', brand: 'GirlsGlow', stock: 130, rating: 4.4, featured: true, isActive: true,
  },
  // KIDS - Shoes
  {
    name: 'Kids LED Light-Up Sports Sneakers',
    description: 'Fun LED light-up sneakers with cushioned sole and easy velcro closure. Non-slip rubber outsole. Sizes 24-36.',
    price: 1499, discountPrice: 999,
    images: ['https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=600&q=80'],
    category: 'kids', subcategory: 'Shoes', brand: 'KidStep', stock: 85, rating: 4.6, featured: true, isActive: true,
  },
  {
    name: 'Waterproof Kids Rain Boots',
    description: 'Durable waterproof rain boots with anti-slip sole. Easy pull-on design with fun print patterns. Keeps feet dry in all weather.',
    price: 1299, discountPrice: 899,
    images: ['https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80'],
    category: 'kids', subcategory: 'Shoes', brand: 'RainKids', stock: 70, rating: 4.3, featured: false, isActive: true,
  },
  // KIDS - School Bags
  {
    name: 'Ergonomic School Backpack',
    description: 'Comfortable ergonomic school bag with padded back support, air-mesh straps, and laptop sleeve. For grades 1-8.',
    price: 1999, discountPrice: 1399,
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80'],
    category: 'kids', subcategory: 'School Bags', brand: 'StudyPack', stock: 90, rating: 4.7, featured: true, isActive: true,
  },
  {
    name: 'Cartoon Character School Bag',
    description: 'Adorable cartoon school bag with water-resistant material. Padded straps and multiple pockets. Perfect for kindergarten.',
    price: 1499, discountPrice: 999,
    images: ['https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=600&q=80'],
    category: 'kids', subcategory: 'School Bags', brand: 'FunPack', stock: 110, rating: 4.4, featured: false, isActive: true,
  },
  // KIDS - Caps
  {
    name: 'Kids Adjustable Baseball Cap',
    description: 'Fun adjustable baseball cap for kids. 100% cotton with UV protection. Velcro back closure fits ages 4-14.',
    price: 599, discountPrice: 399,
    images: ['https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=600&q=80'],
    category: 'kids', subcategory: 'Caps', brand: 'CapKids', stock: 200, rating: 4.3, featured: false, isActive: true,
  },
  {
    name: 'Embroidered Kids Bucket Hat',
    description: 'Trendy embroidered bucket hat with wide brim for sun protection. Lightweight and packable. Perfect for outdoor activities.',
    price: 799, discountPrice: 549,
    images: ['https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&q=80'],
    category: 'kids', subcategory: 'Caps', brand: 'SunKids', stock: 120, rating: 4.5, featured: true, isActive: true,
  },
];

async function main() {
  console.log('🔌 Connecting to MongoDB...');
  console.log('   URI:', MONGODB_URI.replace(/:([^:@]+)@/, ':****@'));

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Seed admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      // Hash password manually since bcryptjs isn't imported here
      const bcrypt = (await import('bcryptjs')).default;
      const hashed = await bcrypt.hash(adminPassword, 12);
      await User.create({ name: 'Admin', email: adminEmail, password: hashed, role: 'admin', isBlocked: false });
      console.log(`✅ Admin created: ${adminEmail}`);
    } else {
      console.log(`ℹ️  Admin already exists: ${adminEmail}`);
    }

    // Delete existing and re-seed products
    const deleted = await Product.deleteMany({});
    console.log(`🗑️  Deleted ${deleted.deletedCount} existing products`);

    await Product.insertMany(products);
    console.log(`✅ ${products.length} products seeded successfully!`);

    // Summary
    const mens = products.filter(p => p.category === 'mens').length;
    const womens = products.filter(p => p.category === 'womens').length;
    const kids = products.filter(p => p.category === 'kids').length;
    console.log(`\n📊 Summary:`);
    console.log(`   Men's products:   ${mens}`);
    console.log(`   Women's products: ${womens}`);
    console.log(`   Kids products:    ${kids}`);
    console.log(`   Total:            ${products.length}`);

  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.message.includes('ECONNREFUSED') || err.message.includes('querySrv')) {
      console.error('\n⚠️  MongoDB Atlas Connection Failed!');
      console.error('   Please go to MongoDB Atlas → Network Access');
      console.error('   Add IP Address: 152.58.15.149  (or 0.0.0.0/0 for all IPs)');
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

main();
