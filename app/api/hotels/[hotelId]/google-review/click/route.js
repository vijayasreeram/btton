import { NextResponse } from 'next/server';
import { recordReviewClick } from '@/lib/reviewConfigStore';

export async function POST(request, { params }) {
  try {
    const { hotelId } = params;
    const body = await request.json().catch(() => ({}));
    const { branchId, placement } = body;
    const userAgent = request.headers.get('user-agent') || '';

    const result = recordReviewClick({
      hotelId,
      branchId,
      placement: placement || 'button',
      userAgent,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to record click analytics', details: error.message },
      { status: 500 }
    );
  }
}
