import axios from 'axios';
import { logger } from '../utils/logger';

interface NewsArticle {
  title: string;
  url: string;
  source: string;
  description: string;
  publishedAt: string;
  imageUrl?: string;
  author?: string;
}

export class NewsService {
  private googleApiKey: string;
  private bingApiKey: string;

  constructor() {
    this.googleApiKey = process.env.GOOGLE_NEWS_API_KEY || '';
    this.bingApiKey = process.env.BING_NEWS_API_KEY || '';
  }

  async fetchNews(topic: string, location?: string): Promise<NewsArticle[]> {
    try {
      // Try Google News API first
      if (this.googleApiKey) {
        const articles = await this.fetchFromGoogle(topic, location);
        if (articles.length > 0) return articles;
      }

      // Fallback to Bing News API
      if (this.bingApiKey) {
        const articles = await this.fetchFromBing(topic, location);
        if (articles.length > 0) return articles;
      }

      // If no API keys or both failed, return mock data
      logger.warn('No news API configured, returning mock data');
      return this.getMockNews(topic);

    } catch (error) {
      logger.error('Error fetching news:', error);
      return this.getMockNews(topic);
    }
  }

  private async fetchFromGoogle(topic: string, _location?: string): Promise<NewsArticle[]> {
    try {
      const url = 'https://newsapi.org/v2/everything';
      const params = {
        q: topic,
        apiKey: this.googleApiKey,
        language: 'en',
        sortBy: 'relevancy',
        pageSize: 20,
      };

      const response = await axios.get(url, { params });
      
      return response.data.articles.map((article: any) => ({
        title: article.title,
        url: article.url,
        source: article.source.name,
        description: article.description || article.content,
        publishedAt: article.publishedAt,
        imageUrl: article.urlToImage,
        author: article.author,
      }));

    } catch (error) {
      logger.error('Google News API error:', error);
      return [];
    }
  }

  private async fetchFromBing(topic: string, _location?: string): Promise<NewsArticle[]> {
    try {
      const url = 'https://api.bing.microsoft.com/v7.0/news/search';
      const headers = {
        'Ocp-Apim-Subscription-Key': this.bingApiKey,
      };
      const params = {
        q: topic,
        count: 20,
        mkt: 'en-US',
        freshness: 'Week',
      };

      const response = await axios.get(url, { headers, params });
      
      return response.data.value.map((article: any) => ({
        title: article.name,
        url: article.url,
        source: article.provider[0]?.name || 'Unknown',
        description: article.description,
        publishedAt: article.datePublished,
        imageUrl: article.image?.thumbnail?.contentUrl,
        author: undefined,
      }));

    } catch (error) {
      logger.error('Bing News API error:', error);
      return [];
    }
  }

  private getMockNews(topic: string): NewsArticle[]  {
    const mockSources = [
      'BBC News', 'CNN', 'The New York Times', 'The Guardian', 
      'Reuters', 'Associated Press', 'Fox News', 'The Washington Post',
      'Bloomberg', 'CNBC', 'The Wall Street Journal', 'Al Jazeera'
    ];

    return Array.from({ length: 12 }, (_, i) => ({
      title: `${topic}: Latest developments and analysis - Part ${i + 1}`,
      url: `https://example.com/article/${i + 1}`,
      source: mockSources[i % mockSources.length],
      description: `Comprehensive analysis of ${topic} from multiple perspectives. This article explores the key developments, implications, and different viewpoints surrounding this important topic.`,
      publishedAt: new Date(Date.now() - i * 3600000).toISOString(),
      imageUrl: `https://picsum.photos/seed/${topic}-${i}/800/600`,
    }));
  }
}

export default new NewsService();
