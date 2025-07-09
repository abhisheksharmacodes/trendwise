"use client";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from 'next/navigation';
import Image from "next/image";
import Snackbar from "@/components/Snackbar";

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
  const [showSnackbar, setShowSnackbar] = useState(false);

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
      setShowSnackbar(false);
    } catch {
      setError("Failed to load articles");
      setShowSnackbar(true);
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
    <div className="flex flex-col items-center gap-8 px-6 sm:px-0 my-8">
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search articles"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-2 rounded-full p-4 pr-18 border-[#00000050] pl-6 w-full md:w-100 bg-white shadow-sm active:border-[#000000cc]"
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
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
          {Array.from({ length: 8 }).map((_, i) => (
            <li key={i} className="animate-pulse bg-gray-100 rounded-2xl shadow h-72 flex flex-col">
              <div className="bg-gray-200 h-56 w-full rounded-t-2xl" />
              <div className="p-4 flex-1 flex flex-col justify-end">
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <>
          <Snackbar
            message={error}
            type="error"
            isVisible={showSnackbar}
            onClose={() => setShowSnackbar(false)}
          />
          {search && articles.length === 0 && (
            <div className="text-gray-600 mb-4">
                <p>No articles found for &quot;{search}&quot;</p>
            </div>
          )}
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {articles.length === 0 && !search && <li>No articles found.</li>}
            {articles.map((article: ArticleSummary) => (
              <li key={article.slug} className="opacity-97 border-[#00000040] border-1 hover:opacity-100 hover:scale-101 bg-white rounded-2xl shadow group cursor-pointer transition hover:shadow-lg">
                <Link href={`/article/${article.slug}`} className="block h-full">
                  {article.media?.images?.[0]?.url && (
                    <Image
                      src={article.media.images[0].url}
                      alt={article.media.images[0].alt || article.title}
                      className="w-full h-56 object-cover rounded-t-2xl"
                      width={400}
                      height={224}
                      priority={true}
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
          {!search && totalPages > 1 && (
            <div className="flex gap-2 mt-8">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className={`flex items-center justify-center focus:outline-none ${page === 1 ? 'text-gray-400' : 'text-blue-600 hover:text-blue-800 cursor-pointer'}`}
                aria-label="Previous Page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`px-3 py-1 rounded cursor-pointer ${p === page ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className={`flex items-center justify-center focus:outline-none ${page === totalPages ? 'text-gray-400' : 'text-blue-600 hover:text-blue-800 cursor-pointer'}`}
                aria-label="Next Page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 