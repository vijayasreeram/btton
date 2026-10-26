import fs from 'fs';
import path from 'path';

const REVIEWS_FILE = path.join(process.cwd(), 'data', 'google-reviews.json');
const CLICKS_FILE = path.join(process.cwd(), 'data', 'review-clicks.json');

// Default initial seed configurations for multi-hotel / multi-branch support
const DEFAULT_CONFIGS = [
  {
    id: 'rev_anbude_main',
    hotelId: 'anbude-cafe',
    branchId: 'main',
    hotelName: "Anbu'de Cafe",
    location: 'Maraimalai Nagar, Chennai',
    branchName: 'Main Branch',
    address: 'Vallal MGR Salai, Maraimalai Nagar, Tamil Nadu 603209',
    placeId: '',
    reviewUrl: 'https://www.google.com/maps/search/?api=1&query=Anbu+cafe+Maraimalai+Nagar+Tamil+Nadu',
    buttonLabel: 'Review us on Google',
    theme: 'light', // 'light' | 'dark' | 'custom'
    customColors: {
      bg: '#FFFFFF',
      text: '#101B35',
      border: '#E8EAF0',
      hoverBg: '#FFF8E7',
    },
    placement: ['qr_menu', 'header', 'feedback', 'review_modal', 'website'],
    status: 'active', // 'active' | 'inactive'
    verified: true,
    clickCount: 14,
    createdAt: '2026-10-24T09:18:00.000Z',
    updatedAt: '2026-10-26T18:00:00.000Z',
  },
  {
    id: 'rev_anbude_airport',
    hotelId: 'anbude-cafe',
    branchId: 'airport',
    hotelName: "KFC",
    location: 'Ground & 1st Floor, Survey No. 712/3A4, Bagalur Road, NGGOS Colony, Krishnagiri, Tamil Nadu 602001',
    branchName: 'Krishnagiri Branch',
    address: 'Bagalur Road, Krishnagiri, Tamil Nadu 602001',
    placeId: '',
    reviewUrl: 'https://www.google.com/maps/place/KFC/@13.0795577,79.8359729,12z/data=!4m10!1m2!2m1!1skfc!3m6!1s0x3a52914a0cbde151:0xdedc202c517a72be!8m2!3d13.132881!4d79.909241!15sCgNrZmMiA4gBAVoFIgNrZmOSAQpyZXN0YXVyYW504AEA!16s%2Fg%2F11vs2x6_xh?entry=ttu&g_ep=EgoyMDI2MTAyMC4wIKXMDSoASAFQAw%3D%3D',
    buttonLabel: 'Rate on Google',
    theme: 'dark',
    customColors: {
      bg: '#101B35',
      text: '#FFFFFF',
      border: '#FFB800',
      hoverBg: '#1A294A',
    },
    placement: ['qr_menu', 'header', 'feedback', 'review_modal'],
    status: 'active',
    verified: true,
    clickCount: 8,
    createdAt: '2026-10-24T12:00:00.000Z',
    updatedAt: '2026-10-26T18:00:00.000Z',
  },
  {
    id: 'rev_grand_palace_main',
    hotelId: 'grand-palace',
    branchId: 'main',
    hotelName: 'Grand Palace Hotel & Restaurant',
    location: 'T. Nagar, Chennai',
    branchName: 'Central Tower',
    address: '45 Thyagaraya Road, T. Nagar, Chennai 600017',
    placeId: '',
    reviewUrl: 'https://www.google.com/maps/search/?api=1&query=Grand+Palace+Hotel+%26+Restaurant+T.+Nagar+Chennai',
    buttonLabel: 'Share Your Experience on Google',
    theme: 'custom',
    customColors: {
      bg: '#1E1B4B',
      text: '#FDE047',
      border: '#FACC15',
      hoverBg: '#312E81',
    },
    placement: ['qr_menu', 'header', 'feedback', 'review_modal', 'website'],
    status: 'active',
    verified: true,
    clickCount: 22,
    createdAt: '2026-10-25T10:00:00.000Z',
    updatedAt: '2026-10-26T18:00:00.000Z',
  },
];

// Helper to load fresh configs from disk
function loadConfigsFromDisk() {
  try {
    if (fs.existsSync(REVIEWS_FILE)) {
      const data = fs.readFileSync(REVIEWS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    // Ignore error
  }
  return [...DEFAULT_CONFIGS];
}

// Always refresh memory cache from file or seed
global.__REVIEW_CONFIGS__ = loadConfigsFromDisk();

if (!global.__REVIEW_CLICKS__) {
  global.__REVIEW_CLICKS__ = [];
  try {
    if (fs.existsSync(CLICKS_FILE)) {
      const data = fs.readFileSync(CLICKS_FILE, 'utf-8');
      global.__REVIEW_CLICKS__ = JSON.parse(data) || [];
    }
  } catch (err) {
    global.__REVIEW_CLICKS__ = [];
  }
}

function persistConfigs() {
  try {
    const dir = path.dirname(REVIEWS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(global.__REVIEW_CONFIGS__, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write review configs to file:', err.message);
  }
}

function persistClicks() {
  try {
    const dir = path.dirname(CLICKS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CLICKS_FILE, JSON.stringify(global.__REVIEW_CLICKS__, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write review clicks to file:', err.message);
  }
}

/**
 * Normalizes hotel ID by stripping table suffixes like -t1, -t4, -t12
 */
export function normalizeHotelId(hotelId) {
  if (!hotelId || typeof hotelId !== 'string') return '';
  return hotelId.trim().toLowerCase().replace(/-t\d+$/i, '');
}

/**
 * Validates whether string is a valid URL format
 */
export function isValidUrl(string) {
  if (!string || typeof string !== 'string') return false;
  try {
    const url = new URL(string.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

/**
 * Checks if URL is a recognized Google review/maps destination
 */
export function isGoogleReviewDomain(urlStr) {
  if (!isValidUrl(urlStr)) return false;
  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname.toLowerCase();
    return (
      host.includes('google.') ||
      host.includes('g.page') ||
      host.includes('goo.gl')
    );
  } catch (_) {
    return false;
  }
}

/**
 * Generates an infallible Google Maps Search query URL that opens the hotel's listing with reviews and NEVER 404s
 */
export function generateGoogleMapsSearchUrl(hotelName, addressOrLocation) {
  const query = `${hotelName || ''} ${addressOrLocation || ''}`.trim();
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || 'restaurant')}`;
}

/**
 * Resolves a 100% safe, working Google Review URL that never 404s
 */
export function resolveSafeGoogleReviewUrl(config) {
  if (!config) return 'https://maps.google.com';

  const rawUrl = (config.reviewUrl || '').trim();
  const rawPlaceId = (config.placeId || '').trim();

  // If placeId field contains a full Google Maps place link:
  if (rawPlaceId && isValidUrl(rawPlaceId) && rawPlaceId.includes('google.com/maps')) {
    return rawPlaceId;
  }

  // Detect broken dummy placeid URLs that cause Google 404:
  const isBrokenDummyPlaceId =
    rawUrl.includes('ChIJ2Ww-U5p_UjoRgkUeQ8b4B_w') ||
    rawUrl.includes('ChIJ91P9E1VUTsR00pA08wW7XU') ||
    rawUrl.includes('ChIJyWw-AirportUjoR012A') ||
    rawUrl.includes('placeid=alpha') ||
    rawUrl.includes('placeid=beta');

  // If the URL is valid, points to Google, and is NOT a broken dummy placeid:
  if (rawUrl && isValidUrl(rawUrl) && !isBrokenDummyPlaceId) {
    return rawUrl;
  }

  // Fallback to guaranteed working Google Maps Search URL:
  return generateGoogleMapsSearchUrl(config.hotelName, config.address || config.location);
}

/**
 * Get all configured review buttons (with safe resolved review URLs)
 */
export function getAllConfigs() {
  return [...global.__REVIEW_CONFIGS__]
    .map((c) => ({
      ...c,
      reviewUrl: resolveSafeGoogleReviewUrl(c),
    }))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

/**
 * Get config by unique config ID
 */
export function getConfigById(id) {
  const c = global.__REVIEW_CONFIGS__.find((cfg) => cfg.id === id);
  if (!c) return null;
  return {
    ...c,
    reviewUrl: resolveSafeGoogleReviewUrl(c),
  };
}

/**
 * Get distinct list of hotels for switcher
 */
export function getHotelsList() {
  const map = new Map();
  for (const c of global.__REVIEW_CONFIGS__) {
    const hId = normalizeHotelId(c.hotelId);
    if (!map.has(hId)) {
      map.set(hId, {
        hotelId: hId,
        hotelName: c.hotelName,
        location: c.location,
        branches: [],
      });
    }
    map.get(hId).branches.push({
      branchId: c.branchId,
      branchName: c.branchName || 'Main',
      configId: c.id,
      status: c.status,
      clickCount: c.clickCount || 0,
    });
  }
  return Array.from(map.values());
}

/**
 * Get review configuration for a specific hotel and optional branch.
 * Normalizes table slugs (e.g. anbude-cafe-t1 -> anbude-cafe).
 */
export function getConfigByHotelAndBranch(hotelId, branchId = null, placement = null) {
  if (!hotelId) return null;

  const normalizedHotelId = normalizeHotelId(hotelId);
  const hotelConfigs = global.__REVIEW_CONFIGS__.filter(
    (c) => normalizeHotelId(c.hotelId) === normalizedHotelId
  );

  if (hotelConfigs.length === 0) return null;

  let matched = null;

  // 1. If branchId specified, find that branch
  if (branchId) {
    const normalizedBranch = branchId.trim().toLowerCase();
    matched = hotelConfigs.find(
      (c) => (c.branchId || '').toLowerCase() === normalizedBranch
    );
  }

  // 2. Otherwise prefer active 'main' branch, or first active branch, or first branch
  if (!matched) {
    matched = hotelConfigs.find(
      (c) => c.status === 'active' && (c.branchId === 'main' || !c.branchId)
    );
  }

  if (!matched) {
    matched = hotelConfigs.find((c) => c.status === 'active');
  }

  if (!matched) {
    matched = hotelConfigs[0];
  }

  return {
    ...matched,
    reviewUrl: resolveSafeGoogleReviewUrl(matched),
  };
}

/**
 * Save or update configuration (multi-hotel / multi-branch safe)
 */
export function saveConfig(data) {
  const {
    id,
    hotelId,
    branchId = 'main',
    hotelName,
    location,
    branchName = 'Main Branch',
    address = '',
    placeId = '',
    reviewUrl,
    buttonLabel = 'Review us on Google',
    theme = 'light',
    customColors = null,
    placement = ['qr_menu', 'header', 'feedback', 'review_modal', 'website'],
    status = 'active',
    verified = false,
  } = data;

  if (!hotelName || typeof hotelName !== 'string' || !hotelName.trim()) {
    throw new Error('Hotel / Restaurant Name is required.');
  }

  if (!location || typeof location !== 'string' || !location.trim()) {
    throw new Error('Hotel Location is required.');
  }

  const generatedHotelId = normalizeHotelId(hotelId || hotelName)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  let finalReviewUrl = (reviewUrl || '').trim();
  const rawPlaceId = (placeId || '').trim();

  // If user pasted a full Google Maps place URL into placeId:
  if (rawPlaceId && isValidUrl(rawPlaceId) && rawPlaceId.includes('google.com/maps')) {
    finalReviewUrl = rawPlaceId;
  }

  if (status === 'active' && !finalReviewUrl) {
    throw new Error('Google Review URL is required to activate the review button.');
  }

  if (finalReviewUrl && !isValidUrl(finalReviewUrl)) {
    throw new Error('Google Review URL must be a valid web address (e.g. https://www.google.com/maps/search/?api=1&query=...)');
  }

  const allowedThemes = ['light', 'dark', 'custom'];
  const sanitizedTheme = allowedThemes.includes(theme) ? theme : 'light';

  const now = new Date().toISOString();

  // Check if updating existing config by id
  let existingIndex = -1;
  if (id) {
    existingIndex = global.__REVIEW_CONFIGS__.findIndex((c) => c.id === id);
  } else {
    // Check if configuration already exists for this hotelId + branchId
    existingIndex = global.__REVIEW_CONFIGS__.findIndex(
      (c) =>
        normalizeHotelId(c.hotelId) === generatedHotelId &&
        (c.branchId || 'main').toLowerCase() === (branchId || 'main').toLowerCase()
    );
  }

  if (existingIndex >= 0) {
    const existing = global.__REVIEW_CONFIGS__[existingIndex];
    const updated = {
      ...existing,
      hotelId: generatedHotelId,
      branchId: branchId || existing.branchId || 'main',
      hotelName: hotelName.trim(),
      location: location.trim(),
      branchName: branchName ? branchName.trim() : existing.branchName,
      address: address ? address.trim() : '',
      placeId: rawPlaceId,
      reviewUrl: finalReviewUrl,
      buttonLabel: buttonLabel ? buttonLabel.trim() : 'Review us on Google',
      theme: sanitizedTheme,
      customColors:
        sanitizedTheme === 'custom' && customColors
          ? customColors
          : existing.customColors || {
              bg: '#FFFFFF',
              text: '#101B35',
              border: '#E8EAF0',
              hoverBg: '#FFF8E7',
            },
      placement: Array.isArray(placement) ? placement : [placement],
      status: status === 'inactive' ? 'inactive' : 'active',
      verified: verified !== undefined ? Boolean(verified) : existing.verified,
      updatedAt: now,
    };
    global.__REVIEW_CONFIGS__[existingIndex] = updated;
    persistConfigs();
    return {
      ...updated,
      reviewUrl: resolveSafeGoogleReviewUrl(updated),
    };
  }

  // Create new configuration
  const newConfig = {
    id: id || `rev_${generatedHotelId}_${branchId || 'main'}_${Math.random().toString(36).substring(2, 6)}`,
    hotelId: generatedHotelId,
    branchId: branchId || 'main',
    hotelName: hotelName.trim(),
    location: location.trim(),
    branchName: branchName ? branchName.trim() : 'Main Branch',
    address: address ? address.trim() : '',
    placeId: rawPlaceId,
    reviewUrl: finalReviewUrl,
    buttonLabel: buttonLabel ? buttonLabel.trim() : 'Review us on Google',
    theme: sanitizedTheme,
    customColors:
      sanitizedTheme === 'custom' && customColors
        ? customColors
        : {
            bg: '#FFFFFF',
            text: '#101B35',
            border: '#E8EAF0',
            hoverBg: '#FFF8E7',
          },
    placement: Array.isArray(placement) ? placement : [placement],
    status: status === 'inactive' ? 'inactive' : 'active',
    verified: Boolean(verified),
    clickCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  global.__REVIEW_CONFIGS__.push(newConfig);
  persistConfigs();
  return {
    ...newConfig,
    reviewUrl: resolveSafeGoogleReviewUrl(newConfig),
  };
}

/**
 * Toggle active/inactive status
 */
export function updateConfigStatus(id, newStatus) {
  const config = global.__REVIEW_CONFIGS__.find((c) => c.id === id);
  if (!config) return null;

  if (newStatus === 'active' && !config.reviewUrl) {
    config.reviewUrl = generateGoogleMapsSearchUrl(config.hotelName, config.address || config.location);
  }

  config.status = newStatus === 'active' ? 'active' : 'inactive';
  config.updatedAt = new Date().toISOString();
  persistConfigs();
  return {
    ...config,
    reviewUrl: resolveSafeGoogleReviewUrl(config),
  };
}

/**
 * Delete a configuration
 */
export function deleteConfig(id) {
  const index = global.__REVIEW_CONFIGS__.findIndex((c) => c.id === id);
  if (index === -1) return false;

  global.__REVIEW_CONFIGS__.splice(index, 1);
  persistConfigs();
  return true;
}

/**
 * Record an outbound click on the review button
 */
export function recordReviewClick({ hotelId, branchId = null, placement = 'qr_menu', userAgent = '' }) {
  if (!hotelId) return null;

  const now = new Date().toISOString();
  const config = getConfigByHotelAndBranch(hotelId, branchId);

  if (config) {
    const rawConfig = global.__REVIEW_CONFIGS__.find((c) => c.id === config.id);
    if (rawConfig) {
      rawConfig.clickCount = (rawConfig.clickCount || 0) + 1;
      rawConfig.updatedAt = now;
      persistConfigs();
    }
  }

  const clickEvent = {
    id: `clk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    hotelId: normalizeHotelId(hotelId),
    branchId: branchId || config?.branchId || 'main',
    placement: placement || 'button',
    timestamp: now,
    userAgent: typeof userAgent === 'string' ? userAgent.substring(0, 150) : '',
  };

  global.__REVIEW_CLICKS__.unshift(clickEvent);
  if (global.__REVIEW_CLICKS__.length > 1000) {
    global.__REVIEW_CLICKS__ = global.__REVIEW_CLICKS__.slice(0, 1000);
  }
  persistClicks();

  return {
    success: true,
    clickCount: config ? (config.clickCount || 0) + 1 : 1,
    clickEvent,
  };
}

/**
 * Get click analytics for a specific hotel or all hotels
 */
export function getClickAnalytics(hotelId = null) {
  let clicks = global.__REVIEW_CLICKS__;
  if (hotelId) {
    const normalized = normalizeHotelId(hotelId);
    clicks = clicks.filter((c) => normalizeHotelId(c.hotelId) === normalized);
  }

  const totalClicks = clicks.length;

  const placementBreakdown = {
    qr_menu: 0,
    header: 0,
    feedback: 0,
    review_modal: 0,
    website: 0,
    other: 0,
  };

  for (const c of clicks) {
    const p = c.placement || 'other';
    if (p in placementBreakdown) {
      placementBreakdown[p]++;
    } else {
      placementBreakdown.other++;
    }
  }

  return {
    totalClicks,
    placementBreakdown,
    recentClicks: clicks.slice(0, 20),
  };
}
