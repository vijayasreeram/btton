'use client';

import { useState, useEffect } from 'react';
import { BookOpen, MessageSquareHeart, Star, Bell, Receipt } from 'lucide-react';
import PortalHeader from './PortalHeader';
import ActionCard from './ActionCard';
import FeedbackPage from './FeedbackPage';
import ReviewModal from './ReviewModal';
import PortalFooter from './PortalFooter';
import CategoryList from './CategoryList';
import CategoryDishes from './CategoryDishes';
import WaiterCallModal from './WaiterCallModal';
import BillCallModal from './BillCallModal';
import ActiveCallBanner from './ActiveCallBanner';
import GoogleReviewButton from './GoogleReviewButton';
import fallbackMenuData from '../data/anbude-cafe-menu.json';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function PortalClient({ params, initialView = 'hub' }) {
  const slug = params?.slug || 'anbude-cafe';

  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [currentView, setCurrentView] = useState(initialView); // 'hub' | 'categories' | 'dishes' | 'feedback'
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [waiterCallOpen, setWaiterCallOpen] = useState(false);
  const [billCallOpen, setBillCallOpen] = useState(false);
  const [activeCall, setActiveCall] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchRestaurantData() {
      try {
        const res = await fetch(`${API_URL}/api/menu/${slug}`, {
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data) {
            const rData = data.restaurant || data;
            const tableData = data.table || rData?.table || null;
            if (tableData) {
              rData.table = tableData;
            } else {
              const match = slug?.match(/-t(\d+)$/i);
              if (match) {
                rData.table = { label: `Table ${parseInt(match[1], 10)}` };
              }
            }
            setRestaurant(rData);
            setCategories(data.categories || []);
            return;
          }
        }
      } catch (err) {
        // Fallback silently if offline or API is down
      }

      // Use local fallback data
      if (isMounted) {
        const rData = fallbackMenuData.restaurant || fallbackMenuData;
        const match = slug?.match(/-t(\d+)$/i);
        if (match) {
          rData.table = { label: `Table ${parseInt(match[1], 10)}` };
        } else if (!rData.table) {
          rData.table = { label: 'Table 1' };
        }
        setRestaurant(rData);
        setCategories(fallbackMenuData.categories || []);
      }
    }

    fetchRestaurantData();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const restaurantName = restaurant?.name || "Anbu'de Cafe";
  const tableLabel = restaurant?.table?.label || 'Table 1';
  const googleReviewUrl =
    restaurant?.googleReviewUrl ||
    'https://maps.google.com/?q=Anbu+cafe+Maraimalai+Nagar';

  // Poll for active service calls for this table
  useEffect(() => {
    let isSubscribed = true;

    const checkActiveCalls = async () => {
      try {
        const res = await fetch(
          `/api/service-calls?slug=${slug}&table=${encodeURIComponent(tableLabel)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (isSubscribed) {
            const calls = data.calls || [];
            setActiveCall(calls.length > 0 ? calls[0] : null);
          }
        }
      } catch (err) {
        // Ignore polling error
      }
    };

    checkActiveCalls();
    const interval = setInterval(checkActiveCalls, 5000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [slug, tableLabel]);

  // Navigation handlers
  const handleOpenMenu = () => {
    setCurrentView('categories');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenFeedback = () => {
    setCurrentView('feedback');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setCurrentView('dishes');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCategories = () => {
    setCurrentView('categories');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHub = () => {
    setCurrentView('hub');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCallSuccess = (call) => {
    setActiveCall(call);
  };

  const handleCancelCall = (callId) => {
    if (activeCall?.id === callId) {
      setActiveCall(null);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FFFCF7] sm:bg-[#F6F3EC] sm:py-6 sm:px-4 flex justify-center items-start text-[#101B35] font-sans selection:bg-[#FFB800]/30 selection:text-amber-950 overflow-x-hidden relative">
      {/* Mobile Device Viewport Mockup on Desktop, 100% Full-bleed on Mobile */}
      <div
        className="w-full max-w-[430px] min-w-0 mx-auto bg-[#FFFCF7] min-h-screen sm:min-h-[850px] sm:rounded-[32px] sm:shadow-[0_16px_50px_rgba(0,0,0,0.08)] overflow-hidden border-0 sm:border sm:border-[#E8EAF0] flex flex-col justify-between transition-all relative pb-20 sm:pb-12"
        style={{ maxWidth: '430px' }}
      >
        <div className="w-full">
          {/* VIEW 1: Main Dining Hub */}
          {currentView === 'hub' && (
            <>
              <PortalHeader restaurant={restaurant} googleReviewUrl={googleReviewUrl} />

              <main className="w-full px-4 sm:px-5 pt-2 pb-6 space-y-3">
                {/* 1. Core Action: View Menu */}
                <ActionCard
                  icon={BookOpen}
                  variant="yellow"
                  title="View Menu"
                  subtitle="Browse categories & freshly prepared dishes"
                  badgeText={`${categories.length || 16} CATEGORIES`}
                  illustration="/hub/card-noodle-bowl.png"
                  onClick={handleOpenMenu}
                />

                {/* 2. Instant Table Assistance Action Cards: Waiter Call & Bill Call */}
                <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                  {/* Waiter Call Card */}
                  <button
                    type="button"
                    onClick={() => setWaiterCallOpen(true)}
                    className="p-3.5 rounded-[22px] border-[1.8px] border-[#FFB800] bg-[#FFF8E7]/60 hover:bg-[#FFF8E7] active:scale-[0.98] transition-all shadow-[0_2px_12px_rgba(255,184,0,0.12)] text-left flex flex-col justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="w-10 h-10 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#92400E] group-hover:scale-105 transition-transform">
                        <Bell className="w-5 h-5 fill-[#FFB800] text-[#92400E]" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFB800] text-[#101B35]">
                        {tableLabel}
                      </span>
                    </div>

                    <div>
                      <div className="text-sm font-black text-[#101B35] tracking-tight">
                        Call Waiter
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5 leading-tight">
                        Water, cutlery & assistance
                      </div>
                    </div>
                  </button>

                  {/* Bill Call Card */}
                  <button
                    type="button"
                    onClick={() => setBillCallOpen(true)}
                    className="p-3.5 rounded-[22px] border-[1.8px] border-[#86EFAC] bg-[#F0FFF6]/70 hover:bg-[#F0FFF6] active:scale-[0.98] transition-all shadow-[0_2px_12px_rgba(22,184,106,0.10)] text-left flex flex-col justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="w-10 h-10 rounded-2xl bg-[#DCFCE7] border border-[#BBF7D0] flex items-center justify-center text-[#15803D] group-hover:scale-105 transition-transform">
                        <Receipt className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#16B86A] text-white">
                        UPI / Cash
                      </span>
                    </div>

                    <div>
                      <div className="text-sm font-black text-[#101B35] tracking-tight">
                        Request Bill
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5 leading-tight">
                        Settle via UPI or counter
                      </div>
                    </div>
                  </button>
                </div>

                {/* Action Card: Leave Anonymous Feedback */}
                <ActionCard
                  icon={MessageSquareHeart}
                  variant="blue"
                  title="Leave Anonymous Feedback"
                  subtitle="Direct & private note to the manager"
                  illustration="/hub/card-notepad.png"
                  onClick={handleOpenFeedback}
                />

                {/* 3. Dynamic Customer-Facing Google Review Button (Configured via Admin Dashboard) */}
                <GoogleReviewButton
                  hotelId={slug}
                  variant="card"
                  placement="qr_menu"
                  fallbackUrl={googleReviewUrl}
                />
              </main>

              {/* Scanzaa Footer: ONLY on first page (Hub) */}
              <PortalFooter restaurant={restaurant} />
            </>
          )}

          {/* VIEW 2: All Restaurant Categories */}
          {currentView === 'categories' && (
            <div className="relative pb-6">
              <CategoryList
                categories={categories}
                restaurantName={restaurantName}
                onSelectCategory={handleSelectCategory}
                onBack={handleBackToHub}
              />

              {/* Floating Quick Service Bar for Categories View */}
              <div className="px-4 pt-4 pb-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWaiterCallOpen(true)}
                  className="py-2.5 px-3 rounded-xl border border-amber-300 bg-[#FFF8E7] text-amber-950 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer shadow-2xs"
                >
                  <Bell className="w-3.5 h-3.5 fill-[#FFB800] text-[#92400E]" />
                  <span>Call Waiter</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBillCallOpen(true)}
                  className="py-2.5 px-3 rounded-xl border border-emerald-300 bg-[#F0FFF6] text-emerald-950 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer shadow-2xs"
                >
                  <Receipt className="w-3.5 h-3.5 text-[#15803D]" />
                  <span>Request Bill</span>
                </button>
              </div>
            </div>
          )}

          {/* VIEW 3: Dishes of Selected Category Alone */}
          {currentView === 'dishes' && selectedCategory && (
            <div className="relative pb-6">
              <CategoryDishes
                category={selectedCategory}
                onBackToCategories={handleBackToCategories}
              />

              {/* Floating Quick Service Bar for Dishes View */}
              <div className="px-4 pt-4 pb-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWaiterCallOpen(true)}
                  className="py-2.5 px-3 rounded-xl border border-amber-300 bg-[#FFF8E7] text-amber-950 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer shadow-2xs"
                >
                  <Bell className="w-3.5 h-3.5 fill-[#FFB800] text-[#92400E]" />
                  <span>Call Waiter</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBillCallOpen(true)}
                  className="py-2.5 px-3 rounded-xl border border-emerald-300 bg-[#F0FFF6] text-emerald-950 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer shadow-2xs"
                >
                  <Receipt className="w-3.5 h-3.5 text-[#15803D]" />
                  <span>Request Bill</span>
                </button>
              </div>
            </div>
          )}

          {/* VIEW 4: Dedicated Anonymous Feedback Page */}
          {currentView === 'feedback' && (
            <FeedbackPage
              restaurant={restaurant}
              onBackToHub={handleBackToHub}
              onViewMenu={handleOpenMenu}
            />
          )}
        </div>
      </div>

      {/* Floating Active Request Notification Banner */}
      <ActiveCallBanner
        activeCall={activeCall}
        onCancelCall={handleCancelCall}
      />

      {/* Waiter Call Modal */}
      <WaiterCallModal
        isOpen={waiterCallOpen}
        onClose={() => setWaiterCallOpen(false)}
        tableLabel={tableLabel}
        slug={slug}
        onCallSuccess={handleCallSuccess}
      />

      {/* Bill Call Modal */}
      <BillCallModal
        isOpen={billCallOpen}
        onClose={() => setBillCallOpen(false)}
        tableLabel={tableLabel}
        slug={slug}
        restaurantName={restaurantName}
        onCallSuccess={handleCallSuccess}
      />

      {/* Google Review Prompt */}
      <ReviewModal
        isOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
        restaurant={restaurant}
        hotelId={slug}
      />
    </div>
  );
}
