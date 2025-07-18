import { notFound } from "next/navigation";
import { Metadata } from "next";
import axios from "axios";
import Link from "next/link";
import Comments from "@/components/Comments";
import ArticleContent from "@/components/ArticleContent";
import Image from "next/image";

// Define a minimal type for static params
interface ArticleSummary {
  slug: string;
}

// Generate static params for ISR
export async function generateStaticParams() {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL || "https://trendwise-app-back.vercel.app"}/api/articles`
    );
    
    return res.data.articles.map((article: ArticleSummary) => ({
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
      `${process.env.NEXT_PUBLIC_API_URL || "https://trendwise-app-back.vercel.app"}/api/articles/${slug}`
    );
    return res.data;
  } catch (error) {
    console.error('Failed to fetch article:', error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

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

export default async function ArticleDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <article className="bg-white mt-0 sm:mt-6 sm:rounded-2xl shadow p-6 sm:p-6 max-w-3xl mx-0 sm:mx-auto">
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 leading-tight">{article.title}</h1>
      <div className="text-gray-500 text-sm mb-4 flex items-center gap-4">
        <span className="uppercase">{article.trendingTopic}</span>
        <span>·</span>
        <span>{article.readTime || 2} min read</span>
      </div>
      {article.media?.images?.[0]?.url && (
        <Image
          src={article.media.images[0].url}
          alt={article.media.images[0].alt || article.title}
          className="w-full rounded-xl mb-6"
          width={800}
          height={400}
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