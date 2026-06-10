import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Cart from '@/models/Cart';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const cart = await Cart.findOne({ userId: session.user.id })
      .populate('products.productId')
      .lean();

    return NextResponse.json({ success: true, data: cart || { products: [] } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, quantity = 1 } = await req.json();

    await connectDB();

    let cart = await Cart.findOne({ userId: session.user.id });

    if (!cart) {
      cart = await Cart.create({
        userId: session.user.id,
        products: [{ productId, quantity }],
      });
    } else {
      const existingItem = cart.products.find(
        (item: any) => item.productId.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.products.push({ productId, quantity });
      }

      await cart.save();
    }

    await cart.populate('products.productId');

    return NextResponse.json({ success: true, data: cart });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, quantity } = await req.json();

    await connectDB();

    const cart = await Cart.findOne({ userId: session.user.id });
    if (!cart) {
      return NextResponse.json({ success: false, error: 'Cart not found' }, { status: 404 });
    }

    if (quantity <= 0) {
      cart.products = cart.products.filter(
        (item: any) => item.productId.toString() !== productId
      );
    } else {
      const item = cart.products.find(
        (item: any) => item.productId.toString() === productId
      );
      if (item) item.quantity = quantity;
    }

    await cart.save();
    await cart.populate('products.productId');

    return NextResponse.json({ success: true, data: cart });
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

    const cart = await Cart.findOne({ userId: session.user.id });
    if (!cart) {
      return NextResponse.json({ success: false, error: 'Cart not found' }, { status: 404 });
    }

    if (productId) {
      cart.products = cart.products.filter(
        (item: any) => item.productId.toString() !== productId
      );
    } else {
      cart.products = [];
    }

    await cart.save();
    return NextResponse.json({ success: true, message: 'Cart updated' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
