import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Clock, Calendar, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HistoricalTimeline({ topic, currentArticleId }) {
  const [timelineData, setTimelineData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    loadHistoricalContext();
  }, [topic]);

  const loadHistoricalContext = async () => {
    try {
      // Check cache first
      const cached = await base44.entities.HistoricalContext.filter(
        { topic },
        '-created_date',
        1
      );

      if (cached && cached.length > 0) {
        const cacheAge = Date.now() - new Date(cached[0].created_date).getTime();
        if (cacheAge < 24 * 60 * 60 * 1000) { // 24 hours
          setTimelineData(cached[0]);
          setIsLoading(false);
          return;
        }
      }

      // Generate historical context
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a historical timeline for "${topic}". 

Provide:
1. 5-7 key events that led to the current situation
2. Each event should have: date, headline, brief summary, and why it's significant
3. Key developments over time
4. Related topics that provide context

Focus on factual historical events that help understand how we got to today's situation.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            timeline_events: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string" },
                  headline: { type: "string" },
                  summary: { type: "string" },
                  significance: { type: "string" }
                }
              }
            },
            key_developments: {
              type: "array",
              items: { type: "string" }
            },
            related_topics: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      // Save to database
      const contextData = {
        topic,
        current_article_id: currentArticleId,
        timeline_events: result.timeline_events || [],
        key_developments: result.key_developments || [],
        related_topics: result.related_topics || []
      };

      await base44.entities.HistoricalContext.create(contextData);
      setTimelineData(contextData);
    } catch (error) {
      console.error("Error loading historical context:", error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#1a1a1a] border-2 border-[#1a1a1a] dark:border-[#333] p-8 text-center">
        <Clock className="w-8 h-8 mx-auto mb-3 animate-pulse text-[#d4af37]" />
        <p className="font-serif text-sm text-gray-600 dark:text-gray-400">
          Building historical timeline...
        </p>
      </div>
    );
  }

  if (!timelineData) return null;

  const displayEvents = expanded 
    ? timelineData.timeline_events 
    : timelineData.timeline_events?.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white dark:bg-[#1a1a1a] border-2 border-[#1a1a1a] dark:border-[#333] p-6 md:p-8"
    >
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 border-2 border-[#d4af37] flex items-center justify-center flex-shrink-0">
          <Calendar className="w-6 h-6 text-[#d4af37]" />
        </div>
        <div className="flex-1">
          <h3 className="font-serif font-bold text-2xl text-[#1a1a1a] dark:text-white mb-1">
            Historical Context
          </h3>
          <p className="font-serif text-sm text-gray-600 dark:text-gray-400">
            How we got here: Key events leading to today's story
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[#d4af37]"></div>

        <div className="space-y-8">
          {displayEvents?.map((event, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="relative pl-16"
            >
              {/* Timeline dot */}
              <div className="absolute left-0 top-1 w-12 h-12 rounded-full border-4 border-[#d4af37] bg-white dark:bg-[#1a1a1a] flex items-center justify-center">
                <span className="font-serif font-bold text-xs text-[#d4af37]">
                  {idx + 1}
                </span>
              </div>

              <div className="border-l-4 border-gray-200 dark:border-gray-800 pl-6 pb-2">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="font-serif text-sm font-semibold text-gray-600 dark:text-gray-400">
                    {event.date}
                  </span>
                </div>
                <h4 className="font-serif font-bold text-lg text-[#1a1a1a] dark:text-white mb-2">
                  {event.headline}
                </h4>
                <p className="font-serif text-sm text-gray-700 dark:text-gray-300 mb-3">
                  {event.summary}
                </p>
                <div className="bg-[#d4af37]/10 border-l-2 border-[#d4af37] pl-3 py-2">
                  <p className="font-serif text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-bold">Why it matters:</span> {event.significance}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Expand/Collapse */}
      {timelineData.timeline_events?.length > 3 && (
        <div className="mt-6 text-center">
          <Button
            onClick={() => setExpanded(!expanded)}
            variant="outline"
            className="font-serif"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Show All {timelineData.timeline_events.length} Events
              </>
            )}
          </Button>
        </div>
      )}

      {/* Key Developments */}
      {timelineData.key_developments && timelineData.key_developments.length > 0 && (
        <div className="mt-8 pt-8 border-t-2 border-gray-200 dark:border-gray-800">
          <h4 className="font-serif font-bold text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#d4af37]" />
            Key Developments
          </h4>
          <ul className="space-y-2">
            {timelineData.key_developments.map((dev, idx) => (
              <li key={idx} className="flex items-start gap-3 font-serif text-sm text-gray-700 dark:text-gray-300">
                <span className="text-[#d4af37] font-bold">•</span>
                <span>{dev}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Related Topics */}
      {timelineData.related_topics && timelineData.related_topics.length > 0 && (
        <div className="mt-6 bg-gray-50 dark:bg-[#0a0a0a] p-4 rounded">
          <p className="font-serif text-xs text-gray-600 dark:text-gray-400 mb-2">
            Related Historical Topics:
          </p>
          <div className="flex flex-wrap gap-2">
            {timelineData.related_topics.map((topic, idx) => (
              <span
                key={idx}
                className="px-3 py-1 text-xs font-serif border border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37]/10 cursor-pointer transition-colors"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}