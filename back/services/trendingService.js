const puppeteer = require('puppeteer');
const axios = require('axios');

class TrendingService {
  constructor() {
    this.browser = null;
    this.lastFetchTime = null;
    this.cacheDuration = 30 * 60 * 1000; // 30 minutes cache
    this.cachedTrends = null;
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
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
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
      console.log('[TRENDING] Fetching Google Trends...');
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      // Set user agent to avoid detection
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Set viewport
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Navigate to Google Trends with cache-busting
      const timestamp = Date.now();
      await page.goto(`https://trends.google.com/trends/trendingsearches/daily?geo=IN`, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for content to load with multiple selectors
      await page.waitForFunction(() => {
        const selectors = [
          '.mZ3RIc',
          '[data-testid="trending-searches"]',
          '.trending-searches'
        ];
        return selectors.some(selector => document.querySelector(selector));
      }, { timeout: 15000 });

      // Try extracting from .mZ3RIc first
      let topics = await page.$$eval('.mZ3RIc', els => els.map(el => el.textContent.trim()).filter(Boolean));
      console.log(`[TRENDING] .mZ3RIc found: ${topics.length} elements`);
      if (topics.length > 0) {
        topics.forEach((t, i) => console.log(`[TRENDING] .mZ3RIc[${i}]:`, t));
        // Return as trend objects
        const trends = topics.map(title => ({
          title,
          traffic: 'Unknown',
          source: 'google_trends',
          timestamp: new Date().toISOString()
        }));
        await page.close();
        console.log(`[TRENDING] ✅ Google Trends fetched: ${trends.length} topics (from .mZ3RIc)`);
        return trends;
      }

      // Fallback: Extract trending topics with improved selectors
      const trends = await page.evaluate(() => {
        const selectors = [
          '.feed-list-wrapper .feed-item',
          '[data-testid="trending-searches"] .trend-item',
          '.trending-searches .trend-item',
          '.trending-searches-item'
        ];
        let trendElements = [];
        for (const selector of selectors) {
          trendElements = document.querySelectorAll(selector);
          if (trendElements.length > 0) break;
        }
        const trends = [];
        trendElements.forEach((element, index) => {
          // No limit, add all
          const titleSelectors = [
            '.title',
            '.trend-title',
            'h3',
            '.trending-title',
            '[data-testid="trend-title"]'
          ];
          const trafficSelectors = [
            '.search-count-title',
            '.traffic-count',
            '.trend-traffic',
            '[data-testid="traffic-count"]'
          ];
          let title = '';
          let traffic = 'Unknown';
          for (const selector of titleSelectors) {
            const titleElement = element.querySelector(selector);
            if (titleElement) {
              title = titleElement.textContent.trim();
              break;
            }
          }
          for (const selector of trafficSelectors) {
            const trafficElement = element.querySelector(selector);
            if (trafficElement) {
              traffic = trafficElement.textContent.trim();
              break;
            }
          }
          if (title) {
            trends.push({
              title: title,
              traffic: traffic,
              source: 'google_trends',
              timestamp: new Date().toISOString()
            });
          }
        });
        return trends;
      });
      console.log(`[TRENDING] Fallback selectors found: ${trends.length} topics`);
      await page.close();
      console.log(`[TRENDING] ✅ Google Trends fetched: ${trends.length} topics`);
      return trends;
    } catch (error) {
      console.error('[TRENDING] ❌ Error fetching Google Trends:', error.message);
      return [];
    }
  }

  async getAllTrends(forceRefresh = false) {
    try {
      // Check cache first
      if (!forceRefresh && this.cachedTrends && this.lastFetchTime) {
        const timeSinceLastFetch = Date.now() - this.lastFetchTime;
        if (timeSinceLastFetch < this.cacheDuration) {
          console.log('[TRENDING] Using cached trends (age:', Math.round(timeSinceLastFetch / 1000), 'seconds)');
          return this.cachedTrends;
        }
      }

      console.log('[TRENDING] Fetching fresh trending topics...');
      // Only fetch from Google Trends
      const googleTrends = await this.getGoogleTrends();
      const allTrends = [];
      if (googleTrends && googleTrends.length > 0) {
        allTrends.push(...googleTrends);
        console.log(`[TRENDING] Added ${googleTrends.length} Google trends`);
      }
      // If no real sources succeeded, return empty array
      if (allTrends.length === 0) {
        console.log('[TRENDING] ❌ No trending topics found from real sources');
        return [];
      }
      // Remove duplicates and limit to top 15
      const uniqueTrends = allTrends.filter((trend, index, self) => 
        index === self.findIndex(t => t.title.toLowerCase() === trend.title.toLowerCase())
      );
      // Update cache
      this.cachedTrends = uniqueTrends;
      this.lastFetchTime = Date.now();
      console.log(`[TRENDING] ✅ Total unique trends: ${uniqueTrends.length}`);
      uniqueTrends.forEach((trend, index) => {
        console.log(`[TRENDING] ${index + 1}. ${trend.title} (${trend.source})`);
      });
      return uniqueTrends;
    } catch (error) {
      console.error('[TRENDING] ❌ Error fetching all trends:', error.message);
      return [];
    }
  }

  async searchRelatedContent(topic) {
    try {
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
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