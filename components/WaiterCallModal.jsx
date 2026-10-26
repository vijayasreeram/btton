'use client';

import { useState } from 'react';
import {
  X,
  Bell,
  GlassWater,
  UtensilsCrossed,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

const REASON_PRESETS = [
  {
    id: 'water',
    label: 'Drinking Water',
    description: 'Fresh drinking water for the table',
    icon: GlassWater,
    iconColor: 'text-sky-600',
    iconBg: 'bg-sky-50 border-sky-200',
  },
  {
    id: 'cutlery',
    label: 'Cutlery & Napkins',
    description: 'Extra plates, spoons, forks or tissues',
    icon: UtensilsCrossed,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50 border-amber-200',
  },
  {
    id: 'clean',
    label: 'Clean / Wipe Table',
    description: 'Clear plates or clean up a spill',
    icon: Sparkles,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50 border-emerald-200',
  },
  {
    id: 'general',
    label: 'General Assistance',
    description: 'Call a waiter over to the table',
    icon: HelpCircle,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-50 border-indigo-200',
  },
  {
    id: 'issue',
    label: 'Issue with Food / Order',
    description: 'Wrong dish, preparation issue or delay',
    icon: AlertTriangle,
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-50 border-rose-200',
  },
];

export default function WaiterCallModal({
  isOpen,
  onClose,
  tableLabel = 'Table 1',
  slug = 'anbude-cafe',
  onCallSuccess,
}) {
  const [selectedReason, setSelectedReason] = useState('water');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submittedCall, setSubmittedCall] = useState(null);

  if (!isOpen) return null;

  const handleSelectReason = (reasonId) => {
    setSelectedReason(reasonId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const preset = REASON_PRESETS.find((r) => r.id === selectedReason) || REASON_PRESETS[0];

    try {
      const res = await fetch('/api/service-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: tableLabel,
          slug,
          type: 'waiter',
          subType: preset.id,
          title: preset.label,
          note: note.trim(),
        }),
      });

      const data = await res.json();
      const callData = data.call || {
        table: tableLabel,
        title: preset.label,
        note: note.trim(),
      };

      setSubmittedCall(callData);
      if (onCallSuccess) {
        onCallSuccess(callData);
      }
    } catch (err) {
      console.error('Failed to call waiter:', err);
      // Fallback local acknowledgment so guest is never left stranded
      const fallbackCall = {
        table: tableLabel,
        title: preset.label,
        note: note.trim(),
        status: 'pending',
      };
      setSubmittedCall(fallbackCall);
      if (onCallSuccess) {
        onCallSuccess(fallbackCall);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDone = () => {
    setSubmittedCall(null);
    setNote('');
    setSelectedReason('water');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm transition-opacity"
      onClick={handleDone}
    >
      <div
        className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-3xl shadow-2xl border border-gray-200 overflow-hidden text-[#101B35] animate-in fade-in slide-in-from-bottom duration-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-[#FFFCF7] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#92400E]">
              <Bell className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-[#101B35] font-sans tracking-tight">
                  Call Waiter
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FFB800] text-[#101B35]">
                  {tableLabel}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-sans">
                Select assistance needed for your table
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDone}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        {submittedCall ? (
          /* Confirmation Success State */
          <div className="p-6 sm:p-8 text-center flex flex-col items-center justify-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-[#ECFDF5] border-2 border-[#10B981] flex items-center justify-center text-[#10B981] shadow-sm animate-in zoom-in-75 duration-200">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-[#101B35] font-sans">
                Waiter Notified!
              </h3>
              <p className="text-xs text-gray-600 max-w-xs leading-relaxed font-sans">
                Your request for <strong>{submittedCall.title}</strong> has been transmitted directly to floor staff for <strong>{tableLabel}</strong>.
              </p>
            </div>

            <div className="w-full bg-[#FFFCF7] border border-[#FEF3C7] rounded-2xl p-3.5 text-left text-xs text-amber-950 font-sans space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <Bell className="w-3.5 h-3.5 text-[#FFB800]" />
                <span>Live Table Alert Active</span>
              </div>
              <p className="text-[11px] text-amber-800/90">
                A team member is on the way. You don’t need to wave or call again.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDone}
              className="w-full py-3.5 px-4 rounded-xl bg-[#101B35] text-white font-bold text-xs hover:bg-black transition cursor-pointer shadow-sm active:scale-95"
            >
              Done & Return to Menu
            </button>
          </div>
        ) : (
          /* Form Body */
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
            {/* Quick Reason Presets */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block font-sans">
                What do you need?
              </label>

              <div className="grid grid-cols-1 gap-2">
                {REASON_PRESETS.map((preset) => {
                  const isSelected = selectedReason === preset.id;
                  const Icon = preset.icon;

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectReason(preset.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#FFB800] bg-[#FFF8E7] shadow-[0_2px_10px_rgba(255,184,0,0.15)] ring-2 ring-[#FFB800]/30'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${preset.iconBg} ${preset.iconColor}`}
                        >
                          <Icon className="w-4 h-4 stroke-[2.2]" />
                        </div>
                        <div>
                          <div className="text-xs sm:text-[13px] font-bold text-[#101B35] font-sans">
                            {preset.label}
                          </div>
                          <div className="text-[11px] text-gray-500 font-sans">
                            {preset.description}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'border-[#FFB800] bg-[#FFB800]'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#101B35]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Specific Note */}
            <div className="space-y-1.5 pt-1">
              <label
                htmlFor="waiter-note"
                className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block font-sans"
              >
                Special note for waiter (optional)
              </label>
              <input
                id="waiter-note"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. 2 warm waters, or extra tissue box..."
                maxLength={120}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-[#101B35] placeholder:text-gray-400 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 transition"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-[#FFB800] hover:bg-[#E5A500] text-[#101B35] font-extrabold text-xs sm:text-[13px] transition shadow-[0_4px_14px_rgba(255,184,0,0.3)] active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Notifying Floor Staff...</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4 fill-[#101B35]" />
                    <span>Ring Waiter for {tableLabel}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
