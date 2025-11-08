import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Search, Shield, Scale, Sparkles, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Landing() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const authenticated = await base44.auth.isAuthenticated();
    setIsAuthenticated(authenticated);
    if (authenticated) {
      navigate(createPageUrl("Dashboard"));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (isAuthenticated) {
        navigate(createPageUrl("Dashboard") + `?search=${encodeURIComponent(searchQuery)}`);
      } else {
        base44.auth.redirectToLogin(createPageUrl("Dashboard") + `?search=${encodeURIComponent(searchQuery)}`);
      }
    }
  };

  const features = [
    {
      icon: Shield,
      title: "No More Bias",
      description: "AI-powered analysis ensures you see both sides of every story, free from echo chambers."
    },
    {
      icon: Scale,
      title: "Both Sides Compared",
      description: "Side-by-side perspectives help you understand the complete picture, not just one narrative."
    },
    {
      icon: Sparkles,
      title: "AI-Verified Summaries",
      description: "Smart algorithms analyze sentiment and credibility to deliver balanced, trustworthy insights."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Decorative Line */}
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="w-24 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto mb-8"
            />

            <h1 className="font-serif font-bold text-5xl md:text-7xl lg:text-8xl text-[#1a1a1a] dark:text-white mb-6 tracking-tight">
              The Truth Has
              <br />
              <span className="bg-gradient-to-r from-[#d4af37] to-[#b8860b] bg-clip-text text-transparent">
                Two Sides
              </span>
            </h1>

            <p className="font-sans text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              Stop consuming one-sided news. Newsception shows you balanced perspectives 
              on every story, powered by AI analysis and editorial integrity.
            </p>

            {/* Hero Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="max-w-2xl mx-auto mb-8"
            >
              <form onSubmit={handleSearch} className="relative">
                <div className="neomorphic rounded-2xl p-2 bg-[#e8e8e8] dark:bg-[#1a1a1a]">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Search any topic... e.g., 'climate change', 'AI regulation'"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent border-none focus-visible:ring-0 font-sans text-[#1a1a1a] dark:text-white placeholder:text-gray-500"
                    />
                    <Button
                      type="submit"
                      className="neomorphic bg-[#e8e8e8] dark:bg-[#1a1a1a] text-[#b8860b] dark:text-[#d4af37] hover:scale-105 transition-transform"
                    >
                      <Search className="w-5 h-5 mr-2" />
                      Explore
                    </Button>
                  </div>
                </div>
              </form>
              <p className="text-xs font-sans text-gray-500 dark:text-gray-600 mt-3">
                Instant access to balanced perspectives on any topic
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                onClick={() => navigate(createPageUrl("Dashboard"))}
                size="lg"
                className="neomorphic bg-[#e8e8e8] dark:bg-[#1a1a1a] text-[#1a1a1a] dark:text-white font-sans px-8 py-6 text-lg hover:scale-105 transition-transform"
              >
                Explore Stories
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                onClick={() => base44.auth.redirectToLogin()}
                size="lg"
                variant="outline"
                className="neomorphic bg-[#e8e8e8] dark:bg-[#1a1a1a] border-2 border-[#d4af37] text-[#b8860b] dark:text-[#d4af37] font-sans px-8 py-6 text-lg hover:scale-105 transition-transform"
              >
                Sign In
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-[#d4af37] opacity-5 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-[#b8860b] opacity-5 blur-3xl" />
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif font-bold text-4xl md:text-5xl text-[#1a1a1a] dark:text-white mb-4">
              Why Newsception?
            </h2>
            <div className="w-16 h-[2px] bg-[#d4af37] mx-auto" />
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <div className="neomorphic rounded-3xl p-8 bg-[#e8e8e8] dark:bg-[#1a1a1a] h-full transition-all duration-300">
                  <div className="neomorphic w-16 h-16 rounded-2xl bg-[#e8e8e8] dark:bg-[#1a1a1a] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-8 h-8 text-[#b8860b] dark:text-[#d4af37]" />
                  </div>
                  <h3 className="font-serif font-bold text-2xl text-[#1a1a1a] dark:text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="font-sans text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-transparent to-[#d8d8d8] dark:to-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif font-bold text-4xl md:text-5xl text-[#1a1a1a] dark:text-white mb-4">
              How It Works
            </h2>
            <div className="w-16 h-[2px] bg-[#d4af37] mx-auto mb-6" />
            <p className="font-sans text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Three simple steps to balanced journalism
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-8">
            {[
              { step: "1", title: "Search Any Topic", desc: "Enter any news topic, event, or controversy you want to understand" },
              { step: "2", title: "AI Analysis", desc: "Our algorithm analyzes articles from multiple sources and perspectives" },
              { step: "3", title: "Compare Perspectives", desc: "View side-by-side summaries showing both sides of the story" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="flex gap-6 items-start"
              >
                <div className="neomorphic w-16 h-16 rounded-2xl bg-[#e8e8e8] dark:bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                  <span className="font-serif font-bold text-2xl text-[#b8860b] dark:text-[#d4af37]">
                    {item.step}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-serif font-bold text-xl text-[#1a1a1a] dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="font-sans text-gray-600 dark:text-gray-400">
                    {item.desc}
                  </p>
                </div>
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="neomorphic rounded-3xl p-12 bg-[#e8e8e8] dark:bg-[#1a1a1a] text-center"
          >
            <h2 className="font-serif font-bold text-3xl md:text-4xl text-[#1a1a1a] dark:text-white mb-4">
              Ready to See the Full Story?
            </h2>
            <p className="font-sans text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands discovering balanced perspectives every day
            </p>
            <Button
              onClick={() => navigate(createPageUrl("Dashboard"))}
              size="lg"
              className="neomorphic bg-[#e8e8e8] dark:bg-[#1a1a1a] text-[#b8860b] dark:text-[#d4af37] font-sans px-12 py-6 text-lg hover:scale-105 transition-transform"
            >
              Start Exploring Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}