'use client';
import { motion } from 'framer-motion';

export default function InkAnimation({ children, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <motion.div
        className="relative"
        initial={{ filter: 'blur(4px)' }}
        animate={{ filter: 'blur(0px)' }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

