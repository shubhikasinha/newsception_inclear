'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function DebateCard({ debate }) {
  const {
    id,
    topic,
    sideACount = 0,
    sideBCount = 0,
    viewerCount = 0,
    status = 'live',
    createdAt
  } = debate;

  return (
    <motion.div
      className="bg-white border-2 border-[#e0e0e0] p-6 hover:border-[#d4af37] transition-all"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, shadow: 'lg' }}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-serif font-bold text-xl text-[#1a1a1a] flex-1">
          {topic}
        </h3>
        {status === 'live' && (
          <span className="ml-4 px-3 py-1 bg-red-500 text-white text-xs font-serif font-semibold">
            LIVE
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4 text-sm font-serif">
        <div>
          <span className="text-[#666]">Side A:</span>
          <span className="ml-2 text-[#2c3e50] font-semibold">{sideACount}</span>
        </div>
        <div>
          <span className="text-[#666]">Side B:</span>
          <span className="ml-2 text-[#8b0000] font-semibold">{sideBCount}</span>
        </div>
        <div>
          <span className="text-[#666]">Viewers:</span>
          <span className="ml-2 text-[#1a1a1a] font-semibold">{viewerCount}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          href={`/debate/${id}`}
          className="flex-1 px-4 py-2 bg-[#1a1a1a] text-white font-serif text-sm font-semibold text-center hover:bg-[#2c2c2c] transition-colors"
        >
          Join Debate
        </Link>
        <Link
          href={`/audience/${id}`}
          className="flex-1 px-4 py-2 bg-[#f0f0f0] text-[#1a1a1a] font-serif text-sm font-semibold text-center hover:bg-[#e0e0e0] transition-colors"
        >
          Watch Live
        </Link>
      </div>
    </motion.div>
  );
}

