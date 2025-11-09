import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function generateInitialFeed() {
  console.log('🔄 Generating initial news feed...');
  
  try {
    const response = await axios.post(`${API_URL}/articles/feed/generate`);
    console.log('✅ Feed generated successfully!');
    console.log(`📰 Created ${response.data.count} feed items`);
    return true;
  } catch (error: any) {
    console.error('❌ Error generating feed:', error.message);
    return false;
  }
}

async function testTopics() {
  const testTopics = [
    'artificial intelligence',
    'climate change',
    'cryptocurrency',
    'electric vehicles',
    'space exploration'
  ];
  
  console.log('\n🧪 Testing topic analysis with sample searches...\n');
  
  for (const topic of testTopics) {
    try {
      console.log(`🔍 Analyzing: "${topic}"...`);
      const response = await axios.post(`${API_URL}/analysis/compare`, {
        topic,
        location: 'global'
      });
      
      if (response.data) {
        console.log(`✅ ${topic}: ${response.data.articles?.length || 0} articles analyzed`);
      }
    } catch (error: any) {
      console.log(`⚠️  ${topic}: ${error.message}`);
    }
  }
}

async function main() {
  console.log('🚀 InClear Backend Test & Setup\n');
  
  // Test backend health
  try {
    const health = await axios.get('http://localhost:5000/health');
    console.log('✅ Backend is healthy:', health.data);
  } catch (error) {
    console.error('❌ Backend is not running! Please start it first:');
    console.log('   cd backend && npm run dev\n');
    process.exit(1);
  }
  
  // Generate initial feed
  await generateInitialFeed();
  
  // Test some topics
  await testTopics();
  
  console.log('\n✅ Setup complete! You can now use the app.\n');
}

main();
