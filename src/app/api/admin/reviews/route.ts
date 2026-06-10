import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const products = await Product.find({ 'reviews.0': { $exists: true } })
      .select('name images reviews')
      .lean() as any[];

    const allReviews = products.flatMap((product) =>
      (product.reviews || []).map((review: any) => ({
        ...review,
        productId: product._id,
        productName: product.name,
        productImage: product.images?.[0] || '',
      }))
    ).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, data: allReviews });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Approve/reject a review
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, reviewId, isApproved } = await req.json();
    await connectDB();

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const review = product.reviews.id(reviewId);
    if (!review) {
      return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
    }

    review.isApproved = isApproved;

    // Recalculate average rating
    const approved = product.reviews.filter((r: any) => r.isApproved);
    product.rating = approved.length > 0
      ? Math.round((approved.reduce((s: number, r: any) => s + r.rating, 0) / approved.length) * 10) / 10
      : 0;

    await product.save();

    return NextResponse.json({ success: true, message: `Review ${isApproved ? 'approved' : 'rejected'}` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Delete a review
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const reviewId = searchParams.get('reviewId');

    if (!productId || !reviewId) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    await connectDB();

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const idx = product.reviews.findIndex((r: any) => r._id.toString() === reviewId);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
    }

    product.reviews.splice(idx, 1);

    const approved = product.reviews.filter((r: any) => r.isApproved);
    product.rating = approved.length > 0
      ? Math.round((approved.reduce((s: number, r: any) => s + r.rating, 0) / approved.length) * 10) / 10
      : 0;

    await product.save();

    return NextResponse.json({ success: true, message: 'Review deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
