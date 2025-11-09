import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../config/database';
import { analyzeTopic } from '../services/topicAnalysisService';
import NewsFeedItem from '../models/NewsFeedItem';
import { logger } from '../utils/logger';

const QUICK_TOPICS = [
  'artificial intelligence regulation',
  'climate change summit 2025',
  'cryptocurrency market',
  'space exploration mars',
  'electric vehicles tesla'
];

async function quickDemo() {
  try {
    await connectDB();
    logger.info('🚀 Quick Demo Setup - Populating 5 trending topics...\n');

    for (let i = 0; i < QUICK_TOPICS.length; i++) {
      const topic = QUICK_TOPICS[i];
      
      try {
        logger.info(`[${i+1}/5] Analyzing: "${topic}"...`);
        
        const result = await analyzeTopic(topic, 'global', { forceRefresh: true });
        
        if (result.articles && result.articles.length > 0) {
          logger.info(`✅ Success: ${result.articles.length} articles`);
        }

        // Shorter wait time for demo
        if (i < QUICK_TOPICS.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
        
      } catch (error: any) {
        logger.warn(`⚠️  Skipped: ${error.message}`);
      }
    }

    // Check feed count
    const feedCount = await NewsFeedItem.countDocuments();
    logger.info(`\n✅ Demo ready! ${feedCount} topics in feed`);
    logger.info(`🎉 Refresh your dashboard to see them!`);
    
    process.exit(0);
  } catch (error) {
    logger.error('❌ Demo setup failed:', error);
    process.exit(1);
  }
}

quickDemo();
