import axios from 'axios';
import { curatedMockNews, MockNewsArticleGroup } from '../data/mockNewsData';
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
    const sanitizedTopic = (topic || '').trim();
    const normalizedTopic = sanitizedTopic.toLowerCase();

    const rankedGroups = curatedMockNews
      .map(group => ({ group, score: this.calculateKeywordScore(group, normalizedTopic) }))
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score);

    const selectedArticles = rankedGroups.length > 0
      ? rankedGroups[0].group.articles
      : this.takeLatestArticles(curatedMockNews, 12);

    if (rankedGroups.length > 0) {
      logger.info(`Serving curated mock news for topic "${sanitizedTopic || topic}" using keyword bucket: ${rankedGroups[0].group.keywords.join(', ')}`);
    } else {
      logger.info(`Serving curated mock news fallback set for topic "${sanitizedTopic || topic}"`);
    }

    return selectedArticles.map(article => ({ ...article }));
  }

  private calculateKeywordScore(group: MockNewsArticleGroup, normalizedTopic: string): number {
    if (!normalizedTopic) {
      return 0;
    }

    const topicTokens = normalizedTopic.split(/[\s/,-]+/).filter(Boolean);

    return group.keywords.reduce((score, keyword) => {
      const normalizedKeyword = keyword.toLowerCase();

      if (normalizedTopic === normalizedKeyword) {
        return score + 6;
      }

      if (normalizedTopic.includes(normalizedKeyword)) {
        return score + 4;
      }

      if (normalizedKeyword.includes(normalizedTopic) && normalizedTopic.length > 3) {
        return score + 2;
      }

      const keywordTokens = normalizedKeyword.split(/[\s/,-]+/).filter(token => token.length > 2);
      const sharedTokens = keywordTokens.filter(token => topicTokens.includes(token));

      if (sharedTokens.length > 0) {
        return score + sharedTokens.length;
      }

      return score;
    }, 0);
  }

  private takeLatestArticles(groups: MockNewsArticleGroup[], limit: number): NewsArticle[] {
    return groups
      .flatMap(group => group.articles)
      .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
      .slice(0, limit)
      .map(article => ({ ...article }));
  }
}

export default new NewsService();
