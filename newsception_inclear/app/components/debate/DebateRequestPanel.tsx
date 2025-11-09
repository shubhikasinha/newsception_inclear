'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ThumbsUp, 
  Users, 
  Radio, 
  TrendingUp, 
  Clock,
  MessageCircle,
  Flame
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface DebateRequest {
  _id: string;
  topic: string;
  vote_count: number;
  status: 'pending' | 'approved' | 'active' | 'completed';
  created_at: string;
  debate_room_id?: string;
}

interface DebateRequestPanelProps {
  onJoinDebate?: (roomId: string, topic: string) => void;
}

export default function DebateRequestPanel({ onJoinDebate }: DebateRequestPanelProps) {
  const [requests, setRequests] = useState<DebateRequest[]>([]);
  const [searchTopic, setSearchTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [votedTopics, setVotedTopics] = useState<Set<string>>(new Set());
  const [showRequestForm, setShowRequestForm] = useState(false);

  useEffect(() => {
    if (searchTopic) {
      loadDebateRequests(searchTopic);
    }
  }, [searchTopic]);

  const loadDebateRequests = async (topic: string) => {
    try {
      setIsLoading(true);
      const data = await apiClient.getDebateRequests(topic);
      if (Array.isArray(data)) {
        setRequests(data);
      }
    } catch (error) {
      console.log('Using mock debate requests');
      // Mock data for demonstration
      setRequests([
        {
          _id: '1',
          topic: topic,
          vote_count: 3,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (requestId: string, topic: string) => {
    if (votedTopics.has(requestId)) return;

    try {
      // Call API to vote
      // await apiClient.voteDebateRequest(requestId);
      
      // Update local state
      setRequests(prev =>
        prev.map(req =>
          req._id === requestId
            ? { ...req, vote_count: req.vote_count + 1 }
            : req
        )
      );
      setVotedTopics(prev => new Set(prev).add(requestId));
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleRequestDebate = async (topic: string) => {
    try {
      setIsLoading(true);
      // await apiClient.requestDebate({ topic });
      await loadDebateRequests(topic);
      setShowRequestForm(false);
    } catch (error) {
      console.error('Error requesting debate:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getVoteProgress = (voteCount: number) => {
    return Math.min((voteCount / 5) * 100, 100);
  };

  const isDebateReady = (request: DebateRequest) => {
    return request.vote_count >= 5 || request.status === 'approved' || request.status === 'active';
  };

  return (
    <div className="space-y-4">
      {/* Search/Topic Input */}
      <div className="neomorphic p-4 rounded-xl">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter topic to find or request debate..."
            value={searchTopic}
            onChange={(e) => setSearchTopic(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all"
          />
        </div>
      </div>

      {/* Debate Requests List */}
      {searchTopic && (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="neomorphic p-6 rounded-xl text-center"
              >
                <div className="animate-spin w-8 h-8 border-3 border-[#d4af37] border-t-transparent rounded-full mx-auto mb-3"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading debates...</p>
              </motion.div>
            ) : requests.length > 0 ? (
              requests.map((request, index) => {
                const progress = getVoteProgress(request.vote_count);
                const ready = isDebateReady(request);
                const hasVoted = votedTopics.has(request._id);

                return (
                  <motion.div
                    key={request._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.1 }}
                    className={`neomorphic p-5 rounded-xl transition-all duration-300 ${
                      ready
                        ? 'ring-2 ring-[#d4af37] shadow-lg shadow-[#d4af37]/20'
                        : ''
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-serif text-lg font-semibold text-gray-900 dark:text-white">
                            {request.topic}
                          </h3>
                          {ready && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded-full"
                            >
                              <Radio className="w-3 h-3" />
                              LIVE
                            </motion.span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(request.created_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {request.vote_count} votes
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Vote Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {ready ? '✅ Debate Ready!' : `${request.vote_count}/5 votes needed`}
                        </span>
                        {!ready && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {5 - request.vote_count} more needed
                          </span>
                        )}
                      </div>
                      <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          className={`h-full rounded-full ${
                            ready
                              ? 'bg-gradient-to-r from-[#d4af37] to-green-500'
                              : 'bg-gradient-to-r from-[#b8860b] to-[#d4af37]'
                          }`}
                        >
                          {ready && (
                            <motion.div
                              animate={{
                                backgroundPosition: ['0% 0%', '100% 100%'],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'linear',
                              }}
                              className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                              style={{ backgroundSize: '200% 200%' }}
                            />
                          )}
                        </motion.div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      {!ready ? (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleVote(request._id, request.topic)}
                          disabled={hasVoted}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                            hasVoted
                              ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-[#d4af37] to-[#b8860b] text-white hover:shadow-lg hover:scale-105'
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                          {hasVoted ? 'Voted' : 'Vote for Debate'}
                        </motion.button>
                      ) : (
                        <motion.button
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            onJoinDebate?.(request.debate_room_id || request._id, request.topic)
                          }
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg font-semibold hover:shadow-xl transition-all"
                        >
                          <Radio className="w-5 h-5 animate-pulse" />
                          Join Live Debate
                          <Flame className="w-4 h-4 text-yellow-300" />
                        </motion.button>
                      )}
                    </div>

                    {/* Live Indicator for Ready Debates */}
                    {ready && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                      >
                        <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                          <MessageCircle className="w-4 h-4" />
                          <span className="font-medium">
                            Twitter Spaces-style debate is now active! Join to participate.
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="neomorphic p-8 rounded-xl text-center"
              >
                <TrendingUp className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                <h3 className="font-serif text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No debates found for "{searchTopic}"
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Be the first to request a debate on this topic!
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleRequestDebate(searchTopic)}
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b8860b] text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  Request Debate
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Initial State */}
      {!searchTopic && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="neomorphic p-12 rounded-xl text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-[#d4af37] to-[#b8860b] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-serif text-xl font-bold text-gray-900 dark:text-white mb-2">
            Start a Debate
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-1">
            Enter a topic to find existing debates or request a new one.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Debates start automatically when 5+ people vote for them!
          </p>
        </motion.div>
      )}
    </div>
  );
}
