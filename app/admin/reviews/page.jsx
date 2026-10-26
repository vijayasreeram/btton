'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Star,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertTriangle,
  Building2,
  MapPin,
  Globe,
  Tag,
  Palette,
  Eye,
  MousePointerClick,
  BarChart3,
  RefreshCw,
  Plus,
  Power,
  Trash2,
  Check,
  ShieldCheck,
  Sliders,
  ChevronRight,
  ArrowUpRight,
  LayoutGrid,
  Bell,
  UtensilsCrossed,
  Sparkles,
} from 'lucide-react';
import GoogleReviewButton, { GoogleIcon } from '@/components/GoogleReviewButton';

const PLACEMENT_OPTIONS = [
  { id: 'qr_menu', label: 'QR Dining Hub (Action Card)' },
  { id: 'header', label: 'Menu Header (Rating Pill)' },
  { id: 'feedback', label: 'Customer Feedback Page' },
  { id: 'review_modal', label: 'Review Modal Popup' },
  { id: 'website', label: 'External Website / Embed' },
];

export default function GoogleReviewManagementPage() {
  const [hotelsList, setHotelsList] = useState([]);
  const [allConfigs, setAllConfigs] = useState([]);
  const [selectedConfigId, setSelectedConfigId] = useState(null);

  // Form State
  const [hotelId, setHotelId] = useState('anbude-cafe');
  const [branchId, setBranchId] = useState('main');
  const [hotelName, setHotelName] = useState("Anbu'de Cafe");
  const [location, setLocation] = useState('Maraimalai Nagar, Chennai');
  const [branchName, setBranchName] = useState('Main Branch');
  const [address, setAddress] = useState('Vallal MGR Salai, Maraimalai Nagar, Tamil Nadu 603209');
  const [placeId, setPlaceId] = useState('');
  const [reviewUrl, setReviewUrl] = useState('https://www.google.com/maps/search/?api=1&query=Anbu+cafe+Maraimalai+Nagar+Tamil+Nadu');
  const [buttonLabel, setButtonLabel] = useState('Review us on Google');
  const [theme, setTheme] = useState('light');
  const [customColors, setCustomColors] = useState({
    bg: '#FFFFFF',
    text: '#101B35',
    border: '#E8EAF0',
    hoverBg: '#FFF8E7',
  });
  const [placements, setPlacements] = useState([
    'qr_menu',
    'header',
    'feedback',
    'review_modal',
    'website',
  ]);
  const [status, setStatus] = useState('active');
  const [verified, setVerified] = useState(true);

  // Analytics State
  const [analytics, setAnalytics] = useState(null);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isTestingUrl, setIsTestingUrl] = useState(false);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);

  // Load all hotels & review configs
  const loadData = async () => {
    try {
      const res = await fetch('/api/hotels');
      if (res.ok) {
        const data = await res.json();
        setHotelsList(data.hotels || []);
        const configs = data.configs || [];
        setAllConfigs(configs);

        // Select the first configuration if none selected
        if (!selectedConfigId && configs.length > 0) {
          selectConfiguration(configs[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load hotels data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Populate form when a config is chosen
  const selectConfiguration = (cfg) => {
    if (!cfg) return;
    setSelectedConfigId(cfg.id);
    setHotelId(cfg.hotelId);
    setBranchId(cfg.branchId || 'main');
    setHotelName(cfg.hotelName);
    setLocation(cfg.location || '');
    setBranchName(cfg.branchName || 'Main Branch');
    setAddress(cfg.address || '');
    setPlaceId(cfg.placeId || '');
    setReviewUrl(cfg.reviewUrl || '');
    setButtonLabel(cfg.buttonLabel || 'Review us on Google');
    setTheme(cfg.theme || 'light');
    setCustomColors(
      cfg.customColors || {
        bg: '#FFFFFF',
        text: '#101B35',
        border: '#E8EAF0',
        hoverBg: '#FFF8E7',
      }
    );
    setPlacements(cfg.placement || ['qr_menu', 'header']);
    setStatus(cfg.status || 'active');
    setVerified(Boolean(cfg.verified));
    setErrorMessage('');
    setSaveSuccess(false);

    // Fetch analytics for this hotel
    fetchAnalytics(cfg.hotelId);
  };

  // Fetch click analytics for selected hotel
  const fetchAnalytics = async (hId) => {
    try {
      const res = await fetch(`/api/hotels/${encodeURIComponent(hId)}/google-review/analytics`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data.analytics || null);
      }
    } catch (e) {
      console.error('Failed to load analytics:', e);
    }
  };

  // Toggle placement checkbox
  const handleTogglePlacement = (id) => {
    setPlacements((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // Create new blank hotel form
  const handleAddNewHotel = () => {
    setSelectedConfigId(null);
    setHotelId('');
    setBranchId('main');
    setHotelName('');
    setLocation('');
    setBranchName('Main Branch');
    setAddress('');
    setPlaceId('');
    setReviewUrl('');
    setButtonLabel('Review us on Google');
    setTheme('light');
    setCustomColors({
      bg: '#FFFFFF',
      text: '#101B35',
      border: '#E8EAF0',
      hoverBg: '#FFF8E7',
    });
    setPlacements(['qr_menu', 'header', 'feedback', 'review_modal']);
    setStatus('active');
    setVerified(false);
    setAnalytics(null);
    setErrorMessage('');
  };

  // Infallible Auto-Generate Link (Guaranteed to work on Google Maps without 404)
  const handleAutoGenerateUrl = () => {
    if (!hotelName.trim()) {
      setErrorMessage('Please enter Hotel / Restaurant Name first.');
      return;
    }
    const query = `${hotelName.trim()} ${address.trim() || location.trim()}`.trim();
    const safeUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    setReviewUrl(safeUrl);
    setVerified(true);
    setErrorMessage('');
  };

  // Test Link Action (opens in new tab)
  const handleTestLink = () => {
    setErrorMessage('');
    let target = (reviewUrl || '').trim();

    // Auto-resolve if user pasted Google Maps link in placeId:
    if (placeId && placeId.includes('google.com/maps')) {
      target = placeId.trim();
    }

    if (!target) {
      if (!hotelName.trim()) {
        setErrorMessage('Please enter a Google Review URL or Hotel Name first.');
        return;
      }
      target = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${hotelName.trim()} ${address.trim() || location.trim()}`.trim()
      )}`;
      setReviewUrl(target);
    }

    // Auto-fix broken dummy placeid before testing
    if (
      target.includes('placeid=ChIJ2Ww-U5p_UjoRgkUeQ8b4B_w') ||
      target.includes('placeid=ChIJ91P9E1VUTsR00pA08wW7XU') ||
      target.includes('placeid=ChIJyWw-AirportUjoR012A')
    ) {
      target = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${hotelName.trim()} ${address.trim() || location.trim()}`.trim()
      )}`;
      setReviewUrl(target);
    }

    try {
      const url = new URL(target);
      window.open(url.href, '_blank', 'noopener,noreferrer');
      setVerified(true);
      setIsTestingUrl(true);
      setTimeout(() => setIsTestingUrl(false), 2000);
    } catch (e) {
      setErrorMessage('Invalid URL format. Must start with http:// or https://');
    }
  };

  // Save / Update Configuration
  const handleSaveConfiguration = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setIsSaving(true);

    if (!hotelName.trim()) {
      setErrorMessage('Hotel / Restaurant Name is required.');
      setIsSaving(false);
      return;
    }

    if (!location.trim()) {
      setErrorMessage('Hotel Location is required.');
      setIsSaving(false);
      return;
    }

    let finalReviewUrl = reviewUrl.trim();

    // If user pasted a Google Maps link into placeId:
    if (placeId.trim().includes('google.com/maps')) {
      finalReviewUrl = placeId.trim();
    }

    // Auto-generate if empty or broken dummy placeid
    if (
      status === 'active' &&
      (!finalReviewUrl ||
        finalReviewUrl.includes('placeid=ChIJ2Ww-U5p_UjoRgkUeQ8b4B_w') ||
        finalReviewUrl.includes('placeid=ChIJ91P9E1VUTsR00pA08wW7XU'))
    ) {
      const query = `${hotelName.trim()} ${address.trim() || location.trim()}`.trim();
      finalReviewUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
      setReviewUrl(finalReviewUrl);
    }

    try {
      new URL(finalReviewUrl);
    } catch (_) {
      setErrorMessage('Invalid URL format. Please enter a valid URL or click [⚡ Generate Working Link]');
      setIsSaving(false);
      return;
    }

    try {
      const targetHotelId = (hotelId || hotelName)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const payload = {
        id: selectedConfigId,
        hotelId: targetHotelId,
        branchId: branchId.trim() || 'main',
        hotelName: hotelName.trim(),
        location: location.trim(),
        branchName: branchName.trim() || 'Main Branch',
        address: address.trim(),
        placeId: placeId.trim(),
        reviewUrl: finalReviewUrl,
        buttonLabel: buttonLabel.trim() || 'Review us on Google',
        theme,
        customColors,
        placement: placements,
        status,
        verified: true,
      };

      const res = await fetch(`/api/hotels/${encodeURIComponent(targetHotelId)}/google-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to save configuration');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      // Reload list and set newly saved config
      await loadData();
      if (data.config) {
        setSelectedConfigId(data.config.id);
        setHotelId(data.config.hotelId);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error saving configuration');
    } finally {
      setIsSaving(false);
    }
  };

  // Quick Status Toggle (Active / Inactive)
  const handleToggleStatus = async () => {
    if (!selectedConfigId) return;

    const newStatus = status === 'active' ? 'inactive' : 'active';

    if (newStatus === 'inactive') {
      setDeactivateModalOpen(true);
      return;
    }

    await applyStatusChange('active');
  };

  const applyStatusChange = async (newStatus) => {
    try {
      const res = await fetch(`/api/hotels/${encodeURIComponent(hotelId)}/google-review/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedConfigId,
          status: newStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to update status');
      }

      setStatus(newStatus);
      setDeactivateModalOpen(false);
      loadData();
    } catch (err) {
      setErrorMessage(err.message);
      setDeactivateModalOpen(false);
    }
  };

  // Live Preview Object
  const previewConfig = {
    hotelId,
    branchId,
    reviewUrl: reviewUrl || 'https://maps.google.com',
    buttonLabel: buttonLabel || 'Review us on Google',
    theme,
    customColors,
    status,
  };

  return (
    <div className="min-h-screen bg-[#F6F3EC] text-[#101B35] font-sans selection:bg-[#FFB800]/30 selection:text-amber-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#E8EAF0] shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFB800]/20 border border-[#FFB800]/40 flex items-center justify-center text-[#101B35] shadow-xs">
                <Star className="w-6 h-6 fill-[#FFB800] text-[#B45309]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-[#101B35] tracking-tight">
                    Google Review Management
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#101B35] text-white">
                    Admin
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                  Configure direct Google Review destinations, custom themes, and click analytics across hotels & branches
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/staff"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition cursor-pointer"
            >
              <Bell className="w-4 h-4 text-amber-500" />
              <span>Floor Monitor</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition cursor-pointer"
            >
              <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
              <span>Customer Menu</span>
            </Link>
            <button
              type="button"
              onClick={handleAddNewHotel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FFB800] hover:bg-[#E5A500] text-[#101B35] transition shadow-xs cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Hotel / Branch</span>
            </button>
          </div>
        </header>

        {/* Hotel & Branch Selector Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#E8EAF0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="w-5 h-5 text-gray-400 shrink-0" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0">
              Active Configuration:
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {allConfigs.map((cfg) => {
                const isSelected = cfg.id === selectedConfigId;
                return (
                  <button
                    key={cfg.id}
                    type="button"
                    onClick={() => selectConfiguration(cfg)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? 'bg-[#101B35] text-white border-[#101B35] shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <span>{cfg.hotelName}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                        cfg.status === 'active'
                          ? isSelected
                            ? 'bg-emerald-400 text-gray-950 font-black'
                            : 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {cfg.branchName || 'Main'} · {cfg.status}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={loadData}
            className="self-end md:self-auto p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition cursor-pointer shrink-0"
            title="Refresh configurations"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Alerts / Feedback Message */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Configuration saved successfully. All changes are live on customer menus!</span>
          </div>
        )}

        {/* Main 2-Column Work Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Configuration Form (8 cols on lg) */}
          <div className="lg:col-span-7 space-y-6">
            <form
              onSubmit={handleSaveConfiguration}
              className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8EAF0] shadow-sm space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#B45309]" />
                  <h2 className="text-base font-extrabold text-[#101B35]">
                    {selectedConfigId ? 'Edit Configuration' : 'Create New Hotel / Branch Review Button'}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}
                  >
                    {status === 'active' ? '● Active' : '○ Inactive'}
                  </span>
                </div>
              </div>

              {/* 1. Hotel & Branch Identification */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                      Hotel / Restaurant Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={hotelName}
                      onChange={(e) => setHotelName(e.target.value)}
                      placeholder="e.g. Anbu'de Cafe or KFC"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-[#101B35] font-semibold focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 transition"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                      Hotel Location / Area <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Maraimalai Nagar, Chennai or Krishnagiri"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-[#101B35] font-semibold focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                      Branch Name
                    </label>
                    <input
                      type="text"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      placeholder="e.g. Main Branch, Airport Express, Krishnagiri Branch"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-[#101B35] focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 transition"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                      Hotel ID / URL Slug
                    </label>
                    <input
                      type="text"
                      value={hotelId}
                      onChange={(e) => setHotelId(e.target.value)}
                      placeholder="e.g. anbude-cafe or grand-palace"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-[#101B35] font-mono focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 transition"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      Matches the QR dining menu slug e.g. /{hotelId || 'slug'} (table suffixes like -t1 are auto-resolved).
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                    Full Physical Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Vallal MGR Salai, Maraimalai Nagar, Tamil Nadu 603209"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-[#101B35] focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 transition"
                  />
                </div>
              </div>

              {/* 2. Google Review URL & Place ID */}
              <div className="space-y-3 pt-3 border-t border-gray-100">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      Google Review Direct URL <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAutoGenerateUrl}
                        className="text-[10px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-lg border border-amber-300 transition flex items-center gap-1 cursor-pointer"
                        title="Generates a 100% working Google Maps search URL that never 404s"
                      >
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>Generate Working Link</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleTestLink}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>Test Link</span>
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="url"
                      value={reviewUrl}
                      onChange={(e) => {
                        setReviewUrl(e.target.value);
                        setVerified(false);
                      }}
                      placeholder="e.g. https://www.google.com/maps/search/?api=1&query=... or direct Google Maps place link"
                      required
                      className="w-full px-3.5 py-2.5 pr-20 rounded-xl border border-gray-200 text-xs font-mono text-[#101B35] focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 transition"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {verified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                          <Check className="w-3 h-3" />
                          Tested
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                          Unconfirmed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Warning banner if URL contains a fake placeid */}
                  {reviewUrl && reviewUrl.includes('ChIJ2Ww-U5p_UjoRgkUeQ8b4B_w') && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between gap-2 mt-2">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>This link has an unverified placeholder Place ID that causes a Google 404 error.</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleAutoGenerateUrl}
                        className="px-2.5 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 font-bold text-[10px] shrink-0 cursor-pointer"
                      >
                        Fix with Working Link
                      </button>
                    </div>
                  )}

                  <p className="text-[10px] text-gray-400 mt-1 leading-normal">
                    Tip: Paste your Google Business Profile review short-link, your Google Maps place link, or click <strong>Generate Working Link</strong> to prevent 404s.
                  </p>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                    Google Maps Place ID or Maps Place Link (optional)
                  </label>
                  <input
                    type="text"
                    value={placeId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPlaceId(val);
                      // Auto-sync if user pasted full Google Maps link:
                      if (val.includes('google.com/maps')) {
                        setReviewUrl(val.trim());
                        setVerified(true);
                      }
                    }}
                    placeholder="e.g. ChIJ... or paste Google Maps link"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-mono text-gray-700 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 transition"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Pasting a Google Maps link here automatically updates the review URL destination.
                  </p>
                </div>
              </div>

              {/* 3. Button Customization: Label, Theme & Custom Colors */}
              <div className="space-y-4 pt-3 border-t border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                      Button Label
                    </label>
                    <input
                      type="text"
                      value={buttonLabel}
                      onChange={(e) => setButtonLabel(e.target.value)}
                      placeholder="Review us on Google"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-[#101B35] font-bold focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 transition"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                      Button Theme
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['light', 'dark', 'custom'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTheme(t)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold capitalize border transition cursor-pointer ${
                            theme === t
                              ? 'bg-[#101B35] text-white border-[#101B35] shadow-xs'
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Custom Color Pickers (when custom theme selected) */}
                {theme === 'custom' && (
                  <div className="p-4 rounded-2xl bg-[#FFF8E7] border border-[#FDE68A] space-y-3 animate-in fade-in">
                    <span className="text-xs font-bold text-[#8B4513] block">
                      Custom Brand Palette:
                    </span>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-gray-600 block mb-1">
                          Background
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={customColors.bg || '#FFFFFF'}
                            onChange={(e) =>
                              setCustomColors({ ...customColors, bg: e.target.value })
                            }
                            className="w-8 h-8 rounded-lg border border-gray-300 p-0 cursor-pointer"
                          />
                          <span className="text-[11px] font-mono">{customColors.bg}</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-600 block mb-1">
                          Text Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={customColors.text || '#101B35'}
                            onChange={(e) =>
                              setCustomColors({ ...customColors, text: e.target.value })
                            }
                            className="w-8 h-8 rounded-lg border border-gray-300 p-0 cursor-pointer"
                          />
                          <span className="text-[11px] font-mono">{customColors.text}</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-600 block mb-1">
                          Border Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={customColors.border || '#E8EAF0'}
                            onChange={(e) =>
                              setCustomColors({ ...customColors, border: e.target.value })
                            }
                            className="w-8 h-8 rounded-lg border border-gray-300 p-0 cursor-pointer"
                          />
                          <span className="text-[11px] font-mono">{customColors.border}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Placement Checkboxes */}
              <div className="space-y-2 pt-3 border-t border-gray-100">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">
                  Button Placements:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PLACEMENT_OPTIONS.map((opt) => {
                    const isChecked = placements.includes(opt.id);
                    return (
                      <label
                        key={opt.id}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                          isChecked
                            ? 'bg-[#F0FFF6] border-emerald-300 text-emerald-950'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTogglePlacement(opt.id)}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span>{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#101B35] hover:bg-black text-white text-xs font-extrabold shadow-sm transition active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving Changes...' : 'Save Configuration'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTestLink}
                    className="inline-flex items-center gap-1.5 px-3.5 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold transition cursor-pointer active:scale-95"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Test Link</span>
                  </button>
                </div>

                {selectedConfigId && (
                  <button
                    type="button"
                    onClick={handleToggleStatus}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer active:scale-95 ${
                      status === 'active'
                        ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{status === 'active' ? 'Deactivate Button' : 'Activate Button'}</span>
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN: Live Interactive Preview & Click Analytics (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-6">
            {/* 1. Live Real-Time Button Preview */}
            <div className="bg-white p-5 rounded-3xl border border-[#E8EAF0] shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-extrabold text-[#101B35]">
                    Live Customer-Facing Preview
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-gray-400">
                  {hotelName || 'Hotel Preview'}
                </span>
              </div>

              <div className="space-y-3 bg-[#FFFCF7] p-4 rounded-2xl border border-dashed border-gray-200">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                    Dining Hub Card Variant:
                  </span>
                  <GoogleReviewButton
                    hotelId={hotelId || 'anbude-cafe'}
                    initialConfig={previewConfig}
                    variant="card"
                  />
                </div>

                <div className="pt-2 border-t border-gray-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                    Standard Button Variant:
                  </span>
                  <GoogleReviewButton
                    hotelId={hotelId || 'anbude-cafe'}
                    initialConfig={previewConfig}
                    variant="default"
                  />
                </div>

                <div className="pt-2 border-t border-gray-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                    Compact Inline Variant:
                  </span>
                  <GoogleReviewButton
                    hotelId={hotelId || 'anbude-cafe'}
                    initialConfig={previewConfig}
                    variant="compact"
                  />
                </div>
              </div>

              <p className="text-[11px] text-gray-500 italic">
                * Click the buttons above to test live redirection and verify your review destination in real time.
              </p>
            </div>

            {/* 2. Click Analytics Summary */}
            <div className="bg-white p-5 rounded-3xl border border-[#E8EAF0] shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-extrabold text-[#101B35]">
                    Outbound Review Clicks Analytics
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  Real Time
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
                    Total Visits
                  </span>
                  <span className="text-2xl font-black text-[#101B35] font-mono">
                    {analytics?.totalClicks ?? allConfigs.find((c) => c.id === selectedConfigId)?.clickCount ?? 0}
                  </span>
                  <span className="text-[10px] text-gray-500 block mt-0.5">
                    Outbound Google Link Clicks
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                    Link Status
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'
                      }`}
                    />
                    <span className="text-sm font-bold capitalize">{status}</span>
                  </div>
                  <span className="text-[10px] text-gray-500 block mt-1 truncate">
                    {branchName || 'Main'}
                  </span>
                </div>
              </div>

              {/* Placement Breakdown */}
              {analytics?.placementBreakdown && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                    Clicks by Surface:
                  </span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-gray-700">
                      <span>QR Dining Menu:</span>
                      <span className="font-mono font-bold">{analytics.placementBreakdown.qr_menu}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-700">
                      <span>Customer Feedback:</span>
                      <span className="font-mono font-bold">{analytics.placementBreakdown.feedback}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-700">
                      <span>Review Modal:</span>
                      <span className="font-mono font-bold">{analytics.placementBreakdown.review_modal}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-700">
                      <span>Menu Header:</span>
                      <span className="font-mono font-bold">{analytics.placementBreakdown.header}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Multi-Hotel and Multi-Branch Directory Table */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8EAF0] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-base font-extrabold text-[#101B35]">
                Configured Hotel & Branch Review Buttons
              </h3>
              <p className="text-xs text-gray-500">
                Multi-tenant review configurations are isolated. Editing one hotel never overrides another.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Hotel & Branch</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Review Destination URL</th>
                  <th className="py-2.5 px-3">Theme</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Visits</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {allConfigs.map((cfg) => (
                  <tr
                    key={cfg.id}
                    className={`hover:bg-gray-50/80 transition ${
                      cfg.id === selectedConfigId ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="font-bold text-[#101B35]">{cfg.hotelName}</div>
                      <div className="text-[11px] text-gray-500">{cfg.branchName || 'Main'}</div>
                    </td>
                    <td className="py-3 px-3 text-gray-600">{cfg.location}</td>
                    <td className="py-3 px-3">
                      <a
                        href={cfg.reviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline max-w-[200px] truncate block font-mono text-[11px]"
                        title={cfg.reviewUrl}
                      >
                        {cfg.reviewUrl}
                      </a>
                    </td>
                    <td className="py-3 px-3 capitalize">{cfg.theme}</td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          cfg.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {cfg.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold">
                      {cfg.clickCount || 0}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => selectConfiguration(cfg)}
                        className="px-3 py-1 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 hover:bg-white hover:border-[#101B35] transition cursor-pointer"
                      >
                        Configure
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Deactivation Confirmation Modal */}
      {deactivateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in"
          onClick={() => setDeactivateModalOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-gray-200 text-[#101B35] space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Power className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-[#101B35]">
                Deactivate Google Review Button?
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                When deactivated, the review button will be hidden from customer menus and QR codes for <strong>{hotelName} ({branchName})</strong> until re-activated.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeactivateModalOpen(false)}
                className="flex-1 py-2.5 px-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => applyStatusChange('inactive')}
                className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Confirm Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
