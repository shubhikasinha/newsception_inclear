import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Tag, TrendingUp, Brain, Shield } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";

export default function BiasVisualization({ topic, articles }) {
  const [biasData, setBiasData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    analyzeBias();
  }, [topic]);

  const analyzeBias = async () => {
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze potential bias in news coverage about "${topic}". 

Examine the articles and identify:
1. Biased or loaded language (specific terms/phrases that carry emotional weight)
2. What perspective each biased term favors
3. Overall coverage tilt
4. Reasoning for bias assessment

Provide specific examples of biased terms with context.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            overall_bias_score: {
              type: "number",
              description: "Score from -100 (heavily left) to 100 (heavily right), 0 is neutral"
            },
            coverage_tilt: {
              type: "string",
              enum: ["heavily_left", "left", "center_left", "center", "center_right", "right", "heavily_right"]
            },
            biased_terms: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  term: { type: "string" },
                  context: { type: "string" },
                  bias_type: { type: "string" },
                  frequency: { type: "number" }
                }
              }
            },
            reasoning: { type: "string" }
          }
        }
      });

      // Save bias analysis
      await base44.entities.BiasAnalysis.create({
        topic,
        bias_score: result.overall_bias_score || 0,
        biased_terms: result.biased_terms || [],
        reasoning: result.reasoning || "",
        coverage_tilt: result.coverage_tilt || "center"
      });

      setBiasData(result);
    } catch (error) {
      console.error("Error analyzing bias:", error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#1a1a1a] border-2 border-[#1a1a1a] dark:border-[#333] p-8 text-center">
        <Brain className="w-8 h-8 mx-auto mb-3 animate-pulse text-[#d4af37]" />
        <p className="font-serif text-sm text-gray-600 dark:text-gray-400">
          Analyzing potential bias...
        </p>
      </div>
    );
  }

  if (!biasData) return null;

  const getTiltColor = (tilt) => {
    const colors = {
      heavily_left: "bg-blue-700",
      left: "bg-blue-500",
      center_left: "bg-blue-300",
      center: "bg-gray-400",
      center_right: "bg-red-300",
      right: "bg-red-500",
      heavily_right: "bg-red-700"
    };
    return colors[tilt] || "bg-gray-400";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white dark:bg-[#1a1a1a] border-2 border-[#1a1a1a] dark:border-[#333] p-6 md:p-8"
    >
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 border-2 border-orange-500 flex items-center justify-center flex-shrink-0">
          <Shield className="w-6 h-6 text-orange-500" />
        </div>
        <div className="flex-1">
          <h3 className="font-serif font-bold text-2xl text-[#1a1a1a] dark:text-white mb-1">
            Bias Detection Report
          </h3>
          <p className="font-serif text-sm text-gray-600 dark:text-gray-400">
            AI-powered analysis of language and framing
          </p>
        </div>
        <Badge className={`${getTiltColor(biasData.coverage_tilt)} text-white font-serif`}>
          {biasData.coverage_tilt?.replace(/_/g, ' ').toUpperCase()}
        </Badge>
      </div>

      {/* Bias Score Meter */}
      <div className="mb-8">
        <div className="flex justify-between mb-2 text-xs font-serif text-gray-600 dark:text-gray-400">
          <span>Heavily Left</span>
          <span>Center</span>
          <span>Heavily Right</span>
        </div>
        <div className="relative h-8 rounded-full overflow-hidden border-2 border-[#1a1a1a] dark:border-white">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-gray-300 to-red-700"></div>
          <motion.div
            initial={{ left: "50%" }}
            animate={{ left: `${((biasData.overall_bias_score + 100) / 200) * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-10 bg-[#1a1a1a] dark:bg-white border-2 border-[#d4af37]"
          />
        </div>
        <p className="text-center mt-2 font-serif text-sm">
          Bias Score: <span className="font-bold">{biasData.overall_bias_score}</span>
        </p>
      </div>

      {/* Biased Terms */}
      {biasData.biased_terms && biasData.biased_terms.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-5 h-5 text-[#d4af37]" />
            <h4 className="font-serif font-bold text-lg">Loaded Language Detected</h4>
          </div>
          <div className="grid gap-3">
            {biasData.biased_terms.slice(0, 8).map((item, idx) => (
              <div key={idx} className="border-l-4 border-orange-400 pl-4 py-2 bg-gray-50 dark:bg-[#0a0a0a]">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <p className="font-serif font-bold text-sm">"{item.term}"</p>
                  <Badge variant="outline" className="text-xs whitespace-nowrap">
                    {item.bias_type}
                  </Badge>
                </div>
                <p className="font-serif text-xs text-gray-700 dark:text-gray-300 italic">
                  "{item.context}"
                </p>
                {item.frequency && (
                  <p className="font-serif text-xs text-gray-500 mt-1">
                    Appears {item.frequency} time{item.frequency > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reasoning */}
      <div className="border-t-2 border-gray-200 dark:border-gray-800 pt-6">
        <div className="flex items-start gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <h4 className="font-serif font-bold text-sm">Analysis Reasoning</h4>
        </div>
        <p className="font-serif text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {biasData.reasoning}
        </p>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900 p-3 rounded">
        <p className="font-serif text-xs text-yellow-800 dark:text-yellow-200">
          <span className="font-bold">Note:</span> This analysis is AI-generated and identifies potential bias indicators.
          All news sources have some degree of framing. This tool helps you recognize it.
        </p>
      </div>
    </motion.div>
  );
}