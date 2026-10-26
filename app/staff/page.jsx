'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Receipt,
  GlassWater,
  UtensilsCrossed,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  Smartphone,
  Banknote,
  CreditCard,
  CheckCircle2,
  Clock,
  Volume2,
  VolumeX,
  RefreshCw,
  Check,
  ShieldAlert,
} from 'lucide-react';

// Web Audio API Pleasant Notification Chime (no external mp3 dependency)
function playChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now); // A5
    osc1.frequency.exponentialRampToValueAtTime(1318.5, now + 0.15); // E6

    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.6);

    // Second harmonic bell
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1760, now + 0.12);
    gain2.gain.setValueAtTime(0.18, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now + 0.12);
    osc2.stop(now + 0.7);
  } catch (e) {
    // AudioContext blocked before user interaction
  }
}

function timeAgo(dateString) {
  if (!dateString) return 'Just now';
  const diffMs = new Date() - new Date(dateString);
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 20) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin === 1) return '1 min ago';
  if (diffMin < 60) return `${diffMin} mins ago`;
  const diffHours = Math.floor(diffMin / 60);
  return `${diffHours}h ago`;
}

export default function StaffMonitorPage() {
  const [calls, setCalls] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filter, setFilter] = useState('active'); // 'active' | 'all'
  const [isRefreshing, setIsRefreshing] = useState(false);
  const previousPendingCount = useRef(0);

  const fetchCalls = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/service-calls');
      if (res.ok) {
        const data = await res.json();
        const callList = data.calls || [];
        setCalls(callList);

        // Count pending calls
        const pendingCount = callList.filter((c) => c.status === 'pending').length;
        if (pendingCount > previousPendingCount.current && soundEnabled) {
          playChime();
        }
        previousPendingCount.current = pendingCount;
      }
    } catch (err) {
      console.error('Failed to poll service calls:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCalls();
    // Poll every 4 seconds for real-time table assistance
    const interval = setInterval(fetchCalls, 4000);
    return () => clearInterval(interval);
  }, [soundEnabled]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/service-calls/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setCalls((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: newStatus, updatedAt: new Date().toISOString() } : c))
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const activeCalls = calls.filter((c) => c.status === 'pending' || c.status === 'attending');
  const displayedCalls = filter === 'active' ? activeCalls : calls;

  const getCallIcon = (call) => {
    if (call.type === 'bill') {
      if (call.paymentMethod === 'upi') return Smartphone;
      if (call.paymentMethod === 'cash') return Banknote;
      return CreditCard;
    }
    switch (call.subType) {
      case 'water':
        return GlassWater;
      case 'cutlery':
        return UtensilsCrossed;
      case 'clean':
        return Sparkles;
      case 'issue':
        return AlertTriangle;
      default:
        return Bell;
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F3EC] text-[#101B35] font-sans p-4 sm:p-6 lg:p-8 selection:bg-[#FFB800]/30 selection:text-amber-950">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-[#E8EAF0] shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#FFB800]/20 border border-[#FFB800]/40 flex items-center justify-center text-[#101B35]">
                <Bell className="w-5 h-5 fill-[#FFB800]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-[#101B35] tracking-tight">
                    Floor Service & Bill Calls
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#101B35] text-white">
                    {activeCalls.length} Active
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                  Real-time table assistance dashboard for Anbu&apos;de Cafe
                </p>
              </div>
            </div>
          </div>

          {/* Controls: Sound toggle, Refresh, Filter tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playChime();
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                soundEnabled
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : 'bg-gray-100 text-gray-500 border-gray-200'
              }`}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-amber-600" />
                  <span>Chime On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>Muted</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={fetchCalls}
              disabled={isRefreshing}
              className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => setFilter('active')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filter === 'active'
                    ? 'bg-white text-[#101B35] shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Active ({activeCalls.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filter === 'all'
                    ? 'bg-white text-[#101B35] shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                All Logs ({calls.length})
              </button>
            </div>
          </div>
        </header>

        {/* Call Cards Grid */}
        {displayedCalls.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E8EAF0] shadow-sm space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#101B35]">
              All Tables Attended To
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              No pending waiter or bill requests at this moment. New requests from guests will appear here with an audio alert.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedCalls.map((call) => {
              const isBill = call.type === 'bill';
              const isPending = call.status === 'pending';
              const isAttending = call.status === 'attending';
              const isResolved = call.status === 'resolved';
              const isCancelled = call.status === 'cancelled';
              const Icon = getCallIcon(call);

              return (
                <div
                  key={call.id}
                  className={`bg-white rounded-3xl p-5 border transition-all shadow-sm flex flex-col justify-between space-y-4 ${
                    isPending
                      ? isBill
                        ? 'border-emerald-400 ring-2 ring-emerald-400/20 shadow-md'
                        : 'border-[#FFB800] ring-2 ring-[#FFB800]/20 shadow-md'
                      : isAttending
                      ? 'border-sky-300 bg-sky-50/20'
                      : 'border-gray-200 opacity-60'
                  }`}
                >
                  {/* Top: Table badge & elapsed time */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-xl bg-[#101B35] text-white font-mono font-black text-sm tracking-tight">
                        {call.table}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isBill
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        {isBill ? 'Bill Call' : 'Waiter Call'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{timeAgo(call.createdAt)}</span>
                    </div>
                  </div>

                  {/* Center: Title & Subtitle */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                          isBill
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <Icon className="w-4 h-4 stroke-[2.2]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-base font-extrabold text-[#101B35] leading-snug">
                          {call.title}
                        </h4>
                        {call.paymentMethod && (
                          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">
                            Method: {call.paymentMethod.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Guest Note */}
                    {call.note && (
                      <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200/80 text-xs text-gray-700 font-sans italic">
                        &ldquo;{call.note}&rdquo;
                      </div>
                    )}
                  </div>

                  {/* Bottom: Status indicator & Action buttons */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <div className="text-[11px] font-bold">
                      {isPending && (
                        <span className="inline-flex items-center gap-1.5 text-amber-600">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                          <span>Waiting for staff</span>
                        </span>
                      )}
                      {isAttending && (
                        <span className="inline-flex items-center gap-1.5 text-sky-600 font-bold">
                          <span className="w-2 h-2 rounded-full bg-sky-500" />
                          <span>Staff Attending</span>
                        </span>
                      )}
                      {isResolved && (
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold">
                          <Check className="w-3.5 h-3.5" />
                          <span>Completed</span>
                        </span>
                      )}
                      {isCancelled && (
                        <span className="text-gray-400">Cancelled by guest</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      {isPending && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(call.id, 'attending')}
                          className="px-2.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold transition cursor-pointer active:scale-95"
                        >
                          Attending
                        </button>
                      )}
                      {(isPending || isAttending) && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(call.id, 'resolved')}
                          className="px-3 py-1.5 rounded-xl bg-[#101B35] hover:bg-black text-white text-xs font-bold transition cursor-pointer shadow-xs active:scale-95 flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Done</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
