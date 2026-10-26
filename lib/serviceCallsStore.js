import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'service-calls.json');

// Initialize in-memory cache on global to survive Next.js dev reloads
if (!global.__SERVICE_CALLS__) {
  global.__SERVICE_CALLS__ = [];
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      global.__SERVICE_CALLS__ = JSON.parse(data) || [];
    }
  } catch (err) {
    global.__SERVICE_CALLS__ = [];
  }
}

function persistToFile() {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(global.__SERVICE_CALLS__, null, 2), 'utf-8');
  } catch (err) {
    // Non-fatal if filesystem is read-only
    console.error('Failed to write service calls to file:', err.message);
  }
}

export function getAllCalls(slug) {
  let list = global.__SERVICE_CALLS__;
  if (slug) {
    list = list.filter((c) => c.slug === slug || c.slug?.startsWith(slug.split('-t')[0]));
  }
  // Return sorted newest first
  return [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getActiveCallsForTable(table, slug) {
  const normalizedTable = (table || '').trim().toLowerCase();
  return global.__SERVICE_CALLS__.filter(
    (c) =>
      c.table.toLowerCase() === normalizedTable &&
      (c.status === 'pending' || c.status === 'attending')
  );
}

export function createCall({ table, slug, type, subType, title, note, paymentMethod }) {
  const normalizedTable = (table || 'Table 1').trim();
  const now = new Date().toISOString();

  // Deduplication: reject if identical pending call was created within the last 60 seconds
  const recentDuplicate = global.__SERVICE_CALLS__.find(
    (c) =>
      c.table.toLowerCase() === normalizedTable.toLowerCase() &&
      c.type === type &&
      c.status === 'pending' &&
      new Date(now) - new Date(c.createdAt) < 60000
  );

  if (recentDuplicate) {
    return { duplicate: true, call: recentDuplicate };
  }

  const newCall = {
    id: `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    table: normalizedTable,
    slug: slug || 'anbude-cafe',
    type, // 'waiter' | 'bill'
    subType: subType || (type === 'waiter' ? 'general' : 'counter'),
    title: title || (type === 'waiter' ? 'Call Waiter' : 'Request Bill'),
    note: (note || '').trim(),
    paymentMethod: paymentMethod || null, // 'upi' | 'cash' | 'card_machine' | null
    status: 'pending', // 'pending' | 'attending' | 'resolved' | 'cancelled'
    createdAt: now,
    updatedAt: now,
  };

  global.__SERVICE_CALLS__.unshift(newCall);
  persistToFile();
  return { duplicate: false, call: newCall };
}

export function updateCallStatus(id, newStatus) {
  const call = global.__SERVICE_CALLS__.find((c) => c.id === id);
  if (!call) return null;

  call.status = newStatus;
  call.updatedAt = new Date().toISOString();
  persistToFile();
  return call;
}

export function cancelCall(id) {
  return updateCallStatus(id, 'cancelled');
}
