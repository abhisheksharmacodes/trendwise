"use client";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from 'next/navigation';

// Define a minimal type for articles
interface ArticleSummary {
  slug: string;
  title: string;
  media?: {
    images?: Array<{
      url: string;
      alt?: string;
    }>;
  };
}

interface ClientHomePageProps {
  initialArticles: ArticleSummary[];
  total: number;
  initialPage?: number;
}

export default function ClientHomePage({ initialArticles, total, initialPage = 1 }: ClientHomePageProps) {
  const [articles, setArticles] = useState<ArticleSummary[]>(initialArticles);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(initialPage);
  const router = useRouter();
  const searchParams = useSearchParams();
  const postsPerPage = 10;
  const totalPages = Math.ceil(total / postsPerPage);

  const fetchArticles = useCallback(async (query = "", pageNum = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || "https://trendwise-app-back.vercel.app"}/api/articles`,
        { params: { search: query, page: pageNum, limit: postsPerPage } }
      );
      setArticles(res.data.articles);
      if (!search) {
        // Only update total if not searching
        // setTotal(res.data.total);
      }
      setError("");
    } catch {
      setError("Failed to load articles");
    }
    setLoading(false);
  }, [postsPerPage, search]);

  // Debounced live search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (search) {
        fetchArticles(search, 1);
        setPage(1);
      } else {
        setArticles(initialArticles);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [search, initialArticles, fetchArticles]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchArticles(search, newPage);
    // Update URL query param
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search articles"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-2 rounded-full p-4 pr-18 border-[#00000050] pl-6 w-100 bg-white shadow-sm active:border-[#000000cc]"
        />
        {search ? (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="bg-gray-200 cursor-pointer text-gray-600 my-[8px] px-3 -ml-18 rounded-full hover:bg-gray-300 shadow flex items-center justify-center"
            aria-label="Clear"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        ) : (
          <button
            type="submit"
            className="bg-blue-600 cursor-pointer text-white my-[8px] px-3 -ml-18 rounded-full hover:bg-blue-700 shadow flex items-center justify-center"
            aria-label="Search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
      {loading ? (
        <div>Loading articles...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          {search && (
            <div className="text-gray-600 mb-4">
              {articles.length === 0 ? (
                <p>No articles found for &quot;{search}&quot;</p>
              ) : (
                <p>Found {articles.length} article{articles.length !== 1 ? 's' : ''} for &quot;{search}&quot;</p>
              )}
            </div>
          )}
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {articles.length === 0 && !search && <li>No articles found.</li>}
            {articles.map((article: ArticleSummary) => (
              <li key={article.slug} className="opacity-97 border-[#00000040] border-1 hover:opacity-100 hover:scale-101 bg-white rounded-2xl shadow group cursor-pointer transition hover:shadow-lg">
                <Link href={`/article/${article.slug}`} className="block h-full">
                  {article.media?.images?.[0]?.url && (
                    <img
                      src={article.media.images[0].url}
                      alt={article.media.images[0].alt || article.title}
                      className="w-full h-56 object-cover rounded-t-2xl"
                    />
                  )}
                  <div className="p-4">
                    <div className="text-xl font-extrabold text-gray-900 mb-2 leading-tight">
                      {article.title}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {/* Pagination Controls */}
          {!search && totalPages > 1 && (
            <div className="flex gap-2 mt-8">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`px-3 py-1 rounded ${p === page ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 