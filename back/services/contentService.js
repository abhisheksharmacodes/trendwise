const { GoogleGenerativeAI } = require('@google/generative-ai');
const trendingService = require('./trendingService');

class ContentService {
  constructor() {
    this.genAI = new GoogleGenerativeAI('AIzaSyDQhCJAQaqicOP7TYzAH99X3p3tEeKiubw');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async generateArticle(topic, relatedContent = []) {
    try {
      const prompt = this.buildArticlePrompt(topic, relatedContent);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();
      
      // Parse the generated content
      const articleData = this.parseGeneratedContent(content, topic);
      
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

    return `You are an expert content writer and SEO specialist. Create a comprehensive, SEO-optimized blog article about "${topic}".

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
3. Use clear paragraph breaks and spacing for readability.
4. Use subheadings frequently to break up content and guide the reader.
5. Use bullet points or numbered lists for steps, tips, or grouped information.
6. Highlight key points with <strong> or <em>.
7. Make the layout visually engaging and easy to scan.
8. Write in a professional but accessible tone.
9. Include a meta description (max 160 characters)
10. Suggest 5-8 relevant keywords
11. Include 2-3 relevant hashtags for social media

${contentContext}

Please format your response as follows:

TITLE: [Your article title here]
META_DESCRIPTION: [Meta description here]
KEYWORDS: [keyword1, keyword2, keyword3, keyword4, keyword5]
HASHTAGS: [hashtag1, hashtag2, hashtag3]

CONTENT:
[Your article content in valid, semantic HTML as described above]

IMAGES:
[Suggest 2-3 relevant image descriptions for the article]

VIDEOS:
[Suggest 1-2 relevant video topics or sources]

TWEETS:
[Suggest 2-3 tweet-worthy quotes from the article]

Make sure the content is original, engaging, and provides real value to readers.`;
  }

  // Post-process content to ensure HTML structure
  postProcessContent(rawContent) {
    // If it already contains lots of tags, return as is
    const tagCount = (rawContent.match(/<\/?[a-z][^>]*>/gi) || []).length;
    if (tagCount > 5) return rawContent;

    // Otherwise, wrap lines in <p> and detect headings
    return rawContent
      .split(/\n+/)
      .map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        // Heading detection: line ends with ':' or is ALL CAPS or looks like a section
        if (/^[A-Z][A-Za-z0-9 ,:'"-]{3,80}:$/.test(trimmed) || /^[A-Z ]{5,}$/.test(trimmed)) {
          return `<h2>${trimmed.replace(/:$/, '')}</h2>`;
        }
        // List detection: starts with - or *
        if (/^[-*] /.test(trimmed)) {
          return `<li>${trimmed.replace(/^[-*] /, '')}</li>`;
        }
        // Otherwise, wrap in <p>
        return `<p>${trimmed}</p>`;
      })
      .join('\n')
      // If we created <li>, wrap them in <ul>
      .replace(/(<li>.*?<\/li>\n?)+/gs, match => `<ul>\n${match}\n</ul>\n`);
  }

  parseGeneratedContent(content, topic) {
    try {
      // Extract title
      const titleMatch = content.match(/TITLE:\s*(.+?)(?=\n|$)/i);
      const title = titleMatch ? titleMatch[1].trim() : `Complete Guide to ${topic}`;

      // Extract meta description
      const metaMatch = content.match(/META_DESCRIPTION:\s*(.+?)(?=\n|$)/i);
      let metaDescription = metaMatch ? metaMatch[1].trim() : `Learn everything about ${topic} in this comprehensive guide.`;
      
      // Truncate meta description if it's too long (max 300 characters)
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

      // Extract main content
      const contentMatch = content.match(/CONTENT:\s*([\s\S]*?)(?=\n(?:IMAGES|VIDEOS|TWEETS):|$)/i);
      let articleContent = contentMatch ? contentMatch[1].trim() : content;
      // Post-process to ensure HTML structure
      articleContent = this.postProcessContent(articleContent);

      // Extract image suggestions
      const imagesMatch = content.match(/IMAGES:\s*([\s\S]*?)(?=\n(?:VIDEOS|TWEETS):|$)/i);
      const imageSuggestions = imagesMatch 
        ? imagesMatch[1].split('\n').map(img => img.trim()).filter(img => img && img !== 'IMAGES:')
        : [`${topic} illustration`, `${topic} infographic`];

      // Extract video suggestions
      const videosMatch = content.match(/VIDEOS:\s*([\s\S]*?)(?=\nTWEETS:|$)/i);
      const videoSuggestions = videosMatch 
        ? videosMatch[1].split('\n').map(vid => vid.trim()).filter(vid => vid && vid !== 'VIDEOS:')
        : [`${topic} tutorial`, `${topic} overview`];

      // Extract tweet suggestions
      const tweetsMatch = content.match(/TWEETS:\s*([\s\S]*?)$/i);
      const tweetSuggestions = tweetsMatch 
        ? tweetsMatch[1].split('\n').map(tweet => tweet.trim()).filter(tweet => tweet && tweet !== 'TWEETS:')
        : [`Discover the latest insights about ${topic}!`, `Everything you need to know about ${topic} in one place.`];

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
          image: imageSuggestions[0] || `${topic} image`,
          url: `${process.env.FRONTEND_URL}/article/${slug}`
        },
        trendingTopic: topic,
        source: 'gemini_ai',
        status: 'published',
        seoScore,
        readTime,
        media: {
          images: imageSuggestions.map((desc, index) => ({
            url: `https://picsum.photos/seed/${encodeURIComponent(topic.replace(/\s+/g, ''))}${index + 1}/800/400`,
            alt: desc,
            caption: desc
          })),
          videos: videoSuggestions.map(desc => ({
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(desc)}`,
            title: desc,
            platform: 'youtube'
          })),
          tweets: tweetSuggestions.map(content => ({
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(content)}`,
            content,
            author: 'TrendWise'
          }))
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