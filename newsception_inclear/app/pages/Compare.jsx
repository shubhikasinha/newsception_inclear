
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { ArrowLeft, Info, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

import PerspectiveColumn from "../components/compare/PerspectiveColumn";
import EnhancedHeatmap from "../components/compare/EnhancedHeatmap";
import BiasVisualization from "../components/compare/BiasVisualization";
import HistoricalTimeline from "../components/history/HistoricalTimeline";
import FactCheckPanel from "../components/factcheck/FactCheckPanel";
import LoadingState from "../components/shared/LoadingState";
import DebateRequestButton from "../components/debate/DebateRequestButton";
import EnhancedSentimentPanel from "../components/analysis/EnhancedSentimentPanel";

export default function Compare() {
  const navigate = useNavigate();
  const location = useLocation();
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [perspectiveData, setPerspectiveData] = useState(null);
  const [allArticles, setAllArticles] = useState([]);
  const [claims, setClaims] = useState([]);
  const [showMobilePerspective, setShowMobilePerspective] = useState("positive");
  const [error, setError] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const topicParam = urlParams.get('topic');
    if (topicParam) {
      setTopic(topicParam);
      loadPerspectives(topicParam);
    } else {
      navigate(createPageUrl("Dashboard"));
    }
  }, [location]);

  const loadPerspectives = async (searchTopic) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await trackSearch(searchTopic);

      // Check cache
      const cachedArticles = await base44.entities.Article.filter(
        { topic: searchTopic },
        '-created_date',
        25
      );

      if (cachedArticles && cachedArticles.length >= 6) {
        const recentArticle = cachedArticles[0];
        const articleAge = Date.now() - new Date(recentArticle.created_date).getTime();
        const oneHour = 60 * 60 * 1000;

        if (articleAge < oneHour) {
          console.log("Using cached articles");
          setAllArticles(cachedArticles);
          const perspectives = categorizePerspectives(cachedArticles, searchTopic);
          setPerspectiveData(perspectives);
          await loadClaims(searchTopic);
          setIsLoading(false);
          return;
        }
      }

      // Fetch comprehensive analysis
      console.log("Fetching comprehensive analysis for:", searchTopic);
      
      const analysisResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Perform an in-depth analysis of "${searchTopic}" using current news sources.

IMPORTANT: Don't assume this is a left vs right political issue. First analyze what this topic is actually about, then determine the NATURAL ways perspectives differ on it.

For example:
- Economic topics might divide into "growth-focused" vs "sustainability-focused"
- Technology topics might divide into "innovation advocates" vs "regulation advocates"  
- Health topics might divide into "public health priority" vs "individual freedom priority"

Steps:
1. Identify what the topic is really about
2. Find 20-25 recent news articles from diverse credible sources
3. Determine the NATURAL dividing lines for this specific topic
4. Group articles into the two main opposing perspectives
5. Extract 5-7 key verifiable CLAIMS from articles (factual statements that can be fact-checked)
6. For each perspective, create detailed analysis

Provide:
- Perspective A title (describe what this viewpoint represents)
- Perspective A summary (comprehensive, 4-5 sentences)
- Perspective A key points (5-6 detailed points)
- 8-10 real article titles, sources, URLs, and credibility scores for Perspective A

- Perspective B title (describe what this viewpoint represents)  
- Perspective B summary (comprehensive, 4-5 sentences)
- Perspective B key points (5-6 detailed points)
- 8-10 real article titles, sources, URLs, and credibility scores for Perspective B

- Key claims: Extract specific factual claims that can be verified
- Distribution analysis`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            dividing_criteria: {
              type: "object",
              properties: {
                axis_name: { type: "string" },
                perspective_a_label: { type: "string" },
                perspective_b_label: { type: "string" }
              }
            },
            perspective_a: {
              type: "object",
              properties: {
                title: { type: "string" },
                summary: { type: "string" },
                key_points: { type: "array", items: { type: "string" } },
                articles: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      source: { type: "string" },
                      url: { type: "string" },
                      credibility: { type: "number" }
                    }
                  }
                }
              }
            },
            perspective_b: {
              type: "object",
              properties: {
                title: { type: "string" },
                summary: { type: "string" },
                key_points: { type: "array", items: { type: "string" } },
                articles: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      source: { type: "string" },
                      url: { type: "string" },
                      credibility: { type: "number" }
                    }
                  }
                }
              }
            },
            key_claims: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  claim_text: { type: "string" },
                  claim_type: { type: "string" },
                  verifiable: { type: "boolean" }
                }
              }
            },
            distribution: {
              type: "object",
              properties: {
                perspective_a_percentage: { type: "number" },
                perspective_b_percentage: { type: "number" },
                neutral_percentage: { type: "number" }
              }
            }
          }
        }
      });

      console.log("Comprehensive Analysis Result:", analysisResult);

      // Save all articles
      const articlesToSave = [];
      
      if (analysisResult.perspective_a?.articles) {
        for (const article of analysisResult.perspective_a.articles) {
          articlesToSave.push({
            topic: searchTopic,
            title: article.title,
            source: article.source || "News Source",
            url: article.url || "#",
            summary: analysisResult.perspective_a.summary,
            stance: "support",
            sentiment: "positive",
            credibility_score: article.credibility || Math.floor(Math.random() * 15) + 80,
            key_points: analysisResult.perspective_a.key_points || [],
            perspective_type: "positive"
          });
        }
      }

      if (analysisResult.perspective_b?.articles) {
        for (const article of analysisResult.perspective_b.articles) {
          articlesToSave.push({
            topic: searchTopic,
            title: article.title,
            source: article.source || "News Source",
            url: article.url || "#",
            summary: analysisResult.perspective_b.summary,
            stance: "oppose",
            sentiment: "negative",
            credibility_score: article.credibility || Math.floor(Math.random() * 15) + 75,
            key_points: analysisResult.perspective_b.key_points || [],
            perspective_type: "negative"
          });
        }
      }

      if (articlesToSave.length > 0) {
        await base44.entities.Article.bulkCreate(articlesToSave);
      }

      setAllArticles(articlesToSave);

      // Save claims
      if (analysisResult.key_claims) {
        const claimsToSave = analysisResult.key_claims.map(claim => ({
          topic: searchTopic,
          claim_text: claim.claim_text,
          claim_type: claim.claim_type || "factual",
          verifiable: claim.verifiable !== false,
          confidence_score: 85
        }));
        await base44.entities.Claim.bulkCreate(claimsToSave);
        setClaims(claimsToSave);
      }

      // Format for display
      const perspectiveData = {
        dividingCriteria: analysisResult.dividing_criteria || {
          axis_name: "Perspective Spectrum",
          perspective_a_label: "Perspective A",
          perspective_b_label: "Perspective B"
        },
        positive: {
          title: analysisResult.perspective_a?.title || `Perspective A on ${searchTopic}`,
          summary: analysisResult.perspective_a?.summary || "Analysis in progress...",
          sentiment: "positive",
          source: "Multiple Sources",
          credibility: Math.floor(Math.random() * 10) + 85,
          keyPoints: analysisResult.perspective_a?.key_points || [],
          articles: analysisResult.perspective_a?.articles || []
        },
        negative: {
          title: analysisResult.perspective_b?.title || `Perspective B on ${searchTopic}`,
          summary: analysisResult.perspective_b?.summary || "Analysis in progress...",
          sentiment: "negative",
          source: "Multiple Sources",
          credibility: Math.floor(Math.random() * 10) + 80,
          keyPoints: analysisResult.perspective_b?.key_points || [],
          articles: analysisResult.perspective_b?.articles || []
        },
        distribution: analysisResult.distribution || {
          perspective_a_percentage: 48,
          perspective_b_percentage: 45,
          neutral_percentage: 7
        }
      };

      setPerspectiveData(perspectiveData);

    } catch (error) {
      console.error("Error loading perspectives:", error);
      setError("Failed to analyze topic. Please try again.");
    }
    
    setIsLoading(false);
  };

  const trackSearch = async (searchTopic) => {
    try {
      const existing = await base44.entities.SearchHistory.filter({ topic: searchTopic }, '-created_date', 1);
      
      if (existing && existing.length > 0) {
        await base44.entities.SearchHistory.update(existing[0].id, {
          search_count: (existing[0].search_count || 1) + 1,
          last_searched: new Date().toISOString()
        });
      } else {
        await base44.entities.SearchHistory.create({
          topic: searchTopic,
          search_count: 1,
          last_searched: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error tracking search:", error);
    }
  };

  const loadClaims = async (searchTopic) => {
    try {
      const existingClaims = await base44.entities.Claim.filter(
        { topic: searchTopic },
        '-created_date',
        10
      );
      setClaims(existingClaims || []);
    } catch (error) {
      console.error("Error loading claims:", error);
    }
  };

  const categorizePerspectives = (articles, searchTopic) => {
    const positiveArticles = articles.filter(a => a.perspective_type === 'positive');
    const negativeArticles = articles.filter(a => a.perspective_type === 'negative');

    if (positiveArticles.length === 0 || negativeArticles.length === 0) {
      return null;
    }

    return {
      dividingCriteria: {
        axis_name: "Perspective Spectrum",
        perspective_a_label: "Perspective A",
        perspective_b_label: "Perspective B"
      },
      positive: {
        title: positiveArticles[0].title,
        summary: positiveArticles[0].summary,
        sentiment: positiveArticles[0].sentiment,
        source: "Multiple Sources",
        credibility: positiveArticles[0].credibility_score,
        keyPoints: positiveArticles[0].key_points || [],
        articles: positiveArticles.map(a => ({
          title: a.title,
          source: a.source,
          url: a.url,
          credibility: a.credibility_score
        }))
      },
      negative: {
        title: negativeArticles[0].title,
        summary: negativeArticles[0].summary,
        sentiment: negativeArticles[0].sentiment,
        source: "Multiple Sources",
        credibility: negativeArticles[0].credibility_score,
        keyPoints: negativeArticles[0].key_points || [],
        articles: negativeArticles.map(a => ({
          title: a.title,
          source: a.source,
          url: a.url,
          credibility: a.credibility_score
        }))
      },
      distribution: {
        perspective_a_percentage: Math.round((positiveArticles.length / articles.length) * 100),
        perspective_b_percentage: Math.round((negativeArticles.length / articles.length) * 100),
        neutral_percentage: 0
      }
    };
  };

  if (isLoading) {
    return <LoadingState topic={topic} />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <h2 className="font-serif font-bold text-2xl text-red-600 dark:text-red-400 mb-4">
            {error}
          </h2>
          <Button onClick={() => navigate(createPageUrl("Dashboard"))}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!perspectiveData) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <LoadingState topic={topic} />
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
          <Button
            onClick={() => navigate(createPageUrl("Dashboard"))}
            variant="ghost"
            className="font-sans text-gray-600 dark:text-gray-400 hover:text-[#b8860b] dark:hover:text-[#d4af37]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Explore
          </Button>
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
          <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto mb-6" />
          
          {/* Info Banner */}
          <div className="neomorphic-inset rounded-2xl p-4 bg-white dark:bg-[#1a1a1a] max-w-3xl mx-auto border-2 border-gray-200 dark:border-gray-800">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-[#b8860b] dark:text-[#d4af37] flex-shrink-0 mt-0.5" />
              <p className="font-serif text-sm text-gray-600 dark:text-gray-400 text-left">
                AI-powered analysis from {allArticles.length} sources. Perspectives determined by natural divisions in coverage, not predetermined political categories.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Debate Request Button */}
        <div className="mb-8">
          <DebateRequestButton 
            topic={topic}
            articleId={allArticles[0]?.id}
            perspectiveCriteria={perspectiveData?.dividingCriteria}
          />
        </div>

        {/* Mobile Perspective Toggle */}
        <div className="md:hidden mb-6">
          <div className="neomorphic rounded-2xl p-1 bg-white dark:bg-[#1a1a1a] flex gap-1 border-2 border-gray-200 dark:border-gray-800">
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
            <Button
              onClick={() => navigate(createPageUrl("Feedback") + `?topic=${encodeURIComponent(topic)}`)}
              className="bg-[#d4af37] hover:bg-[#b8860b] text-black font-serif"
            >
              Share Your Feedback
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
