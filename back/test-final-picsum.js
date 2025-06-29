const ContentService = require('./services/contentService.js');

async function testFinalPicsum() {
  console.log('Final test: Picsum images with keywords...\n');
  
  try {
    // Test with a topic that should generate varied Picsum images
    const topic = 'Machine Learning and Data Science';
    console.log(`Testing with topic: "${topic}"`);
    
    const testArticle = await ContentService.generateArticle(topic);
    
    console.log('\n✅ Article generated successfully!');
    console.log(`Title: ${testArticle.title}`);
    console.log(`Cover Image: ${testArticle.ogTags.image}`);
    console.log(`Number of images: ${testArticle.media.images.length}`);
    
    if (testArticle.media.images.length > 0) {
      console.log('\nImages found:');
      testArticle.media.images.forEach((img, index) => {
        console.log(`${index + 1}. ${img.url} | ${img.alt}`);
        
        // Check if it's a Picsum image with keywords
        if (img.url.includes('picsum.photos')) {
          if (img.url.includes('keyword=')) {
            const keywordMatch = img.url.match(/keyword=([^&"]+)/);
            const keyword = keywordMatch ? keywordMatch[1] : 'unknown';
            console.log(`   ✅ Picsum image with keyword: "${keyword}"`);
          } else {
            console.log(`   ⚠️  Picsum image without keywords`);
          }
        } else {
          console.log(`   ℹ️  Non-Picsum image (${img.url.includes('unsplash') ? 'Unsplash' : 'Other'})`);
        }
      });
    }
    
    // Check for keyword variety
    const keywordMatches = testArticle.content.match(/keyword=([^&"]+)/g);
    if (keywordMatches) {
      const keywords = keywordMatches.map(match => match.replace('keyword=', ''));
      const uniqueKeywords = [...new Set(keywords)];
      console.log(`\n✅ Found ${uniqueKeywords.length} unique keywords: ${uniqueKeywords.join(', ')}`);
      
      if (uniqueKeywords.length > 1) {
        console.log('✅ SUCCESS: Multiple keywords used for image variety!');
      } else {
        console.log('⚠️  Only one keyword used - could use more variety');
      }
    }
    
    // Check for random number variety
    const randomMatches = testArticle.content.match(/random=(\d+)/g);
    if (randomMatches) {
      const randomNumbers = randomMatches.map(match => match.replace('random=', ''));
      const uniqueRandomNumbers = [...new Set(randomNumbers)];
      console.log(`✅ Found ${uniqueRandomNumbers.length} unique random numbers: ${uniqueRandomNumbers.join(', ')}`);
      
      if (uniqueRandomNumbers.length > 1) {
        console.log('✅ SUCCESS: Multiple random numbers used for image variety!');
      } else {
        console.log('⚠️  Only one random number used - could use more variety');
      }
    }
    
    console.log('\n✅ Final Picsum test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error in final Picsum test:', error.message);
  }
}

// Run the test
testFinalPicsum(); 