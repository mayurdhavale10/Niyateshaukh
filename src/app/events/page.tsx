// src/app/page.tsx (or events page)
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import ThreeJsBackground from '@/components/threejsbackground';
import EventDetails from '@/components/events/EventDetails';

type EventDoc = {
  _id: string;
  eventName: string;
  photos?: string[];
  mehfilNumber?: number | string;
  eventDate?: string | Date;
  eventTime?: string;
  venue?: { name?: string; address?: string; city?: string; pincode?: string };
  contactEmail?: string;
};

const DEFAULT_EVENT_HERO = '/event/eventniyat.webp';

// Custom Feather Pen SVG Icon Component
function FeatherPenIcon({ className = "" }: { className?: string }) {
  return (
    <svg 
      className={className}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M20.24 3.76c-.98-.98-2.56-.98-3.54 0L4 16.46V20h3.54l12.7-12.7c.98-.98.98-2.56 0-3.54zM6 18v-1.54l9-9L16.54 9l-9 9H6z" 
        fill="currentColor"
      />
      <path 
        d="M3 20h18v2H3v-2z" 
        fill="currentColor"
        opacity="0.7"
      />
    </svg>
  );
}

// Animated Seats Filling Counter Component
function SeatsFillingCounter() {
  const [percentage, setPercentage] = useState(0);
  const targetPercentage = 50; // Change this to actual filled percentage

  useEffect(() => {
    let current = 0;
    const increment = targetPercentage / 50; // Speed of animation
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetPercentage) {
        setPercentage(targetPercentage);
        clearInterval(timer);
      } else {
        setPercentage(Math.floor(current));
      }
    }, 30);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-3">
      <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-pink-300 animate-pulse drop-shadow-lg">
        {percentage}% Seats Filled!
      </p>
      
      {/* Progress Bar */}
      <div className="w-full max-w-md mx-auto bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-full h-4 overflow-hidden border border-purple-400/30 shadow-inner">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-400 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
          style={{ width: `${percentage}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
        </div>
      </div>
      
      <p className="text-xs sm:text-sm text-purple-200/80 font-medium">
        Out of 100 seats • Hurry up!
      </p>
    </div>
  );
}

export default function EventsPage() {
  const [event, setEvent] = useState<EventDoc | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch active event (if any)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/events', { cache: 'no-store' });
        const data = await res.json();
        
        console.log('📡 API Response:', data);
        console.log('🎭 Mehfil Number:', data?.event?.mehfilNumber, 'Type:', typeof data?.event?.mehfilNumber);
        
        setEvent(data?.event ?? null);
      } catch (err) {
        console.error('❌ Failed to fetch event:', err);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const heroSrc = event?.photos?.[0] || DEFAULT_EVENT_HERO;

  const formattedDate = useMemo(() => {
    if (!event?.eventDate) return undefined;
    const d = new Date(event.eventDate);
    if (Number.isNaN(d.getTime())) return undefined;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [event?.eventDate]);

  const venueName = useMemo(() => {
    const parts = [event?.venue?.name, event?.venue?.city].filter(Boolean);
    return parts.join(', ') || undefined;
  }, [event?.venue?.name, event?.venue?.city]);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Google Fonts */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Berkshire+Swash&display=swap" 
        rel="stylesheet" 
      />

      {/* Background */}
      <div className="fixed inset-0 z-0">
        <ThreeJsBackground />
      </div>

      {/* Foreground */}
      <div className="relative z-10">
        {/* Navbar */}
        <Navbar />

        {/* Event Header - Shows event name and key details */}
        <div className="w-full px-3 sm:px-4 md:px-6 pt-16 sm:pt-20 pb-6 sm:pb-8">
          <div className="w-full text-center space-y-3 sm:space-y-4">
            {/* Event Name */}
            <h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight px-2"
              style={{ fontFamily: "'Berkshire Swash', cursive" }}
            >
              {event?.eventName || 'Niyat e Shaukh'}
            </h1>
            
            {/* Mehfil Number */}
            {event?.mehfilNumber && (
              <p className="text-lg sm:text-xl md:text-2xl text-purple-300 font-medium">
                Mehfil {event.mehfilNumber}
              </p>
            )}

            {/* Event Details Grid */}
            <div className="max-w-3xl mx-auto mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {/* Date */}
              {formattedDate && (
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-5 border border-white/20 hover:bg-white/15 transition-all duration-300 shadow-lg">
                  <div className="flex items-center justify-center sm:flex-col gap-2 sm:gap-1">
                    <span className="text-3xl sm:text-4xl">📅</span>
                    <div className="text-left sm:text-center flex-1 sm:flex-none">
                      <p className="text-xs sm:text-sm text-purple-300 font-medium mb-0.5 sm:mb-1">Date</p>
                      <p className="font-semibold text-white text-sm sm:text-base">{formattedDate}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Time */}
              {event?.eventTime && (
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-5 border border-white/20 hover:bg-white/15 transition-all duration-300 shadow-lg">
                  <div className="flex items-center justify-center sm:flex-col gap-2 sm:gap-1">
                    <span className="text-3xl sm:text-4xl">🕐</span>
                    <div className="text-left sm:text-center flex-1 sm:flex-none">
                      <p className="text-xs sm:text-sm text-purple-300 font-medium mb-0.5 sm:mb-1">Time</p>
                      <p className="font-semibold text-white text-sm sm:text-base">{event.eventTime}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Location */}
              {venueName && (
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-5 border border-white/20 hover:bg-white/15 transition-all duration-300 shadow-lg">
                  <div className="flex items-center justify-center sm:flex-col gap-2 sm:gap-1">
                    <span className="text-3xl sm:text-4xl">📍</span>
                    <div className="text-left sm:text-center flex-1 sm:flex-none">
                      <p className="text-xs sm:text-sm text-purple-300 font-medium mb-0.5 sm:mb-1">Location</p>
                      <p className="font-semibold text-white text-sm sm:text-base break-words">{venueName}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Registration Form - Appears right after header */}
        <div id="registration-section" className="w-full px-3 sm:px-4 md:px-6 py-6 sm:py-8">
          <div className="w-full">
            {loading ? (
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
                <p className="text-white mt-4 text-sm sm:text-base">Loading event details...</p>
              </div>
            ) : (
              <>
                {/* Urgency Message with Animation */}
                <div className="text-center mb-6 sm:mb-8">
                  <div className="relative inline-block">
                    {/* Glowing background effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-xl opacity-40 animate-pulse"></div>
                    
                    {/* Main card */}
                    <div className="relative bg-gradient-to-br from-purple-900/60 via-pink-900/40 to-purple-900/60 backdrop-blur-xl rounded-3xl px-8 sm:px-12 py-6 sm:py-8 border-2 border-purple-400/40 shadow-2xl hover:shadow-purple-500/60 transition-all duration-500 hover:scale-[1.02]">
                      
                      {/* Top decoration with feather pens */}
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="animate-bounce" style={{ animationDelay: '0s' }}>
                          <FeatherPenIcon className="w-8 h-8 sm:w-10 sm:h-10 text-purple-300 drop-shadow-lg" />
                        </div>
                        
                        <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg">
                          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200">
                            Register Soon!
                          </span>
                        </h3>
                        
                        <div className="animate-bounce" style={{ animationDelay: '0.2s' }}>
                          <FeatherPenIcon className="w-8 h-8 sm:w-10 sm:h-10 text-pink-300 drop-shadow-lg" />
                        </div>
                      </div>
                      
                      {/* Seats counter */}
                      <SeatsFillingCounter />
                      
                      {/* Bottom message */}
                      <div className="mt-4 flex items-center justify-center gap-2">
                        <span className="text-xl sm:text-2xl animate-pulse">🌟</span>
                        <p className="text-sm sm:text-base md:text-lg text-purple-100 font-semibold animate-pulse">
                          Don't miss your chance to shine on stage!
                        </p>
                        <span className="text-xl sm:text-2xl animate-pulse">🌟</span>
                      </div>
                      
                      {/* Decorative corner accents */}
                      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-purple-400/50 rounded-tl-lg"></div>
                      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-purple-400/50 rounded-tr-lg"></div>
                      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-purple-400/50 rounded-bl-lg"></div>
                      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-purple-400/50 rounded-br-lg"></div>
                    </div>
                  </div>
                </div>
                
                <EventDetails 
                  eventId={event?._id}
                  eventName={event?.eventName}
                  eventDate={formattedDate}
                  eventTime={event?.eventTime}
                  venue={venueName}
                />
              </>
            )}
          </div>
        </div>

        {/* Hero Image - Appears last */}
        <div className="w-full px-3 sm:px-4 md:px-6 py-6 sm:py-8">
          <div className="max-w-5xl mx-auto">
            <div className="relative group overflow-hidden rounded-2xl shadow-2xl">
              <img
                src={heroSrc}
                alt={event?.eventName || 'Event'}
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
        </div>

        {/* Contact Us Section */}
        {event?.contactEmail && (
          <div className="w-full px-3 sm:px-4 md:px-6 py-8 sm:py-12">
            <div className="max-w-2xl mx-auto text-center space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                  Contact Us
                </h2>
                <p className="text-sm sm:text-base text-purple-300">
                  Have questions? We're here to help!
                </p>
              </div>
              <a
                href={`mailto:${event.contactEmail}`}
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-purple-500/50 hover:scale-105 text-sm sm:text-base"
              >
                <span className="text-lg sm:text-xl">✉️</span>
                <span className="break-all">{event.contactEmail}</span>
              </a>
            </div>
          </div>
        )}

        {/* Bottom Spacing */}
        <div className="h-8 sm:h-12"></div>
      </div>
    </div>
  );
}