import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, TrendingUp, TrendingDown, Minus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ArticleDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const [articleData, setArticleData] = useState(null);

  useEffect(() => {
    // In a real app, this would fetch article details
    // For now, using mock data
    setArticleData({
      title: "Understanding Climate Change Policy: A Comprehensive Analysis",
      source: "The Progressive Herald",
      credibility: 87,
      sentiment: "positive",
      date: "January 15, 2025",
      summary: `This comprehensive analysis explores the multifaceted aspects of climate change policy, examining both the opportunities and challenges that lie ahead. The article presents evidence-based arguments from leading experts in environmental science, economics, and policy-making. Key findings suggest that coordinated international efforts, combined with innovative technological solutions, offer a viable path forward. The piece carefully balances optimism about potential solutions with realistic assessments of implementation challenges.`,
      fullContent: `Climate change represents one of the defining challenges of our generation, requiring unprecedented levels of international cooperation and innovation. Recent developments in renewable energy technology, carbon capture, and sustainable agriculture demonstrate that viable solutions exist. However, the transition to a low-carbon economy requires careful planning, significant investment, and political will.

The article examines successful case studies from countries that have made substantial progress in reducing emissions while maintaining economic growth. These examples provide valuable lessons about policy design, stakeholder engagement, and the importance of long-term planning. Expert interviews reveal both the technical feasibility and economic viability of various approaches to climate mitigation.

Critical analysis of implementation challenges includes discussions of political resistance, economic transition costs, and the need for equitable solutions that don't disproportionately burden vulnerable communities. The piece emphasizes that while challenges are significant, they are not insurmountable with proper planning and resources.`,
      keywords: ["climate policy", "renewable energy", "sustainability", "economic transition", "international cooperation"],
      credibilityBreakdown: {
        sourceReputation: 90,
        factChecking: 85,
        expertCitation: 88,
        transparency: 84
      }
    });
  }, []);

  if (!articleData) {
    return <div>Loading...</div>;
  }

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case "positive": return <TrendingUp className="w-5 h-5 text-green-500" />;
      case "negative": return <TrendingDown className="w-5 h-5 text-red-500" />;
      default: return <Minus className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="font-sans text-gray-600 dark:text-gray-400 hover:text-[#b8860b] dark:hover:text-[#d4af37]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </motion.div>

        {/* Article Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            {getSentimentIcon(articleData.sentiment)}
            <Badge className="bg-[#d4af37] text-white font-sans">
              {articleData.sentiment.toUpperCase()}
            </Badge>
            <span className="font-sans text-sm text-gray-500 dark:text-gray-500">
              {articleData.date}
            </span>
          </div>

          <h1 className="font-serif font-bold text-3xl md:text-5xl text-[#1a1a1a] dark:text-white mb-4">
            {articleData.title}
          </h1>

          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="font-sans text-lg text-gray-600 dark:text-gray-400">
                {articleData.source}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="neomorphic bg-[#e8e8e8] dark:bg-[#1a1a1a] border-none font-sans"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Original
            </Button>
          </div>

          <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
        </motion.div>

        {/* Summary Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="neomorphic rounded-2xl p-6 md:p-8 bg-[#e8e8e8] dark:bg-[#1a1a1a] mb-8"
        >
          <h2 className="font-serif font-bold text-xl text-[#1a1a1a] dark:text-white mb-4">
            Executive Summary
          </h2>
          <p className="font-sans text-gray-700 dark:text-gray-300 leading-relaxed">
            {articleData.summary}
          </p>
        </motion.div>

        {/* Full Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8 space-y-6"
        >
          {articleData.fullContent.split('\n\n').map((paragraph, index) => (
            <p key={index} className="font-sans text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              {paragraph}
            </p>
          ))}
        </motion.div>

        {/* Keywords */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="neomorphic rounded-2xl p-6 bg-[#e8e8e8] dark:bg-[#1a1a1a] mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-5 h-5 text-[#b8860b] dark:text-[#d4af37]" />
            <h2 className="font-serif font-bold text-xl text-[#1a1a1a] dark:text-white">
              Key Topics
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {articleData.keywords.map((keyword, index) => (
              <Badge
                key={index}
                variant="outline"
                className="neomorphic bg-[#e8e8e8] dark:bg-[#1a1a1a] border-none font-sans"
              >
                {keyword}
              </Badge>
            ))}
          </div>
        </motion.div>

        {/* Credibility Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="neomorphic rounded-2xl p-6 md:p-8 bg-[#e8e8e8] dark:bg-[#1a1a1a]"
        >
          <h2 className="font-serif font-bold text-xl text-[#1a1a1a] dark:text-white mb-6">
            Credibility Score: {articleData.credibility}/100
          </h2>
          <div className="space-y-4">
            {Object.entries(articleData.credibilityBreakdown).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between mb-2">
                  <span className="font-sans text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="font-sans text-sm font-semibold text-[#b8860b] dark:text-[#d4af37]">
                    {value}/100
                  </span>
                </div>
                <div className="neomorphic-inset rounded-full h-3 bg-[#e8e8e8] dark:bg-[#1a1a1a] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-[#d4af37] to-[#b8860b] rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}