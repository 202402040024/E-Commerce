import { NextRequest, NextResponse } from 'next/server';
import { seedAdmin, seedProducts } from '@/lib/seeder';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const force = searchParams.get('force') === 'true';

    await seedAdmin();
    await seedProducts(force);

    return NextResponse.json({
      success: true,
      message: force
        ? 'Database force-reseeded with all sample products!'
        : 'Database seeded successfully!',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
