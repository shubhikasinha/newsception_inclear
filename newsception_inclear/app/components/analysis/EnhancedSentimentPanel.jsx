'use client';
import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Heart, Frown, Meh, Smile, TrendingUp, Brain, Tag, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { generateSentimentInsights, generateClaimVerifications } from "@/lib/insights";

export default function EnhancedSentimentPanel({ articles = [], topic, claims = [] }) {
  const [sentimentData, setSentimentData] = useState([]);
  const [verificationData, setVerificationData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const articleKey = useMemo(
    () => articles.map((article) => article?.id || article?.title || "unknown").join("|"),
    [articles]
  );

  const claimsKey = useMemo(
    () => claims.map((claim) => claim?.claim_text || "").join("|"),
    [claims]
  );

  useEffect(() => {
    if (!articles || articles.length === 0) {
      setSentimentData([]);
      setVerificationData([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    const runAnalysis = async () => {
      try {
        const [sentiments, verifications] = await Promise.all([
          generateSentimentInsights(topic, articles.slice(0, 10)),
          generateClaimVerifications(topic, claims.slice(0, 10)),
        ]);

        if (!isMounted) return;
        setSentimentData(sentiments);
        setVerificationData(verifications);
      } catch (error) {
        console.error("Error generating sentiment insights:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    runAnalysis();

    return () => {
      isMounted = false;
    };
  }, [topic, articleKey, claimsKey, articles, claims]);

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive': return <Smile className="w-5 h-5 text-green-500" />;
      case 'negative': return <Frown className="w-5 h-5 text-red-500" />;
      case 'neutral': return <Meh className="w-5 h-5 text-gray-500" />;
      case 'mixed': return <TrendingUp className="w-5 h-5 text-yellow-500" />;
      default: return <Meh className="w-5 h-5 text-gray-500" />;
    }
  };

  const getVerificationIcon = (status) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'false': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'misleading': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default: return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBadgeVariant = (score) => {
    if (score > 0.3) return "default";
    if (score < -0.3) return "destructive";
    return "outline";
  };

  const clampToPercentage = (value) => {
    if (Number.isNaN(value)) return 0;
    return Math.max(0, Math.min(100, Number(value)));
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#1a1a1a] border-2 border-[#1a1a1a] dark:border-[#333] p-8 text-center">
        <Brain className="w-8 h-8 mx-auto mb-3 animate-pulse text-[#d4af37]" />
        <p className="font-serif text-sm text-gray-600 dark:text-gray-400">
          AI analyzing sentiment and verifying claims...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Sentiment Analysis */}
      <div className="bg-white dark:bg-[#1a1a1a] border-2 border-[#1a1a1a] dark:border-[#333] p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Heart className="w-6 h-6 text-[#d4af37]" />
          <h3 className="font-serif font-bold text-2xl">AI Sentiment Analysis</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {sentimentData.slice(0, 6).map((data, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="border border-gray-200 dark:border-gray-800 p-4 rounded-lg"
            >
              <div className="flex items-start justify-between mb-3">
                {getSentimentIcon(data.overall_sentiment)}
                <Badge variant={getBadgeVariant(data.sentiment_score)}>
                  {data.overall_sentiment}
                </Badge>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-serif">Sentiment Score</span>
                  <span className="font-serif font-bold">{Number(data.sentiment_score || 0).toFixed(2)}</span>
                </div>
                <Progress value={clampToPercentage((Number(data.sentiment_score || 0) + 1) * 50)} className="h-2" />
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-serif">Confidence</span>
                  <span className="font-serif font-bold">{data.confidence}%</span>
                </div>
                <Progress value={clampToPercentage(data.confidence)} className="h-2" />
              </div>

              {data.emotional_tone && data.emotional_tone.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {data.emotional_tone.slice(0, 3).map((tone, tidx) => (
                    <Badge key={tidx} variant="outline" className="text-xs">
                      {tone}
                    </Badge>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Key Entities Summary */}
        {sentimentData.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
            <h4 className="font-serif font-semibold mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#d4af37]" />
              Most Mentioned Entities
            </h4>
            <div className="flex flex-wrap gap-2">
              {[...new Set(sentimentData.flatMap(d => d.key_entities?.map(e => e.name) || []))].slice(0, 10).map((entity, idx) => (
                <Badge key={idx} className="bg-[#d4af37] text-black">
                  {entity}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Claim Verification */}
      <div className="bg-white dark:bg-[#1a1a1a] border-2 border-[#1a1a1a] dark:border-[#333] p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-6 h-6 text-[#d4af37]" />
          <h3 className="font-serif font-bold text-2xl">AI Claim Verification</h3>
        </div>

        <div className="space-y-4">
          {verificationData.map((data, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="border-l-4 border-[#d4af37] pl-4 py-3 bg-gray-50 dark:bg-[#0a0a0a]"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3 flex-1">
                  {getVerificationIcon(data.verification_status)}
                  <p className="font-serif text-sm font-semibold flex-1">{data.claim}</p>
                </div>
                <Badge className={
                  data.accuracy_score > 70 ? "bg-green-500" :
                  data.accuracy_score > 40 ? "bg-yellow-500" :
                  "bg-red-500"
                }>
                  {data.accuracy_score}% accurate
                </Badge>
              </div>

              <p className="font-serif text-xs text-gray-600 dark:text-gray-400 mb-2">
                {data.ai_reasoning}
              </p>

              {data.evidence && data.evidence.length > 0 && (
                <div className="mt-2">
                  <p className="font-serif text-xs font-semibold mb-1">Evidence:</p>
                  <div className="space-y-1">
                    {data.evidence.slice(0, 2).map((ev, eidx) => (
                      <a
                        key={eidx}
                        href={ev.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs text-[#d4af37] hover:underline"
                      >
                        • {ev.source}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}