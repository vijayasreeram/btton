import { NextResponse } from 'next/server';
import { getAllConfigs, getHotelsList } from '@/lib/reviewConfigStore';

export async function GET() {
  try {
    const hotels = getHotelsList();
    const configs = getAllConfigs();
    return NextResponse.json({
      success: true,
      hotels,
      configs,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch hotels list', details: error.message },
      { status: 500 }
    );
  }
}
