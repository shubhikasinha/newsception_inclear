import React from "react";
import { motion } from "framer-motion";
import { BarChart3, Info } from "lucide-react";

export default function BiasHeatmap({ distribution, dividingCriteria, topic }) {
  const perspectiveA = distribution?.perspective_a_percentage || 48;
  const neutral = distribution?.neutral_percentage || 7;
  const perspectiveB = distribution?.perspective_b_percentage || 45;

  const criteria = dividingCriteria || {
    axis_name: "Coverage Distribution",
    perspective_a_label: "Perspective A",
    perspective_b_label: "Perspective B"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white dark:bg-[#1a1a1a] border-2 border-[#1a1a1a] dark:border-[#333] p-6 md:p-8"
    >
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 border-2 border-[#d4af37] flex items-center justify-center flex-shrink-0">
          <BarChart3 className="w-6 h-6 text-[#d4af37]" />
        </div>
        <div className="flex-1">
          <h3 className="font-serif font-bold text-2xl text-[#1a1a1a] dark:text-white mb-1">
            Source Distribution Analysis
          </h3>
          <p className="font-serif text-sm text-gray-600 dark:text-gray-400">
            How news sources cluster on: <span className="font-bold text-[#d4af37]">{criteria.axis_name}</span>
          </p>
        </div>
      </div>

      {/* Heatmap Visualization */}
      <div className="mb-6">
        <div className="flex justify-between mb-2 text-sm font-serif">
          <span className="font-bold text-green-700 dark:text-green-400">
            {criteria.perspective_a_label}
          </span>
          <span className="font-bold text-gray-600 dark:text-gray-400">
            Neutral/Mixed
          </span>
          <span className="font-bold text-red-700 dark:text-red-400">
            {criteria.perspective_b_label}
          </span>
        </div>

        <div className="relative h-16 flex rounded-none overflow-hidden border-2 border-[#1a1a1a] dark:border-white">
          {/* Perspective A */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${perspectiveA}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="bg-gradient-to-r from-green-600 to-green-500 relative group cursor-pointer"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-serif font-bold text-white text-lg drop-shadow">
                {perspectiveA}%
              </span>
            </div>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
          </motion.div>

          {/* Neutral */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${neutral}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="bg-gradient-to-r from-gray-400 to-gray-500 relative group cursor-pointer"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-serif font-bold text-white text-sm drop-shadow">
                {neutral}%
              </span>
            </div>
          </motion.div>

          {/* Perspective B */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${perspectiveB}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
            className="bg-gradient-to-r from-red-500 to-red-600 relative group cursor-pointer"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-serif font-bold text-white text-lg drop-shadow">
                {perspectiveB}%
              </span>
            </div>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
          </motion.div>
        </div>

        {/* Scale markers */}
        <div className="flex justify-between mt-2 text-xs font-serif text-gray-500 dark:text-gray-600">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Interpretation */}
      <div className="border-l-4 border-[#d4af37] pl-4 bg-gray-50 dark:bg-[#0a0a0a] p-4">
        <div className="flex items-start gap-2 mb-2">
          <Info className="w-4 h-4 text-[#b8860b] dark:text-[#d4af37] mt-0.5 flex-shrink-0" />
          <h4 className="font-serif font-semibold text-[#1a1a1a] dark:text-white">
            What This Shows
          </h4>
        </div>
        <p className="font-serif text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          This heatmap shows how news sources covering "{topic}" distribute across the spectrum of 
          <span className="font-bold"> {criteria.axis_name.toLowerCase()}</span>. 
          {perspectiveA > 55 || perspectiveB > 55 ? (
            <span className="text-orange-600 dark:text-orange-400 font-semibold"> Coverage leans notably toward one perspective.</span>
          ) : (
            <span className="text-green-600 dark:text-green-400 font-semibold"> Coverage is relatively balanced across perspectives.</span>
          )}
        </p>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="w-full h-3 bg-gradient-to-r from-green-600 to-green-500 mb-2"></div>
            <p className="font-serif text-xs text-gray-600 dark:text-gray-400">
              {criteria.perspective_a_label}
            </p>
          </div>
          <div>
            <div className="w-full h-3 bg-gradient-to-r from-gray-400 to-gray-500 mb-2"></div>
            <p className="font-serif text-xs text-gray-600 dark:text-gray-400">
              Neutral/Balanced
            </p>
          </div>
          <div>
            <div className="w-full h-3 bg-gradient-to-r from-red-500 to-red-600 mb-2"></div>
            <p className="font-serif text-xs text-gray-600 dark:text-gray-400">
              {criteria.perspective_b_label}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}