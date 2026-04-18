"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import { fetchAPI } from "./utils/fetch-api";
import {
  ARTICLES_PAGE_SIZE,
  buildArticlesListParams,
  buildRecentPostsParams,
  type ArticlesListStrapiResponse,
} from "./utils/article-queries";
import Loader from "./components/Loader";
import {
  FeaturedPost,
  PostCard,
  SidebarPost,
  FilterTabs,
  SearchInput,
} from "./components/HeroSection";
import type { Article } from "./components/HeroSection";

interface Category {
  id: number;
  name: string;
  slug: string;
}

const BLOG_SLUG = process.env.NEXT_PUBLIC_BLOG_SLUG || "";

function isArticle(x: unknown): x is Article {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "number" &&
    typeof o.title === "string" &&
    typeof o.slug === "string" &&
    typeof o.publishedAt === "string"
  );
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(id);
  }, [searchQuery]);

  const { data: categoriesData, error: categoriesError } = useSWR(
    BLOG_SLUG ? `categories-${BLOG_SLUG}` : "categories",
    () =>
      fetchAPI("/categories", {
        filters: BLOG_SLUG ? { blog: { slug: BLOG_SLUG } } : undefined,
        populate: "*",
      })
  );

  const { data: recentResponse } = useSWR(
    BLOG_SLUG ? `recent-posts-${BLOG_SLUG}` : "recent-posts",
    () => fetchAPI("/articles", buildRecentPostsParams())
  );

  const getKey = useCallback(
    (pageIndex: number, previousPageData: ArticlesListStrapiResponse | null) => {
      if (
        previousPageData &&
        (previousPageData.data?.length ?? 0) < ARTICLES_PAGE_SIZE
      ) {
        return null;
      }
      return [
        "home-articles",
        BLOG_SLUG,
        activeCategory,
        debouncedSearch,
        pageIndex,
      ] as const;
    },
    [activeCategory, debouncedSearch]
  );

  const fetchArticlesPage = useCallback(
    (key: readonly [
      "home-articles",
      string,
      string,
      string,
      number,
    ]) => {
      const [, , category, search, pageIndex] = key;
      return fetchAPI(
        "/articles",
        buildArticlesListParams({
          pageIndex,
          categorySlug: category || undefined,
          search,
        })
      ) as Promise<ArticlesListStrapiResponse>;
    },
    []
  );

  const {
    data: articlePages,
    error: articlesError,
    size,
    setSize,
    isValidating,
    isLoading: articlesLoading,
  } = useSWRInfinite(getKey, fetchArticlesPage, {
    revalidateFirstPage: false,
  });

  const prevFilters = useRef<{ c: string; q: string } | null>(null);
  useEffect(() => {
    if (prevFilters.current === null) {
      prevFilters.current = { c: activeCategory, q: debouncedSearch };
      return;
    }
    if (
      prevFilters.current.c !== activeCategory ||
      prevFilters.current.q !== debouncedSearch
    ) {
      prevFilters.current = { c: activeCategory, q: debouncedSearch };
      setSize(1);
    }
  }, [activeCategory, debouncedSearch, setSize]);

  const categories: Category[] = categoriesData?.data || [];
  const sidebarArticles: Article[] = (recentResponse?.data ?? []).filter(
    isArticle
  );

  const filteredArticles: Article[] = articlePages
    ? articlePages.flatMap((page) => (page.data ?? []).filter(isArticle))
    : [];

  const featuredArticle = filteredArticles[0];
  const hasMore = Boolean(
    articlePages &&
      articlePages.length > 0 &&
      (articlePages[articlePages.length - 1]?.data?.length ?? 0) >=
        ARTICLES_PAGE_SIZE
  );

  const categoryOptions = categories.map((cat) => ({
    name: cat.name,
    slug: cat.slug,
  }));

  const loadingInitial =
    (!categoriesData && !categoriesError) ||
    (articlesLoading && !articlePages);

  if (loadingInitial) return <Loader />;

  if (articlesError && !articlePages) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
        <p className="text-center text-slate-600 dark:text-slate-400">
          Could not load articles. Please refresh the page.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 min-w-0 lg:grid-cols-4 gap-6 lg:gap-8">
          <main className="min-w-0 lg:col-span-3 space-y-6 sm:space-y-8">
            {featuredArticle && (
              <div className="hidden lg:block">
                <FeaturedPost article={featuredArticle} />
              </div>
            )}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between md:items-center">
              <FilterTabs
                categories={categoryOptions}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
              <SearchInput value={searchQuery} onChange={setSearchQuery} />
            </div>

            {filteredArticles.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                  <svg
                    className="w-8 h-8 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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
                  No articles found
                </h3>
                <p className="text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                  {searchQuery
                    ? "Try adjusting your search or filter criteria"
                    : "Check back soon for new content"}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredArticles.map((article, index) => (
                    <div
                      key={article.id}
                      className={index === 0 ? "lg:hidden" : undefined}
                    >
                      <PostCard article={article} />
                    </div>
                  ))}
                </div>

                {hasMore && (
                  <div className="flex justify-center pt-4">
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

                {isValidating && filteredArticles.length > 0 && (
                  <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                    Loading more…
                  </p>
                )}
              </>
            )}
          </main>

          <aside className="min-w-0 lg:col-span-1">
            <div className="space-y-6 lg:sticky lg:top-28">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                  Recent Posts
                </h3>
                <div className="space-y-1">
                  {sidebarArticles.map((article) => (
                    <SidebarPost key={article.id} article={article} />
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white">
                <h3 className="text-lg font-bold mb-2">Subscribe to our newsletter</h3>
                <p className="text-primary-100 text-sm mb-4">
                  Get the latest articles delivered straight to your inbox.
                </p>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-primary-200 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 mb-3"
                />
                <button
                  type="button"
                  className="w-full px-4 py-2.5 rounded-lg bg-white text-primary-600 font-medium text-sm hover:bg-primary-50 transition-colors"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
