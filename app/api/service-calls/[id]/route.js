import { NextResponse } from 'next/server';
import { updateCallStatus, cancelCall } from '@/lib/serviceCallsStore';

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    const allowedStatuses = ['pending', 'attending', 'resolved', 'cancelled'];
    if (!status || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const updated = updateCallStatus(id, status);
    if (!updated) {
      return NextResponse.json({ error: 'Service call not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, call: updated });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update service call', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const cancelled = cancelCall(id);
    if (!cancelled) {
      return NextResponse.json({ error: 'Service call not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, call: cancelled });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to cancel service call', details: error.message },
      { status: 500 }
    );
  }
}
