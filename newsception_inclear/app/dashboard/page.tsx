'use client';
import React, { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, MapPin, Clock } from "lucide-react";

import NewsFeedCard from "../components/dashboard/NewsFeedCard";
import LocationTrendingBar from "../components/dashboard/LocationTrendingBar";
import { LoadingState } from "../components/shared/LoadingStates";
import { apiClient } from "@/lib/api-client";

function DashboardSuspenseFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <p className="font-serif text-lg text-gray-600 dark:text-gray-400">
        Preparing your dashboard...
      </p>
    </div>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{city: string, country: string} | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getUserLocation();
    loadInitialFeed();
  }, []);

  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) {
      handleSearch(searchParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMoreFeed();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading]);
  const getUserLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`,
              {
                headers: {
                  'User-Agent': 'YourAppName/1.0 (contact@yourdomain.com)'
                }
              }
            );
            const data = await response.json();
            setUserLocation({
              city: data.address.city || data.address.town || data.address.village || 'Your Area',
              country: data.address.country || 'Global'
            });
          } catch (error) {
            console.error("Error getting location:", error);
            setUserLocation({ city: 'Global', country: 'World' });
          }
        },
        (error) => {
          console.log("Location access denied, using global news");
          setUserLocation({ city: 'Global', country: 'World' });
        }
      );
    } else {
      setUserLocation({ city: 'Global', country: 'World' });
    }
  };
  const loadInitialFeed = async () => {
    setIsLoading(true);
    try {
      // Try to fetch real data from backend first
      const response = await apiClient.getNewsFeed({ page: 1, limit: 20 });
      
      if (response && response.feed && Array.isArray(response.feed)) {
        console.log('Successfully loaded feed from backend:', response.feed);
        const formattedFeed = response.feed.map((item: any) => ({
          id: item._id,
          headline: item.headline,
          summary: item.summary,
          topic: item.topic,
          source_count: item.sourceCount,
          trending_score: item.trendingScore,
          category: item.category,
          image_url: item.imageUrl,
          published_at: item.publishedAt,
          perspectives: {
            count: item.perspectiveCount,
            categories: item.perspectives || []
          }
        }));
        
        setFeedItems(formattedFeed);
        return;
      }
    } catch (error) {
      console.error("Backend API error:", error);
    }
    
    // If backend fails, use minimal mock data
    setFeedItems([
      {
        headline: "Search for any topic to see balanced perspectives",
        summary: "Enter a search term above to discover different viewpoints on any news topic. Our AI will analyze multiple sources and present balanced perspectives.",
        topic: "Getting Started",
        source_count: 0,
        trending_score: 0,
        perspectives: {
          count: 0,
          categories: []
        }
      }
    ]);
    setIsLoading(false);
  };

  const loadMoreFeed = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const response = await apiClient.getNewsFeed({ page: nextPage, limit: 10 });
      
      if (response && response.feed && Array.isArray(response.feed) && response.feed.length > 0) {
        const formattedFeed = response.feed.map((item: any) => ({
          id: item._id,
          headline: item.headline,
          summary: item.summary,
          topic: item.topic,
          source_count: item.sourceCount,
          trending_score: item.trendingScore,
          category: item.category,
          image_url: item.imageUrl,
          published_at: item.publishedAt,
          perspectives: {
            count: item.perspectiveCount,
            categories: item.perspectives || []
          }
        }));

        setFeedItems(prev => [...prev, ...formattedFeed]);
        setPage(nextPage);
        
        // Check if we have more pages
        if (response.pagination && nextPage >= response.pagination.pages) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more feed:", error);
      setHasMore(false);
    }
    setIsLoading(false);
  };

  const handleSearch = (query: string) => {
    if (!query || !query.trim()) return;
    router.push(`/compare?topic=${encodeURIComponent(query)}`);
  };

  const handleFeedItemClick = (item: any) => {
    router.push(`/compare?topic=${encodeURIComponent(item.headline)}`);
  };

  if (isLoading && feedItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] flex items-center justify-center">
        <LoadingState message="Loading your personalized news feed..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a]">
      {/* Newspaper Header */}
      <div className="border-b-4 border-double border-[#1a1a1a] dark:border-[#d4af37] bg-white dark:bg-[#1a1a1a] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center mb-4">
            <h1 className="font-serif font-black text-5xl md:text-6xl tracking-tight text-[#1a1a1a] dark:text-white">
              TODAY'S EDITION
            </h1>
            <div className="flex items-center justify-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              {userLocation && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {userLocation.city}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(searchQuery);
                  }
                }}
                placeholder="Search news topics..."
                className="w-full px-6 py-4 pr-12 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-[#d4af37] focus:outline-none transition-colors"
              />
              <button 
                onClick={() => handleSearch(searchQuery)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-[#1a1a1a] dark:text-[#d4af37]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Location-Based Trending Bar */}
      <LocationTrendingBar location={userLocation} onTopicClick={handleSearch} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Feed Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-[#d4af37]"></div>
            <h2 className="font-serif font-bold text-3xl text-[#1a1a1a] dark:text-white">
              Breaking Stories
            </h2>
          </div>
          <p className="font-serif text-gray-600 dark:text-gray-400 ml-5">
            Multiple perspectives on today's most important news
          </p>
        </div>

        {/* News Feed */}
        <AnimatePresence mode="popLayout">
          <div className="space-y-6">
            {feedItems.map((item, index) => (
              <NewsFeedCard
                key={item.id || item.headline}
                item={item}
                index={index}
                onClick={() => handleFeedItemClick(item)}
              />
            ))}
          </div>
        </AnimatePresence>

        {/* Infinite Scroll Trigger */}
        <div ref={observerTarget} className="py-8 flex justify-center">
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-serif">Loading more stories...</span>
            </div>
          )}
        </div>

        {!hasMore && feedItems.length > 0 && (
          <div className="text-center py-8 border-t-2 border-[#1a1a1a] dark:border-[#d4af37]">
            <p className="font-serif text-gray-600 dark:text-gray-400">
              You've reached the end of today's edition
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSuspenseFallback />}>
      <DashboardContent />
    </Suspense>
  );
}
