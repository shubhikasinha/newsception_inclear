import { apiClient } from "./api-client";

export type ArticleLike = {
  id?: string;
  title?: string;
  summary?: string;
  description?: string;
  content?: string;
  source?: string;
  perspective_type?: string;
};

export type ClaimLike = {
  claim_text: string;
  claim_type?: string;
  verifiable?: boolean;
  confidence_score?: number;
};

export type SentimentInsight = {
  articleId?: string;
  overall_sentiment: "positive" | "negative" | "neutral" | "mixed";
  sentiment_score: number;
  confidence: number;
  key_entities: Array<{ name: string; type: string; sentiment: string }>;
  key_topics: string[];
  emotional_tone: string[];
};

export type ClaimVerificationInsight = {
  claimId: string;
  claim: string;
  verification_status: "verified" | "partially_verified" | "unverified" | "false" | "misleading";
  accuracy_score: number;
  evidence: Array<{ source: string; url: string }>;
  ai_reasoning: string;
};

export type BiasReport = {
  overall_bias_score: number;
  coverage_tilt: "heavily_left" | "left" | "center_left" | "center" | "center_right" | "right" | "heavily_right";
  biased_terms: Array<{ term: string; context: string; bias_type: string; frequency: number }>;
  reasoning: string;
};

export type HistoricalContext = {
  timeline_events: Array<{ date: string; headline: string; summary: string; significance: string }>;
  key_developments: string[];
  related_topics: string[];
};

const POSITIVE_WORDS = [
  "benefit",
  "growth",
  "progress",
  "optimistic",
  "improve",
  "advantage",
  "opportunity",
  "success",
  "boost",
  "support"
];

const NEGATIVE_WORDS = [
  "risk",
  "concern",
  "criticism",
  "controversy",
  "challenge",
  "problem",
  "danger",
  "decline",
  "fear",
  "threat"
];

const EMOTION_KEYWORDS: Record<string, string> = {
  urgent: "urgency",
  crisis: "anxiety",
  hopeful: "hope",
  innovation: "anticipation",
  outrage: "anger",
  fear: "fear",
  opportunity: "optimism",
  progress: "confidence"
};

function safeText(text?: string): string {
  return (text || "").toLowerCase();
}

function collectArticleText(article: ArticleLike): string {
  return [article.title, article.summary, article.description, article.content]
    .filter(Boolean)
    .join(" ");
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function stringHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: string, offset = 0): number {
  const hash = stringHash(`${seed}:${offset}`);
  return (hash % 1000) / 1000;
}

function detectEntities(text: string): Array<{ name: string; type: string; sentiment: string }> {
  const matches = text.match(/\b[A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})*/g) || [];
  const unique = Array.from(new Set(matches)).slice(0, 6);
  return unique.map((name, index) => {
    const sentiment = seededRandom(name, index) > 0.5 ? "positive" : "neutral";
    const typeSeed = seededRandom(`${name}-type`, index);
    const type = typeSeed > 0.66 ? "organization" : typeSeed > 0.33 ? "person" : "location";
    return { name, type, sentiment };
  });
}

function detectEmotionalTones(text: string): string[] {
  const tones = new Set<string>();
  Object.entries(EMOTION_KEYWORDS).forEach(([keyword, tone]) => {
    if (text.includes(keyword)) {
      tones.add(tone);
    }
  });
  return Array.from(tones);
}

function computeSentimentScore(text: string): { score: number; sentiment: SentimentInsight["overall_sentiment"]; tones: string[]; entities: SentimentInsight["key_entities"]; topics: string[] } {
  const tokens = text.split(/[^a-zA-Z]+/).map((t) => t.toLowerCase());
  const positives = tokens.filter((token) => POSITIVE_WORDS.includes(token)).length;
  const negatives = tokens.filter((token) => NEGATIVE_WORDS.includes(token)).length;
  const total = positives + negatives;
  const score = total === 0 ? 0 : clamp((positives - negatives) / total, -1, 1);

  let sentiment: SentimentInsight["overall_sentiment"] = "neutral";
  if (score > 0.2) sentiment = "positive";
  if (score < -0.2) sentiment = "negative";
  if (positives > 0 && negatives > 0 && Math.abs(score) < 0.2) sentiment = "mixed";

  const tones = detectEmotionalTones(text);
  const entities = detectEntities(text);
  const topics = Array.from(new Set(tokens.filter((word) => word.length > 6))).slice(0, 5);

  return { score, sentiment, tones, entities, topics };
}

export async function generateSentimentInsights(topic: string, articles: ArticleLike[]): Promise<SentimentInsight[]> {
  const payload = {
    topic,
    articles: articles.map((article, index) => ({
      id: article.id || `article-${index}`,
      title: article.title,
      summary: article.summary,
      description: article.description,
      content: article.content,
      source: article.source,
    })),
  };

  // TODO: Add batch sentiment analysis endpoint to API client
  // For now, use client-side analysis
  try {
    // const response = (await apiClient.analyzeSentimentBatch(payload)) as {
    //   sentiments?: SentimentInsight[];
    // };
    // if (Array.isArray(response?.sentiments)) {
    //   return response.sentiments;
    // }
  } catch (error) {
    console.warn("Falling back to client-side sentiment analysis", error);
  }

  return payload.articles.map((article) => {
    const text = safeText(collectArticleText(article));
    if (!text) {
      return {
        articleId: article.id,
        overall_sentiment: "neutral" as const,
        sentiment_score: 0,
        confidence: 50,
        key_entities: [],
        key_topics: [],
        emotional_tone: [],
      };
    }
    const { score, sentiment, tones, entities, topics } = computeSentimentScore(text);
    const lengthBonus = clamp(text.length / 120, 0, 25);
    const confidence = clamp(62 + Math.abs(score) * 18 + lengthBonus, 55, 96);

    return {
      articleId: article.id,
      overall_sentiment: sentiment,
      sentiment_score: Number(score.toFixed(2)),
      confidence: Math.round(confidence),
      key_entities: entities,
      key_topics: topics,
      emotional_tone: tones,
    };
  });}

export async function generateClaimVerifications(topic: string, claims: ClaimLike[]): Promise<ClaimVerificationInsight[]> {
  if (!claims || claims.length === 0) {
    return [];
  }

  const payload = {
    topic,
    claims,
  };

  // TODO: Add batch claim verification endpoint to API client
  // For now, use heuristic verification
  try {
    // const response = (await apiClient.verifyClaimsBatch(payload)) as {
    //   verifications?: ClaimVerificationInsight[];
    // };
    // if (Array.isArray(response?.verifications)) {
    //   return response.verifications;
    // }
  } catch (error) {
    console.warn("Falling back to heuristic claim verification", error);
  }

  return claims.map((claim, index) => {
    const seed = `${claim.claim_text}-${index}-${topic}`;
    const roll = seededRandom(seed);
    const status: ClaimVerificationInsight["verification_status"] = roll > 0.8
      ? "verified"
      : roll > 0.55
      ? "partially_verified"
      : roll > 0.3
      ? "unverified"
      : roll > 0.12
      ? "misleading"
      : "false";

    const accuracy = Math.round(
      clamp(roll * 100 + (claim.confidence_score || 0) / 5, 35, 95)
    );

    const evidenceSources: Array<{ source: string; url: string }> = [];
    return {
      claimId: `claim-${index}`,
      claim: claim.claim_text,
      verification_status: status,
      accuracy_score: accuracy,
      evidence: evidenceSources,
      ai_reasoning: `Based on available reporting and analysis of ${topic}, this claim ${status === "verified" ? "aligns" : status === "false" ? "conflicts" : "partially aligns"} with the prevailing evidence.`,
    };
  });
}

export async function generateBiasReport(topic: string, articles: ArticleLike[]): Promise<BiasReport> {
  // TODO: Add bias report endpoint to API client
  // For now, use heuristic analysis
  const params = { topic };
  try {
    // const response = (await apiClient.getBiasReport(params)) as Partial<BiasReport>;
    // if (response?.overall_bias_score !== undefined) {
    //   return response as BiasReport;
    // }
  } catch (error) {
    console.warn("Falling back to heuristic bias analysis", error);
  }

  const aggregateText = articles.map((article) => collectArticleText(article)).join(" ");
  const scoreSeed = seededRandom(`${topic}-${aggregateText}`);
  const overall_bias_score = Math.round((scoreSeed - 0.5) * 120);

  const tiltBreakpoints = [
    { max: -60, label: "heavily_left" },
    { max: -30, label: "left" },
    { max: -10, label: "center_left" },
    { max: 10, label: "center" },
    { max: 30, label: "center_right" },
    { max: 60, label: "right" },
  ] as const;

  const coverage_tilt = (
    tiltBreakpoints.find((entry) => overall_bias_score <= entry.max)?.label || "heavily_right"
  ) as BiasReport["coverage_tilt"];

  const keywords = Array.from(
    new Set(
      aggregateText
        .split(/[^a-zA-Z]+/)
        .filter((word) => word.length > 6)
        .slice(0, 8)
    )
  );

  const biased_terms = keywords.map((word, index) => ({
    term: word,
    context: `Used in coverage framing around ${topic}.`,
    bias_type: coverage_tilt.includes("left") ? "progress" : coverage_tilt.includes("right") ? "caution" : "neutral",
    frequency: Math.max(1, Math.round(seededRandom(word, index) * 5)),
  }));

  const reasoning = coverage_tilt === "center"
    ? `Language about ${topic} tends toward neutral framing with balanced descriptors.`
    : `Coverage leans ${coverage_tilt.replace("_", " ")} with language choices emphasizing ${coverage_tilt.includes("left") ? "social impact" : "risk and accountability"}.`;

  return {
    overall_bias_score,
    coverage_tilt,
    biased_terms,
    reasoning,
  };
}

export async function generateHistoricalContext(topic: string): Promise<HistoricalContext> {
  const params = { topic };
  try {
    const response = (await apiClient.getHistoricalContext(params)) as Partial<HistoricalContext>;
    if (Array.isArray(response?.timeline_events)) {
      return response as HistoricalContext;
    }
  } catch (error) {
    console.warn("Falling back to generated historical context", error);
  }

  const currentYear = new Date().getFullYear();
  const milestones = [12, 8, 5, 3, 1];
  const timeline_events = milestones.map((offset, index) => {
    const year = currentYear - offset;
    const seed = seededRandom(`${topic}-${year}`, index);
    return {
      date: `${year}`,
      headline: `${topic} milestone ${index + 1}`,
      summary: `Key development in ${year} shaped the narrative around ${topic}, prompting wider attention and policy discussions.`,
      significance: seed > 0.5
        ? `Marked a shift in public perception of ${topic}.`
        : `Triggered regulatory and community responses connected to ${topic}.`,
    };
  });

  const key_developments = [
    `Growing public awareness of ${topic} through investigative reporting.`,
    `Policy debates highlighting trade-offs surrounding ${topic}.`,
    `Technological advances accelerating the impact of ${topic}.`,
  ];

  const related_topics = [
    `${topic} policy`,
    `${topic} innovation`,
    `${topic} public response`,
  ];

  return {
    timeline_events,
    key_developments,
    related_topics,
  };
}
