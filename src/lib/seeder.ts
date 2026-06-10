import connectDB from './mongodb';
import User from '@/models/User';
import Product from '@/models/Product';

export async function seedAdmin() {
  try {
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    const existingAdmin = await User.findOne({ email: adminEmail, role: 'admin' });

    if (!existingAdmin) {
      await User.create({
        name: 'Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isBlocked: false,
      });
      console.log('✅ Default admin created successfully');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
}

export async function seedProducts() {
  try {
    await connectDB();

    const count = await Product.countDocuments();
    if (count > 0) return;

    const products = [
      // Men's products
      {
        name: 'Classic Cotton T-Shirt',
        description: 'Premium quality cotton t-shirt, perfect for casual wear. Breathable fabric with modern fit.',
        price: 1499,
        discountPrice: 999,
        images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'],
        category: 'mens',
        subcategory: 'T-Shirts',
        brand: 'FashionHub',
        stock: 100,
        rating: 4.5,
        featured: true,
      },
      {
        name: 'Formal Oxford Shirt',
        description: 'Elegant formal shirt crafted from fine cotton. Perfect for office and formal occasions.',
        price: 2499,
        discountPrice: 1799,
        images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500'],
        category: 'mens',
        subcategory: 'Shirts',
        brand: 'StyleCraft',
        stock: 75,
        rating: 4.3,
        featured: true,
      },
      {
        name: 'Slim Fit Denim Jeans',
        description: 'Modern slim fit jeans with stretch fabric for maximum comfort. Classic blue wash.',
        price: 3499,
        discountPrice: 2499,
        images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'],
        category: 'mens',
        subcategory: 'Jeans',
        brand: 'DenimKing',
        stock: 60,
        rating: 4.6,
        featured: false,
      },
      {
        name: 'Leather Biker Jacket',
        description: 'Premium genuine leather jacket with quilted lining. Timeless style for every season.',
        price: 8999,
        discountPrice: 6999,
        images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500'],
        category: 'mens',
        subcategory: 'Jackets',
        brand: 'LeatherCo',
        stock: 30,
        rating: 4.7,
        featured: true,
      },
      {
        name: 'Running Sports Shoes',
        description: 'High-performance running shoes with advanced cushioning and breathable mesh upper.',
        price: 4999,
        discountPrice: 3499,
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'],
        category: 'mens',
        subcategory: 'Shoes',
        brand: 'SportStep',
        stock: 50,
        rating: 4.4,
        featured: false,
      },
      {
        name: 'Luxury Chronograph Watch',
        description: 'Sophisticated chronograph watch with stainless steel case. Water resistant up to 50m.',
        price: 12999,
        discountPrice: 9999,
        images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500'],
        category: 'mens',
        subcategory: 'Watches',
        brand: 'TimePiece',
        stock: 20,
        rating: 4.8,
        featured: true,
      },
      // Women's products
      {
        name: 'Floral Summer Dress',
        description: 'Beautiful floral print summer dress with midi length. Perfect for casual outings.',
        price: 2999,
        discountPrice: 1999,
        images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500'],
        category: 'womens',
        subcategory: 'Dresses',
        brand: 'FloralBloom',
        stock: 80,
        rating: 4.5,
        featured: true,
      },
      {
        name: 'Silk Banarasi Saree',
        description: 'Pure silk Banarasi saree with intricate zari work. Perfect for festivals and weddings.',
        price: 15999,
        discountPrice: 12999,
        images: ['https://images.unsplash.com/photo-1610030169161-6d89cbed0ef2?w=500'],
        category: 'womens',
        subcategory: 'Sarees',
        brand: 'SilkRoute',
        stock: 25,
        rating: 4.9,
        featured: true,
      },
      {
        name: 'Designer Leather Handbag',
        description: 'Genuine leather handbag with multiple compartments. Stylish and functional.',
        price: 5999,
        discountPrice: 4499,
        images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'],
        category: 'womens',
        subcategory: 'Handbags',
        brand: 'BagLux',
        stock: 40,
        rating: 4.6,
        featured: false,
      },
      {
        name: 'Strappy Block Heels',
        description: 'Elegant strappy heels with comfortable block heel. Perfect for parties and events.',
        price: 3499,
        discountPrice: 2499,
        images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500'],
        category: 'womens',
        subcategory: 'Heels',
        brand: 'HeelStyle',
        stock: 55,
        rating: 4.3,
        featured: false,
      },
      {
        name: 'Pearl Drop Earrings',
        description: 'Classic freshwater pearl drop earrings set in sterling silver. Timeless elegance.',
        price: 2999,
        discountPrice: 1999,
        images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500'],
        category: 'womens',
        subcategory: 'Jewelry',
        brand: 'PearlGem',
        stock: 45,
        rating: 4.7,
        featured: true,
      },
      // Kids' products
      {
        name: 'Building Blocks Set',
        description: 'Creative building blocks set with 100+ colorful pieces. Enhances creativity and motor skills.',
        price: 1999,
        discountPrice: 1499,
        images: ['https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500'],
        category: 'kids',
        subcategory: 'Toys',
        brand: 'KidJoy',
        stock: 90,
        rating: 4.8,
        featured: true,
      },
      {
        name: "Kids Graphic T-Shirt",
        description: 'Fun and colorful graphic t-shirt for kids. Made from 100% organic cotton.',
        price: 799,
        discountPrice: 599,
        images: ['https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=500'],
        category: 'kids',
        subcategory: 'T-Shirts',
        brand: 'KidStyle',
        stock: 120,
        rating: 4.4,
        featured: false,
      },
      {
        name: 'Kids Sneakers',
        description: 'Lightweight and durable sneakers for active kids. Non-slip sole for safety.',
        price: 1499,
        discountPrice: 1099,
        images: ['https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=500'],
        category: 'kids',
        subcategory: 'Shoes',
        brand: 'KidStep',
        stock: 70,
        rating: 4.5,
        featured: false,
      },
      {
        name: 'Ergonomic School Bag',
        description: 'Comfortable and spacious school bag with padded back support and multiple pockets.',
        price: 1999,
        discountPrice: 1499,
        images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'],
        category: 'kids',
        subcategory: 'School Bags',
        brand: 'StudyPack',
        stock: 85,
        rating: 4.6,
        featured: true,
      },
    ];

    await Product.insertMany(products);
    console.log('✅ Sample products seeded successfully');
  } catch (error) {
    console.error('Error seeding products:', error);
  }
}
