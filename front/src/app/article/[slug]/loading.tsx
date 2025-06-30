import React from "react";

export default function ArticleLoadingSkeleton() {
  return (
    <article className="bg-white rounded-2xl shadow p-6 max-w-3xl mx-auto animate-pulse">
      <div className="h-10 bg-gray-200 rounded w-2/3 mb-4" />
      <div className="flex items-center gap-4 mb-4">
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="h-4 bg-gray-100 rounded w-8" />
        <div className="h-4 bg-gray-200 rounded w-16" />
      </div>
      <div className="bg-gray-200 h-64 w-full rounded-xl mb-6" />
      <div className="space-y-4">
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-5/6" />
        <div className="h-4 bg-gray-100 rounded w-2/3" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
      </div>
      <div className="mt-8 h-8 w-32 bg-gray-200 rounded" />
      <div className="mt-8 space-y-2">
        <div className="h-4 bg-gray-100 rounded w-1/3" />
        <div className="h-4 bg-gray-100 rounded w-2/3" />
      </div>
    </article>
  );
} 