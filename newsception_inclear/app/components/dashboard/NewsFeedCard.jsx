import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, Eye, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function NewsFeedCard({ item, index, onClick }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onClick={onClick}
      className="bg-white dark:bg-[#1a1a1a] border-2 border-[#1a1a1a] dark:border-[#333] cursor-pointer hover:border-[#d4af37] transition-all group"
    >
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Badge className="bg-[#d4af37] text-black font-serif font-bold px-3 py-1 text-xs uppercase tracking-wider">
              {item.topic}
            </Badge>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4" />
              <span className="font-serif">{item.source_count || 12} sources</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
            <TrendingUp className="w-4 h-4" />
            <span className="font-serif font-bold text-sm">{item.trending_score || 85}%</span>
          </div>
        </div>

        {/* Headline */}
        <h2 className="font-serif font-bold text-2xl md:text-3xl text-[#1a1a1a] dark:text-white mb-4 leading-tight group-hover:text-[#d4af37] transition-colors">
          {item.headline}
        </h2>

        {/* Decorative line */}
        <div className="w-16 h-[3px] bg-[#1a1a1a] dark:bg-[#d4af37] mb-4"></div>

        {/* Summary */}
        <p className="font-serif text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          {item.summary}
        </p>

        {/* Perspectives */}
        {item.perspectives && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-[#b8860b] dark:text-[#d4af37]" />
              <span className="font-serif font-semibold text-sm text-gray-600 dark:text-gray-400">
                {item.perspectives.count || 3} Perspectives Available
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {item.perspectives.categories?.map((perspective, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-xs font-serif border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-[#0a0a0a]"
                >
                  {perspective}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Read More */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
          <span className="font-serif text-sm text-gray-500 dark:text-gray-500 uppercase tracking-wider">
            Click to explore all sides
          </span>
          <ChevronRight className="w-5 h-5 text-[#b8860b] dark:text-[#d4af37] group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.article>
  );
}