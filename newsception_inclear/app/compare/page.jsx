'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import PerspectiveColumn from '../components/compare/PerspectiveColumn';
import EnhancedHeatmap from '../components/compare/EnhancedHeatmap';
import BiasVisualization from '../components/compare/BiasVisualization';
import HistoricalTimeline from '../components/history/HistoricalTimeline';
import FactCheckPanel from '../components/factcheck/FactCheckPanel';
import LoadingState from '../components/shared/LoadingState';
import EnhancedSentimentPanel from '../components/analysis/EnhancedSentimentPanel';
import UserProfile from '../components/auth/UserProfile';
import { apiClient } from '../lib/api';

export default function ComparePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const topic = searchParams.get('topic') || '';
  
  const [isLoading, setIsLoading] = useState(true);
  const [perspectiveData, setPerspectiveData] = useState(null);
  const [allArticles, setAllArticles] = useState([]);
  const [claims, setClaims] = useState([]);
  const [historicalContext, setHistoricalContext] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (topic) {
      loadPerspectives(topic);
      loadHistoricalContext(topic);
    } else {
      router.push('/dashboard');
    }
  }, [topic]);

  const loadPerspectives = async (searchTopic) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await apiClient.searchNews(searchTopic);
      
      // Organize articles by perspective
      const supportArticles = data.articles?.filter(a => a.perspective === 'support') || [];
      const opposeArticles = data.articles?.filter(a => a.perspective === 'oppose') || [];
      
      setPerspectiveData({
        support: {
          articles: supportArticles,
          stance: supportArticles[0]?.stance || 'Supporting view',
        },
        oppose: {
          articles: opposeArticles,
          stance: opposeArticles[0]?.stance || 'Opposing view',
        },
      });
      
      setAllArticles(data.articles || []);
      
      // Extract claims from articles
      const allClaims = [];
      data.articles?.forEach(article => {
        if (article.claims) {
          allClaims.push(...article.claims);
        }
      });
      setClaims(allClaims);
      
    } catch (error) {
      console.error('Error loading perspectives:', error);
      setError('Failed to load perspectives. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistoricalContext = async (searchTopic) => {
    try {
      const data = await apiClient.getHistoricalContext(searchTopic);
      setHistoricalContext(data);
    } catch (error) {
      console.error('Error loading historical context:', error);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="text-center p-8 bg-white border-2 border-red-300 rounded">
          <h2 className="text-2xl font-serif font-bold text-red-700 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 px-6 py-2 bg-[#1a1a1a] text-white font-serif font-semibold hover:bg-[#2c2c2c]"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] font-serif">
      {/* Header */}
      <header className="bg-white border-b-2 border-[#d4af37] py-4 px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-[#f0f0f0] rounded transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#1a1a1a] tracking-wide">
                {topic}
              </h1>
              <p className="text-sm text-[#666] mt-1">Dual Perspective Analysis</p>
            </div>
          </div>
          <UserProfile />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Support Perspective */}
          <PerspectiveColumn
            perspective="support"
            articles={perspectiveData?.support?.articles || []}
            stance={perspectiveData?.support?.stance}
          />

          {/* Oppose Perspective */}
          <PerspectiveColumn
            perspective="oppose"
            articles={perspectiveData?.oppose?.articles || []}
            stance={perspectiveData?.oppose?.stance}
          />
        </div>

        {/* Analysis Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <EnhancedSentimentPanel articles={allArticles} />
          <BiasVisualization articles={allArticles} />
        </div>

        {/* Heatmap */}
        <div className="mb-8">
          <EnhancedHeatmap articles={allArticles} />
        </div>

        {/* Historical Timeline */}
        {historicalContext && (
          <div className="mb-8">
            <HistoricalTimeline events={historicalContext.events || []} />
          </div>
        )}

        {/* Fact Check Panel */}
        {claims.length > 0 && (
          <div className="mb-8">
            <FactCheckPanel claims={claims} />
          </div>
        )}
      </div>
    </div>
  );
}

