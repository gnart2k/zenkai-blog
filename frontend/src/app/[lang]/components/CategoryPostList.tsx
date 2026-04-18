"use client";

import { useCallback, useEffect, useRef } from "react";
import useSWRInfinite from "swr/infinite";
import { fetchAPI } from "../utils/fetch-api";
import {
  ARTICLES_PAGE_SIZE,
  buildArticlesListParams,
  type ArticlesListStrapiResponse,
} from "../utils/article-queries";
import ArticleCard, { type ArticleCardArticle } from "./ArticleCard";
import Loader from "./Loader";

function isArticleCardArticle(x: unknown): x is ArticleCardArticle {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "number" &&
    typeof o.title === "string" &&
    typeof o.slug === "string" &&
    typeof o.publishedAt === "string"
  );
}

export default function CategoryPostList({ categorySlug }: { categorySlug: string }) {
  const getKey = useCallback(
    (pageIndex: number, previousPageData: ArticlesListStrapiResponse | null) => {
      if (
        previousPageData &&
        (previousPageData.data?.length ?? 0) < ARTICLES_PAGE_SIZE
      ) {
        return null;
      }
      return ["category-articles", categorySlug, pageIndex] as const;
    },
    [categorySlug]
  );

  const fetcher = useCallback(
    (key: readonly ["category-articles", string, number]) => {
      const [, slug, pageIndex] = key;
      return fetchAPI(
        "/articles",
        buildArticlesListParams({
          pageIndex,
          categorySlug: slug,
        })
      ) as Promise<ArticlesListStrapiResponse>;
    },
    []
  );

  const { data, error, size, setSize, isValidating, isLoading } = useSWRInfinite(
    getKey,
    fetcher,
    { revalidateFirstPage: false }
  );

  const prevSlug = useRef<string | null>(null);
  useEffect(() => {
    if (prevSlug.current === null) {
      prevSlug.current = categorySlug;
      return;
    }
    if (prevSlug.current !== categorySlug) {
      prevSlug.current = categorySlug;
      setSize(1);
    }
  }, [categorySlug, setSize]);

  const articles: ArticleCardArticle[] = data
    ? data.flatMap((page) =>
        (page.data ?? []).filter(isArticleCardArticle)
      )
    : [];

  const hasMore = Boolean(
    data &&
      data.length > 0 &&
      (data[data.length - 1]?.data?.length ?? 0) >= ARTICLES_PAGE_SIZE
  );

  if (isLoading && !data) {
    return <Loader />;
  }

  if (error) {
    return (
      <section className="container mx-auto max-w-7xl px-4 py-16 text-center text-slate-600 dark:text-slate-400">
        <p>Could not load articles. Please try again later.</p>
      </section>
    );
  }

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
            Check back soon for new content.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setSize((s) => s + 1)}
            disabled={isValidating}
            className="btn-primary px-6 py-2.5 text-sm font-medium disabled:opacity-60"
          >
            {isValidating ? "Loading…" : "Load more"}
          </button>
        </div>
      )}

      {isValidating && articles.length > 0 && (
        <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          Loading more…
        </p>
      )}
    </section>
  );
}
