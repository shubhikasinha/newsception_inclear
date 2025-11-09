'use client';
import { motion, AnimatePresence } from 'framer-motion';
import InkAnimation from './InkAnimation';

export default function ModeratorBar({ messages = [] }) {
  return (
    <div className="w-full bg-[#f5f5f0] border-b-2 border-[#d4af37] py-4 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-1 h-8 bg-[#d4af37]"></div>
          <h2 className="text-2xl font-serif font-bold text-[#1a1a1a] tracking-wide">
            MODERATOR
          </h2>
        </div>
        
        <AnimatePresence mode="popLayout">
          {messages.length > 0 && (
            <InkAnimation>
              <div className="mt-3 space-y-2">
                {messages.slice(-3).map((msg, idx) => (
                  <motion.div
                    key={msg.id || idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="font-serif text-[#2c2c2c] text-sm leading-relaxed"
                  >
                    <span className="text-[#d4af37] font-semibold">•</span> {msg.text}
                  </motion.div>
                ))}
              </div>
            </InkAnimation>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

