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
  private readonly openRouterKey = process.env.OPENROUTER_API_KEY;
  private readonly openRouterModel = process.env.OPENROUTER_MODEL || 'openrouter/gpt-4.1-mini';
  private readonly openRouterBaseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
  private readonly siteUrl = process.env.OPENROUTER_SITE_URL || process.env.FRONTEND_URL || 'http://localhost:3000';

  private async callOpenRouter(payload: Record<string, unknown>) {
    if (!this.openRouterKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const headers = {
      Authorization: `Bearer ${this.openRouterKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': this.siteUrl,
      'X-Title': 'Newsception Analysis',
    };

    const response = await axios.post(`${this.openRouterBaseUrl}/chat/completions`, payload, {
      headers,
      timeout: 45000,
    });

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from language model');
    }

    return content;
  }

  async analyzeArticles(articles: any[], topic: string): Promise<AnalysisResult[]> {
    try {
      if (!this.openRouterKey) {
        logger.warn('OpenRouter API key missing, using mock analysis');
        return this.getMockAnalysis(articles, topic);
      }

      const serializedArticles = articles.slice(0, 20).map((article, index) => ({
        id: index + 1,
        title: article.title,
        source: article.source,
        publishedAt: article.publishedAt,
        summary: article.description?.slice(0, 800) || '',
      }));

      const systemPrompt =
        'You are a seasoned media analyst who evaluates news coverage for bias, sentiment, and key claims.' +
        ' Return structured JSON that matches the provided schema exactly.' +
        ' Avoid prose, do not include markdown, and ensure arrays and numbers are valid.';

      const userPrompt = JSON.stringify({
        topic,
        instructions: {
          goal: 'Classify each article into support, oppose, or neutral perspectives. Summarize key takeaways and extract verifiable claims.',
          output_schema: {
            analyses: [
              {
                perspective: 'support | oppose | neutral',
                stance: 'short phrase summarizing stance',
                sentiment: 'positive | negative | neutral | mixed',
                sentimentScore: 'number between -1 and 1',
                summary: '2-3 sentence summary',
                keyPoints: ['bullet points'],
                credibilityScore: '0-100',
                biasScore: '-100 to 100',
                entities: [{ name: 'string', type: 'person|organization|location|topic', sentiment: 'positive|negative|neutral', score: '0-1' }],
                emotionalTones: [{ emotion: 'string', score: '0-1' }],
                claims: [{ text: 'string', type: 'factual|opinion|prediction|statistic', verifiability: '0-100', confidence: '0-100' }],
                biasAnalysis: {
                  coverageTilt: 'heavily_left|left|center_left|center|center_right|right|heavily_right',
                  loadedTerms: [{ term: 'string', context: 'string', biasType: 'positive|negative|fear|uncertain' }],
                  reasoning: 'one sentence explanation',
                },
              },
            ],
          },
        },
        articles: serializedArticles,
      });

      const payload = {
        model: this.openRouterModel,
        temperature: 0.4,
        max_tokens: 3500,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      };

      const content = await this.callOpenRouter(payload);
      const parsed = JSON.parse(content);

      if (!Array.isArray(parsed?.analyses)) {
        throw new Error('Unexpected OpenRouter response format');
      }

      const mapped = parsed.analyses.slice(0, articles.length).map((analysis: any, index: number) => {
        const isSupport = analysis.perspective === 'support';
        return {
          perspective: analysis.perspective ?? (isSupport ? 'support' : 'oppose'),
          stance: analysis.stance || (isSupport ? `Advocates for ${topic}` : `Critical of ${topic}`),
          sentiment: analysis.sentiment || (isSupport ? 'positive' : 'negative'),
          sentimentScore: Number(analysis.sentimentScore ?? (isSupport ? 0.4 : -0.4)),
          summary: analysis.summary || articles[index].description?.slice(0, 200) || `Analysis of ${topic}`,
          keyPoints: Array.isArray(analysis.keyPoints) && analysis.keyPoints.length ? analysis.keyPoints : [
            `Primary argument presented in relation to ${topic}`,
            'Key supporting detail',
            'Implication to monitor',
          ],
          credibilityScore: Number(analysis.credibilityScore ?? 75),
          biasScore: Number(analysis.biasScore ?? (isSupport ? 25 : -25)),
          entities: Array.isArray(analysis.entities) ? analysis.entities.slice(0, 5) : [],
          emotionalTones: Array.isArray(analysis.emotionalTones) ? analysis.emotionalTones.slice(0, 4) : [],
          claims: Array.isArray(analysis.claims) && analysis.claims.length
            ? analysis.claims.slice(0, 5)
            : [
              {
                text: `${topic} continues to generate significant debate`,
                type: 'factual',
                verifiability: 65,
                confidence: 70,
              },
            ],
          biasAnalysis: analysis.biasAnalysis || {
            coverageTilt: isSupport ? 'center_right' : 'center_left',
            loadedTerms: [
              {
                term: isSupport ? 'breakthrough' : 'concern',
                context: `The article frames ${topic} as ${isSupport ? 'a breakthrough' : 'cause for concern'}.`,
                biasType: isSupport ? 'positive' : 'negative',
              },
            ],
            reasoning: `Language suggests a ${isSupport ? 'supportive' : 'critical'} stance regarding ${topic}.`,
          },
        } as AnalysisResult;
      });

      return mapped;
    } catch (error) {
      logger.error('Falling back to mock analysis due to ML error', error);
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
      if (!this.openRouterKey) {
        logger.warn('OpenRouter API key missing, using mock historical context');
        return this.getMockHistoricalContext(topic);
      }

      const payload = {
        model: this.openRouterModel,
        temperature: 0.3,
        max_tokens: 1200,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: 'You are a historian bot that produces concise timelines. Output valid JSON only.',
          },
          {
            role: 'user',
            content: JSON.stringify({
              task: 'Generate a high-level timeline for the topic.',
              topic,
              schema: {
                events: [
                  {
                    date: 'ISO date string',
                    headline: 'string',
                    summary: 'string',
                    significance: 'string',
                    sources: ['string'],
                  },
                ],
                keyDevelopments: ['string'],
                relatedTopics: ['string'],
              },
            }),
          },
        ],
      };

      const content = await this.callOpenRouter(payload);
      const parsed = JSON.parse(content);

      if (!Array.isArray(parsed?.events)) {
        throw new Error('Unexpected timeline response');
      }

      return parsed;
    } catch (error) {
      logger.warn('Falling back to mock historical context', error);
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
