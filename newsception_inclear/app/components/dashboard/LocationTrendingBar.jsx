import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Flame } from "lucide-react";
import { loadTrendingTopics, FALLBACK_TRENDING_TOPICS } from "@/lib/trending";

const FALLBACK_TOPICS = FALLBACK_TRENDING_TOPICS.slice(0, 5);

export default function LocationTrendingBar({ location, onTopicClick }) {
  const [trendingTopics, setTrendingTopics] = useState(FALLBACK_TOPICS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const fetchTrending = async () => {
      try {
        const topics = await loadTrendingTopics({
          city: location?.city,
          country: location?.country,
          limit: 5,
        });

        if (isActive) {
          setTrendingTopics(topics.length > 0 ? topics : FALLBACK_TOPICS);
        }
      } catch (error) {
        console.error("Error loading location trending:", error);
        if (isActive) {
          setTrendingTopics(FALLBACK_TOPICS);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchTrending();

    return () => {
      isActive = false;
    };
  }, [location?.city, location?.country]);

  if (isLoading) {
    return (
      <div className="bg-[#1a1a1a] dark:bg-black border-b-2 border-[#d4af37] py-3">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-8 bg-gray-800 animate-pulse rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] dark:bg-black border-b-2 border-[#d4af37] py-3 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#d4af37]" />
            <span className="font-serif font-bold text-white text-sm uppercase tracking-wider">
              Trending in {location?.city || 'Your Area'}
            </span>
          </div>
        </div>

        {/* Scrolling Ticker */}
        <div className="relative overflow-hidden">
          <motion.div
            animate={{ x: [0, -1000] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="flex gap-6"
          >
            {[...trendingTopics, ...trendingTopics].map((topic, index) => (
              <button
                key={index}
                onClick={() => onTopicClick(topic.headline)}
                className="flex items-center gap-3 px-4 py-2 bg-[#d4af37] hover:bg-[#b8860b] transition-colors whitespace-nowrap group shrink-0"
              >
                <Flame className="w-4 h-4 text-red-600" />
                <span className="font-serif font-semibold text-black">
                  {topic.headline}
                </span>
                <span className="text-xs text-gray-800 font-serif">
                  {topic.trend_score}%
                </span>
              </button>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}