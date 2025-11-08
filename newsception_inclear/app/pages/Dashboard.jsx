import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Search, TrendingUp, Loader2, MapPin, Clock, Users, ChevronRight } from "lucide-react";

import NewsFeedCard from "../components/dashboard/NewsFeedCard";
import LocationTrendingBar from "../components/dashboard/LocationTrendingBar";
import LoadingState from "../components/shared/LoadingState";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [feedItems, setFeedItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const observerTarget = useRef(null);

  useEffect(() => {
    checkAuth();
    getUserLocation();
    loadInitialFeed();
    
    const urlParams = new URLSearchParams(location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      handleSearch(searchParam);
    }
  }, []);

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

  const checkAuth = async () => {
    const authenticated = await base44.auth.isAuthenticated();
    if (!authenticated) {
      base44.auth.redirectToLogin(createPageUrl("Dashboard"));
    }
  };

  const getUserLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Use reverse geocoding to get location name
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
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 5 current trending news topics for today. These should be real, globally relevant news stories that are making headlines right now. 

For each story, provide:
- A compelling headline (like a real newspaper)
- A 2-3 sentence summary
- Main topic category
- Number of major sources covering it (estimate 5-20)
- A trending score (70-100)
- 3-4 different perspectives/angles on this story

Make these feel like real breaking news from today.`,
        response_json_schema: {
          type: "object",
          properties: {
            feed_items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  headline: { type: "string" },
                  summary: { type: "string" },
                  topic: { type: "string" },
                  source_count: { type: "number" },
                  trending_score: { type: "number" },
                  perspectives: {
                    type: "object",
                    properties: {
                      count: { type: "number" },
                      categories: {
                        type: "array",
                        items: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (result?.feed_items) {
        // Save to database
        const itemsToSave = result.feed_items.map(item => ({
          ...item,
          location: userLocation?.city || 'Global'
        }));
        
        await base44.entities.NewsFeedItem.bulkCreate(itemsToSave);
        setFeedItems(result.feed_items);
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
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 3 more diverse trending news topics, different from typical headlines. Include international news, technology, climate, health, or economy topics.

For each story, provide:
- A compelling headline
- A 2-3 sentence summary  
- Main topic category
- Source count (5-20)
- Trending score (60-95)
- 3-4 different perspectives`,
        response_json_schema: {
          type: "object",
          properties: {
            feed_items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  headline: { type: "string" },
                  summary: { type: "string" },
                  topic: { type: "string" },
                  source_count: { type: "number" },
                  trending_score: { type: "number" },
                  perspectives: {
                    type: "object",
                    properties: {
                      count: { type: "number" },
                      categories: {
                        type: "array",
                        items: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (result?.feed_items) {
        setFeedItems(prev => [...prev, ...result.feed_items]);
        setPage(prev => prev + 1);
        
        // Save to database
        const itemsToSave = result.feed_items.map(item => ({
          ...item,
          location: userLocation?.city || 'Global'
        }));
        await base44.entities.NewsFeedItem.bulkCreate(itemsToSave);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more feed:", error);
    }
    setIsLoading(false);
  };

  const handleSearch = (query) => {
    if (!query || !query.trim()) return;
    navigate(createPageUrl("Compare") + `?topic=${encodeURIComponent(query)}`);
  };

  const handleFeedItemClick = (item) => {
    navigate(createPageUrl("Compare") + `?topic=${encodeURIComponent(item.headline)}`);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a]">
      {/* Newspaper Header */}
      <div className="border-b-4 border-double border-[#1a1a1a] dark:border-[#d4af37] bg-white dark:bg-[#1a1a1a] sticky top-16 z-40">
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
                className="w-full px-6 py-3 pr-12 rounded-none border-2 border-[#1a1a1a] dark:border-[#d4af37] bg-white dark:bg-[#1a1a1a] font-serif text-lg focus:outline-none focus:border-[#d4af37]"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(e.target.value);
                  }
                }}
              />
              <button 
                onClick={(e) => {
                  const input = e.target.closest('div').querySelector('input');
                  handleSearch(input.value);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
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