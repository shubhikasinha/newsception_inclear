'use client';

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Brain, CheckCircle, RefreshCw, Shield, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  generateClaimVerifications,
  type ClaimLike,
  type ClaimVerificationInsight,
} from "@/lib/insights";

interface FactCheckPanelProps {
  claims?: ClaimLike[];
  articleId?: string;
  topic?: string;
}

type ClaimVerdict = ClaimVerificationInsight["verification_status"];

type FactCheckEntry = {
  id: string;
  claim: string;
  status: ClaimVerdict;
  accuracy: number;
  reasoning: string;
  sources: ClaimVerificationInsight["evidence"];
};

const VERDICT_META: Record<ClaimVerdict, { label: string; color: string; icon: React.ReactElement }> = {
  verified: {
    label: "Verified",
    color: "bg-green-600",
    icon: <CheckCircle className="w-5 h-5 text-green-600" />,
  },
  partially_verified: {
    label: "Partially Verified",
    color: "bg-blue-600",
    icon: <CheckCircle className="w-5 h-5 text-blue-600" />,
  },
  unverified: {
    label: "Unverified",
    color: "bg-gray-600",
    icon: <AlertCircle className="w-5 h-5 text-gray-600" />,
  },
  misleading: {
    label: "Misleading",
    color: "bg-orange-600",
    icon: <AlertCircle className="w-5 h-5 text-orange-600" />,
  },
  false: {
    label: "False",
    color: "bg-red-600",
    icon: <XCircle className="w-5 h-5 text-red-600" />,
  },
};

const DEFAULT_VERIFICATION: FactCheckEntry = {
  id: "unknown",
  claim: "",
  status: "unverified",
  accuracy: 0,
  reasoning: "This claim has not been fully evaluated yet.",
  sources: [],
};

export default function FactCheckPanel({
  claims = [],
  articleId,
  topic,
}: FactCheckPanelProps) {
  const [verifications, setVerifications] = useState<FactCheckEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const claimKey = useMemo(() => JSON.stringify(claims.map((claim) => claim.claim_text || "")), [claims]);
  useEffect(() => {
    if (!claims.length) {
      setVerifications([]);
      return;
    }

    let isMounted = true;
    const runVerification = async () => {
      setIsLoading(true);
      try {
        const results = await generateClaimVerifications(topic || "", claims);
        if (!isMounted) return;
        if (results.length) {
          setVerifications(
            results.map((item, index) => ({
              id: item.claimId || (articleId ? `${articleId}-${index}` : `claim-${index}`),
              claim: item.claim || claims[index]?.claim_text || `Claim ${index + 1}`,
              status: item.verification_status,
              accuracy: item.accuracy_score ?? 0,
              reasoning: item.ai_reasoning,
              sources: Array.isArray(item.evidence) ? item.evidence : [],
            }))
          );
        } else {
          setVerifications(
            claims.map((claim, index) => ({
              ...DEFAULT_VERIFICATION,
              id: claim.claim_text
                ? articleId
                  ? `${articleId}-${index}`
                  : `claim-${index}`
                : `claim-${index}-${Date.now()}`,
              claim: claim.claim_text || claim.claim_type || "Unknown claim",
            }))
          );
        }
        setLastUpdated(new Date());
      } catch (error) {
        console.error("Error generating claim verifications:", error);
        if (isMounted) {
          setVerifications(
            claims.map((claim, index) => ({
              ...DEFAULT_VERIFICATION,
              id: claim.claim_text
                ? articleId
                  ? `${articleId}-${index}`
                  : `claim-${index}`
                : `claim-${index}-${Date.now()}`,
              claim: claim.claim_text || claim.claim_type || "Unknown claim",
              reasoning: "Failed to verify this claim. Please try refreshing or check back later.",
            }))
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    runVerification();

    return () => {
      isMounted = false;
    };
  }, [articleId, topic, claimKey, claims, refreshKey]);

  const handleRefresh = () => {
    setLastUpdated(null);
    setRefreshKey((key) => key + 1);
  };

  if (!claims.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1a1a1a] border-2 border-[#1a1a1a] dark:border-[#333] p-6 text-center"
      >
        <Shield className="w-8 h-8 mx-auto mb-3 text-[#d4af37]" />
        <p className="font-serif text-sm text-gray-600 dark:text-gray-400">
          No fact-checkable claims detected in this article.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#1a1a1a] border-2 border-[#1a1a1a] dark:border-[#333] p-6 md:p-8"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-serif font-bold text-2xl text-[#1a1a1a] dark:text-white mb-2">
            Fact-Check Overview
          </h3>
          <p className="font-serif text-sm text-gray-600 dark:text-gray-400">
            AI-assisted verification of prominent claims
          </p>
          {lastUpdated && (
            <p className="font-serif text-xs text-gray-500 mt-1">
              Updated {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          className="font-serif flex items-center gap-2"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className="w-4 h-4" />
          Re-run
        </Button>
      </div>

      {isLoading ? (
        <div className="bg-gray-50 dark:bg-[#0a0a0a] border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center">
          <Brain className="w-6 h-6 mx-auto mb-3 animate-pulse text-[#d4af37]" />
          <p className="font-serif text-sm text-gray-600 dark:text-gray-400">
            Evaluating claims against trusted sources...
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {verifications.map((verification) => {
            const verdict = VERDICT_META[verification.status] || VERDICT_META.unverified;
            const confidence = Math.max(0, Math.min(100, Math.round(verification.accuracy || 0)));
            const sources = Array.isArray(verification.sources) ? verification.sources : [];
            const hasSources = sources.length > 0;

            return (
              <div key={verification.id} className="border-2 border-gray-200 dark:border-gray-800 p-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 border-2 border-[#d4af37] flex items-center justify-center shrink-0">
                      {verdict.icon}
                    </div>
                    <div>
                      <Badge className={`${verdict.color} text-white font-serif text-xs mb-2`}>
                        {verdict.label}
                      </Badge>
                      <p className="font-serif text-sm text-gray-800 dark:text-gray-200">
                        {verification.claim}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-xs text-gray-500">Confidence</p>
                    <p className="font-serif font-bold text-lg text-[#d4af37]">{confidence}%</p>
                  </div>
                </div>

                <p className="font-serif text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                  {verification.reasoning}
                </p>

                {hasSources && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {sources.slice(0, 6).map((source, sourceIndex) => (
                      <Badge
                        key={`${verification.id}-badge-${sourceIndex}`}
                        variant="outline"
                        className="text-xs font-serif"
                      >
                        {source.source || "Referenced source"}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-300 dark:border-yellow-900 p-4 rounded">
        <p className="font-serif text-xs text-yellow-800 dark:text-yellow-200">
          <span className="font-bold">Reminder:</span> Fact-check insights combine available reporting with AI reasoning.
          Always review the provided sources when forming conclusions.
        </p>
      </div>
    </motion.div>
  );
}
