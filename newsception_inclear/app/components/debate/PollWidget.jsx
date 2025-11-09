'use client';
import { motion } from 'framer-motion';

export default function PollWidget({ 
  sideAVotes = 0, 
  sideBVotes = 0, 
  onVote,
  userVote = null 
}) {
  const totalVotes = sideAVotes + sideBVotes;
  const sideAPercent = totalVotes > 0 ? (sideAVotes / totalVotes) * 100 : 0;
  const sideBPercent = totalVotes > 0 ? (sideBVotes / totalVotes) * 100 : 0;

  return (
    <motion.div
      className="bg-white p-6 border-2 border-[#e0e0e0] rounded"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="font-serif font-bold text-lg text-[#1a1a1a] mb-4">
        LIVE POLL
      </h3>

      {/* Side A */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-serif text-sm text-[#2c3e50] font-semibold">
            Side A
          </span>
          <span className="font-serif text-sm text-[#666]">
            {sideAVotes} votes ({sideAPercent.toFixed(1)}%)
          </span>
        </div>
        <div className="h-4 bg-[#e0e0e0] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#2c3e50]"
            initial={{ width: 0 }}
            animate={{ width: `${sideAPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Side B */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-serif text-sm text-[#8b0000] font-semibold">
            Side B
          </span>
          <span className="font-serif text-sm text-[#666]">
            {sideBVotes} votes ({sideBPercent.toFixed(1)}%)
          </span>
        </div>
        <div className="h-4 bg-[#e0e0e0] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#8b0000]"
            initial={{ width: 0 }}
            animate={{ width: `${sideBPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Vote buttons */}
      {onVote && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onVote('A')}
            disabled={userVote === 'A'}
            className={`
              flex-1 px-4 py-2 font-serif text-sm font-semibold
              transition-all
              ${userVote === 'A'
                ? 'bg-[#2c3e50] text-white cursor-not-allowed'
                : 'bg-[#f0f0f0] text-[#2c3e50] hover:bg-[#2c3e50] hover:text-white'
              }
            `}
          >
            Vote Side A
          </button>
          <button
            onClick={() => onVote('B')}
            disabled={userVote === 'B'}
            className={`
              flex-1 px-4 py-2 font-serif text-sm font-semibold
              transition-all
              ${userVote === 'B'
                ? 'bg-[#8b0000] text-white cursor-not-allowed'
                : 'bg-[#f0f0f0] text-[#8b0000] hover:bg-[#8b0000] hover:text-white'
              }
            `}
          >
            Vote Side B
          </button>
        </div>
      )}

      <p className="text-xs text-[#999] font-serif mt-4 text-center">
        {totalVotes} total votes
      </p>
    </motion.div>
  );
}

