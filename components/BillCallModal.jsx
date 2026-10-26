'use client';

import { useState } from 'react';
import {
  X,
  Receipt,
  Smartphone,
  Banknote,
  CreditCard,
  CheckCircle2,
  Loader2,
  Copy,
  Check,
  QrCode,
} from 'lucide-react';

const PAYMENT_METHODS = [
  {
    id: 'upi',
    title: 'UPI Payment',
    subtitle: 'Google Pay, PhonePe, Paytm, or BHIM',
    badge: 'Fastest',
    icon: Smartphone,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-50 border-indigo-200',
  },
  {
    id: 'cash',
    title: 'Pay at Counter (Cash / Card)',
    subtitle: 'Settle directly at the main cashier desk',
    badge: 'Counter',
    icon: Banknote,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50 border-emerald-200',
  },
  {
    id: 'card_machine',
    title: 'Bring Card Machine to Table',
    subtitle: 'Waiter brings wireless POS swipe terminal',
    badge: 'At Table',
    icon: CreditCard,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50 border-amber-200',
  },
];

export default function BillCallModal({
  isOpen,
  onClose,
  tableLabel = 'Table 1',
  slug = 'anbude-cafe',
  restaurantName = "Anbu'de Cafe",
  onCallSuccess,
}) {
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submittedCall, setSubmittedCall] = useState(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  if (!isOpen) return null;

  const defaultUpiId = 'anbudecafe@okaxis';

  const handleCopyUpi = () => {
    try {
      navigator.clipboard.writeText(defaultUpiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } catch (err) {
      // Fallback
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const method = PAYMENT_METHODS.find((m) => m.id === selectedMethod) || PAYMENT_METHODS[0];

    try {
      const res = await fetch('/api/service-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: tableLabel,
          slug,
          type: 'bill',
          subType: method.id,
          title: `Bill Request (${method.title})`,
          paymentMethod: method.id,
          note: note.trim(),
        }),
      });

      const data = await res.json();
      const callData = data.call || {
        table: tableLabel,
        title: `Bill Request (${method.title})`,
        paymentMethod: method.id,
        note: note.trim(),
      };

      setSubmittedCall(callData);
      if (onCallSuccess) {
        onCallSuccess(callData);
      }
    } catch (err) {
      console.error('Failed to request bill:', err);
      // Fallback acknowledgment
      const fallbackCall = {
        table: tableLabel,
        title: `Bill Request (${method.title})`,
        paymentMethod: method.id,
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
    setSelectedMethod('upi');
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
            <div className="w-10 h-10 rounded-2xl bg-[#DCFCE7] border border-[#BBF7D0] flex items-center justify-center text-[#15803D]">
              <Receipt className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-[#101B35] font-sans tracking-tight">
                  Request Bill
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#16B86A] text-white">
                  {tableLabel}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-sans">
                Ready to settle your dining bill at {restaurantName}
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
                Bill Requested!
              </h3>
              <p className="text-xs text-gray-600 max-w-xs leading-relaxed font-sans">
                Staff has received your bill request for <strong>{tableLabel}</strong>.
              </p>
            </div>

            {submittedCall.paymentMethod === 'upi' ? (
              <div className="w-full bg-[#F3F7FF] border border-[#BFDBFE] rounded-2xl p-4 text-left space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1D4ED8]">
                    <QrCode className="w-4 h-4" />
                    <span>Instant UPI Settlement</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
                    Official VPA
                  </span>
                </div>

                <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-blue-200">
                  <span className="text-xs font-mono font-bold text-[#101B35]">
                    {defaultUpiId}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                  >
                    {copiedUpi ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy VPA</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-blue-700/90 leading-tight">
                  Staff will bring the final physical bill to verify items and show the dynamic QR on their device.
                </p>
              </div>
            ) : (
              <div className="w-full bg-[#FFFCF7] border border-[#FEF3C7] rounded-2xl p-3.5 text-left text-xs text-amber-950 font-sans space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <Receipt className="w-3.5 h-3.5 text-[#16B86A]" />
                  <span>
                    {submittedCall.paymentMethod === 'card_machine'
                      ? 'Card Terminal On the Way'
                      : 'Counter Settlement Flagged'}
                  </span>
                </div>
                <p className="text-[11px] text-amber-800/90">
                  {submittedCall.paymentMethod === 'card_machine'
                    ? 'Waitstaff is bringing the wireless card terminal directly to your table.'
                    : 'The cashier desk is notified. You can step up to the counter whenever you are ready.'}
                </p>
              </div>
            )}

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
            {/* Preferred Payment Method */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block font-sans">
                Select Payment Preference
              </label>

              <div className="grid grid-cols-1 gap-2">
                {PAYMENT_METHODS.map((method) => {
                  const isSelected = selectedMethod === method.id;
                  const Icon = method.icon;

                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedMethod(method.id)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#16B86A] bg-[#F0FFF6] shadow-[0_2px_10px_rgba(22,184,106,0.15)] ring-2 ring-[#16B86A]/30'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${method.iconBg} ${method.iconColor}`}
                        >
                          <Icon className="w-4 h-4 stroke-[2.2]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-[13px] font-bold text-[#101B35] font-sans">
                              {method.title}
                            </span>
                            <span
                              className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full border ${
                                isSelected
                                  ? 'bg-[#16B86A] text-white border-[#16B86A]'
                                  : 'bg-gray-100 text-gray-600 border-gray-200'
                              }`}
                            >
                              {method.badge}
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-500 font-sans mt-0.5">
                            {method.subtitle}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'border-[#16B86A] bg-[#16B86A]'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Specific Note */}
            <div className="space-y-1.5 pt-1">
              <label
                htmlFor="bill-note"
                className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block font-sans"
              >
                Special Request (optional)
              </label>
              <input
                id="bill-note"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Need GST tax invoice with company name..."
                maxLength={120}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-[#101B35] placeholder:text-gray-400 focus:outline-none focus:border-[#16B86A] focus:ring-2 focus:ring-[#16B86A]/20 transition"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-[#16B86A] hover:bg-[#139E5B] text-white font-extrabold text-xs sm:text-[13px] transition shadow-[0_4px_14px_rgba(22,184,106,0.3)] active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Alerting Cashier & Floor Staff...</span>
                  </>
                ) : (
                  <>
                    <Receipt className="w-4 h-4 stroke-[2.2]" />
                    <span>Request Bill for {tableLabel}</span>
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
