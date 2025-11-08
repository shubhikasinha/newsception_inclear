import axios from 'axios';
import { logger } from '../utils/logger';

interface AnalysisResult {
  perspective: 'support' | 'oppose' | 'neutral';
  stance: string;
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  sentimentScore: number;
  summary: string;
  keyPoints: string[];
  credibilityScore: number;
  biasScore: number;
  entities: Array<{
    name: string;
    type: string;
    sentiment: string;
    score: number;
  }>;
  emotionalTones: Array<{
    emotion: string;
    score: number;
  }>;
  claims: Array<{
    text: string;
    type: 'factual' | 'opinion' | 'prediction' | 'statistic';
    verifiability: number;
    confidence: number;
  }>;
  biasAnalysis: {
    coverageTilt: string;
    loadedTerms: Array<{
      term: string;
      context: string;
      biasType: string;
    }>;
    reasoning: string;
  };
}

class MLService {
  private mlServiceUrl: string;

  constructor() {
    this.mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
  }

  async analyzeArticles(articles: any[], topic: string): Promise<AnalysisResult[]> {
    try {
      // Check if ML service is available
      if (!process.env.ML_SERVICE_URL) {
        logger.warn('ML service not configured, using mock analysis');
        return this.getMockAnalysis(articles, topic);
      }

      const response = await axios.post(
        `${this.mlServiceUrl}/analyze`,
        { articles, topic },
        { timeout: 30000 }
      );

      return response.data;

    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        logger.warn('ML service not available, using mock analysis');
      } else {
        logger.error('ML service error:', error.message);
      }
      return this.getMockAnalysis(articles, topic);
    }
  }

  private getMockAnalysis(articles: any[], topic: string): AnalysisResult[] {
    return articles.map((article, index) => {
      const isSupport = index % 2 === 0;
      const sentimentValue = isSupport ? 0.6 : -0.4;
      
      return {
        perspective: isSupport ? 'support' : 'oppose',
        stance: isSupport 
          ? `Advocates for ${topic}` 
          : `Critical of ${topic}`,
        sentiment: isSupport ? 'positive' : 'negative',
        sentimentScore: sentimentValue,
        summary: `${article.description?.slice(0, 200) || 'Analysis of ' + topic}...`,
        keyPoints: [
          `Key aspect of ${topic} discussed in this article`,
          `Important perspective on the implications`,
          `Analysis of stakeholder positions`,
        ],
        credibilityScore: 70 + Math.floor(Math.random() * 25),
        biasScore: isSupport ? 30 : -30,
        entities: [
          {
            name: topic,
            type: 'TOPIC',
            sentiment: isSupport ? 'positive' : 'negative',
            score: sentimentValue,
          },
        ],
        emotionalTones: [
          { emotion: isSupport ? 'optimism' : 'concern', score: 0.7 },
          { emotion: 'analytical', score: 0.5 },
        ],
        claims: [
          {
            text: `${topic} has significant implications`,
            type: 'factual',
            verifiability: 75,
            confidence: 80,
          },
        ],
        biasAnalysis: {
          coverageTilt: isSupport ? 'center_right' : 'center_left',
          loadedTerms: [
            {
              term: isSupport ? 'breakthrough' : 'concerning',
              context: `The ${topic} development is described as ${isSupport ? 'breakthrough' : 'concerning'}`,
              biasType: isSupport ? 'positive' : 'negative',
            },
          ],
          reasoning: `Article shows ${isSupport ? 'supportive' : 'critical'} stance based on language analysis`,
        },
      };
    });
  }

  async getHistoricalContext(topic: string): Promise<any> {
    try {
      if (!process.env.ML_SERVICE_URL) {
        return this.getMockHistoricalContext(topic);
      }

      const response = await axios.post(
        `${this.mlServiceUrl}/historical-context`,
        { topic },
        { timeout: 20000 }
      );

      return response.data;

    } catch (error) {
      logger.warn('ML service not available for historical context');
      return this.getMockHistoricalContext(topic);
    }
  }

  private getMockHistoricalContext(topic: string): any {
    const now = new Date();
    return {
      events: [
        {
          date: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
          headline: `Initial developments in ${topic}`,
          summary: `The beginnings of the ${topic} discussion`,
          significance: 'Established the foundation for current debates',
          sources: ['Historical records'],
        },
        {
          date: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
          headline: `Major milestone in ${topic}`,
          summary: `Significant progress was made`,
          significance: 'Changed the landscape of discussion',
          sources: ['News archives'],
        },
        {
          date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          headline: `Recent developments in ${topic}`,
          summary: `Latest updates and changes`,
          significance: 'Led to current situation',
          sources: ['Recent news'],
        },
      ],
      keyDevelopments: [
        'Initial research and findings',
        'Policy discussions and debates',
        'Implementation challenges',
        'Current status and future outlook',
      ],
      relatedTopics: ['Related Topic 1', 'Related Topic 2'],
    };
  }
}

export default new MLService();
