'use client';

import { MapPin, Star, Coffee, Utensils, Users } from 'lucide-react';
import GoogleReviewButton from './GoogleReviewButton';

export default function PortalHeader({ restaurant, googleReviewUrl }) {
  const name = restaurant?.name || "Anbu'de Cafe";
  const cuisineType = restaurant?.cuisineType || 'Café · Fast Food · Beverages';
  const address = restaurant?.address || 'Vallal MGR Salai, Maraimalai Nagar';
  const shortAddress = address.split(',')[0].trim() || 'Vallal MGR Salai';
  const ratingText = restaurant?.rating?.includes('Google')
    ? restaurant.rating.replace('Google reviews', 'Google').replace('Google review', 'Google')
    : '5.0 (12 Google)';
  const hoursText = restaurant?.hours || 'Open daily · closes 11:00 PM';
  const closesAt = hoursText.toLowerCase().includes('11:00')
    ? 'Closes at 11:00 PM'
    : hoursText.toLowerCase().includes('10:30')
    ? 'Closes at 10:30 PM'
    : 'Closes at 11:00 PM';

  const description =
    restaurant?.description ||
    'A cozy place to enjoy great coffee, freshly prepared food and a relaxing atmosphere.';

  // Check if admin uploaded a custom cover image or logo
  const hasCustomCover = Boolean(restaurant?.coverImage && !restaurant.coverImage.includes('default-cafe-cover'));
  const hasCustomLogo = Boolean(restaurant?.logoUrl && !restaurant.logoUrl.includes('anbu-cafe-logo'));

  const coverImage = restaurant?.coverImage || '/hub/default-cafe-cover.jpg';
  const logoUrl = restaurant?.logoUrl || '/hub/anbu-cafe-logo.png';
  const isVerified = restaurant?.isVerified !== false;

  return (
    <header className="relative w-full bg-[#FFFCF7] pb-2">
      {/* 1. Header Banner / Cover Section */}
      {!hasCustomCover ? (
        /* Default State: Master Edge-to-Edge Banner with Scalloped Wave & Leaves, with Separate Circular Logo */
        <div className="relative w-full overflow-hidden bg-[#1a1510]">
          <img
            src="/hub/hub-banner-base.png"
            alt={`${name} cover`}
            className="w-full h-auto object-cover block select-none"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />

          {/* SEPARATE Circular Logo Element: Independent from upper image, dynamically displays admin or default logo */}
          <div
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden flex items-center justify-center z-20 pointer-events-none select-none"
            style={{
              top: '75.18%',
              width: '21%',
              aspectRatio: '1 / 1',
            }}
          >
            <img
              src={logoUrl}
              alt={name}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      ) : (
        /* Custom Admin-Uploaded Cover State */
        <div className="relative w-full">
          <div className="relative w-full h-[220px] sm:h-[240px] overflow-hidden bg-[#1a1510]">
            <img
              src={coverImage}
              alt={`${name} cover`}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent pointer-events-none" />
            <svg
              viewBox="0 0 500 80"
              preserveAspectRatio="none"
              className="absolute -bottom-1 left-0 w-full h-14 sm:h-16 text-[#FFFCF7] fill-current pointer-events-none block z-0"
            >
              <path d="M0,45 C100,75 160,25 250,55 C340,85 400,35 500,50 L500,85 L0,85 Z" />
            </svg>
          </div>

          <div className="relative max-w-sm mx-auto px-4 -mt-[56px] flex flex-col items-center text-center z-10">
            <div className="relative rounded-full bg-white p-1.5 shadow-[0_10px_28px_rgba(255,184,0,0.22)] border-2 border-[#FFB800]/50 flex items-center justify-center overflow-hidden ring-4 ring-[#FEF3C7] w-[120px] h-[120px] z-20">
              <img
                src={logoUrl}
                alt={name}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Restaurant Profile Information Container */}
      <div className="relative w-full max-w-sm mx-auto px-3.5 min-[360px]:px-4 pt-1 sm:pt-2 flex flex-col items-center text-center z-10">
        {/* Restaurant Name: Bold Typography + Golden Verified Checkmark */}
        <div className="mt-1 flex items-center justify-center gap-1.5">
          <h1 className="text-[27px] sm:text-[30px] font-black tracking-tight text-[#101B35] font-sans leading-tight">
            {name}
          </h1>
          {isVerified && (
            <span
              className="w-5 h-5 rounded-full bg-[#FFB800] text-[#101B35] flex items-center justify-center text-[10px] font-bold shadow-2xs shrink-0"
              title="Verified Restaurant"
            >
              ✓
            </span>
          )}
        </div>

        {/* Cuisine Concept Subtitle */}
        <p className="mt-1 text-xs font-semibold text-[#718096] font-sans tracking-wide">
          {cuisineType}
        </p>

        {restaurant?.table && (
          <div className="mt-2.5 inline-flex items-center px-3 py-0.5 rounded-full bg-[#FEF3C7] border border-[#F59E0B]/50 text-[#92400E] shadow-2xs animate-in fade-in zoom-in-95 duration-150">
            <span className="text-xs font-bold tracking-wide uppercase font-sans">
              {(() => {
                const raw = (restaurant.table.label || restaurant.table.name || '').trim();
                const match = raw.match(/(\d+)/);
                return match ? `Table ${parseInt(match[1], 10)}` : (raw || 'Table 1');
              })()}
            </span>
          </div>
        )}

        {/* Dual Cards: Open Now (#F0FFF6) + Rating & Review Count (#FEFCE8) */}
        <div className="grid grid-cols-2 gap-2 min-[360px]:gap-2.5 w-full mt-3.5 items-stretch">
          {/* Card 1: Open Now */}
          <div className="bg-[#F0FFF6] border border-[#16B86A]/30 rounded-2xl py-2 px-2 min-[360px]:py-2.5 min-[360px]:px-3 text-center shadow-2xs flex flex-col justify-center">
            <div className="flex items-center justify-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16B86A] animate-pulse" />
              <span className="text-[13px] min-[360px]:text-[14px] font-extrabold text-[#16B86A] font-sans">
                Open Now
              </span>
            </div>
            <p className="text-[10.5px] font-medium text-[#718096] mt-0.5 font-sans">
              {closesAt}
            </p>
          </div>

          {/* Card 2: Rating & Reviews (Dynamic Google Review Button) */}
          <GoogleReviewButton
            hotelId={restaurant?.slug || 'anbude-cafe'}
            variant="badge"
            placement="header"
            fallbackUrl={googleReviewUrl}
          />
        </div>

        {/* Location Pill */}
        <div className="mt-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#E8EAF0] shadow-2xs text-xs font-semibold text-[#101B35] font-sans">
            <MapPin className="w-3.5 h-3.5 text-[#718096]" />
            <span>{shortAddress}</span>
          </span>
        </div>

        {/* Short Restaurant Description: Centered & Comfortably Spaced */}
        <p className="mt-2.5 text-xs sm:text-[13px] text-[#718096] max-w-[285px] mx-auto leading-relaxed font-sans">
          {description}
        </p>

        {/* 4 Feature Highlights Row with Subtle Dividers */}
        <div className="w-full mt-4 pt-3.5 border-t border-[#E8EAF0] grid grid-cols-4 items-center text-center">
          {/* Feature 1: Great Coffee */}
          <div className="flex flex-col items-center">
            <div className="w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 sm:w-11 sm:h-11 rounded-full bg-[#FAF0E6] flex items-center justify-center text-[#8B4513] shadow-2xs transition-transform hover:scale-105">
              <Coffee className="w-4 h-4 min-[360px]:w-5 min-[360px]:h-5 stroke-[2.2]" />
            </div>
            <span className="text-[9px] min-[360px]:text-[10px] sm:text-[10.5px] font-bold text-[#718096] mt-1.5 leading-tight font-sans">
              Great Coffee
            </span>
          </div>

          {/* Divider & Feature 2: Tasty Food */}
          <div className="flex flex-col items-center border-l border-[#E8EAF0]">
            <div className="w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 sm:w-11 sm:h-11 rounded-full bg-[#FFF1E6] flex items-center justify-center text-[#EA580C] shadow-2xs transition-transform hover:scale-105">
              <Utensils className="w-4 h-4 min-[360px]:w-5 min-[360px]:h-5 stroke-[2.2]" />
            </div>
            <span className="text-[9px] min-[360px]:text-[10px] sm:text-[10.5px] font-bold text-[#718096] mt-1.5 leading-tight font-sans">
              Tasty Food
            </span>
          </div>

          {/* Divider & Feature 3: Cozy Ambience */}
          <div className="flex flex-col items-center border-l border-[#E8EAF0]">
            <div className="w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 sm:w-11 sm:h-11 rounded-full bg-[#F5EBE1] flex items-center justify-center text-[#78350F] shadow-2xs transition-transform hover:scale-105">
              <Users className="w-4 h-4 min-[360px]:w-5 min-[360px]:h-5 stroke-[2.2]" />
            </div>
            <span className="text-[9px] min-[360px]:text-[10px] sm:text-[10.5px] font-bold text-[#718096] mt-1.5 leading-tight font-sans">
              Cozy Ambience
            </span>
          </div>

          {/* Divider & Feature 4: Fresh Ingredients */}
          <div className="flex flex-col items-center border-l border-[#E8EAF0]">
            <div className="w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 sm:w-11 sm:h-11 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#16B86A] shadow-2xs transition-transform hover:scale-105">
              <svg className="w-4 h-4 min-[360px]:w-5 min-[360px]:h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
              </svg>
            </div>
            <span className="text-[9px] min-[360px]:text-[10px] sm:text-[10.5px] font-bold text-[#718096] mt-1.5 leading-tight font-sans">
              Fresh Ingredients
            </span>
          </div>
        </div>

        {/* Section Header: Guest Dining Portal with Background Wave Band */}
        <div className="relative mt-5 pt-2 w-full flex flex-col items-center text-center">
          <div className="flex items-center gap-1.5 text-[#FFB800] mb-1">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2,21H20V19H2M20,8H18V5H20M20,3H4V13A4,4 0 0,0 8,17H14A4,4 0 0,0 18,13V10H20A2,2 0 0,0 22,8V5A2,2 0 0,0 20,3Z" />
            </svg>
          </div>
          <h2 className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[#718096] font-sans">
            GUEST DINING PORTAL
          </h2>
          <p className="text-xs text-[#718096]/90 font-medium mt-0.5 font-sans">
            Explore our menu, give feedback and help us improve!
          </p>
        </div>
      </div>
    </header>
  );
}
