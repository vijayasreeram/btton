import { NextResponse } from 'next/server';
import {
  getConfigByHotelAndBranch,
  saveConfig,
  deleteConfig,
  getConfigById,
} from '@/lib/reviewConfigStore';

export async function GET(request, { params }) {
  try {
    const { hotelId } = params;
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId') || null;
    const placement = searchParams.get('placement') || null;
    const isAdmin = searchParams.get('admin') === 'true';

    const config = getConfigByHotelAndBranch(hotelId, branchId, placement);

    // If customer-facing request (non-admin), only serve if button is active
    if (!isAdmin) {
      if (!config || config.status !== 'active' || !config.reviewUrl) {
        return NextResponse.json({
          active: false,
          config: null,
          message: 'Review button configuration is inactive or not configured.',
        });
      }
      return NextResponse.json({
        active: true,
        config,
      });
    }

    // Admin request - return config even if inactive
    return NextResponse.json({
      success: true,
      config: config || null,
      hotelId,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve review configuration', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const { hotelId } = params;
    const body = await request.json();

    const configData = {
      ...body,
      hotelId: hotelId || body.hotelId,
    };

    const saved = saveConfig(configData);

    return NextResponse.json({
      success: true,
      message: 'Google Review Button configuration saved successfully.',
      config: saved,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to save review configuration' },
      { status: 400 }
    );
  }
}

export async function PUT(request, { params }) {
  // Re-use saveConfig logic since it upserts
  return POST(request, { params });
}

export async function DELETE(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Configuration ID is required to delete.' },
        { status: 400 }
      );
    }

    const removed = deleteConfig(id);
    if (!removed) {
      return NextResponse.json(
        { error: 'Configuration not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Review configuration deleted successfully.',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete configuration', details: error.message },
      { status: 500 }
    );
  }
}
