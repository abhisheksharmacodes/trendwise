const puppeteer = require('puppeteer');

let image_search = 'new zealand team';

async function scrapeGoogleImages(query, maxImages = 20) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const searchUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}`;
  await page.goto(searchUrl, { waitUntil: 'networkidle2' });

  // Scroll to load more images
  let lastHeight = await page.evaluate('document.body.scrollHeight');
  while (true) {
    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
    await new Promise(resolve => setTimeout(resolve, 1000));
    let newHeight = await page.evaluate('document.body.scrollHeight');
    if (newHeight === lastHeight) break;
    lastHeight = newHeight;
    if ((await page.$$('.vimgld')).length >= maxImages) break;
  }

  // Extract image URLs
  const imageUrls = await page.evaluate((maxImages) => {
    const imgs = Array.from(document.querySelectorAll('.vimgld'));
    return imgs
      .map(img => img.getAttribute('src') || img.getAttribute('data-src'))
      .filter(Boolean)
      .slice(0, maxImages);
  }, maxImages);

  await browser.close();
  return imageUrls;
}

// Example usage:
scrapeGoogleImages(image_search, 20).then(urls => {
  console.log('Image URLs:', urls);
}).catch(err => {
  console.error('Error scraping images:', err);
});