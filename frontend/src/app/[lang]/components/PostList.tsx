"use client";

import ArticleCard, { type ArticleCardArticle } from "./ArticleCard";

interface PostListProps {
  data: ArticleCardArticle[];
  children?: React.ReactNode;
}

export default function PostList({ data: articles, children }: PostListProps) {
  if (articles.length === 0) {
    return (
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
            <svg
              className="w-8 h-8 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No articles yet
          </h3>
          <p className="text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
            Check back soon for new content. We are working on bringing you interesting articles.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
      {children && (
        <div className="mt-12 flex justify-center">
          {children}
        </div>
      )}
    </section>
  );
}
