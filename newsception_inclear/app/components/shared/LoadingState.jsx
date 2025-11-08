import React from "react";
import { motion } from "framer-motion";
import { Loader2, Search, FileText, Brain } from "lucide-react";

export default function LoadingState({ topic }) {
  const steps = [
    { icon: Search, label: "Searching sources", delay: 0 },
    { icon: FileText, label: "Analyzing articles", delay: 0.3 },
    { icon: Brain, label: "Generating perspectives", delay: 0.6 }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Animated Logo */}
          <div className="neomorphic w-24 h-24 rounded-3xl mx-auto mb-8 bg-[#e8e8e8] dark:bg-[#1a1a1a] flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-12 h-12 text-[#b8860b] dark:text-[#d4af37]" />
            </motion.div>
          </div>

          {/* Title */}
          <h2 className="font-serif font-bold text-2xl md:text-3xl text-[#1a1a1a] dark:text-white mb-2">
            Analyzing Perspectives
          </h2>
          {topic && (
            <p className="font-sans text-lg text-gray-600 dark:text-gray-400 mb-8">
              on "{topic}"
            </p>
          )}

          {/* Loading Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: step.delay }}
                className="neomorphic rounded-2xl p-4 bg-[#e8e8e8] dark:bg-[#1a1a1a] flex items-center gap-4"
              >
                <div className="neomorphic w-10 h-10 rounded-xl bg-[#e8e8e8] dark:bg-[#1a1a1a] flex items-center justify-center">
                  <step.icon className="w-5 h-5 text-[#b8860b] dark:text-[#d4af37]" />
                </div>
                <span className="font-sans text-gray-700 dark:text-gray-300">
                  {step.label}
                </span>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="ml-auto"
                >
                  <Loader2 className="w-4 h-4 text-gray-400" />
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Shimmer Effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mt-8 text-sm font-sans text-gray-500 dark:text-gray-600"
          >
            This may take a few moments...
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}