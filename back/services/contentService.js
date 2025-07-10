const { GoogleGenerativeAI } = require('@google/generative-ai');
const trendingService = require('./trendingService');
const axios = require('axios');
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const SERPAPI_KEY = '5b5393fc0fb0de50ce2ecc416b00d4f97bf8ed742b81f6c4f691a4235b733443';

// Allow all images (permissive)
function shouldExcludeImage(url) {
  return false;
}

async function fetchImagesFromSerpApi(keyword, numImages = 3) {
  try {
    const response = await axios.get('https://serpapi.com/search', {
      params: {
        engine: 'google_images',
        q: keyword,
        api_key: SERPAPI_KEY,
        num: numImages
      }
    });
    // Log the full SerpAPI response for debugging
    console.log(`Full SerpAPI response for '${keyword}':`, JSON.stringify(response.data, null, 2));
    const images = response.data.images_results || [];
    const urls = images.slice(0, numImages).map(img => img.original || img.thumbnail || img.link).filter(Boolean);
    console.log(`Fetched SerpAPI images for '${keyword}':`, urls);
    return urls;
  } catch (error) {
    console.error('Error fetching images from SerpAPI:', error.message);
    return [];
  }
}

class ContentService {
  constructor() {
    this.genAI = new GoogleGenerativeAI('AIzaSyDQhCJAQaqicOP7TYzAH99X3p3tEeKiubw');
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.8
      }
    });
    this.testUnsplashConnection();
  }

  async testUnsplashConnection() {
    try {
      console.log('Testing Unsplash API connection...');
      const response = await axios.get('https://api.unsplash.com/photos/random', {
        params: { query: 'test', count: 1 },
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          'Accept-Version': 'v1'
        },
        timeout: 5000
      });
      console.log('✅ Unsplash API connection successful');
    } catch (error) {
      console.error('❌ Unsplash API connection failed:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
    }
  }

  async generateArticle(topic, relatedContent = []) {
    try {
      const prompt = this.buildArticlePrompt(topic, relatedContent);
      // Log the prompt
      console.log('Gemini Prompt:', prompt);
      // Log the model configuration
      if (this.model && this.model.generationConfig) {
        console.log('Gemini Model generationConfig:', this.model.generationConfig);
      } else {
        console.log('Gemini Model config (raw):', this.model);
      }
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      console.log('--- RAW GEMINI RESPONSE ---');
      console.log(content);
      
      // Parse the generated content
      const articleData = await this.parseGeneratedContent(content, topic);
      
      return articleData;
    } catch (error) {
      console.error(`[ARTICLE GENERATION ERROR] Failed to generate article for topic: "${topic}"`);
      console.error('Error message:', error.message);
      if (error.stack) {
        console.error('Error stack:', error.stack);
      }
      throw new Error('Failed to generate article content: ' + error.message);
    }
  }

  buildArticlePrompt(topic, relatedContent) {
    const contentContext = relatedContent.length > 0
      ? `\n\nRelated content found:\n${relatedContent.map(item => `- ${item.title}: ${item.snippet}`).join('\n')}`
      : '';

    return `You are an expert content writer and SEO specialist. Your task is to write a comprehensive, SEO-optimized blog article about "${topic}". The article must be engaging, informative, and address why this topic is currently trending.

IMPORTANT:
- DO NOT GIVE SHORT RESPONSE BUT A FULL FLEDGED ARTICLE AS DESCRIBED BELOW.
- The article MUST be at least 800 words and up to 1200 words. Be expansive and detailed in your explanations.
- You MUST use valid, semantic HTML for all structure: <h1>, <h2>, <h3>, <p>, <ul>/<ol>, <blockquote>, <strong>/<em>.
- Do NOT include <html>, <head>, or <body> tags—just the article content.
- Do NOT output any plain text outside of tags. Every piece of text must be within an HTML tag.
- Do NOT use line breaks for paragraphs—use <p> tags for natural paragraph breaks.
- Do NOT use <br> tags for spacing.
- Use clear paragraph breaks and spacing for readability.
- Use subheadings (<h2> and <h3>) frequently to break up content and guide the reader.
- Use bullet points or numbered lists (<ul>/<ol>) for steps, tips, or grouped information.
- Highlight key points with <strong> or <em> tags.
- Make the layout visually engaging and easy to scan.
- Write in a professional but accessible tone.
- Make sure you use good formatting for headings, paragraphs, text-indentation, paragraph spacing.

**CRITICAL CONTENT SECTIONS (ENSURE THESE ARE COVERED IN DETAIL TO REACH WORD COUNT):**
- **Introduction:** Hook the reader by immediately addressing the trending topic and its current significance. Briefly introduce why it's a hot discussion.
- **The Core Event/Reason for Trending:** Detail the specifics of *what* happened or *why* this topic is trending right now. This could involve recent developments, key figures, a new discovery, a specific incident, or unfolding events. Provide factual details to explain its current relevance.
- **Background & Context:** Explain the broader context surrounding the topic. This might include historical background, underlying causes, contributing factors, or related concepts necessary for a comprehensive understanding.
- **Impact and Implications:** Discuss the various impacts of the trending topic. Consider its social, economic, cultural, environmental, or political implications. How is it affecting people, industries, or the world at large?
- **Public/Expert Reactions & Discourse:** Explore how the public, experts, or relevant stakeholders are reacting to the topic. Include insights into social media buzz, popular opinions, debates, and expert analyses.
- **Future Outlook/Solutions/Next Steps:** Conclude with a forward-looking perspective. Discuss potential future developments, proposed solutions, necessary actions, or what readers can expect next regarding this topic. Offer a sense of resolution or call to action where appropriate.

Please provide a meta description (max 160 characters), 5-8 relevant keywords, and 2-3 relevant hashtags for social media.

Please format your response as follows:

TITLE: [Your article title here]  
META_DESCRIPTION: [Meta description here]
KEYWORDS: [keyword1, keyword2, keyword3, keyword4, keyword5]
HASHTAGS: [hashtag1, hashtag2, hashtag3]

CONTENT:
[Your entire article content in valid, semantic HTML as described above]

MEDIA:
IMAGES:
- [No images in this step, placeholder for future]
VIDEOS:
- [No videos in this step, placeholder for future]
TWEETS:
- [No tweets in this step, placeholder for future]

${contentContext}
`;
  }

  async parseGeneratedContent(content, topic) {
    try {
      // Extract title (more forgiving)
      const titleMatch = content.match(/TITLE\s*:?\s*(.+?)(?=\n|$)/i);
      const title = titleMatch ? titleMatch[1].trim() : `Complete Guide to ${topic}`;
      if (!titleMatch) console.warn('Title not found, using fallback.');

      // Extract meta description (more forgiving)
      const metaMatch = content.match(/META_DESCRIPTION\s*:?\s*(.+?)(?=\n|$)/i);
      let metaDescription = metaMatch ? metaMatch[1].trim() : `Learn everything about ${topic} in this comprehensive guide.`;
      if (!metaMatch) console.warn('Meta description not found, using fallback.');
      if (metaDescription.length > 300) {
        metaDescription = metaDescription.substring(0, 297) + '...';
      }

      // Extract keywords (more forgiving)
      const keywordsMatch = content.match(/KEYWORDS\s*:?\s*(.+?)(?=\n|$)/i);
      const keywords = keywordsMatch
        ? keywordsMatch[1].split(',').map(k => k.trim()).filter(k => k)
        : [topic, 'guide', 'information', 'tips', 'latest'];
      if (!keywordsMatch) console.warn('Keywords not found, using fallback.');

      // Extract hashtags (more forgiving)
      const hashtagsMatch = content.match(/HASHTAGS\s*:?\s*(.+?)(?=\n|$)/i);
      const hashtags = hashtagsMatch
        ? hashtagsMatch[1].split(',').map(h => h.trim()).filter(h => h)
        : [`#${topic.replace(/\s+/g, '')}`, '#trending', '#guide'];
      if (!hashtagsMatch) console.warn('Hashtags not found, using fallback.');

      // Extract main content (more forgiving)
      const contentMatch = content.match(/CONTENT\s*:?\s*([\s\S]*?)(?=\nMEDIA:|$)/i);
      let articleContent = contentMatch ? contentMatch[1].trim() : content;
      if (!contentMatch) console.warn('CONTENT section not found, using full content.');

      // Extract the first <img> src as cover image
      
      const imgMatch = articleContent.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgMatch && !shouldExcludeImage(imgMatch[1])) {
        coverImage = imgMatch[1];
      }

      // Extract MEDIA section (unchanged)
      const mediaMatch = content.match(/MEDIA\s*:?\s*([\s\S]*)$/i);
      let images = [], videos = [], tweets = [];
      if (mediaMatch) {
        const mediaSection = mediaMatch[1];
        // Images
        const imagesMatch = mediaSection.match(/IMAGES\s*:?\s*([\s\S]*?)(?=VIDEOS:|TWEETS:|$)/i);
        if (imagesMatch) {
          images = imagesMatch[1].split('\n').map(line => {
            const m = line.match(/-\s*\[(.+?)\]\s*\|\s*\[(.+?)\]/);
            if (m) return { url: m[1].trim(), alt: m[2].trim(), caption: m[2].trim() };
            return null;
          }).filter(Boolean);
        }
        // Videos
        const videosMatch = mediaSection.match(/VIDEOS\s*:?\s*([\s\S]*?)(?=TWEETS:|$)/i);
        if (videosMatch) {
          videos = videosMatch[1].split('\n').map(line => {
            const m = line.match(/-\s*\[(.+?)\]/);
            if (m) return { url: m[1].trim(), title: '', platform: 'youtube' };
            return null;
          }).filter(Boolean);
        }
        // Tweets
        const tweetsMatch = mediaSection.match(/TWEETS\s*:?\s*([\s\S]*)/i);
        if (tweetsMatch) {
          tweets = tweetsMatch[1].split('\n').map(line => {
            const m = line.match(/-\s*\[(.+?)\]/);
            if (m) return { url: m[1].trim(), content: '', author: 'TrendWise' };
            return null;
          }).filter(Boolean);
        }
      }
      // Fallback: If media arrays are empty, extract from HTML
      if (images.length === 0) {
        images = Array.from(articleContent.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*?(?:alt=["']([^"']*)["'])?[^>]*>/gi))
          .map(m => ({ url: m[1], alt: m[2] || '', caption: m[2] || '' }))
          .filter(img => !shouldExcludeImage(img.url));
        console.log('Extracted images from HTML:', images);
      }

      // Replace placeholder images with real images from SerpAPI
      const placeholderRegex = /https?:\/\/(via\.placeholder\.com|picsum\.photos)[^"']*/g;
      let serpImages = [];
      if (images.some(img => placeholderRegex.test(img.url))) {
        // Use topic or first keyword for image search
        const searchKeyword = (keywords && keywords.length > 0) ? keywords[0] : topic;
        serpImages = await fetchImagesFromSerpApi(searchKeyword, images.length);
        images = images.map((img, idx) => {
          if (placeholderRegex.test(img.url) && serpImages[idx]) {
            return { ...img, url: serpImages[idx] };
          }
          return img;
        });
        // Also replace in articleContent
        let serpIdx = 0;
        articleContent = articleContent.replace(placeholderRegex, () => {
          const url = serpImages[serpIdx] || '';
          serpIdx++;
          return url;
        });
        console.log('Replaced placeholder images with SerpAPI images:', images);
      }
      if (videos.length === 0) {
        videos = Array.from(articleContent.matchAll(/<iframe[^>]+src=["']([^"']+)["'][^>]*>/gi)).map(m => ({
          url: m[1], title: '', platform: 'youtube'
        }));
      }
      if (tweets.length === 0) {
        tweets = Array.from(articleContent.matchAll(/<blockquote[^>]*class=["'][^"']*twitter-tweet[^"']*["'][^>]*>\s*<a[^>]+href=["']([^"']+)["']/gi)).map(m => ({
          url: m[1], content: '', author: 'TrendWise'
        }));
      }

      // Filter out invalid YouTube embeds (playlists, non-direct video links)
      const validYouTubeEmbed = (url) =>
        /^https:\/\/www\.youtube\.com\/embed\/[\w-]{11}(\?.*)?$/.test(url);
      videos = videos.filter(v => validYouTubeEmbed(v.url));
      // Remove invalid iframes from articleContent
      articleContent = articleContent.replace(/<iframe[^>]+src=["']([^"']+)["'][^>]*><\/iframe>/gi, (match, src) => {
        return validYouTubeEmbed(src) ? match : '';
      });

      // Filter out excluded images (Wikimedia, etc.)
      const originalImageCount = images.length;
      images = images.filter(img => {
        if (shouldExcludeImage(img.url)) {
          console.log(`Filtering out excluded image: ${img.url}`);
          return false;
        }
        return true;
      });
      if (originalImageCount > images.length) {
        console.log(`Filtered out ${originalImageCount - images.length} excluded images`);
      }

      // Remove excluded images from article content
      articleContent = articleContent.replace(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi, (match, src) => {
        if (shouldExcludeImage(src)) {
          console.log(`Removing excluded image from content: ${src}`);
          return '';
        }
        return match;
      });

      // DEBUG: Always call SerpAPI for image search, regardless of placeholders
      const debugSearchKeyword = (keywords && keywords.length > 0) ? keywords[0] : topic;
      console.log('[DEBUG] Calling fetchImagesFromSerpApi with:', debugSearchKeyword, images.length);
      const debugSerpImages = await fetchImagesFromSerpApi(debugSearchKeyword, images.length || 3);
      console.log('[DEBUG] SerpAPI returned:', debugSerpImages);

      // Use SerpAPI images as the images array for the article
      let imagesForArticle = debugSerpImages.map(url => ({ url, alt: debugSearchKeyword, caption: debugSearchKeyword }));
      let coverImage = imagesForArticle.length > 0 ? imagesForArticle[0].url : '';

      // Log what was extracted
      console.log('Extracted title:', title);
      console.log('Extracted metaDescription:', metaDescription);
      console.log('Extracted keywords:', keywords);
      console.log('Extracted hashtags:', hashtags);
      console.log('Extracted images:', images.length);
      console.log('Extracted word count:', articleContent.split(/\s+/).length);

      // Instead of throwing, just warn if requirements are not met
      const picsumImgCount = (articleContent.match(/<img[^>]+src=["']https:\/\/picsum\.photos/g) || []).length;
      const wordCount = articleContent.split(/\s+/).length;
      if (picsumImgCount < 1) {
        console.warn('Warning: No picsum images found.');
      }
      if (wordCount < 300) {
        console.warn('Warning: Content is less than 300 words.');
      }

      // Only fallback if content is truly unusable (e.g., empty or extremely short)
      if (!articleContent || articleContent.length < 100) {
        throw new Error('Article content is empty or too short.');
      }

      // Generate slug from title
      const slug = this.generateSlug(title);
      // Calculate read time (rough estimate: 200 words per minute)
      const readTime = Math.ceil(wordCount / 200);
      // Calculate SEO score
      const seoScore = this.calculateSEOScore(title, metaDescription, keywords, articleContent);

      // After replacing placeholder images with SerpAPI images
      // Ensure the first image is set as coverImage
      // let coverImage = ''; // This line is now redundant as coverImage is set above
      // if (images.length > 0 && images[0].url) {
      //   coverImage = images[0].url;
      // }
      return {
        title,
        slug,
        excerpt: metaDescription,
        content: articleContent,
        meta: {
          title: title.length > 60 ? title.substring(0, 57) + '...' : title,
          description: metaDescription,
          keywords
        },
        ogTags: {
          title,
          description: metaDescription,
          image: coverImage || '',
          url: `${process.env.FRONTEND_URL}/article/${slug}`
        },
        trendingTopic: topic,
        source: 'gemini_ai',
        status: 'published',
        seoScore,
        readTime,
        media: {
          images: imagesForArticle,
          videos,
          tweets
        },
        hashtags
      };
    } catch (error) {
      console.error(`[PARSING ERROR] Failed to parse generated content for topic: "${topic}"`);
      console.error('Error message:', error.message);
      if (error.stack) {
        console.error('Error stack:', error.stack);
      }
      console.error('RAW CONTENT THAT CAUSED ERROR:', content);
      throw error; // Do not fallback, just rethrow the error
    }
  }

  generateSlug(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  calculateSEOScore(title, metaDescription, keywords, content) {
    let score = 0;

    // Title length (optimal: 50-60 characters)
    if (title.length >= 50 && title.length <= 60) score += 20;
    else if (title.length >= 30 && title.length <= 70) score += 15;
    else score += 10;

    // Meta description length (optimal: 150-160 characters)
    if (metaDescription.length >= 150 && metaDescription.length <= 160) score += 20;
    else if (metaDescription.length >= 120 && metaDescription.length <= 170) score += 15;
    else score += 10;

    // Keywords presence in content
    const contentLower = content.toLowerCase();
    const keywordMatches = keywords.filter(keyword =>
      contentLower.includes(keyword.toLowerCase())
    ).length;
    score += Math.min(20, (keywordMatches / keywords.length) * 20);

    // Content length (optimal: 800-1200 words)
    const wordCount = content.split(/\s+/).length;
    if (wordCount >= 800 && wordCount <= 1200) score += 20;
    else if (wordCount >= 600 && wordCount <= 1500) score += 15;
    else score += 10;

    // Headings structure
    const h1Count = (content.match(/<h1[^>]*>/gi) || []).length;
    const h2Count = (content.match(/<h2[^>]*>/gi) || []).length;
    const h3Count = (content.match(/<h3[^>]*>/gi) || []).length;

    if (h1Count === 1 && h2Count >= 2 && h3Count >= 1) score += 20;
    else if (h1Count === 1 && h2Count >= 1) score += 15;
    else score += 10;

    return Math.min(100, score);
  }

  async generateArticleFromTrend(trend) {
    try {
      // Get related content for context
      const relatedContent = await trendingService.searchRelatedContent(trend.title);

      // Generate article using Gemini
      const articleData = await this.generateArticle(trend.title, relatedContent);

      return articleData;
    } catch (error) {
      console.error('Error generating article from trend:', error);
      throw error;
    }
  }
}

module.exports = new ContentService(); 