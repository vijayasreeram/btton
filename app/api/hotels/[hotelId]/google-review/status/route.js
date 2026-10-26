import { NextResponse } from 'next/server';
import { updateConfigStatus } from '@/lib/reviewConfigStore';

export async function PATCH(request, { params }) {
  try {
    const { hotelId } = params;
    const body = await request.json();
    const { id, status } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Configuration ID is required to update status.' },
        { status: 400 }
      );
    }

    if (!status || !['active', 'inactive'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be either "active" or "inactive".' },
        { status: 400 }
      );
    }

    const updated = updateConfigStatus(id, status);
    if (!updated) {
      return NextResponse.json(
        { error: 'Review configuration not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Review button ${status === 'active' ? 'activated' : 'deactivated'} successfully.`,
      config: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to update review button status' },
      { status: 400 }
    );
  }
}
