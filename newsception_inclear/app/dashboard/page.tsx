'use client';
import React, { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, MapPin, Clock } from "lucide-react";

import NewsFeedCard from "../components/dashboard/NewsFeedCard";
import LocationTrendingBar from "../components/dashboard/LocationTrendingBar";
import LoadingState from "../components/shared/LoadingState";
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

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, isLoading, page]);

  const getUserLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
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
      // Mock data for now - replace with actual API call when backend is ready
      const mockFeedItems = [
        {
          headline: "Global Climate Summit Reaches Historic Agreement on Carbon Emissions",
          summary: "World leaders from 195 countries have agreed to unprecedented carbon reduction targets. The agreement includes binding commitments and a $100 billion fund for developing nations.",
          topic: "Environment",
          source_count: 18,
          trending_score: 95,
          perspectives: {
            count: 4,
            categories: ["Policy Impact", "Economic Implications", "Scientific Analysis", "Developing Nations"]
          }
        },
        {
          headline: "Major Tech Companies Announce AI Safety Coalition",
          summary: "Leading technology firms have formed a coalition to establish ethical guidelines for AI development. The initiative aims to ensure responsible innovation while maintaining competitive advantage.",
          topic: "Technology",
          source_count: 15,
          trending_score: 88,
          perspectives: {
            count: 4,
            categories: ["Industry Standards", "Regulatory Concerns", "Innovation Impact", "Public Trust"]
          }
        },
        {
          headline: "Healthcare Reform Proposal Sparks National Debate",
          summary: "A comprehensive healthcare reform bill has been introduced, promising universal coverage. The proposal has generated intense discussion about costs, access, and quality of care.",
          topic: "Healthcare",
          source_count: 12,
          trending_score: 82,
          perspectives: {
            count: 3,
            categories: ["Cost Analysis", "Access Equity", "Quality Standards"]
          }
        },
        {
          headline: "Economic Recovery Shows Mixed Signals Across Global Markets",
          summary: "While some sectors show robust growth, others struggle with persistent challenges. Economists debate whether current policies are sufficient for sustained recovery.",
          topic: "Economy",
          source_count: 14,
          trending_score: 79,
          perspectives: {
            count: 4,
            categories: ["Growth Indicators", "Policy Effectiveness", "Market Volatility", "Employment Trends"]
          }
        },
        {
          headline: "Education Technology Transforms Traditional Learning Models",
          summary: "Schools worldwide are adopting hybrid learning approaches combining digital and in-person instruction. The shift raises questions about educational equity and effectiveness.",
          topic: "Education",
          source_count: 10,
          trending_score: 75,
          perspectives: {
            count: 3,
            categories: ["Learning Outcomes", "Digital Divide", "Teacher Adaptation"]
          }
        }
      ];

      setFeedItems(mockFeedItems);
      
      // Try to fetch from backend when available
      try {
        const news = await apiClient.getNewsFeed({ page: 1, limit: 20 });
        if (news && Array.isArray(news)) {
          setFeedItems(news);
        }
      } catch (error) {
        console.log("Backend not available, using mock data");
      }
    } catch (error) {
      console.error("Error loading feed:", error);
    }
    setIsLoading(false);
  };

  const loadMoreFeed = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      // Mock additional items
      const mockAdditionalItems = [
        {
          headline: "Renewable Energy Investment Reaches Record Levels",
          summary: "Global investment in renewable energy has exceeded all previous records, driven by falling costs and policy incentives.",
          topic: "Energy",
          source_count: 11,
          trending_score: 72,
          perspectives: {
            count: 3,
            categories: ["Investment Trends", "Technology Advances", "Policy Drivers"]
          }
        },
        {
          headline: "International Trade Agreements Face New Challenges",
          summary: "Existing trade frameworks are being reconsidered as nations prioritize domestic industries and supply chain resilience.",
          topic: "Trade",
          source_count: 9,
          trending_score: 68,
          perspectives: {
            count: 3,
            categories: ["Protectionism vs Globalization", "Supply Chain Security", "Economic Impact"]
          }
        },
        {
          headline: "Urban Planning Initiatives Focus on Sustainable Cities",
          summary: "Major cities are implementing innovative urban planning strategies to address climate change and improve quality of life.",
          topic: "Urban Development",
          source_count: 8,
          trending_score: 65,
          perspectives: {
            count: 3,
            categories: ["Environmental Goals", "Infrastructure Needs", "Community Impact"]
          }
        }
      ];

      setFeedItems(prev => [...prev, ...mockAdditionalItems]);
      setPage(prev => prev + 1);
      
      if (page >= 3) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more feed:", error);
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
    return <LoadingState topic="Dashboard" />;
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
                placeholder="Search any topic for balanced perspectives..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-3 pr-12 rounded-none border-2 border-[#1a1a1a] dark:border-[#d4af37] bg-white dark:bg-[#1a1a1a] font-serif text-lg focus:outline-none focus:border-[#d4af37]"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(searchQuery);
                  }
                }}
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
        <AnimatePresence>
          <div className="space-y-6">
            {feedItems.map((item, index) => (
              <NewsFeedCard
                key={index}
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
