import { MetadataRoute } from 'next'
import axios from 'axios'

// Define a minimal type for sitemap articles
interface SitemapArticle {
  slug: string;
  updatedAt?: string;
  publishedAt?: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  // Get articles from API
  let articles: SitemapArticle[] = []
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL || 'https://trendwise-app-back.vercel.app'}/api/articles`,
      { params: { limit: 1000 } }
    )
    articles = res.data.articles
  } catch (err) {
    // fallback: no articles
    console.error('Failed to fetch articles for sitemap:', err)
  }

  // Base pages
  const basePages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
  ]

  // Article pages
  const articlePages = articles.map((article) => ({
    url: `${baseUrl}/article/${article.slug}`,
    lastModified: new Date(article.updatedAt || article.publishedAt || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...basePages, ...articlePages]
} 