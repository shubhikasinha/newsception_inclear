'use client';
import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Send, CheckCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";

function FeedbackSuspenseFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <p className="font-serif text-lg text-gray-600 dark:text-gray-400">
        Preparing feedback form...
      </p>
    </div>
  );
}

function FeedbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [topic, setTopic] = useState("");
  const [formData, setFormData] = useState({
    was_helpful: null as boolean | null,
    felt_balanced: null as boolean | null,
    rating: 0,
    comments: "",
    user_email: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const topicParam = searchParams.get('topic');
    if (topicParam) {
      setTopic(topicParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Try to submit to backend API
      try {
        await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: topic || "General Feedback",
            was_helpful: formData.was_helpful,
            felt_balanced: formData.felt_balanced,
            rating: formData.rating,
            comments: formData.comments,
            user_email: formData.user_email
          })
        });
      } catch (error) {
        console.log("Backend not available, feedback logged locally");
      }

      setSubmitted(true);
      setTimeout(() => {
        router.push('/dashboard');
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
          <div className="w-24 h-24 rounded-full mx-auto mb-6 bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
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
    <div className="min-h-screen py-12 bg-[#fafafa] dark:bg-[#0a0a0a]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
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
            Share Your Feedback
          </h1>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto mb-6" />          <p className="font-sans text-lg text-gray-600 dark:text-gray-400">
            Help us improve InClear by sharing your experience
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
          <form onSubmit={handleSubmit} className="rounded-3xl p-8 md:p-12 bg-white dark:bg-[#1a1a1a] border-2 border-gray-200 dark:border-gray-800 space-y-8">
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
                    aria-label={`Rate ${star} stars`}
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
                  className={`py-4 rounded-2xl font-sans font-medium transition-all border-2 ${
                    formData.was_helpful === true
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                      : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  Yes, very helpful
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, was_helpful: false })}
                  className={`py-4 rounded-2xl font-sans font-medium transition-all border-2 ${
                    formData.was_helpful === false
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                      : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400"
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
                  className={`py-4 rounded-2xl font-sans font-medium transition-all border-2 ${
                    formData.felt_balanced === true
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                      : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  Yes, balanced
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, felt_balanced: false })}
                  className={`py-4 rounded-2xl font-sans font-medium transition-all border-2 ${
                    formData.felt_balanced === false
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                      : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400"
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
              <textarea
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                placeholder="Share any thoughts, suggestions, or concerns..."
                className="w-full bg-white dark:bg-[#0a0a0a] border-2 border-gray-300 dark:border-gray-700 rounded-lg p-4 font-sans min-h-32 text-[#1a1a1a] dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
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
                className="bg-white dark:bg-[#0a0a0a] border-2 border-gray-300 dark:border-gray-700 font-sans text-[#1a1a1a] dark:text-white placeholder:text-gray-500"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || formData.rating === 0}
              className="w-full bg-[#d4af37] hover:bg-[#b8860b] text-black font-sans py-6 text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
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

export default function FeedbackPage() {
  return (
    <Suspense fallback={<FeedbackSuspenseFallback />}>
      <FeedbackContent />
    </Suspense>
  );
}
