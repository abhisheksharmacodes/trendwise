const puppeteer = require('puppeteer');
const axios = require('axios');

class TrendingService {
  constructor() {
    this.browser = null;
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async getGoogleTrends() {
    try {
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      // Set user agent to avoid detection
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Navigate to Google Trends
      await page.goto('https://trends.google.com/trends/trendingsearches/daily?geo=US', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for content to load
      await page.waitForSelector('.feed-list-wrapper', { timeout: 10000 });

      // Extract trending topics
      const trends = await page.evaluate(() => {
        const trendElements = document.querySelectorAll('.feed-list-wrapper .feed-item');
        const trends = [];
        
        trendElements.forEach((element, index) => {
          if (index < 10) { // Limit to top 10
            const titleElement = element.querySelector('.title');
            const trafficElement = element.querySelector('.search-count-title');
            
            if (titleElement) {
              trends.push({
                title: titleElement.textContent.trim(),
                traffic: trafficElement ? trafficElement.textContent.trim() : 'Unknown',
                source: 'google_trends'
              });
            }
          }
        });
        
        return trends;
      });

      await page.close();
      return trends;
    } catch (error) {
      console.error('Error fetching Google Trends:', error);
      // Fallback to mock data
      return this.getMockTrends();
    }
  }

  async getTwitterTrends() {
    try {
      // Note: Twitter API requires authentication
      // This is a simplified version that scrapes Twitter trends
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      await page.goto('https://twitter.com/explore/tabs/trending', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for trends to load
      await page.waitForSelector('[data-testid="trend"]', { timeout: 10000 });

      const trends = await page.evaluate(() => {
        const trendElements = document.querySelectorAll('[data-testid="trend"]');
        const trends = [];
        
        trendElements.forEach((element, index) => {
          if (index < 10) {
            const textElement = element.querySelector('[data-testid="trend"] span');
            if (textElement) {
              trends.push({
                title: textElement.textContent.trim(),
                traffic: 'Trending on Twitter',
                source: 'twitter'
              });
            }
          }
        });
        
        return trends;
      });

      await page.close();
      return trends;
    } catch (error) {
      console.error('Error fetching Twitter Trends:', error);
      return this.getMockTrends();
    }
  }

  async getMockTrends() {
    // Mock trending topics for development/testing
    return [
      {
        title: 'Artificial Intelligence Breakthroughs',
        traffic: 'High',
        source: 'mock'
      },
      {
        title: 'Climate Change Solutions',
        traffic: 'High',
        source: 'mock'
      },
      {
        title: 'Space Exploration News',
        traffic: 'Medium',
        source: 'mock'
      },
      {
        title: 'Tech Industry Updates',
        traffic: 'Medium',
        source: 'mock'
      },
      {
        title: 'Health and Wellness Trends',
        traffic: 'High',
        source: 'mock'
      },
      {
        title: 'Sustainable Living',
        traffic: 'Medium',
        source: 'mock'
      },
      {
        title: 'Digital Transformation',
        traffic: 'High',
        source: 'mock'
      },
      {
        title: 'Remote Work Culture',
        traffic: 'Medium',
        source: 'mock'
      },
      {
        title: 'Cybersecurity Threats',
        traffic: 'High',
        source: 'mock'
      },
      {
        title: 'Renewable Energy Innovations',
        traffic: 'Medium',
        source: 'mock'
      }
    ];
  }

  async getAllTrends() {
    try {
      const [googleTrends, twitterTrends] = await Promise.allSettled([
        this.getGoogleTrends(),
        this.getTwitterTrends()
      ]);

      const allTrends = [];
      
      if (googleTrends.status === 'fulfilled') {
        allTrends.push(...googleTrends.value);
      }
      
      if (twitterTrends.status === 'fulfilled') {
        allTrends.push(...twitterTrends.value);
      }

      // If both failed, use mock data
      if (allTrends.length === 0) {
        allTrends.push(...this.getMockTrends());
      }

      // Remove duplicates and limit to top 15
      const uniqueTrends = allTrends.filter((trend, index, self) => 
        index === self.findIndex(t => t.title === trend.title)
      ).slice(0, 15);

      return uniqueTrends;
    } catch (error) {
      console.error('Error fetching all trends:', error);
      return this.getMockTrends();
    }
  }

  async searchRelatedContent(topic) {
    try {
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Search for related news and content
      await page.goto(`https://www.google.com/search?q=${encodeURIComponent(topic)}&tbm=nws`, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      const content = await page.evaluate(() => {
        const articles = document.querySelectorAll('.SoaBEf');
        const results = [];
        
        articles.forEach((article, index) => {
          if (index < 5) {
            const titleElement = article.querySelector('.n0jPhd');
            const snippetElement = article.querySelector('.GI74Re');
            const linkElement = article.querySelector('a');
            
            if (titleElement) {
              results.push({
                title: titleElement.textContent.trim(),
                snippet: snippetElement ? snippetElement.textContent.trim() : '',
                url: linkElement ? linkElement.href : '',
                source: 'google_news'
              });
            }
          }
        });
        
        return results;
      });

      await page.close();
      return content;
    } catch (error) {
      console.error('Error searching related content:', error);
      return [];
    }
  }
}

module.exports = new TrendingService(); 