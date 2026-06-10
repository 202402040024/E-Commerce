import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const reviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().min(5, 'Comment must be at least 5 characters').max(500, 'Comment too long'),
});

// GET — fetch all approved reviews for a product
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const product = await Product.findById(id).select('reviews rating').lean() as any;
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const reviews = (product.reviews || []).sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const approved = reviews.filter((r: any) => r.isApproved);
    const ratingCounts = [1, 2, 3, 4, 5].map((star) => ({
      star,
      count: approved.filter((r: any) => r.rating === star).length,
    }));

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        totalReviews: reviews.length,
        approvedCount: approved.length,
        averageRating: product.rating,
        ratingCounts,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST — submit a new review
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'You must be logged in to write a review' },
        { status: 401 }
      );
    }

    if ((session.user as any).role === 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admins cannot write product reviews' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = reviewSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { rating, comment } = validation.data;
    await connectDB();
    const { id } = await params;

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    // Check if user already reviewed this product
    const existingReview = product.reviews.find(
      (r: any) => r.userId.toString() === session.user.id
    );

    if (existingReview) {
      // Update existing review
      existingReview.rating = rating;
      existingReview.comment = comment.trim();
      existingReview.isApproved = true; // auto-approve updated reviews
    } else {
      // Add new review
      product.reviews.push({
        userId: session.user.id,
        userName: session.user.name || 'Anonymous',
        rating,
        comment: comment.trim(),
        isApproved: true, // auto-approve
      });
    }

    // Recalculate average rating from all approved reviews
    const approvedReviews = product.reviews.filter((r: any) => r.isApproved);
    if (approvedReviews.length > 0) {
      const total = approvedReviews.reduce((sum: number, r: any) => sum + r.rating, 0);
      product.rating = Math.round((total / approvedReviews.length) * 10) / 10;
    }

    await product.save();

    return NextResponse.json({
      success: true,
      message: existingReview ? 'Review updated successfully!' : 'Review submitted successfully!',
      data: {
        rating: product.rating,
        totalReviews: product.reviews.length,
      },
    });
  } catch (error: any) {
    console.error('Review submit error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE — delete user's own review
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const reviewIndex = product.reviews.findIndex(
      (r: any) => r.userId.toString() === session.user.id
    );

    if (reviewIndex === -1) {
      return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
    }

    product.reviews.splice(reviewIndex, 1);

    // Recalculate rating
    const approvedReviews = product.reviews.filter((r: any) => r.isApproved);
    product.rating =
      approvedReviews.length > 0
        ? Math.round(
            (approvedReviews.reduce((s: number, r: any) => s + r.rating, 0) /
              approvedReviews.length) *
              10
          ) / 10
        : 0;

    await product.save();

    return NextResponse.json({ success: true, message: 'Review deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
