import { Suspense } from "react";
import Link from "next/link";
import axios from "axios";
import ClientHomePage from "./ClientHomePage";
import { cookies } from 'next/headers';
import { headers } from 'next/headers';
import { parse } from 'querystring';

export default async function Home({ searchParams }: { searchParams?: { [key: string]: string } }) {
  // Get page from search params (default 1)
  const page = searchParams?.page ? parseInt(searchParams.page) : 1;
  const limit = 10;
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/articles`,
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
