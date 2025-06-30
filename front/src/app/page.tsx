import { Suspense } from "react";
import axios from "axios";
import ClientHomePage from "./ClientHomePage";

export default async function Home({ searchParams }: { searchParams?: Promise<{ [key: string]: string }> }) {
  const params = searchParams ? await searchParams : undefined;
  // Get page from search params (default 1)
  const page = params?.page ? parseInt(params.page) : 1;
  const limit = 10;
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL || "https://trendwise-app-back.vercel.app"}/api/articles`,
      { params: { page, limit } }
    );
    const initialArticles = res.data.articles;
    const total = res.data.total;
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <ClientHomePage initialArticles={initialArticles} total={total} initialPage={page} />
      </Suspense>
    );
  } catch (error) {
    console.error('Failed to fetch initial articles:', error);
    return <div>Failed to load articles.</div>;
  }
}
