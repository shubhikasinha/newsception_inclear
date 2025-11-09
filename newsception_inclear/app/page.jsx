'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import DebateCard from './components/debate/DebateCard';
import UserProfile from './components/auth/UserProfile';

export default function Home() {
  const [topics, setTopics] = useState([]);
  const [debates, setDebates] = useState([]);
  const [newTopic, setNewTopic] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load topics and debates
  useEffect(() => {
    loadTopics();
    loadDebates();
    const interval = setInterval(() => {
      loadTopics();
      loadDebates();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadTopics = async () => {
    try {
      const res = await fetch('/api/topics');
      if (res.ok) {
        const data = await res.json();
        setTopics(data);
      }
    } catch (err) {
      console.error('Error loading topics:', err);
    }
  };

  const loadDebates = async () => {
    try {
      // Try backend API first
      const res = await fetch('/api/backend/debate/requests');
      if (res.ok) {
        const data = await res.json();
        // Filter for active debates
        const activeDebates = (data.requests || []).filter(d => d.status === 'live');
        setDebates(activeDebates);
      } else {
        // Fallback to local API
        const localRes = await fetch('/api/rooms/create');
        if (localRes.ok) {
          const localData = await localRes.json();
          setDebates(Array.isArray(localData) ? localData : []);
        }
      }
    } catch (err) {
      console.error('Error loading debates:', err);
      // Fallback to empty array
      setDebates([]);
    }
  };

  const handleVote = async (topicId) => {
    try {
      const topic = topics.find(t => t.id === topicId);
      if (!topic) return;

      // Try backend API first
      try {
        const res = await fetch('/api/backend/debate/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            topic: topic.topic,
            perspectiveA: 'Support',
            perspectiveB: 'Oppose'
          }),
        });

        if (res.ok) {
          const data = await res.json();
          loadTopics();
          loadDebates();
          
          // If debate room was created (5+ requests), show notification
          if (data.roomId) {
            alert(`Debate room created! ${topic.topic} now has a live debate.`);
          }
          return;
        }
      } catch (backendErr) {
        console.log('Backend not available, using local API');
      }

      // Fallback to local API
      const res = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.topic }),
      });

      if (res.ok) {
        loadTopics();
        
        // If topic reaches 5+ votes, create debate room
        const updatedTopic = await res.json();
        if (updatedTopic.votes >= 5) {
          createDebateRoom(updatedTopic.topic);
        }
      }
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  const createDebateRoom = async (topic) => {
    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      if (res.ok) {
        loadDebates();
      }
    } catch (err) {
      console.error('Error creating debate:', err);
    }
  };

  const handleSubmitTopic = async (e) => {
    e.preventDefault();
    if (!newTopic.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: newTopic.trim() }),
      });

      if (res.ok) {
        setNewTopic('');
        loadTopics();
      }
    } catch (err) {
      console.error('Error submitting topic:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-serif">
      {/* Header */}
      <header className="bg-white border-b-2 border-[#d4af37] py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[#1a1a1a] tracking-wide">
                IN CLEAR
              </h1>
              <div className="w-32 h-1 bg-[#d4af37] mt-2"></div>
              <p className="text-sm text-[#666] mt-2">
                Real-time AI-moderated debates
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-[#f0f0f0] hover:bg-[#e0e0e0] text-[#1a1a1a] font-serif font-semibold transition-colors rounded"
              >
                Dashboard
              </Link>
              <UserProfile />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Submit New Topic */}
        <motion.div
          className="bg-white border-2 border-[#e0e0e0] p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-serif font-bold text-[#1a1a1a] mb-4">
            Propose a Debate Topic
          </h2>
          <form onSubmit={handleSubmitTopic} className="flex gap-2">
            <input
              type="text"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="Enter a debate topic..."
              className="flex-1 px-4 py-2 border-2 border-[#e0e0e0] font-serif focus:outline-none focus:border-[#d4af37]"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={isSubmitting || !newTopic.trim()}
              className="px-6 py-2 bg-[#1a1a1a] text-white font-serif font-semibold hover:bg-[#2c2c2c] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </form>
          <p className="text-xs text-[#999] mt-2">
            Topics with 5+ votes automatically create a debate room
          </p>
        </motion.div>

        {/* Live Debates */}
        {debates.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-serif font-bold text-[#1a1a1a] mb-6">
              LIVE DEBATES
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {debates.map((debate) => (
                <DebateCard key={debate.id} debate={debate} />
              ))}
            </div>
          </section>
        )}

        {/* Trending Topics */}
        <section>
          <h2 className="text-3xl font-serif font-bold text-[#1a1a1a] mb-6">
            TRENDING TOPICS
          </h2>
          {topics.length === 0 ? (
            <div className="bg-white border-2 border-[#e0e0e0] p-8 text-center">
              <p className="text-[#999] font-serif">
                No topics yet. Be the first to propose one!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {topics.map((topic, idx) => (
                <motion.div
                  key={topic.id}
                  className="bg-white border-2 border-[#e0e0e0] p-4 flex items-center justify-between hover:border-[#d4af37] transition-all"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="flex-1">
                    <h3 className="font-serif font-semibold text-[#1a1a1a] mb-1">
                      {topic.topic}
                    </h3>
                    <p className="text-xs text-[#666]">
                      {topic.votes} {topic.votes === 1 ? 'vote' : 'votes'}
                      {topic.votes >= 5 && (
                        <span className="ml-2 text-[#d4af37] font-semibold">
                          • Debate Room Available
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => handleVote(topic.id)}
                    className="ml-4 px-4 py-2 bg-[#f0f0f0] hover:bg-[#e0e0e0] text-[#1a1a1a] font-serif font-semibold transition-colors border-2 border-[#e0e0e0]"
                  >
                    Vote
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

