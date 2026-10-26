'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Star } from 'lucide-react';

/**
 * Official Google 'G' Logo SVG
 */
export function GoogleIcon({ className = 'w-5 h-5 shrink-0' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export default function GoogleReviewButton({
  hotelId = 'anbude-cafe',
  branchId = null,
  placement = 'qr_menu',
  variant = 'default', // 'default' | 'card' | 'compact' | 'badge'
  initialConfig = null,
  fallbackUrl = null,
  className = '',
  onClick = null,
  showSubtitle = true,
}) {
  const [config, setConfig] = useState(initialConfig);
  const [loading, setLoading] = useState(!initialConfig);
  const [active, setActive] = useState(initialConfig ? initialConfig.status === 'active' : true);

  // Normalize hotelId (strip table slug like anbude-cafe-t1 -> anbude-cafe)
  const normalizedHotelId = (hotelId || '')
    .trim()
    .toLowerCase()
    .replace(/-t\d+$/i, '');

  useEffect(() => {
    let isMounted = true;

    async function loadReviewConfig() {
      if (!normalizedHotelId) return;
      try {
        const query = new URLSearchParams({
          placement: placement || 'button',
        });
        if (branchId) query.set('branchId', branchId);

        const res = await fetch(
          `/api/hotels/${encodeURIComponent(normalizedHotelId)}/google-review?${query.toString()}`
        );

        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (data.active && data.config) {
              setConfig(data.config);
              setActive(true);
            } else {
              setActive(false);
              setConfig(null);
            }
          }
        }
      } catch (err) {
        // Fallback safely
        if (isMounted && fallbackUrl) {
          setConfig({
            hotelId: normalizedHotelId,
            reviewUrl: fallbackUrl,
            buttonLabel: 'Review us on Google',
            theme: 'light',
            status: 'active',
          });
          setActive(true);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadReviewConfig();

    return () => {
      isMounted = false;
    };
  }, [normalizedHotelId, branchId, placement, fallbackUrl]);

  // If button is inactive or config missing and no fallback, hide cleanly
  if (!active || (!config && !fallbackUrl)) {
    return null;
  }

  // Safe URL calculation: protects against broken dummy place IDs causing Google 404
  const rawUrl = (config?.reviewUrl || fallbackUrl || '').trim();
  const rawPlaceId = (config?.placeId || '').trim();

  let reviewUrl = rawUrl;

  // If placeId contains a valid Google Maps URL, use it:
  if (rawPlaceId && rawPlaceId.includes('google.com/maps')) {
    reviewUrl = rawPlaceId;
  } else if (
    !rawUrl ||
    rawUrl.includes('placeid=ChIJ2Ww-U5p_UjoRgkUeQ8b4B_w') ||
    rawUrl.includes('placeid=ChIJ91P9E1VUTsR00pA08wW7XU') ||
    rawUrl.includes('placeid=ChIJyWw-AirportUjoR012A') ||
    rawUrl.includes('placeid=alpha') ||
    rawUrl.includes('placeid=beta')
  ) {
    // Guaranteed non-404 Google Maps Search URL
    const query = `${config?.hotelName || "Anbu'de Cafe"} ${config?.address || config?.location || 'Maraimalai Nagar'}`.trim();
    reviewUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  const label = config?.buttonLabel || 'Review us on Google';
  const theme = config?.theme || 'light';
  const customColors = config?.customColors || null;

  // Track click for analytics and ensure reliable navigation on every click (1st, 2nd, nth time)
  const handleReviewClick = (e) => {
    // 1. Outbound click tracking beacon
    try {
      fetch(`/api/hotels/${encodeURIComponent(normalizedHotelId)}/google-review/click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId: config?.branchId || branchId || 'main',
          placement: placement || 'button',
        }),
        keepalive: true,
      }).catch(() => {});
    } catch (_) {}

    if (onClick) {
      onClick(e);
    }
  };

  // Determine styling based on theme
  let themeStyles = {
    card: 'bg-white hover:bg-gray-50 text-[#101B35] border-gray-200 shadow-sm hover:border-gray-300',
    iconBox: 'bg-white border-gray-200 shadow-2xs',
    text: 'text-[#101B35]',
    subtext: 'text-gray-500',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  if (theme === 'dark') {
    themeStyles = {
      card: 'bg-[#101B35] hover:bg-[#1A294A] text-white border-slate-700/80 shadow-md hover:border-amber-400/50',
      iconBox: 'bg-white/10 border-white/20',
      text: 'text-white',
      subtext: 'text-gray-300',
      badge: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
    };
  } else if (theme === 'custom' && customColors) {
    themeStyles = {
      card: 'shadow-sm',
      iconBox: 'bg-white/90 border-black/10',
      text: '',
      subtext: 'opacity-80',
      badge: 'bg-black/10 border-black/10',
    };
  }

  const customStyleObj =
    theme === 'custom' && customColors
      ? {
          backgroundColor: customColors.bg || '#FFFFFF',
          color: customColors.text || '#101B35',
          borderColor: customColors.border || '#E8EAF0',
        }
      : {};

  // Variant 1: Large Dining Hub Action Card
  if (variant === 'card') {
    return (
      <a
        href={reviewUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleReviewClick}
        style={customStyleObj}
        className={`group relative flex items-center justify-between p-3 min-[360px]:p-3.5 rounded-[22px] border-[1.8px] transition-all duration-200 active:scale-[0.98] cursor-pointer overflow-hidden ${themeStyles.card} ${className}`}
        aria-label={`${label} - Opens in a new tab`}
      >
        <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0 pr-1 z-10">
          <div
            className={`w-11 h-11 min-[360px]:w-12 min-[360px]:h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-105 ${themeStyles.iconBox}`}
          >
            <GoogleIcon className="w-5 h-5 min-[360px]:w-6 min-[360px]:h-6" />
          </div>

          <div className="flex flex-col text-left min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`text-[13.5px] min-[360px]:text-[14.5px] sm:text-[15.5px] font-extrabold tracking-tight leading-tight ${themeStyles.text}`}
              >
                {label}
              </span>
              <span
                className={`px-1.5 py-0.2 text-[8px] min-[360px]:text-[8.5px] font-black rounded-full border uppercase tracking-wider shrink-0 ${themeStyles.badge}`}
              >
                5.0 ★ Google
              </span>
            </div>

            {showSubtitle && (
              <span
                className={`text-[10px] min-[360px]:text-[10.5px] sm:text-[11px] font-medium mt-0.5 line-clamp-1 leading-normal ${themeStyles.subtext}`}
              >
                Rate us 5 stars on Google Maps
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 w-8 h-8 rounded-full bg-white/20 border border-current/10 flex items-center justify-center text-current opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </a>
    );
  }

  // Variant 2: Compact / Inline Button (for header, footer, or feedback page)
  if (variant === 'compact') {
    return (
      <a
        href={reviewUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleReviewClick}
        style={customStyleObj}
        className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs ${themeStyles.card} ${className}`}
        aria-label={`${label} - Opens in a new tab`}
      >
        <GoogleIcon className="w-4 h-4 shrink-0" />
        <span className={`truncate ${themeStyles.text}`}>{label}</span>
        <ExternalLink className="w-3 h-3 opacity-60" />
      </a>
    );
  }

  // Variant 3: Header Badge Link (for ratings card in header)
  if (variant === 'badge') {
    return (
      <a
        href={reviewUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleReviewClick}
        className={`bg-[#FEFCE8] border border-[#FDE68A] hover:border-[#FFB800] rounded-2xl py-2 px-2.5 text-center shadow-2xs transition-all active:scale-95 group cursor-pointer ${className}`}
        title={`${label} on Google`}
        aria-label={`${label} - Opens in a new tab`}
      >
        <div className="flex items-center justify-center gap-1.5">
          <GoogleIcon className="w-3.5 h-3.5" />
          <span className="text-[12.5px] min-[360px]:text-[13.5px] font-extrabold text-[#8B4513] font-sans group-hover:text-amber-950">
            5.0 ★ Google
          </span>
        </div>
        <p className="text-[10px] font-medium text-[#718096] mt-0.5 font-sans truncate">
          {label}
        </p>
      </a>
    );
  }

  // Default Variant: Standard Standalone Button
  return (
    <a
      href={reviewUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleReviewClick}
      style={customStyleObj}
      className={`w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl border font-bold text-xs sm:text-sm transition-all shadow-sm hover:shadow active:scale-[0.98] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${themeStyles.card} ${className}`}
      aria-label={`${label} - Opens in a new tab`}
    >
      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0 shadow-2xs">
        <GoogleIcon className="w-4 h-4" />
      </div>
      <span className={`truncate font-extrabold ${themeStyles.text}`}>{label}</span>
      <ExternalLink className="w-3.5 h-3.5 opacity-70 shrink-0 ml-auto" />
    </a>
  );
}
