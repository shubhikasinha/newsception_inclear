'use client';
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, Briefcase, Cpu, Beaker, Scale, Star, Check, Bell, Settings, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";

export default function Subscriptions() {
  const router = useRouter();
  const [userSubscriptions, setUserSubscriptions] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    topics_of_interest: [""],
    delivery_frequency: "daily",
    summary_format: "brief"
  });

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const subs = await apiClient.getSubscriptions();
      // Ensure we always set an array (apiClient may return an object or empty object)
      setUserSubscriptions(Array.isArray(subs) ? subs : []);
    } catch (error) {
      console.log("Error loading subscriptions, using empty state", error);
      setUserSubscriptions([]);
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

  const handleSubscribe = async (type: string) => {
    try {
      await apiClient.createSubscription({
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

  const handleUnsubscribe = async (subId: string) => {
    try {
      await apiClient.updateSubscription(subId, { active: false });
      loadSubscriptions();
    } catch (error) {
      console.error("Error unsubscribing:", error);
    }
  };

  const addTopicField = () => {
    setFormData({
      ...formData,
      topics_of_interest: [...formData.topics_of_interest, ""]
    });
  };

  const updateTopic = (index: number, value: string) => {
    const newTopics = [...formData.topics_of_interest];
    newTopics[index] = value;
    setFormData({ ...formData, topics_of_interest: newTopics });
  };

  return (
    <div className="min-h-screen py-12 bg-[#fafafa] dark:bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Link href="/dashboard">
            <Button
              variant="ghost"
              className="font-sans text-gray-600 dark:text-gray-400 hover:text-[#b8860b] dark:hover:text-[#d4af37]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="font-serif font-bold text-4xl md:text-5xl text-[#1a1a1a] dark:text-white mb-4">
            Subscription Center
          </h1>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto mb-6" />          <p className="font-sans text-lg text-gray-600 dark:text-gray-400">
            Get personalized news summaries delivered your way
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
            <h2 className="font-serif font-bold text-2xl text-[#1a1a1a] dark:text-white mb-6 flex items-center gap-2">
              <Bell className="w-6 h-6 text-[#d4af37]" />
              Your Active Subscriptions
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userSubscriptions.map((sub: any) => {
                const subType = subscriptionTypes.find(t => t.type === sub.subscription_type);
                return (
                  <div
                    key={sub.id}
                    className="neomorphic p-6 rounded-xl hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {subType && <subType.icon className="w-8 h-8 text-[#d4af37]" />}
                        <div>
                          <h3 className="font-serif font-bold text-lg text-[#1a1a1a] dark:text-white">
                            {subType?.name || sub.subscription_type}
                          </h3>
                          <Badge className="mt-1">{sub.delivery_frequency}</Badge>
                        </div>
                      </div>
                    </div>
                    {sub.topics_of_interest?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Topics:</p>
                        <div className="flex flex-wrap gap-2">
                          {sub.topics_of_interest.map((topic: string, i: number) => (
                            <span key={i} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <Button
                      onClick={() => handleUnsubscribe(sub.id)}
                      variant="outline"
                      className="w-full"
                    >
                      Unsubscribe
                    </Button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Subscription Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="font-serif font-bold text-2xl text-[#1a1a1a] dark:text-white mb-6">
            Available Subscriptions
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptionTypes.map((sub, index) => (
              <motion.div
                key={sub.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="group"
              >
                <div className="bg-white dark:bg-[#1a1a1a] border-2 border-gray-200 dark:border-gray-800 rounded-3xl p-6 h-full hover:border-[#d4af37] transition-all cursor-pointer"
                  onClick={() => setSelectedType(sub.type)}
                >
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${sub.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>                    <sub.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="font-serif font-bold text-xl text-[#1a1a1a] dark:text-white mb-2">
                    {sub.name}
                  </h3>

                  {/* Description */}
                  <p className="font-sans text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {sub.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2 mb-6">
                    {sub.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full bg-[#d4af37] hover:bg-[#b8860b] text-black"
                  >
                    Subscribe
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Subscription Modal */}
        {selectedType && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <h3 className="font-serif font-bold text-2xl text-[#1a1a1a] dark:text-white mb-6">
                Configure Subscription
              </h3>

              <div className="space-y-6">
                {/* Custom Topics (for custom type) */}
                {selectedType === "custom" && (
                  <div>
                    <Label className="font-serif text-lg mb-3 block">Topics of Interest</Label>
                    {formData.topics_of_interest.map((topic, index) => (
                      <Input
                        key={index}
                        value={topic}
                        onChange={(e) => updateTopic(index, e.target.value)}
                        placeholder="Enter topic..."
                        className="mb-2"
                      />
                    ))}
                    <Button
                      type="button"
                      onClick={addTopicField}
                      variant="outline"
                      className="w-full"
                    >
                      + Add Another Topic
                    </Button>
                  </div>
                )}

                {/* Delivery Frequency */}
                <div>
                  <Label className="font-serif text-lg mb-3 block">Delivery Frequency</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {['daily', 'weekly', 'monthly'].map((freq) => (
                      <button
                        key={freq}
                        type="button"
                        onClick={() => setFormData({ ...formData, delivery_frequency: freq })}
                        className={`py-3 rounded-lg font-sans capitalize ${
                          formData.delivery_frequency === freq
                            ? 'bg-[#d4af37] text-black'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {freq}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary Format */}
                <div>
                  <Label className="font-serif text-lg mb-3 block">Summary Format</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['brief', 'detailed'].map((format) => (
                      <button
                        key={format}
                        type="button"
                        onClick={() => setFormData({ ...formData, summary_format: format })}
                        className={`py-3 rounded-lg font-sans capitalize ${
                          formData.summary_format === format
                            ? 'bg-[#d4af37] text-black'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setSelectedType(null)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleSubscribe(selectedType)}
                    className="flex-1 bg-[#d4af37] hover:bg-[#b8860b] text-black"
                  >
                    Subscribe
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
