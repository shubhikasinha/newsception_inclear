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
  private newsApiKey: string;

  constructor() {
    this.newsApiKey = process.env.GOOGLE_NEWS_API_KEY || '';
  }

  async fetchNews(topic: string, location?: string): Promise<NewsArticle[]> {
    try {
      // Use NewsAPI.org with the configured key
      if (this.newsApiKey) {
        logger.info(`Fetching real news for topic: ${topic}`);
        const articles = await this.fetchFromNewsAPI(topic, location);
        if (articles.length > 0) {
          logger.info(`Successfully fetched ${articles.length} articles from NewsAPI`);
          return articles;
        }
      }

      // If no API key or fetch failed, return mock data as fallback
      logger.warn('NewsAPI not available or no results, returning mock data');
      return this.getMockNews(topic);

    } catch (error) {
      logger.error('Error fetching news:', error);
      return this.getMockNews(topic);
    }
  }

  private async fetchFromNewsAPI(topic: string, _location?: string): Promise<NewsArticle[]> {
    try {
      // Try "everything" endpoint first for comprehensive results
      let url = 'https://newsapi.org/v2/everything';
      let params: any = {
        q: topic,
        apiKey: this.newsApiKey,
        language: 'en',
        sortBy: 'relevancy',
        pageSize: 30,
        // Get articles from last 7 days for relevancy
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      logger.info(`Calling NewsAPI: ${url} with query: ${topic}`);
      let response = await axios.get(url, { params, timeout: 10000 });
      
      if (response.data.status === 'ok' && response.data.articles && response.data.articles.length > 0) {
        logger.info(`NewsAPI returned ${response.data.articles.length} articles`);
        
        const articles = response.data.articles
          .filter((article: any) => 
            article.title && 
            article.url && 
            article.title !== '[Removed]' &&
            article.description !== '[Removed]'
          )
          .map((article: any) => ({
            title: article.title,
            url: article.url,
            source: article.source.name,
            description: article.description || article.content || '',
            publishedAt: article.publishedAt,
            imageUrl: article.urlToImage,
            author: article.author,
          }));

        if (articles.length > 0) {
          return articles;
        }
      }

      // Fallback to "top-headlines" if everything endpoint gives no results
      logger.info('Trying top-headlines endpoint as fallback');
      url = 'https://newsapi.org/v2/top-headlines';
      params = {
        q: topic,
        apiKey: this.newsApiKey,
        language: 'en',
        pageSize: 20,
      };

      response = await axios.get(url, { params, timeout: 10000 });
      
      if (response.data.status === 'ok' && response.data.articles) {
        const articles = response.data.articles
          .filter((article: any) => 
            article.title && 
            article.url &&
            article.title !== '[Removed]'
          )
          .map((article: any) => ({
            title: article.title,
            url: article.url,
            source: article.source.name,
            description: article.description || article.content || '',
            publishedAt: article.publishedAt,
            imageUrl: article.urlToImage,
            author: article.author,
          }));

        return articles;
      }

      logger.warn('NewsAPI returned no valid articles');
      return [];

    } catch (error: any) {
      logger.error('NewsAPI error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
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
