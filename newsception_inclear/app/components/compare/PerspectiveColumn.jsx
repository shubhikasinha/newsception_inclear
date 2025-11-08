
import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function PerspectiveColumn({ perspective, type, index }) {
  const isPositive = type === "positive";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className="h-full"
    >
      <div className="bg-white dark:bg-[#1a1a1a] border-2 border-[#1a1a1a] dark:border-[#333] p-6 md:p-8 h-full flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            {isPositive ? (
              <TrendingUp className="w-6 h-6 text-green-600" />
            ) : (
              <TrendingDown className="w-6 h-6 text-red-600" />
            )}
            <Badge className={`${isPositive ? 'bg-green-600' : 'bg-red-600'} text-white font-serif font-bold px-3 py-1 uppercase tracking-wider`}>
              Perspective {isPositive ? 'A' : 'B'}
            </Badge>
          </div>

          {/* Drop cap headline */}
          <h2 className="font-serif font-bold text-2xl md:text-3xl text-[#1a1a1a] dark:text-white mb-3 leading-tight">
            <span className={`float-left text-6xl md:text-7xl leading-none mr-2 mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {perspective.title[0]}
            </span>
            {perspective.title.substring(1)}
          </h2>

          <div className="flex items-center gap-4 text-sm font-serif text-gray-600 dark:text-gray-400 border-t border-b border-gray-300 dark:border-gray-700 py-2 mt-4">
            <span>{perspective.source}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <span>Credibility:</span>
              <span className="font-bold text-[#b8860b] dark:text-[#d4af37]">
                {perspective.credibility}/100
              </span>
            </div>
            <span>•</span>
            <span>{perspective.articles?.length || 0} sources</span>
          </div>
        </div>

        {/* Summary with newspaper styling */}
        <div className="flex-1 mb-6">
          <p className="font-serif text-base md:text-lg text-gray-800 dark:text-gray-200 leading-relaxed text-justify mb-6 first-letter:text-5xl first-letter:font-bold first-letter:mr-1 first-letter:float-left">
            {perspective.summary}
          </p>
        </div>

        {/* Key Points */}
        <div className="mb-6">
          <h3 className="font-serif font-bold text-lg text-[#1a1a1a] dark:text-white mb-4 pb-2 border-b-2 border-[#d4af37]">
            Key Arguments
          </h3>
          <ul className="space-y-3">
            {perspective.keyPoints?.slice(0, 6).map((point, idx) => (
              <li key={idx} className="flex items-start gap-3 font-serif text-sm text-gray-700 dark:text-gray-300">
                <span className={`font-bold text-lg ${isPositive ? 'text-green-600' : 'text-red-600'} flex-shrink-0`}>
                  •
                </span>
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Source Articles */}
        <div className="border-t-2 border-double border-gray-300 dark:border-gray-700 pt-6">
          <h4 className="font-serif font-semibold text-sm text-gray-600 dark:text-gray-400 mb-4 uppercase tracking-wider">
            Primary Sources ({perspective.articles?.length || 0})
          </h4>
          <div className="space-y-3">
            {perspective.articles?.slice(0, 6).map((article, idx) => (
              <a
                key={idx}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <div className="flex items-start justify-between gap-3 p-3 border-l-2 border-gray-300 dark:border-gray-700 hover:border-[#d4af37] transition-colors">
                  <div className="flex-1">
                    <p className="font-serif text-sm font-semibold text-[#1a1a1a] dark:text-white group-hover:text-[#d4af37] transition-colors line-clamp-2">
                      {article.title}
                    </p>
                    <p className="font-serif text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {article.source}
                      {article.credibility && (
                        <span className="ml-2 text-[#b8860b] dark:text-[#d4af37]">
                          • {article.credibility}/100
                        </span>
                      )}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#d4af37] flex-shrink-0 transition-colors" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
