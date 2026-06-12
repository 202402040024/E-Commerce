import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { seedAdmin, seedProducts } from '@/lib/seeder';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    await seedAdmin();
    await seedProducts(false);

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category')?.trim();
    const subcategory = searchParams.get('subcategory')?.trim();
    const search = searchParams.get('search')?.trim();
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minRating = searchParams.get('minRating');
    const sortBy = searchParams.get('sortBy') || 'newest';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '12'));
    const featured = searchParams.get('featured');

    const query: Record<string, any> = { isActive: true };

    // ── Category filter ─────────────────────────────────────────
    if (category) {
      query.category = category.toLowerCase();
    }

    // ── Subcategory filter ───────────────────────────────────────
    if (subcategory) {
      query.subcategory = { $regex: subcategory, $options: 'i' };
    }

    // ── Search: use regex (works without text index) ─────────────
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { subcategory: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    // ── Price filter — check both price and discountPrice ────────
    if (minPrice || maxPrice) {
      const min = minPrice ? Number(minPrice) : null;
      const max = maxPrice ? Number(maxPrice) : null;

      if (min !== null && max !== null) {
        // Products where effective price (discountPrice or price) is in range
        query.$and = [
          {
            $or: [
              {
                discountPrice: { $exists: true, $ne: null, $gte: min, $lte: max },
              },
              {
                discountPrice: { $exists: false },
                price: { $gte: min, $lte: max },
              },
              {
                discountPrice: null,
                price: { $gte: min, $lte: max },
              },
            ],
          },
        ];
      } else if (min !== null) {
        query.$and = [
          {
            $or: [
              { discountPrice: { $exists: true, $ne: null, $gte: min } },
              { discountPrice: { $in: [null, undefined] }, price: { $gte: min } },
            ],
          },
        ];
      } else if (max !== null) {
        query.$and = [
          {
            $or: [
              { discountPrice: { $exists: true, $ne: null, $lte: max } },
              { discountPrice: { $in: [null, undefined] }, price: { $lte: max } },
            ],
          },
        ];
      }
    }

    // ── Rating filter ────────────────────────────────────────────
    if (minRating && Number(minRating) > 0) {
      query.rating = { $gte: Number(minRating) };
    }

    // ── Featured filter ──────────────────────────────────────────
    if (featured === 'true') {
      query.featured = true;
    }

    // ── Sort ─────────────────────────────────────────────────────
    let sortOption: Record<string, any> = { createdAt: -1 };
    switch (sortBy) {
      case 'price_asc':
        sortOption = { price: 1 };
        break;
      case 'price_desc':
        sortOption = { price: -1 };
        break;
      case 'rating':
        sortOption = { rating: -1, createdAt: -1 };
        break;
      case 'popular':
        sortOption = { 'reviews.length': -1, rating: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const [total, products] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query)
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Products GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
