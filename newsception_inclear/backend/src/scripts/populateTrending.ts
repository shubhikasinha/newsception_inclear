import '../config/database';
import { connectDB } from '../config/database';
import { analyzeTopic } from '../services/topicAnalysisService';
import { logger } from '../utils/logger';

const DEMO_TOPICS = [
  'artificial intelligence',
  'climate change',
  'cryptocurrency bitcoin',
  'space exploration',
  'electric vehicles',
  'renewable energy',
  'cybersecurity',
  'quantum computing',
  'mental health',
  'healthcare innovation',
  'remote work',
  'social media regulation',
  'education technology',
  'food security',
  'sustainable fashion'
];

async function populateTrending() {
  try {
    await connectDB();
    logger.info('🚀 Starting to populate trending topics for demo...\n');

    let successCount = 0;
    let failCount = 0;

    for (const topic of DEMO_TOPICS) {
      try {
        logger.info(`📰 Fetching and analyzing: "${topic}"...`);
        
        const result = await analyzeTopic(topic, 'global', { forceRefresh: true });
        
        if (result.articles && result.articles.length > 0) {
          logger.info(`✅ ${topic}: ${result.articles.length} articles analyzed`);
          successCount++;
        } else {
          logger.warn(`⚠️  ${topic}: No articles found`);
          failCount++;
        }

        // Wait 2 seconds between requests to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error: any) {
        logger.error(`❌ ${topic}: ${error.message}`);
        failCount++;
      }
    }

    logger.info(`\n✅ Population complete!`);
    logger.info(`   Success: ${successCount}/${DEMO_TOPICS.length}`);
    logger.info(`   Failed: ${failCount}/${DEMO_TOPICS.length}`);
    logger.info(`\n🎉 Dashboard is now ready with trending topics!`);
    
    process.exit(0);
  } catch (error) {
    logger.error('❌ Population failed:', error);
    process.exit(1);
  }
}

populateTrending();
