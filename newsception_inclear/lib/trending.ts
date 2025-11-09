import { apiClient } from "./api-client";

interface LoadTrendingParams {
  city?: string;
  country?: string;
  limit?: number;
}

export interface TrendingTopic {
  headline: string;
  topic: string;
  trend_score: number;
}

export const FALLBACK_TRENDING_TOPICS: TrendingTopic[] = [
  { headline: "AI Regulation Debate", topic: "Technology", trend_score: 95 },
  { headline: "Climate Action Summit", topic: "Environment", trend_score: 88 },
  { headline: "Economic Policy Changes", topic: "Economy", trend_score: 82 },
  { headline: "Global Security Talks", topic: "Politics", trend_score: 79 },
  { headline: "Renewable Energy Surge", topic: "Energy", trend_score: 75 }
];

/**
 * Load trending topics for a location. Falls back to curated defaults if the API is unavailable.
 */
export async function loadTrendingTopics({
  city,
  country,
  limit = 5,
}: LoadTrendingParams): Promise<TrendingTopic[]> {
  const fallback = FALLBACK_TRENDING_TOPICS.slice(0, limit);

  try {
    const params: Record<string, string> = {};

    if (city) params.city = city;
    if (country) params.country = country;
    if (limit) params.limit = String(limit);

    // Use getTrendingTopics which is available in API client
    const response = await apiClient.getTrendingTopics(params);

    if (Array.isArray(response) && response.length > 0) {
      return response.map((item: any) => ({
        headline: item.headline ?? item.topic ?? "Trending Now",
        topic: item.topic ?? "General",
        trend_score: Number(item.trend_score ?? 75),
      }));
    }
  } catch (error) {
    console.warn("Falling back to default trending topics:", error);
  }

  return fallback;
}
