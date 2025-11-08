import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { CheckCircle, XCircle, AlertCircle, ThumbsUp, ThumbsDown, Trophy, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export default function FactCheckPanel({ claims, articleId, topic }) {
  const [factChecks, setFactChecks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [formData, setFormData] = useState({
    verdict: "",
    evidence: "",
    source_links: [""]
  });
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    loadFactChecks();
    loadUserPoints();
  }, [claims]);

  const loadFactChecks = async () => {
    try {
      const checks = await base44.entities.FactCheck.filter(
        { article_id: articleId },
        '-votes_helpful',
        50
      );
      setFactChecks(checks || []);
    } catch (error) {
      console.error("Error loading fact checks:", error);
    }
  };

  const loadUserPoints = async () => {
    try {
      const user = await base44.auth.me();
      const userChecks = await base44.entities.FactCheck.filter(
        { created_by: user.email },
        '-created_date',
        100
      );
      const points = userChecks.reduce((sum, check) => sum + (check.credibility_points || 0), 0);
      setUserPoints(points);
    } catch (error) {
      console.error("Error loading points:", error);
    }
  };

  const submitFactCheck = async (claim) => {
    if (!formData.verdict || !formData.evidence) return;

    try {
      const points = formData.source_links.filter(l => l.trim()).length * 10 + 20;
      
      await base44.entities.FactCheck.create({
        article_id: articleId,
        claim: claim.claim_text,
        user_verdict: formData.verdict,
        evidence: formData.evidence,
        source_links: formData.source_links.filter(l => l.trim()),
        credibility_points: points
      });

      setShowForm(false);
      setFormData({ verdict: "", evidence: "", source_links: [""] });
      loadFactChecks();
      loadUserPoints();
    } catch (error) {
      console.error("Error submitting fact check:", error);
    }
  };

  const voteOnFactCheck = async (checkId, isHelpful) => {
    try {
      const check = factChecks.find(c => c.id === checkId);
      if (!check) return;

      await base44.entities.FactCheck.update(checkId, {
        votes_helpful: isHelpful ? (check.votes_helpful || 0) + 1 : check.votes_helpful,
        votes_unhelpful: !isHelpful ? (check.votes_unhelpful || 0) + 1 : check.votes_unhelpful
      });

      loadFactChecks();
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const getVerdictIcon = (verdict) => {
    switch (verdict) {
      case "accurate": return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "false": return <XCircle className="w-5 h-5 text-red-600" />;
      case "misleading": return <AlertCircle className="w-5 h-5 text-orange-600" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getVerdictColor = (verdict) => {
    switch (verdict) {
      case "accurate": return "bg-green-600";
      case "false": return "bg-red-600";
      case "misleading": return "bg-orange-600";
      default: return "bg-gray-600";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#1a1a1a] border-2 border-[#1a1a1a] dark:border-[#333] p-6 md:p-8"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-serif font-bold text-2xl text-[#1a1a1a] dark:text-white mb-2">
            Community Fact-Checking
          </h3>
          <p className="font-serif text-sm text-gray-600 dark:text-gray-400">
            Help verify claims and earn credibility points
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#d4af37]/10 px-4 py-2 rounded-lg">
          <Trophy className="w-5 h-5 text-[#d4af37]" />
          <div className="text-right">
            <p className="font-serif text-xs text-gray-600 dark:text-gray-400">Your Points</p>
            <p className="font-serif font-bold text-lg text-[#d4af37]">{userPoints}</p>
          </div>
        </div>
      </div>

      {/* Claims List */}
      <div className="space-y-6">
        {claims?.slice(0, 5).map((claim, idx) => {
          const relatedChecks = factChecks.filter(fc => fc.claim === claim.claim_text);
          
          return (
            <div key={idx} className="border-2 border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-start gap-3 mb-3">
                <Badge className="bg-[#d4af37] text-black font-serif text-xs">
                  {claim.claim_type}
                </Badge>
                <p className="font-serif text-sm flex-1">{claim.claim_text}</p>
                {claim.verifiable && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedClaim(claim);
                      setShowForm(true);
                    }}
                    className="flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Fact Check
                  </Button>
                )}
              </div>

              {/* Existing Fact Checks */}
              {relatedChecks.length > 0 && (
                <div className="ml-0 mt-4 space-y-3 border-t pt-3">
                  <p className="font-serif text-xs text-gray-600 dark:text-gray-400 font-semibold">
                    {relatedChecks.length} Community Fact-Check{relatedChecks.length > 1 ? 's' : ''}
                  </p>
                  {relatedChecks.map((check, cidx) => (
                    <div key={cidx} className="bg-gray-50 dark:bg-[#0a0a0a] p-3 rounded">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getVerdictIcon(check.user_verdict)}
                          <Badge className={`${getVerdictColor(check.user_verdict)} text-white text-xs`}>
                            {check.user_verdict}
                          </Badge>
                          {check.verified_by_admin && (
                            <Badge variant="outline" className="text-xs">
                              ✓ Verified
                            </Badge>
                          )}
                        </div>
                        <p className="font-serif text-xs text-gray-500">
                          +{check.credibility_points} pts
                        </p>
                      </div>
                      <p className="font-serif text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {check.evidence}
                      </p>
                      {check.source_links && check.source_links.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {check.source_links.map((link, lidx) => (
                            <a
                              key={lidx}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-serif text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              Source {lidx + 1}
                            </a>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-xs">
                        <button
                          onClick={() => voteOnFactCheck(check.id, true)}
                          className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-green-600"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          {check.votes_helpful || 0}
                        </button>
                        <button
                          onClick={() => voteOnFactCheck(check.id, false)}
                          className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-red-600"
                        >
                          <ThumbsDown className="w-3 h-3" />
                          {check.votes_unhelpful || 0}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Fact Check Form Modal */}
      <AnimatePresence>
        {showForm && selectedClaim && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#1a1a1a] border-2 border-[#d4af37] p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <h3 className="font-serif font-bold text-xl mb-4">Submit Fact-Check</h3>
              <p className="font-serif text-sm text-gray-700 dark:text-gray-300 mb-4 p-3 bg-gray-100 dark:bg-gray-900">
                "{selectedClaim.claim_text}"
              </p>

              <div className="space-y-4">
                <div>
                  <label className="font-serif text-sm font-semibold mb-2 block">Your Verdict</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["accurate", "misleading", "false", "unverified"].map(v => (
                      <button
                        key={v}
                        onClick={() => setFormData({ ...formData, verdict: v })}
                        className={`p-3 border-2 font-serif text-sm ${
                          formData.verdict === v
                            ? "border-[#d4af37] bg-[#d4af37]/10"
                            : "border-gray-300 dark:border-gray-700"
                        }`}
                      >
                        {v.charAt(0).toUpperCase() + v.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-serif text-sm font-semibold mb-2 block">Evidence</label>
                  <Textarea
                    value={formData.evidence}
                    onChange={(e) => setFormData({ ...formData, evidence: e.target.value })}
                    placeholder="Explain your reasoning..."
                    className="font-serif"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="font-serif text-sm font-semibold mb-2 block">
                    Source Links (+10 pts each)
                  </label>
                  {formData.source_links.map((link, idx) => (
                    <Input
                      key={idx}
                      value={link}
                      onChange={(e) => {
                        const newLinks = [...formData.source_links];
                        newLinks[idx] = e.target.value;
                        setFormData({ ...formData, source_links: newLinks });
                      }}
                      placeholder="https://..."
                      className="font-serif mb-2"
                    />
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setFormData({ ...formData, source_links: [...formData.source_links, ""] })}
                  >
                    + Add Source
                  </Button>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => submitFactCheck(selectedClaim)}
                    disabled={!formData.verdict || !formData.evidence}
                    className="flex-1"
                  >
                    Submit (+{formData.source_links.filter(l => l.trim()).length * 10 + 20} pts)
                  </Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}