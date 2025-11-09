'use client';
import { motion } from 'framer-motion';
import DebatorTile from './DebatorTile';

export default function SideColumn({ side, users = [], localUserId }) {
  const sideColor = side === 'A' ? '#2c3e50' : '#8b0000';
  const sideLabel = side === 'A' ? 'SIDE A' : 'SIDE B';

  return (
    <motion.div
      className="flex flex-col h-full bg-[#fafafa] border-r-2 border-[#e0e0e0] last:border-r-0"
      initial={{ opacity: 0, x: side === 'A' ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div 
        className="p-4 border-b-2 font-serif"
        style={{ borderColor: sideColor }}
      >
        <h3 
          className="text-xl font-bold tracking-wider"
          style={{ color: sideColor }}
        >
          {sideLabel}
        </h3>
        <p className="text-xs text-[#666] mt-1">
          {users.length} {users.length === 1 ? 'debator' : 'debators'}
        </p>
      </div>

      {/* Debators List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {users.length === 0 ? (
          <div className="text-center py-8 text-[#999] font-serif text-sm">
            No debators yet
          </div>
        ) : (
          users.map((user, idx) => (
            <DebatorTile
              key={user.identity || idx}
              participant={user}
              isSpeaking={user.isSpeaking || false}
              isLocal={user.identity === localUserId}
              side={side}
            />
          ))
        )}
      </div>
    </motion.div>
  );
}

