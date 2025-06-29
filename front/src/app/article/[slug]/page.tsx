import { notFound } from "next/navigation";
import { Metadata } from "next";
import axios from "axios";
import Link from "next/link";
import Comments from "@/components/Comments";
import ArticleContent from "@/components/ArticleContent";

// Generate static params for ISR
export async function generateStaticParams() {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/articles`
    );
    
    return res.data.articles.map((article: any) => ({
      slug: article.slug,
    }));
  } catch (error) {
    console.error('Failed to generate static params:', error);
    return [];
  }
}

// Fetch article data on the server
async function getArticle(slug: string) {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/articles/${slug}`
    );
    return res.data;
  } catch (error) {
    console.error('Failed to fetch article:', error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getArticle(params.slug);

  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: article.title,
    description: article.excerpt || article.meta?.description || 'Read this trending article on TrendWise.',
    keywords: article.meta?.keywords || ['trending', 'article', 'news'],
    authors: [{ name: 'TrendWise Team' }],
    openGraph: {
      title: article.title,
      description: article.excerpt || article.meta?.description,
      type: 'article',
      url: `/article/${article.slug}`,
      images: article.media?.images?.[0]?.url ? [
        {
          url: article.media.images[0].url,
          alt: article.media.images[0].alt || article.title,
          width: 1200,
          height: 630,
        }
      ] : [],
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: ['TrendWise Team'],
      section: article.trendingTopic,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt || article.meta?.description,
      images: article.media?.images?.[0]?.url ? [article.media.images[0].url] : [],
    },
    alternates: {
      canonical: `/article/${article.slug}`,
    },
  };
}

// ISR configuration - revalidate every 60 seconds
export const revalidate = 60;

export default async function ArticleDetail({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug);

  if (!article) {
    notFound();
  }

  return (
    <article className="bg-white rounded-2xl shadow p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-2 leading-tight">{article.title}</h1>
      <div className="text-gray-500 text-sm mb-4 flex items-center gap-4">
        <span>{article.trendingTopic}</span>
        <span>·</span>
        <span>{article.readTime || 2} min read</span>
      </div>
      {article.media?.images?.[0]?.url && (
        <img
          src={article.media.images[0].url}
          alt={article.media.images[0].alt || article.title}
          className="w-full rounded-xl mb-6"
        />
      )}
      <ArticleContent content={article.content} media={article.media} />
      <div className="mt-8">
        <Link href="/" className="text-blue-600 hover:underline">← Back to articles</Link>
      </div>
      <Comments articleId={article._id} />
    </article>
  );
} 