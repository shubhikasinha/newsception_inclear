'use client';
import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Info, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import PerspectiveColumn from "../components/compare/PerspectiveColumn";
import EnhancedHeatmap from "../components/compare/EnhancedHeatmap";
import BiasVisualization from "../components/compare/BiasVisualization";
import HistoricalTimeline from "../components/history/HistoricalTimeline";
import FactCheckPanel from "../components/factcheck/FactCheckPanel";
import { LoadingState } from "../components/shared/LoadingStates";
import EnhancedSentimentPanelComponent from "../components/analysis/EnhancedSentimentPanel";
import { apiClient } from "@/lib/api-client";

type SentimentPanelProps = {
  articles: any[];
  topic: string;
  claims: any[];
};

const EnhancedSentimentPanel = EnhancedSentimentPanelComponent as React.ComponentType<SentimentPanelProps>;

function CompareSuspenseFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <p className="font-serif text-lg text-gray-600 dark:text-gray-400">
        Preparing comparison...
      </p>
    </div>
  );
}

function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [perspectiveData, setPerspectiveData] = useState<any>(null);
  const [allArticles, setAllArticles] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [showMobilePerspective, setShowMobilePerspective] = useState("positive");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const topicParam = searchParams.get('topic');
    if (topicParam) {
      setTopic(topicParam);
      loadPerspectives(topicParam);
    } else {
      router.push('/dashboard');
    }
  }, [searchParams]);

  const loadPerspectives = async (searchTopic: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Try to fetch from backend API
      console.log('Fetching analysis for topic:', searchTopic);
      const result = await apiClient.comparePerspectives(searchTopic);
      
      if (result && result.positive && result.negative) {
        console.log('Successfully loaded analysis from backend:', result);
        setPerspectiveData(result);
        
        // Set articles and claims
        if (result.articles && Array.isArray(result.articles)) {
          setAllArticles(result.articles);
        }
        
        if (result.claims && Array.isArray(result.claims)) {
          setClaims(result.claims);
        }
        
        setIsLoading(false);
        return;
      }

      // Mock data for demonstration
      const mockPerspectiveData = {
        dividingCriteria: {
          axis_name: "Analysis Spectrum",
          perspective_a_label: "Perspective A",
          perspective_b_label: "Perspective B"
        },
        positive: {
          title: `Supporting View: ${searchTopic}`,
          summary: `This perspective emphasizes the potential benefits and opportunities related to ${searchTopic}. Proponents argue for careful consideration of positive outcomes and constructive approaches to implementation.`,
          sentiment: "positive",
          source: "Multiple Sources",
          credibility: 87,
          keyPoints: [
            "Focus on potential opportunities and growth",
            "Emphasis on innovation and progress",
            "Consideration of long-term benefits",
            "Support for measured implementation",
            "Recognition of stakeholder interests"
          ],
          articles: [
            {
              title: `The Case for ${searchTopic}: A Comprehensive Analysis`,
              source: "News Analysis Today",
              url: "#",
              credibility: 88
            },
            {
              title: `Why ${searchTopic} Matters: Expert Perspectives`,
              source: "Policy Review",
              url: "#",
              credibility: 85
            },
            {
              title: `Understanding the Benefits of ${searchTopic}`,
              source: "Research Quarterly",
              url: "#",
              credibility: 90
            }
          ]
        },
        negative: {
          title: `Critical View: ${searchTopic}`,
          summary: `This perspective highlights concerns and potential challenges associated with ${searchTopic}. Critics emphasize the need for caution and careful evaluation of risks and drawbacks.`,
          sentiment: "negative",
          source: "Multiple Sources",
          credibility: 85,
          keyPoints: [
            "Identification of potential risks",
            "Concerns about implementation challenges",
            "Questions about long-term consequences",
            "Emphasis on alternative approaches",
            "Call for comprehensive safeguards"
          ],
          articles: [
            {
              title: `Critical Questions About ${searchTopic}`,
              source: "Critical Analysis Daily",
              url: "#",
              credibility: 86
            },
            {
              title: `The Other Side of ${searchTopic}: What You Need to Know`,
              source: "Investigative Journal",
              url: "#",
              credibility: 84
            },
            {
              title: `Examining the Concerns Around ${searchTopic}`,
              source: "Policy Watch",
              url: "#",
              credibility: 87
            }
          ]
        },
        distribution: {
          perspective_a_percentage: 52,
          perspective_b_percentage: 43,
          neutral_percentage: 5
        }
      };

      // Mock articles
      const mockArticles = [
        ...mockPerspectiveData.positive.articles.map((a: any) => ({
          ...a,
          topic: searchTopic,
          perspective_type: 'positive',
          credibility_score: a.credibility
        })),
        ...mockPerspectiveData.negative.articles.map((a: any) => ({
          ...a,
          topic: searchTopic,
          perspective_type: 'negative',
          credibility_score: a.credibility
        }))
      ];

      // Mock claims
      const mockClaims = [
        {
          claim_text: `${searchTopic} has significant implications for policy`,
          claim_type: "factual",
          verifiable: true,
          confidence_score: 85
        },
        {
          claim_text: `Multiple stakeholders are affected by ${searchTopic}`,
          claim_type: "factual",
          verifiable: true,
          confidence_score: 90
        },
        {
          claim_text: `Research shows varied outcomes related to ${searchTopic}`,
          claim_type: "statistical",
          verifiable: true,
          confidence_score: 82
        }
      ];

      setPerspectiveData(mockPerspectiveData);
      setAllArticles(mockArticles);
      setClaims(mockClaims);

    } catch (error) {
      console.error("Error loading perspectives:", error);
      setError("Failed to analyze topic. Please try again.");
    }
    
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] flex items-center justify-center">
        <LoadingState message={`Analyzing "${topic}" from multiple perspectives...`} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <h2 className="font-serif font-bold text-2xl text-red-600 dark:text-red-400 mb-4">
            {error}
          </h2>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!perspectiveData) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] flex items-center justify-center py-12 px-4">
        <LoadingState message={`Loading analysis for "${topic}"...`} />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 md:py-12 bg-[#fafafa] dark:bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Link href="/dashboard">
            <Button
              variant="ghost"
              className="font-sans text-gray-600 dark:text-gray-400 hover:text-[#b8860b] dark:hover:text-[#d4af37]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Explore
            </Button>
          </Link>
        </motion.div>

        {/* Topic Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="font-serif font-bold text-3xl md:text-5xl text-[#1a1a1a] dark:text-white mb-4">
            {topic}
          </h1>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto mb-6" />          
          {/* Info Banner */}
          <div className="rounded-2xl p-4 bg-white dark:bg-[#1a1a1a] max-w-3xl mx-auto border-2 border-gray-200 dark:border-gray-800">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-[#b8860b] dark:text-[#d4af37] shrink-0 mt-0.5" />
              <p className="font-serif text-sm text-gray-600 dark:text-gray-400 text-left">
                AI-powered analysis from {allArticles.length} sources. Perspectives determined by natural divisions in coverage, not predetermined political categories.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Debate Request Button */}
        <div className="mb-8 text-center">
          <Link href="/debate">
            <Button 
              size="lg"
              className="bg-[#d4af37] hover:bg-[#b8860b] text-black font-serif"
            >
              🎙️ Join Live Debate on This Topic
            </Button>
          </Link>
        </div>

        {/* Mobile Perspective Toggle */}
        <div className="md:hidden mb-6">
          <div className="rounded-2xl p-1 bg-white dark:bg-[#1a1a1a] flex gap-1 border-2 border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setShowMobilePerspective("positive")}
              className={`flex-1 py-3 rounded-xl font-serif font-medium transition-all ${
                showMobilePerspective === "positive"
                  ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-2 border-green-600"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              Perspective A
            </button>
            <button
              onClick={() => setShowMobilePerspective("negative")}
              className={`flex-1 py-3 rounded-xl font-serif font-medium transition-all ${
                showMobilePerspective === "negative"
                  ? "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-2 border-red-600"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              Perspective B
            </button>
          </div>
        </div>

        {/* Dual Perspective Layout */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-8">
          <div className={showMobilePerspective === "positive" ? "block" : "hidden md:block"}>
            <PerspectiveColumn
              perspective={perspectiveData.positive}
              type="positive"
              index={0}
            />
          </div>
          
          <div className={showMobilePerspective === "negative" ? "block" : "hidden md:block"}>
            <PerspectiveColumn
              perspective={perspectiveData.negative}
              type="negative"
              index={1}
            />
          </div>
        </div>

        {/* Enhanced Sentiment & Verification Analysis */}
        <div className="mb-8">
          <EnhancedSentimentPanel 
            articles={allArticles}
            topic={topic}
            claims={claims}
          />
        </div>

        {/* Enhanced Heatmap */}
        <div className="mb-8">
          <EnhancedHeatmap
            articles={allArticles}
            distribution={perspectiveData.distribution}
            dividingCriteria={perspectiveData.dividingCriteria}
            topic={topic}
          />
        </div>

        {/* Bias Visualization */}
        <div className="mb-8">
          <BiasVisualization
            topic={topic}
            articles={allArticles}
          />
        </div>

        {/* Fact Check Panel */}
        {claims.length > 0 && (
          <div className="mb-8">
            <FactCheckPanel
              claims={claims}
              articleId={allArticles[0]?.id}
              topic={topic}
            />
          </div>
        )}

        {/* Historical Timeline */}
        <div className="mb-8">
          <HistoricalTimeline
            topic={topic}
            currentArticleId={allArticles[0]?.id}
          />
        </div>

        {/* CTA to Feedback */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <div className="bg-white dark:bg-[#1a1a1a] border-2 border-[#1a1a1a] dark:border-[#333] p-8 max-w-2xl mx-auto">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-[#d4af37]" />
            <h3 className="font-serif font-bold text-xl text-[#1a1a1a] dark:text-white mb-3">
              Was this analysis helpful?
            </h3>
            <p className="font-serif text-gray-600 dark:text-gray-400 mb-6">
              Your feedback helps us improve our balanced perspective analysis
            </p>
            <Link href={`/feedback?topic=${encodeURIComponent(topic)}`}>
              <Button className="bg-[#d4af37] hover:bg-[#b8860b] text-black font-serif">
                Share Your Feedback
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<CompareSuspenseFallback />}>
      <CompareContent />
    </Suspense>
  );
}
