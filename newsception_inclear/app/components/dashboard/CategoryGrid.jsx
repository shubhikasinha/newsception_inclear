import React from "react";
import { motion } from "framer-motion";
import { Landmark, Cpu, Globe, TrendingUp, Heart, Briefcase } from "lucide-react";

export default function CategoryGrid({ onCategoryClick }) {
  const categories = [
    { name: "Politics", icon: Landmark, color: "from-blue-400 to-blue-600", example: "Government Policy" },
    { name: "Technology", icon: Cpu, color: "from-purple-400 to-purple-600", example: "AI & Innovation" },
    { name: "Climate", icon: Globe, color: "from-green-400 to-green-600", example: "Sustainability" },
    { name: "Economy", icon: TrendingUp, color: "from-yellow-400 to-yellow-600", example: "Markets & Finance" },
    { name: "Health", icon: Heart, color: "from-red-400 to-red-600", example: "Healthcare Policy" },
    { name: "Business", icon: Briefcase, color: "from-indigo-400 to-indigo-600", example: "Corporate News" }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
      {categories.map((category, index) => (
        <motion.button
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => onCategoryClick(category.example)}
          className="neomorphic rounded-3xl p-6 md:p-8 bg-[#e8e8e8] dark:bg-[#1a1a1a] text-center group hover:shadow-xl transition-all"
        >
          <div className={`neomorphic w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-gradient-to-br ${category.color} group-hover:scale-110 transition-transform`}>
            <category.icon className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-serif font-bold text-xl text-[#1a1a1a] dark:text-white mb-2">
            {category.name}
          </h3>
          <p className="font-sans text-sm text-gray-600 dark:text-gray-400">
            {category.example}
          </p>
        </motion.button>
      ))}
    </div>
  );
}