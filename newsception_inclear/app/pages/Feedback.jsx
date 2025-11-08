import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { ArrowLeft, Send, CheckCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function Feedback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [topic, setTopic] = useState("");
  const [formData, setFormData] = useState({
    was_helpful: null,
    felt_balanced: null,
    rating: 0,
    comments: "",
    user_email: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const topicParam = urlParams.get('topic');
    if (topicParam) {
      setTopic(topicParam);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await base44.entities.Feedback.create({
        topic: topic || "General Feedback",
        was_helpful: formData.was_helpful,
        felt_balanced: formData.felt_balanced,
        rating: formData.rating,
        comments: formData.comments,
        user_email: formData.user_email
      });

      setSubmitted(true);
      setTimeout(() => {
        navigate(createPageUrl("Dashboard"));
      }, 3000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }

    setIsSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="neomorphic w-24 h-24 rounded-full mx-auto mb-6 bg-[#e8e8e8] dark:bg-[#1a1a1a] flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="font-serif font-bold text-3xl text-[#1a1a1a] dark:text-white mb-4">
            Thank You!
          </h2>
          <p className="font-sans text-lg text-gray-600 dark:text-gray-400 mb-6">
            Your feedback helps us build better balanced perspectives
          </p>
          <p className="font-sans text-sm text-gray-500 dark:text-gray-500">
            Redirecting to dashboard...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Button
            onClick={() => navigate(createPageUrl("Dashboard"))}
            variant="ghost"
            className="font-sans text-gray-600 dark:text-gray-400 hover:text-[#b8860b] dark:hover:text-[#d4af37]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="font-serif font-bold text-4xl md:text-5xl text-[#1a1a1a] dark:text-white mb-4">
            Share Your Feedback
          </h1>
          <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto mb-6" />
          <p className="font-sans text-lg text-gray-600 dark:text-gray-400">
            Help us improve Newsception by sharing your experience
          </p>
          {topic && (
            <p className="font-sans text-sm text-gray-500 dark:text-gray-500 mt-2">
              Feedback for: <span className="font-semibold">{topic}</span>
            </p>
          )}
        </motion.div>

        {/* Feedback Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="neomorphic rounded-3xl p-8 md:p-12 bg-[#e8e8e8] dark:bg-[#1a1a1a] space-y-8">
            {/* Rating */}
            <div>
              <Label className="font-serif text-lg text-[#1a1a1a] dark:text-white mb-4 block">
                Rate Your Experience
              </Label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= formData.rating
                          ? "fill-[#d4af37] text-[#d4af37]"
                          : "text-gray-400 dark:text-gray-600"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Was Helpful */}
            <div>
              <Label className="font-serif text-lg text-[#1a1a1a] dark:text-white mb-4 block">
                Was this comparison helpful?
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, was_helpful: true })}
                  className={`py-4 rounded-2xl font-sans font-medium transition-all ${
                    formData.was_helpful === true
                      ? "neomorphic-pressed text-green-600 dark:text-green-400"
                      : "neomorphic text-gray-600 dark:text-gray-400 bg-[#e8e8e8] dark:bg-[#1a1a1a]"
                  }`}
                >
                  Yes, very helpful
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, was_helpful: false })}
                  className={`py-4 rounded-2xl font-sans font-medium transition-all ${
                    formData.was_helpful === false
                      ? "neomorphic-pressed text-red-600 dark:text-red-400"
                      : "neomorphic text-gray-600 dark:text-gray-400 bg-[#e8e8e8] dark:bg-[#1a1a1a]"
                  }`}
                >
                  Not helpful
                </button>
              </div>
            </div>

            {/* Felt Balanced */}
            <div>
              <Label className="font-serif text-lg text-[#1a1a1a] dark:text-white mb-4 block">
                Did both sides feel balanced?
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, felt_balanced: true })}
                  className={`py-4 rounded-2xl font-sans font-medium transition-all ${
                    formData.felt_balanced === true
                      ? "neomorphic-pressed text-green-600 dark:text-green-400"
                      : "neomorphic text-gray-600 dark:text-gray-400 bg-[#e8e8e8] dark:bg-[#1a1a1a]"
                  }`}
                >
                  Yes, balanced
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, felt_balanced: false })}
                  className={`py-4 rounded-2xl font-sans font-medium transition-all ${
                    formData.felt_balanced === false
                      ? "neomorphic-pressed text-red-600 dark:text-red-400"
                      : "neomorphic text-gray-600 dark:text-gray-400 bg-[#e8e8e8] dark:bg-[#1a1a1a]"
                  }`}
                >
                  Seemed biased
                </button>
              </div>
            </div>

            {/* Comments */}
            <div>
              <Label className="font-serif text-lg text-[#1a1a1a] dark:text-white mb-4 block">
                Additional Comments (Optional)
              </Label>
              <Textarea
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                placeholder="Share any thoughts, suggestions, or concerns..."
                className="neomorphic-inset bg-[#e8e8e8] dark:bg-[#1a1a1a] border-none font-sans min-h-32 text-[#1a1a1a] dark:text-white placeholder:text-gray-500"
              />
            </div>

            {/* Email */}
            <div>
              <Label className="font-serif text-lg text-[#1a1a1a] dark:text-white mb-4 block">
                Email (Optional)
              </Label>
              <Input
                type="email"
                value={formData.user_email}
                onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                placeholder="your.email@example.com"
                className="neomorphic-inset bg-[#e8e8e8] dark:bg-[#1a1a1a] border-none font-sans text-[#1a1a1a] dark:text-white placeholder:text-gray-500"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || formData.rating === 0}
              className="w-full neomorphic bg-[#e8e8e8] dark:bg-[#1a1a1a] text-[#b8860b] dark:text-[#d4af37] font-sans py-6 text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>Processing...</>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Submit Feedback
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}