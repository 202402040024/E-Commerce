import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { auth } from '@/lib/auth';

// Smart fallback images from Unsplash based on category/subcategory/keywords
function getFallbackImage(
  category: 'mens' | 'womens' | 'kids',
  subcategory: string,
  name: string
): string {
  const sub = subcategory.toLowerCase();
  const n = name.toLowerCase();

  const imageMap: Record<string, string> = {
    // Men's
    't-shirt': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
    'shirt': 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80',
    'jeans': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80',
    'jacket': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80',
    'shoes': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    'watch': 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80',
    'trouser': 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80',
    'blazer': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80',
    'hoodie': 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80',
    'kurta': 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&q=80',
    'polo': 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&q=80',
    // Women's
    'dress': 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80',
    'saree': 'https://images.unsplash.com/photo-1610030169161-6d89cbed0ef2?w=600&q=80',
    'handbag': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
    'purse': 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&q=80',
    'heels': 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80',
    'jewelry': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
    'top': 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=80',
    'skirt': 'https://images.unsplash.com/photo-1594938298603-c8148c4b1c2a?w=600&q=80',
    'blouse': 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=600&q=80',
    'kurti': 'https://images.unsplash.com/photo-1610030169161-6d89cbed0ef2?w=600&q=80',
    'lehenga': 'https://images.unsplash.com/photo-1610030169161-6d89cbed0ef2?w=600&q=80',
    // Kids
    'toy': 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80',
    'cap': 'https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=600&q=80',
    'bag': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
    'frock': 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600&q=80',
    'shorts': 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&q=80',
    'dungaree': 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&q=80',
    'cartoon': 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600&q=80',
  };

  // Check subcategory first, then product name keywords
  for (const [keyword, url] of Object.entries(imageMap)) {
    if (sub.includes(keyword) || n.includes(keyword)) return url;
  }

  // Category-level fallbacks
  const categoryFallbacks = {
    mens: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600&q=80',
    womens: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80',
    kids: 'https://images.unsplash.com/photo-1473362795849-26b45f7d9524?w=600&q=80',
  };

  return categoryFallbacks[category];
}

// Normalize a raw row from CSV/Excel/JSON into a product document
function normalizeRow(row: Record<string, any>) {
  // Helper: get value by multiple possible key names
  const get = (...keys: string[]) => {
    for (const k of keys) {
      const val = row[k] ?? row[k.toLowerCase()] ?? row[k.toUpperCase()];
      if (val !== undefined && val !== null && val !== '') return val;
    }
    return undefined;
  };

  const name = String(get('name', 'product_name', 'productName', 'Product Name', 'title') || '').trim();
  const description = String(get('description', 'desc', 'Description', 'details') || '').trim();
  const priceRaw = get('price', 'Price', 'mrp', 'MRP', 'selling_price');
  const discountRaw = get('discountPrice', 'discount_price', 'sale_price', 'Discount Price', 'offer_price');
  const category = String(get('category', 'Category', 'gender', 'Gender') || '').toLowerCase().trim();
  const subcategory = String(get('subcategory', 'Subcategory', 'sub_category', 'type', 'Type') || '').trim();
  const brand = String(get('brand', 'Brand', 'brand_name') || '').trim();
  const stockRaw = get('stock', 'Stock', 'quantity', 'Quantity', 'qty');
  const imageRaw = get(
    'image', 'images', 'Image', 'image_url', 'imageUrl',
    'img', 'photo', 'picture', 'thumbnail',
    'productUrl', 'product_url', 'ProductUrl',  // handle user's file format
    'imgUrl', 'img_url', 'imageLink', 'image_link'
  );
  const featuredRaw = get('featured', 'Featured', 'is_featured');

  if (!name) return { error: 'Missing product name' };

  // Normalize category to enum values
  let normalizedCategory: 'mens' | 'womens' | 'kids' | null = null;
  const catLower = category.toLowerCase();
  if (['mens', "men's", 'men', 'male', 'him', 'gents'].includes(catLower)) {
    normalizedCategory = 'mens';
  } else if (['womens', "women's", 'women', 'female', 'her', 'ladies'].includes(catLower)) {
    normalizedCategory = 'womens';
  } else if (['kids', 'kid', 'children', 'child', 'boys', 'girls', 'unisex'].includes(catLower)) {
    normalizedCategory = 'kids';
  }

  if (!normalizedCategory) {
    return { error: `Invalid category "${category}" for product "${name}". Use: mens, womens, or kids` };
  }

  const price = parseFloat(String(priceRaw || '0').replace(/[₹,$,€,£,\s,]/g, ''));
  if (!price || price <= 0) return { error: `Invalid price for product "${name}"` };

  const discountPrice = discountRaw
    ? parseFloat(String(discountRaw).replace(/[₹,$,€,£,\s,]/g, ''))
    : undefined;

  const stock = parseInt(String(stockRaw || '100'), 10) || 100;

  // Handle images: can be a comma-separated string or array
  let images: string[] = [];
  if (imageRaw) {
    const rawList = Array.isArray(imageRaw)
      ? imageRaw.map(String)
      : String(imageRaw).split(',').map((s) => s.trim());

    images = rawList.filter((url) => {
      if (!url) return false;
      // Skip base64 data URLs — too large and not suitable for storage
      if (url.startsWith('data:')) return false;
      // Skip Google encrypted thumbnails — they expire/are restricted
      if (url.includes('encrypted-tbn') || url.includes('gstatic.com/shopping')) return false;
      // Must be a valid http/https URL
      return url.startsWith('http://') || url.startsWith('https://');
    });
  }

  const featured =
    featuredRaw === true ||
    String(featuredRaw).toLowerCase() === 'true' ||
    featuredRaw === 1 ||
    featuredRaw === '1' ||
    String(featuredRaw).toLowerCase() === 'yes';

  // Auto-assign a fallback image if none provided (based on category/name)
  if (images.length === 0) {
    images = [getFallbackImage(normalizedCategory, subcategory, name)];
  }

  return {
    name,
    description: description || `${name} - quality ${normalizedCategory} product by ${brand || 'ShopHub'}`,
    price,
    discountPrice: discountPrice && discountPrice < price ? discountPrice : undefined,
    category: normalizedCategory,
    subcategory: subcategory || undefined,
    brand: brand || 'ShopHub',
    stock,
    images,
    featured,
    rating: 0,
    isActive: true,
  };
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { products: rawProducts } = body;

    if (!Array.isArray(rawProducts) || rawProducts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No products data provided' },
        { status: 400 }
      );
    }

    if (rawProducts.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Maximum 500 products per import' },
        { status: 400 }
      );
    }

    await connectDB();

    const valid: any[] = [];
    const errors: { row: number; error: string }[] = [];

    rawProducts.forEach((row: any, index: number) => {
      const result = normalizeRow(row);
      if ('error' in result) {
        errors.push({ row: index + 1, error: result.error as string });
      } else {
        valid.push(result);
      }
    });

    if (valid.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No valid products found in the file',
          details: errors,
        },
        { status: 400 }
      );
    }

    // Insert valid products
    const inserted = await Product.insertMany(valid, { ordered: false });

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${inserted.length} products`,
      data: {
        imported: inserted.length,
        failed: errors.length,
        total: rawProducts.length,
        errors: errors.slice(0, 20), // Return first 20 errors max
      },
    });
  } catch (error: any) {
    console.error('Bulk import error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Import failed' },
      { status: 500 }
    );
  }
}
