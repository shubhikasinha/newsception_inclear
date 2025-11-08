import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { BookOpen, Briefcase, Cpu, Beaker, Scale, Star, Check, Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Subscriptions() {
  const navigate = useNavigate();
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({
    topics_of_interest: [""],
    delivery_frequency: "daily",
    summary_format: "brief"
  });

  useEffect(() => {
    checkAuth();
    loadSubscriptions();
  }, []);

  const checkAuth = async () => {
    const authenticated = await base44.auth.isAuthenticated();
    if (!authenticated) {
      base44.auth.redirectToLogin(createPageUrl("Subscriptions"));
    }
  };

  const loadSubscriptions = async () => {
    try {
      const user = await base44.auth.me();
      const subs = await base44.entities.Subscription.filter(
        { user_id: user.id },
        '-created_date',
        10
      );
      setUserSubscriptions(subs || []);
    } catch (error) {
      console.error("Error loading subscriptions:", error);
    }
  };

  const subscriptionTypes = [
    {
      type: "upsc",
      name: "UPSC Exam Prep",
      icon: BookOpen,
      color: "from-blue-500 to-blue-700",
      description: "Curated current affairs summaries focused on UPSC syllabus",
      features: [
        "Daily news relevant to GS papers",
        "Topic-wise categorization",
        "Monthly compilations",
        "Exam-focused analysis"
      ]
    },
    {
      type: "business",
      name: "Business & Finance",
      icon: Briefcase,
      color: "from-green-500 to-green-700",
      description: "Market insights, economic trends, and corporate news",
      features: [
        "Market analysis",
        "Corporate developments",
        "Economic indicators",
        "Global trade updates"
      ]
    },
    {
      type: "technology",
      name: "Technology & Innovation",
      icon: Cpu,
      color: "from-purple-500 to-purple-700",
      description: "Latest in tech, AI, startups, and digital transformation",
      features: [
        "AI & ML developments",
        "Startup ecosystem",
        "Tech policy",
        "Innovation trends"
      ]
    },
    {
      type: "policy",
      name: "Policy & Governance",
      icon: Scale,
      color: "from-indigo-500 to-indigo-700",
      description: "Government policies, regulations, and public affairs",
      features: [
        "Policy changes",
        "Regulatory updates",
        "Government schemes",
        "Public administration"
      ]
    },
    {
      type: "science",
      name: "Science & Environment",
      icon: Beaker,
      color: "from-teal-500 to-teal-700",
      description: "Scientific research, climate, and environmental news",
      features: [
        "Research breakthroughs",
        "Climate updates",
        "Space exploration",
        "Health & medicine"
      ]
    },
    {
      type: "custom",
      name: "Custom Topics",
      icon: Star,
      color: "from-yellow-500 to-yellow-700",
      description: "Build your own personalized news feed",
      features: [
        "Choose specific topics",
        "Custom frequency",
        "Flexible format",
        "Multi-topic coverage"
      ]
    }
  ];

  const handleSubscribe = async (type) => {
    try {
      const user = await base44.auth.me();
      
      await base44.entities.Subscription.create({
        user_id: user.id,
        subscription_type: type,
        topics_of_interest: formData.topics_of_interest.filter(t => t.trim()),
        delivery_frequency: formData.delivery_frequency,
        summary_format: formData.summary_format,
        active: true
      });

      setSelectedType(null);
      setFormData({
        topics_of_interest: [""],
        delivery_frequency: "daily",
        summary_format: "brief"
      });
      loadSubscriptions();
    } catch (error) {
      console.error("Error subscribing:", error);
    }
  };

  const toggleSubscription = async (subId, currentStatus) => {
    try {
      await base44.entities.Subscription.update(subId, {
        active: !currentStatus
      });
      loadSubscriptions();
    } catch (error) {
      console.error("Error toggling subscription:", error);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="font-serif font-bold text-4xl md:text-5xl text-[#1a1a1a] dark:text-white mb-4">
            Specialized Subscriptions
          </h1>
          <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto mb-6" />
          <p className="font-serif text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Get curated, balanced news summaries tailored to your specific interests
          </p>
        </motion.div>

        {/* Active Subscriptions */}
        {userSubscriptions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-[#d4af37]" />
              <h2 className="font-serif font-bold text-2xl text-[#1a1a1a] dark:text-white">
                Your Subscriptions
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {userSubscriptions.map((sub, idx) => {
                const subType = subscriptionTypes.find(t => t.type === sub.subscription_type);
                return (
                  <div
                    key={idx}
                    className="neomorphic rounded-2xl p-6 bg-[#e8e8e8] dark:bg-[#1a1a1a] flex items-start justify-between"
                  >
                    <div className="flex items-start gap-4">
                      {subType && (
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${subType.color} flex items-center justify-center`}>
                          <subType.icon className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-serif font-bold text-lg mb-1">
                          {subType?.name || sub.subscription_type}
                        </h3>
                        <p className="font-serif text-sm text-gray-600 dark:text-gray-400">
                          {sub.delivery_frequency} • {sub.summary_format}
                        </p>
                        {sub.topics_of_interest && sub.topics_of_interest.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {sub.topics_of_interest.slice(0, 3).map((topic, tidx) => (
                              <Badge key={tidx} variant="outline" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => toggleSubscription(sub.id, sub.active)}
                      variant={sub.active ? "default" : "outline"}
                      size="sm"
                    >
                      {sub.active ? "Active" : "Paused"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Available Subscriptions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptionTypes.map((sub, index) => {
            const isSubscribed = userSubscriptions.some(
              s => s.subscription_type === sub.type && s.active
            );

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="group"
              >
                <div className="neomorphic rounded-3xl p-8 bg-[#e8e8e8] dark:bg-[#1a1a1a] h-full flex flex-col hover:shadow-xl transition-all">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${sub.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <sub.icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="font-serif font-bold text-xl text-[#1a1a1a] dark:text-white mb-3">
                    {sub.name}
                  </h3>

                  <p className="font-serif text-sm text-gray-600 dark:text-gray-400 mb-6">
                    {sub.description}
                  </p>

                  <ul className="space-y-2 mb-6 flex-1">
                    {sub.features.map((feature, fidx) => (
                      <li key={fidx} className="flex items-start gap-2 font-serif text-sm text-gray-700 dark:text-gray-300">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => setSelectedType(sub.type)}
                    disabled={isSubscribed}
                    className="w-full neomorphic bg-[#e8e8e8] dark:bg-[#1a1a1a] text-[#b8860b] dark:text-[#d4af37] hover:scale-105 transition-transform"
                  >
                    {isSubscribed ? "Subscribed" : "Subscribe"}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Subscription Form Modal */}
        {selectedType && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-[#1a1a1a] border-2 border-[#d4af37] p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <h2 className="font-serif font-bold text-2xl mb-6">
                Configure Your Subscription
              </h2>

              <div className="space-y-6">
                {/* Topics */}
                <div>
                  <Label className="font-serif text-sm font-semibold mb-3 block">
                    Topics of Interest
                  </Label>
                  {formData.topics_of_interest.map((topic, idx) => (
                    <Input
                      key={idx}
                      value={topic}
                      onChange={(e) => {
                        const newTopics = [...formData.topics_of_interest];
                        newTopics[idx] = e.target.value;
                        setFormData({ ...formData, topics_of_interest: newTopics });
                      }}
                      placeholder="e.g., Climate Policy, AI Ethics..."
                      className="mb-2 font-serif"
                    />
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setFormData({
                      ...formData,
                      topics_of_interest: [...formData.topics_of_interest, ""]
                    })}
                  >
                    + Add Topic
                  </Button>
                </div>

                {/* Frequency */}
                <div>
                  <Label className="font-serif text-sm font-semibold mb-3 block">
                    Delivery Frequency
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {["daily", "weekly", "real_time"].map(freq => (
                      <button
                        key={freq}
                        onClick={() => setFormData({ ...formData, delivery_frequency: freq })}
                        className={`p-3 border-2 font-serif text-sm ${
                          formData.delivery_frequency === freq
                            ? "border-[#d4af37] bg-[#d4af37]/10"
                            : "border-gray-300 dark:border-gray-700"
                        }`}
                      >
                        {freq.replace("_", " ").charAt(0).toUpperCase() + freq.slice(1).replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Format */}
                <div>
                  <Label className="font-serif text-sm font-semibold mb-3 block">
                    Summary Format
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {["brief", "detailed", "exam_focused"].map(format => (
                      <button
                        key={format}
                        onClick={() => setFormData({ ...formData, summary_format: format })}
                        className={`p-3 border-2 font-serif text-sm ${
                          formData.summary_format === format
                            ? "border-[#d4af37] bg-[#d4af37]/10"
                            : "border-gray-300 dark:border-gray-700"
                        }`}
                      >
                        {format.replace("_", " ").charAt(0).toUpperCase() + format.slice(1).replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => handleSubscribe(selectedType)}
                    className="flex-1"
                  >
                    Confirm Subscription
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedType(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}