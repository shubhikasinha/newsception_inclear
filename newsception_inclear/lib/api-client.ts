/**
 * API Client for communicating with the backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | null | undefined>;
  auth?: boolean;
}

type CachedToken = {
  token: string;
  expiresAt: number;
};

let cachedToken: CachedToken | null = null;

async function fetchAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") {
    return null;
  }

  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  try {
    const response = await fetch("/api/auth/token", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data?.token) {
      const ttlSeconds = typeof data.expiresIn === "number" ? data.expiresIn : 300;
      cachedToken = {
        token: data.token,
        expiresAt: Date.now() + ttlSeconds * 1000 - 5000,
      };
      return data.token;
    }
  } catch (error) {
    console.warn("Failed to retrieve Auth0 token", error);
  }

  return null;
}

class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | null | undefined>) {
    if (!params) {
      return `${this.baseURL}${endpoint}`;
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.set(key, String(value));
      }
    });

    const query = searchParams.toString();
    return query ? `${this.baseURL}${endpoint}?${query}` : `${this.baseURL}${endpoint}`;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, auth, method = "GET", body, ...rest } = options;

    const url = this.buildUrl(endpoint, params);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(rest.headers as Record<string, string> | undefined),
    };

    if (auth) {
      const token = await fetchAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    const response = await fetch(url, {
      ...rest,
      method,
      body,
      headers,
      credentials: auth ? "include" : rest.credentials,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Request failed" }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // News endpoints
  async searchNews(topic: string, location?: string) {
    return this.request("/news/search", {
      params: { topic, location },
    });
  }

  async getTrendingTopics(params?: Record<string, string>) {
    return this.request("/news/trending", { params });
  }

  async getNewsFeed(params?: Record<string, string | number>) {
    return this.request("/articles/feed/items", { params });
  }

  // Article endpoints
  async getArticle(id: string) {
    return this.request(`/articles/${id}`);
  }

  // Analysis endpoints
  async getHistoricalContext(params?: Record<string, string>) {
    return this.request("/analysis/historical", { params });
  }

  async comparePerspectives(topic: string, location?: string, forceRefresh?: boolean) {
    return this.request("/analysis/compare", {
      method: "POST",
      body: JSON.stringify({ topic, location, forceRefresh }),
    });
  }

  // Debate endpoints
  async getDebateRooms() {
    return this.request("/debate/rooms");
  }

  async getDebateRequests(topic: string) {
    return this.request("/debate/requests", {
      params: { topic },
    });
  }

  async requestDebate(data: any) {
    return this.request("/debate/request", {
      method: "POST",
      body: JSON.stringify(data),
      auth: true,
    });
  }

  async createDebateRoom(data: any) {
    return this.request("/debate/rooms", {
      method: "POST",
      body: JSON.stringify(data),
      auth: true,
    });
  }

  async joinDebateRoom(roomId: string, side: string) {
    return this.request(`/debate/room/${roomId}/join`, {
      method: "POST",
      body: JSON.stringify({ side }),
      auth: true,
    });
  }

  // User endpoints
  async getUserPreferences() {
    return this.request("/user/preferences", { auth: true });
  }

  async updateUserPreferences(preferences: any) {
    return this.request("/user/preferences", {
      method: "PUT",
      body: JSON.stringify(preferences),
      auth: true,
    });
  }

  // Subscription endpoints
  async getSubscriptions() {
    return this.request("/subscriptions", { auth: true });
  }

  async createSubscription(data: any) {
    return this.request("/subscriptions", {
      method: "POST",
      body: JSON.stringify(data),
      auth: true,
    });
  }

  async updateSubscription(id: string, data: any) {
    return this.request(`/subscriptions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      auth: true,
    });
  }

  async deleteSubscription(id: string) {
    return this.request(`/subscriptions/${id}`, {
      method: "DELETE",
      auth: true,
    });
  }

  // Fact-check endpoints
  async getFactChecks(articleId: string) {
    return this.request(`/fact-check/${articleId}`);
  }

  async createFactCheck(data: any) {
    return this.request("/fact-check", {
      method: "POST",
      body: JSON.stringify(data),
      auth: true,
    });
  }

  async voteOnFactCheck(id: string, data: any) {
    return this.request(`/fact-check/${id}/vote`, {
      method: "POST",
      body: JSON.stringify(data),
      auth: true,
    });
  }
}

export const apiClient = new APIClient(API_BASE_URL);
