const { GoogleGenerativeAI } = require('@google/generative-ai');
const trendingService = require('./trendingService');
const axios = require('axios');
const UNSPLASH_ACCESS_KEY = 'xqIQs8rrumdtc2HcEikdArFpWfFuvDNa5BoA4kaTLog';

class ContentService {
  constructor() {
    this.genAI = new GoogleGenerativeAI('AIzaSyDQhCJAQaqicOP7TYzAH99X3p3tEeKiubw');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
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
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();
      
      // Parse the generated content
      const articleData = await this.parseGeneratedContent(content, topic);
      
      return articleData;
    } catch (error) {
      console.error('Error generating article with Gemini:', error);
      throw new Error('Failed to generate article content');
    }
  }

  buildArticlePrompt(topic, relatedContent) {
    const contentContext = relatedContent.length > 0 
      ? `\n\nRelated content found:\n${relatedContent.map(item => `- ${item.title}: ${item.snippet}`).join('\n')}`
      : '';

    return `You are an expert content writer and SEO specialist.${topic} is trending on Goolge trends for a reason, find it out and Create a comprehensive, SEO-optimized blog article about it.".

IMPORTANT:
- DO NOT GIVE SHORT RESPONSE BUT A FULL FLEDGED ARTICLE AS DESCRIBED BELOW.
- If you do not include at least 3 <img> tags using picsum.photos as described, your answer will be rejected.
- Do NOT output only a heading or a short paragraph. The article must be at least 800 words and include images as described.
- If you do not follow these instructions, you will be asked to try again.
- Repeat: ALL images MUST use picsum.photos as the source, and there must be at least 3 images in the article content.

Requirements:
1. Write a compelling, informative article (800-1200 words)
2. You MUST use valid, semantic HTML for all structure:
   - <h1> for the main title (once, at the very top)
   - <h2> for main sections (every section must have a heading)
   - <h3> for subsections
   - <p> for every paragraph (every paragraph must be wrapped in <p>)
   - <ul>/<ol> for lists (use for steps, tips, or grouped info)
   - <blockquote> for important points or quotes
   - <strong>/<em> for emphasis
   - Do NOT use inline styles or classes.
   - Do NOT include <html>, <head>, or <body> tags—just the article content.
   - Do NOT output any plain text outside of tags.
   - Do NOT use line breaks for paragraphs—use <p>.
   - Do NOT use <br> for spacing.
3. **CRITICAL: Include 3-5 relevant images throughout the article using <img> tags.**
   - Place the first image right after the <h1> title as a cover image
   - Add images at the beginning of major sections (after <h2> tags)
   - **ALL images MUST use Picsum as the source: <img src=\"https://picsum.photos/800/600?random=1&keyword=RELEVANT_KEYWORD\" alt=\"Relevant description\" style=\"border-radius: 16px; margin: 2em 0;\" />**
   - Replace RELEVANT_KEYWORD with actual keywords related to the topic (e.g., "technology", "business", "data", "ai", "finance", etc.)
   - Use different keywords for different images to ensure variety
   - Use different random numbers (random=1, random=2, random=3, etc.) for each image to get different images
   - Use hyphenated keywords for better results (e.g., "artificial-intelligence", "machine-learning", "blockchain-technology")
   - Example: <img src=\"https://picsum.photos/800/600?random=1&keyword=artificial-intelligence\" alt=\"AI Technology\" style=\"border-radius: 16px; margin: 2em 0;\" />
   - **ABSOLUTELY DO NOT use any images from upload.wikimedia.org, commons.wikimedia.org, Wikimedia, Unsplash, Pexels, example.com, or any other source. ONLY use picsum.photos.**
   - Do NOT use placeholder URLs like example.com or broken links
   - Ensure images are highly relevant to the topic and section they appear in
4. Use clear paragraph breaks and spacing for readability.
5. Use subheadings frequently to break up content and guide the reader.
6. Use bullet points or numbered lists for steps, tips, or grouped information.
7. Highlight key points with <strong> or <em>.
8. Make the layout visually engaging and easy to scan.
9. Write in a professional but accessible tone.
10. Include a meta description (max 160 characters)
11. Suggest 5-8 relevant keywords
12. Include 2-3 relevant hashtags for social media
13. **Most importantly: Embed all images, videos, and tweets directly in the HTML content at the most contextually relevant places.**
    - For images, use <img src="IMAGE_URL" alt="ALT_TEXT" style="border-radius: 16px; margin: 2em 0;" />
    - For videos, use <iframe src="VIDEO_URL" allowfullscreen style="width: 100%; height: 400px; border-radius: 16px; margin: 2em 0;"></iframe>
    - For tweets, use <blockquote class="twitter-tweet"><a href="TWEET_URL"></a></blockquote>
    - Do NOT use placeholders or separate media sections. Do NOT append media at the end—place them where they fit best in the article flow.
14. For all <img> tags, use real, relevant, and publicly accessible image URLs that are highly related to the article topic or section. Prefer images from reputable sources such as Unsplash, Pexels, or official news/media sites. **DO NOT use any images from upload.wikimedia.org or any Wikimedia domains.** Do NOT use example.com, placeholder, or broken links. Always provide a valid, working image URL that matches the topic and is embeddable.
15. Never include any instructional or placeholder text such as "[Insert ...]", "[Add ...]", or similar. All content must be fully written out, complete, and ready for publication. Do not leave any part of the article as a prompt or suggestion for the writer.
16. For all <img> tags, add style="border-radius: 16px; margin: 2em 0;" to make images rounded and properly spaced.
17. For all <p> tags, add style="text-indent: 2em; margin-bottom: 1.5em;" to ensure proper paragraph indentation and spacing.
18. Ensure there is clear and visually pleasing spacing between paragraphs and images.
19. For all <h2> tags, add style="font-size: 1.5em !important; font-weight: bold !important; margin-top: 2em; margin-bottom: 0.3em !important;" to ensure they are visually prominent, bold, and well-spaced.
20. For all <h3> tags, add style="font-size: 1.2em !important; font-weight: bold !important; margin-top: 1.5em; margin-bottom: 0.3em !important;".
21. For all <p> tags that immediately follow headings, set margin-top to 0.3em so the heading and its related paragraph are visually grouped.
22. Whenever possible, embed relevant YouTube videos directly in the article using <iframe> tags. The videos should be highly relevant to the article topic or section.
23. For all <iframe> tags (YouTube videos), use style="width: 100%; height: 400px; border-radius: 16px; margin: 2em 0;" so that videos are the same size and style as images.
24. Only embed YouTube videos that are publicly available and embeddable. Do NOT use playlist links, private videos, or videos that are likely to be region-locked or unavailable. Always use a direct YouTube video link in the format https://www.youtube.com/embed/VIDEO_ID, and ensure the video is playable and embeddable for most users.
25. Avoid using playlist URLs (such as .../videoseries?list=...) or any link that does not point to a single, public YouTube video.
26. Whenever possible, embed relevant tweets directly in the article using <blockquote class="twitter-tweet"><a href="TWEET_URL"></a></blockquote>. The tweets should be highly relevant to the article topic or section, such as expert opinions, news, or viral posts.

${contentContext}

Please format your response as follows:

TITLE: [Your article title here]
META_DESCRIPTION: [Meta description here]
KEYWORDS: [keyword1, keyword2, keyword3, keyword4, keyword5]
HASHTAGS: [hashtag1, hashtag2, hashtag3]

CONTENT:
[Your entire article content in valid, semantic HTML as described above, with all embeds already placed]

MEDIA:
IMAGES:
- [image_url_1] | [alt text 1]
- [image_url_2] | [alt text 2]
VIDEOS:
- [video_url_1]
- [video_url_2]
TWEETS:
- [tweet_url_1]
- [tweet_url_2]

Only include items that are actually embedded in the CONTENT.

---

Example:

TITLE: The Future of AI
META_DESCRIPTION: Discover how AI is shaping our world.
KEYWORDS: AI, future, technology, innovation, trends
HASHTAGS: #AI #Future #Tech

CONTENT:
<h1>The Future of AI</h1>
<img src="https://picsum.photos/800/600?random=1&keyword=artificial-intelligence" alt="AI Future Cover" style="border-radius: 16px; margin: 2em 0;" />
<h2 style="font-size: 1.5em !important; font-weight: bold !important; margin-top: 2em; margin-bottom: 0.3em !important;">Finding the Best Deals</h2>
<p style="text-indent: 2em; margin-top: 0.3em; margin-bottom: 1.5em;">To find the absolute best deals...</p>
<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" allowfullscreen style="width: 100%; height: 400px; border-radius: 16px; margin: 2em 0;"></iframe>
<blockquote class="twitter-tweet"><a href="https://twitter.com/elonmusk/status/1354617646168217602"></a></blockquote>

MEDIA:
IMAGES:
- [https://picsum.photos/800/600?random=1&keyword=artificial-intelligence] | [AI Future Cover]
VIDEOS:
- [https://www.youtube.com/embed/dQw4w9WgXcQ]
TWEETS:
- [https://twitter.com/elonmusk/status/1354617646168217602]

Make sure the content is original, engaging, and provides real value to readers.`;
  }

  async parseGeneratedContent(content, topic) {
    try {
      // Extract title
      const titleMatch = content.match(/TITLE:\s*(.+?)(?=\n|$)/i);
      const title = titleMatch ? titleMatch[1].trim() : `Complete Guide to ${topic}`;

      // Extract meta description
      const metaMatch = content.match(/META_DESCRIPTION:\s*(.+?)(?=\n|$)/i);
      let metaDescription = metaMatch ? metaMatch[1].trim() : `Learn everything about ${topic} in this comprehensive guide.`;
      if (metaDescription.length > 300) {
        metaDescription = metaDescription.substring(0, 297) + '...';
      }

      // Extract keywords
      const keywordsMatch = content.match(/KEYWORDS:\s*(.+?)(?=\n|$)/i);
      const keywords = keywordsMatch 
        ? keywordsMatch[1].split(',').map(k => k.trim()).filter(k => k)
        : [topic, 'guide', 'information', 'tips', 'latest'];

      // Extract hashtags
      const hashtagsMatch = content.match(/HASHTAGS:\s*(.+?)(?=\n|$)/i);
      const hashtags = hashtagsMatch 
        ? hashtagsMatch[1].split(',').map(h => h.trim()).filter(h => h)
        : [`#${topic.replace(/\s+/g, '')}`, '#trending', '#guide'];

      // Extract main content (now with all embeds already placed)
      const contentMatch = content.match(/CONTENT:\s*([\s\S]*?)(?=\nMEDIA:|$)/i);
      let articleContent = contentMatch ? contentMatch[1].trim() : content;

      // Extract the first <img> src as cover image
      let coverImage = '';
      const imgMatch = articleContent.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgMatch && !shouldExcludeImage(imgMatch[1])) {
        coverImage = imgMatch[1];
      }

      // Extract MEDIA section
      const mediaMatch = content.match(/MEDIA:\s*([\s\S]*)$/i);
      let images = [], videos = [], tweets = [];
      if (mediaMatch) {
        const mediaSection = mediaMatch[1];
        // Images
        const imagesMatch = mediaSection.match(/IMAGES:\s*([\s\S]*?)(?=VIDEOS:|TWEETS:|$)/i);
        if (imagesMatch) {
          images = imagesMatch[1].split('\n').map(line => {
            const m = line.match(/-\s*\[(.+?)\]\s*\|\s*\[(.+?)\]/);
            if (m) return { url: m[1].trim(), alt: m[2].trim(), caption: m[2].trim() };
            return null;
          }).filter(Boolean);
        }
        // Videos
        const videosMatch = mediaSection.match(/VIDEOS:\s*([\s\S]*?)(?=TWEETS:|$)/i);
        if (videosMatch) {
          videos = videosMatch[1].split('\n').map(line => {
            const m = line.match(/-\s*\[(.+?)\]/);
            if (m) return { url: m[1].trim(), title: '', platform: 'youtube' };
            return null;
          }).filter(Boolean);
        }
        // Tweets
        const tweetsMatch = mediaSection.match(/TWEETS:\s*([\s\S]*)/i);
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
        images = Array.from(articleContent.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi))
          .map(m => ({ url: m[1], alt: m[2], caption: m[2] }))
          .filter(img => !shouldExcludeImage(img.url));
      }
      if (videos.length === 0) {
        videos = Array.from(articleContent.matchAll(/<iframe[^>]+src=["']([^"']+)["'][^>]*>/gi)).map(m => ({
          url: m[1], title: '', platform: 'youtube' }));
      }
      if (tweets.length === 0) {
        tweets = Array.from(articleContent.matchAll(/<blockquote[^>]*class=["'][^"']*twitter-tweet[^"']*["'][^>]*>\s*<a[^>]+href=["']([^"']+)["']/gi)).map(m => ({
          url: m[1], content: '', author: 'TrendWise' }));
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

      // If no images remain, add Picsum fallback
      if (images.length === 0) {
        console.log('Final fallback: adding Picsum image');
        const keywords = topic.toLowerCase().split(' ').filter(word => word.length > 2);
        const relevantKeyword = keywords.length > 0 ? keywords[0] : 'technology';
        const randomNum = Math.floor(Math.random() * 100) + 1;
        const fallbackImage = `https://picsum.photos/800/600?random=${randomNum}&keyword=${relevantKeyword}`;
        images = [{
          url: fallbackImage,
          alt: topic,
          caption: topic
        }];
        
        // Add to article content if not already present
        if (!articleContent.includes(fallbackImage)) {
          const imgTag = `<img src="${fallbackImage}" alt="${topic}" style="border-radius: 16px; margin: 2em 0;" />`;
          articleContent = imgTag + articleContent;
        }
      }

      // Post-processing check: Ensure at least 3 picsum images and minimum content length
      const picsumImgCount = (articleContent.match(/<img[^>]+src=["']https:\/\/picsum\.photos/g) || []).length;
      if (picsumImgCount < 3 || articleContent.split(/\s+/).length < 800) {
        throw new Error('Gemini output did not meet requirements: less than 3 picsum images or too short.');
      }

      // Generate slug from title
      const slug = this.generateSlug(title);
      // Calculate read time (rough estimate: 200 words per minute)
      const wordCount = articleContent.split(/\s+/).length;
      const readTime = Math.ceil(wordCount / 200);
      // Calculate SEO score
      const seoScore = this.calculateSEOScore(title, metaDescription, keywords, articleContent);

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
          images,
          videos,
          tweets
        },
        hashtags
      };
    } catch (error) {
      console.error('Error parsing generated content:', error);
      // Fallback to basic article structure
      const fallbackDescription = `Learn everything about ${topic} in this comprehensive guide.`;
      return {
        title: `Complete Guide to ${topic}`,
        slug: this.generateSlug(topic),
        excerpt: fallbackDescription,
        content: `<h1>Complete Guide to ${topic}</h1><p>This is a comprehensive guide about ${topic}.</p>`,
        meta: {
          title: `Complete Guide to ${topic}`,
          description: fallbackDescription,
          keywords: [topic, 'guide', 'information']
        },
        trendingTopic: topic,
        source: 'gemini_ai',
        status: 'published',
        seoScore: 70,
        readTime: 3
      };
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