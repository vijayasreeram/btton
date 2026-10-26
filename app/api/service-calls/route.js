import { NextResponse } from 'next/server';
import { getAllCalls, getActiveCallsForTable, createCall } from '@/lib/serviceCallsStore';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const table = searchParams.get('table');

    if (table) {
      const activeCalls = getActiveCallsForTable(table, slug);
      return NextResponse.json({ calls: activeCalls });
    }

    const calls = getAllCalls(slug);
    return NextResponse.json({ calls });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch service calls', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { table, slug, type, subType, title, note, paymentMethod } = body;

    if (!type || !['waiter', 'bill'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "waiter" or "bill".' },
        { status: 400 }
      );
    }

    if (!table || typeof table !== 'string' || !table.trim()) {
      return NextResponse.json(
        { error: 'Table identifier is required.' },
        { status: 400 }
      );
    }

    const result = createCall({
      table,
      slug,
      type,
      subType,
      title,
      note,
      paymentMethod,
    });

    return NextResponse.json(result, { status: result.duplicate ? 200 : 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create service call', details: error.message },
      { status: 500 }
    );
  }
}
