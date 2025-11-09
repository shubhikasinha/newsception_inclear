'use client';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

export default function DebatorTile({ 
  participant, 
  isSpeaking = false, 
  isLocal = false,
  side 
}) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (participant?.audioTrack && audioRef.current) {
      const element = participant.audioTrack.attach();
      audioRef.current.appendChild(element);
      return () => {
        participant.audioTrack?.detach();
      };
    }
  }, [participant?.audioTrack]);

  const getInitials = (identity) => {
    const parts = identity.split('-');
    if (parts.length > 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return identity.slice(0, 2).toUpperCase();
  };

  return (
    <motion.div
      className={`
        relative p-4 bg-white border-2 transition-all duration-300
        ${isSpeaking 
          ? 'border-[#d4af37] shadow-lg shadow-[#d4af37]/20' 
          : 'border-[#e0e0e0]'
        }
      `}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Speaking indicator underline */}
      {isSpeaking && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-[#d4af37]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}

      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className={`
            w-12 h-12 rounded-full flex items-center justify-center
            font-serif font-bold text-white text-sm
            ${side === 'A' ? 'bg-[#2c3e50]' : 'bg-[#8b0000]'}
          `}
        >
          {getInitials(participant?.identity || 'AN')}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-serif text-sm text-[#1a1a1a] truncate">
              {participant?.identity || 'Anonymous'}
            </p>
            {isLocal && (
              <span className="text-xs bg-[#d4af37] text-white px-2 py-0.5 rounded font-serif">
                You
              </span>
            )}
          </div>
          {isSpeaking && (
            <motion.p
              className="text-xs text-[#d4af37] font-serif mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Speaking...
            </motion.p>
          )}
        </div>

        {/* Mic status */}
        <div className="text-lg">
          {participant?.isMicrophoneEnabled ? '🎤' : '🔇'}
        </div>
      </div>

      {/* Hidden audio element */}
      <div ref={audioRef} className="hidden" />
    </motion.div>
  );
}

