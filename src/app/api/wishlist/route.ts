import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Wishlist from '@/models/Wishlist';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const wishlist = await Wishlist.findOne({ userId: session.user.id })
      .populate('products')
      .lean();

    return NextResponse.json({ success: true, data: wishlist || { products: [] } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await req.json();
    await connectDB();

    let wishlist = await Wishlist.findOne({ userId: session.user.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        userId: session.user.id,
        products: [productId],
      });
    } else {
      const exists = wishlist.products.some((id: any) => id.toString() === productId);
      if (!exists) {
        wishlist.products.push(productId);
        await wishlist.save();
      }
    }

    return NextResponse.json({ success: true, message: 'Added to wishlist' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    await connectDB();

    const wishlist = await Wishlist.findOne({ userId: session.user.id });
    if (wishlist && productId) {
      wishlist.products = wishlist.products.filter(
        (id: any) => id.toString() !== productId
      );
      await wishlist.save();
    }

    return NextResponse.json({ success: true, message: 'Removed from wishlist' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
