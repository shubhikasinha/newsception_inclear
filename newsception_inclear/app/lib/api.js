// API client for backend integration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async getAccessToken() {
    // Get Auth0 access token from session
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        return data.accessToken;
      }
    } catch (error) {
      console.error('Error getting access token:', error);
    }
    return null;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get Auth0 token if available
    const token = await this.getAccessToken();
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `API Error: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // News endpoints
  async searchNews(topic, location = null) {
    const params = new URLSearchParams({ topic });
    if (location) params.append('location', location);
    return this.request(`/api/news/search?${params}`);
  }

  async getTrendingTopics(location = null) {
    const params = location ? `?location=${location}` : '';
    return this.request(`/api/news/trending${params}`);
  }

  // Article endpoints
  async getArticle(id) {
    return this.request(`/api/articles/${id}`);
  }

  async getNewsFeed(page = 1, limit = 10, location = null, category = null) {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (location) params.append('location', location);
    if (category) params.append('category', category);
    return this.request(`/api/articles/feed/items?${params}`);
  }

  // Analysis endpoints
  async getHistoricalContext(topic) {
    return this.request(`/api/analysis/historical?topic=${encodeURIComponent(topic)}`);
  }

  async submitFactCheck(claimId, verdict, evidence) {
    return this.request('/api/analysis/factcheck', {
      method: 'POST',
      body: JSON.stringify({ claimId, verdict, evidence }),
    });
  }

  async voteFactCheck(factCheckId, vote) {
    return this.request(`/api/analysis/factcheck/${factCheckId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ vote }),
    });
  }

  async getFactChecks(claimId) {
    return this.request(`/api/analysis/factchecks?claimId=${claimId}`);
  }

  // Debate endpoints
  async requestDebate(topic, perspectiveA, perspectiveB) {
    return this.request('/api/debate/request', {
      method: 'POST',
      body: JSON.stringify({ topic, perspectiveA, perspectiveB }),
    });
  }

  async getDebateRequests(topic = null) {
    const params = topic ? `?topic=${encodeURIComponent(topic)}` : '';
    return this.request(`/api/debate/requests${params}`);
  }

  async joinDebateRoom(roomId, side, userId) {
    return this.request(`/api/debate/room/${roomId}/join`, {
      method: 'POST',
      body: JSON.stringify({ side, userId }),
    });
  }

  async leaveDebateRoom(roomId, userId) {
    return this.request(`/api/debate/room/${roomId}/leave`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async getDebateParticipants(roomId) {
    return this.request(`/api/debate/room/${roomId}/participants`);
  }

  async moderateParticipant(roomId, userId, action, reason) {
    return this.request('/api/debate/moderate', {
      method: 'POST',
      body: JSON.stringify({ roomId, userId, action, reason }),
    });
  }

  async getModerationLogs(roomId) {
    return this.request(`/api/debate/moderation/logs?roomId=${roomId}`);
  }

  // User endpoints
  async getUserPreferences() {
    return this.request('/api/user/preferences');
  }

  async updateUserPreferences(preferences) {
    return this.request('/api/user/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  // Subscription endpoints
  async getSubscriptions() {
    return this.request('/api/subscriptions');
  }

  async createSubscription(subscription) {
    return this.request('/api/subscriptions', {
      method: 'POST',
      body: JSON.stringify(subscription),
    });
  }

  async updateSubscription(id, subscription) {
    return this.request(`/api/subscriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(subscription),
    });
  }

  async deleteSubscription(id) {
    return this.request(`/api/subscriptions/${id}`, {
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for custom instances
export default ApiClient;

