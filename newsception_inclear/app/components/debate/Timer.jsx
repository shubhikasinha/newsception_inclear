'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Timer({ duration = 0, isRunning = false, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      if (timeLeft <= 0 && onComplete) {
        onComplete();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onComplete) onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onComplete]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (timeLeft / duration) * 100 : 0;

  return (
    <motion.div
      className="flex items-center gap-4 bg-white p-4 border-2 border-[#e0e0e0] rounded"
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
    >
      <div className="font-serif text-2xl font-bold text-[#1a1a1a] tracking-wider">
        {formatTime(timeLeft)}
      </div>
      <div className="flex-1 h-2 bg-[#e0e0e0] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[#d4af37]"
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'linear' }}
        />
      </div>
      <div className="text-xs font-serif text-[#666]">
        {isRunning ? '⏱️ Running' : '⏸️ Paused'}
      </div>
    </motion.div>
  );
}

