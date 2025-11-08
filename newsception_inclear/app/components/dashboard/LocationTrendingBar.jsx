import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Flame, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function LocationTrendingBar({ location, onTopicClick }) {
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (location) {
      loadLocationTrending();
    }
  }, [location]);

  const loadLocationTrending = async () => {
    try {
      // Check cache first
      const cached = await base44.entities.LocationTrending.filter(
        { location: location?.city || 'Global' },
        '-trend_score',
        5
      );

      if (cached && cached.length > 0) {
        const recentCache = cached[0];
        const cacheAge = Date.now() - new Date(recentCache.last_updated || recentCache.created_date).getTime();
        const oneHour = 60 * 60 * 1000;

        if (cacheAge < oneHour) {
          setTrendingTopics(cached);
          setIsLoading(false);
          return;
        }
      }

      // Fetch fresh location-based trending
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 5 trending news topics specifically relevant to ${location?.city || 'Global'}, ${location?.country || 'World'} right now.

These should be:
- Real local/regional news if it's a specific city
- International news with local relevance
- Topics people in this area are currently discussing

For each topic provide:
- A concise headline (6-10 words)
- The main topic keyword
- A trending score (70-100 based on relevance)

Make these feel authentic to what would actually be trending in this location.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            trending: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  headline: { type: "string" },
                  topic: { type: "string" },
                  trend_score: { type: "number" }
                }
              }
            }
          }
        }
      });

      if (result?.trending) {
        const topicsToSave = result.trending.map(item => ({
          location: location?.city || 'Global',
          country: location?.country || 'World',
          topic: item.topic,
          headline: item.headline,
          trend_score: item.trend_score,
          last_updated: new Date().toISOString()
        }));

        await base44.entities.LocationTrending.bulkCreate(topicsToSave);
        setTrendingTopics(result.trending);
      }
    } catch (error) {
      console.error("Error loading location trending:", error);
      // Fallback
      setTrendingTopics([
        { headline: "AI Regulation Debate", topic: "Technology", trend_score: 95 },
        { headline: "Climate Action Summit", topic: "Environment", trend_score: 88 },
        { headline: "Economic Policy Changes", topic: "Economy", trend_score: 82 }
      ]);
    }
    setIsLoading(false);
  };

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
                className="flex items-center gap-3 px-4 py-2 bg-[#d4af37] hover:bg-[#b8860b] transition-colors whitespace-nowrap group flex-shrink-0"
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