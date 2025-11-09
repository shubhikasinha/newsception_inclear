'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, TrendingUp, MapPin, Clock } from 'lucide-react';
import NewsFeedCard from '../components/dashboard/NewsFeedCard';
import LocationTrendingBar from '../components/dashboard/LocationTrendingBar';
import LoadingState from '../components/shared/LoadingState';
import UserProfile from '../components/auth/UserProfile';
import { apiClient } from '../lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [feedItems, setFeedItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingTopics, setTrendingTopics] = useState([]);

  useEffect(() => {
    getUserLocation();
    loadInitialFeed();
    loadTrendingTopics();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Default to USA if geolocation fails
          setUserLocation({ country: 'USA' });
        }
      );
    } else {
      setUserLocation({ country: 'USA' });
    }
  };

  const loadInitialFeed = async () => {
    setIsLoading(true);
    try {
      const location = userLocation?.country || 'USA';
      const data = await apiClient.getNewsFeed(1, 10, location);
      setFeedItems(data.items || []);
      setHasMore(data.hasMore || false);
    } catch (error) {
      console.error('Error loading feed:', error);
      // Fallback to mock data
      setFeedItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingTopics = async () => {
    try {
      const location = userLocation?.country || 'USA';
      const data = await apiClient.getTrendingTopics(location);
      setTrendingTopics(data.topics || []);
    } catch (error) {
      console.error('Error loading trending:', error);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      const location = userLocation?.country || 'USA';
      const data = await apiClient.searchNews(query, location);
      
      // Navigate to compare page with results
      router.push(`/compare?topic=${encodeURIComponent(query)}`);
    } catch (error) {
      console.error('Error searching:', error);
      alert('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreFeed = async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const location = userLocation?.country || 'USA';
      const data = await apiClient.getNewsFeed(nextPage, 10, location);
      
      setFeedItems(prev => [...prev, ...(data.items || [])]);
      setHasMore(data.hasMore || false);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-serif">
      {/* Header */}
      <header className="bg-white border-b-2 border-[#d4af37] py-4 px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-[#1a1a1a] tracking-wide">
              NEWS DASHBOARD
            </h1>
            <UserProfile />
          </div>
          
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666] w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                placeholder="Search for news topics..."
                className="w-full pl-10 pr-4 py-3 border-2 border-[#e0e0e0] focus:border-[#d4af37] focus:outline-none font-serif"
              />
            </div>
            <button
              onClick={() => handleSearch(searchQuery)}
              className="px-6 py-3 bg-[#1a1a1a] text-white font-serif font-semibold hover:bg-[#2c2c2c] transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Trending Topics */}
        {trendingTopics.length > 0 && (
          <LocationTrendingBar topics={trendingTopics} />
        )}

        {/* News Feed */}
        {isLoading && feedItems.length === 0 ? (
          <LoadingState />
        ) : (
          <div className="space-y-4">
            {feedItems.map((item, idx) => (
              <motion.div
                key={item.id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <NewsFeedCard
                  item={item}
                  onClick={() => router.push(`/compare?topic=${encodeURIComponent(item.topic || '')}`)}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="text-center mt-8">
            <button
              onClick={loadMoreFeed}
              disabled={isLoading}
              className="px-6 py-3 bg-[#f0f0f0] hover:bg-[#e0e0e0] text-[#1a1a1a] font-serif font-semibold transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

