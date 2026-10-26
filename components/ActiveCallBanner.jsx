'use client';

import { Bell, Receipt, CheckCircle2, Clock, X, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function ActiveCallBanner({ activeCall, onCancelCall }) {
  const [cancelling, setCancelling] = useState(false);

  if (!activeCall) return null;

  const isBill = activeCall.type === 'bill';
  const isAttending = activeCall.status === 'attending';

  const handleCancel = async (e) => {
    e.stopPropagation();
    if (cancelling) return;
    setCancelling(true);
    try {
      await fetch(`/api/service-calls/${activeCall.id}`, {
        method: 'DELETE',
      });
      if (onCancelCall) {
        onCancelCall(activeCall.id);
      }
    } catch (err) {
      console.error('Failed to cancel call:', err);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <aside
      aria-label="Active service request notification"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[400px] z-40 animate-in slide-in-from-bottom duration-300 pointer-events-auto"
    >
      <div
        className={`w-full p-3 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.18)] border backdrop-blur-md flex items-center justify-between gap-3 ${
          isBill
            ? 'bg-[#101B35]/95 text-white border-emerald-500/50'
            : 'bg-[#101B35]/95 text-white border-[#FFB800]/50'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Animated Pulsing Icon */}
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border relative ${
              isBill
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-[#FFB800]/20 text-[#FFB800] border-[#FFB800]/40'
            }`}
          >
            {isBill ? (
              <Receipt className="w-4 h-4 stroke-[2.2]" />
            ) : (
              <Bell className="w-4 h-4 stroke-[2.2]" />
            )}
            <span
              className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${
                isAttending ? 'bg-sky-400' : 'bg-amber-400'
              } animate-ping`}
            />
            <span
              className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${
                isAttending ? 'bg-sky-400' : 'bg-amber-400'
              }`}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-xs font-bold text-white font-sans truncate">
                {activeCall.title || (isBill ? 'Bill Requested' : 'Waiter Called')}
              </span>
              <span className="text-[10px] font-mono text-gray-300 shrink-0">
                ({activeCall.table})
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-medium font-sans">
              {isAttending ? (
                <span className="text-sky-300 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-sky-300" />
                  Staff is on the way!
                </span>
              ) : (
                <span className="text-amber-300/90 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-300" />
                  Staff alerted · Standing by
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Cancel Button */}
        <button
          type="button"
          onClick={handleCancel}
          disabled={cancelling}
          className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-[11px] font-bold text-gray-200 transition shrink-0 cursor-pointer border border-white/10 flex items-center gap-1"
          title="Cancel this request"
        >
          {cancelling ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <>
              <X className="w-3 h-3" />
              <span>Cancel</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
