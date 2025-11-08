import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function TrendingTopics({ onTopicClick }) {
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTrendingTopics();
  }, []);

  const loadTrendingTopics = async () => {
    try {
      // Fetch from search history, sorted by search count
      const searchHistory = await base44.entities.SearchHistory.list('-search_count', 8);
      
      if (searchHistory && searchHistory.length > 0) {
        // Calculate heat score based on search count and recency
        const topicsWithHeat = searchHistory.map(item => {
          const daysSinceSearch = item.last_searched 
            ? Math.floor((Date.now() - new Date(item.last_searched).getTime()) / (1000 * 60 * 60 * 24))
            : 30;
          
          // Heat calculation: more searches = higher heat, recent searches = higher heat
          const recencyBonus = Math.max(0, 30 - daysSinceSearch) / 30 * 20; // 0-20 bonus points
          const searchBonus = Math.min((item.search_count || 1) * 10, 80); // Up to 80 points
          const heat = Math.min(Math.floor(searchBonus + recencyBonus), 100);
          
          return {
            title: item.topic,
            heat: heat
          };
        });

        setTrendingTopics(topicsWithHeat.slice(0, 6));
      } else {
        // Fallback to default topics if no search history
        setTrendingTopics([
          { title: "AI Regulation", heat: 95 },
          { title: "Climate Change", heat: 88 },
          { title: "Electric Vehicles", heat: 82 },
          { title: "Social Media Privacy", heat: 79 },
          { title: "Healthcare Reform", heat: 75 },
          { title: "Cryptocurrency", heat: 72 }
        ]);
      }
    } catch (error) {
      console.error("Error loading trending topics:", error);
      // Fallback topics
      setTrendingTopics([
        { title: "AI Regulation", heat: 95 },
        { title: "Climate Change", heat: 88 },
        { title: "Electric Vehicles", heat: 82 }
      ]);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="neomorphic rounded-2xl p-6 bg-[#e8e8e8] dark:bg-[#1a1a1a] h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {trendingTopics.map((topic, index) => (
        <motion.button
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ y: -4 }}
          onClick={() => onTopicClick(topic.title)}
          className="neomorphic rounded-2xl p-6 bg-[#e8e8e8] dark:bg-[#1a1a1a] text-left hover:scale-105 transition-all group"
        >
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-serif font-bold text-lg text-[#1a1a1a] dark:text-white group-hover:text-[#b8860b] dark:group-hover:text-[#d4af37] transition-colors">
              {topic.title}
            </h3>
            <Flame className={`w-5 h-5 flex-shrink-0 ${
              topic.heat > 90 ? 'text-red-500' : 
              topic.heat > 80 ? 'text-orange-500' : 
              topic.heat > 70 ? 'text-yellow-500' :
              'text-yellow-600'
            }`} />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 neomorphic-inset rounded-full h-2 bg-[#e8e8e8] dark:bg-[#1a1a1a] overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-500"
                style={{ width: `${topic.heat}%` }}
              />
            </div>
            <span className="font-sans text-xs font-semibold text-gray-600 dark:text-gray-400">
              {topic.heat}%
            </span>
          </div>
        </motion.button>
      ))}
    </div>
  );
}