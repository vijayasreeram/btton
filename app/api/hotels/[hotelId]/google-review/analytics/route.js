import { NextResponse } from 'next/server';
import { getClickAnalytics } from '@/lib/reviewConfigStore';

export async function GET(request, { params }) {
  try {
    const { hotelId } = params;
    const analytics = getClickAnalytics(hotelId);

    return NextResponse.json({
      success: true,
      hotelId,
      analytics,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: error.message },
      { status: 500 }
    );
  }
}
