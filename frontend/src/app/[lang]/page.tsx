"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { fetchAPI } from "./utils/fetch-api";
import Loader from "./components/Loader";
import {
  FeaturedPost,
  PostCard,
  SidebarPost,
  FilterTabs,
  SearchInput,
} from "./components/HeroSection";

interface Article {
  id: number;
  title: string;
  description: string;
  slug: string;
  createdAt: string;
  publishedAt: string;
  cover?: {
    url: string;
  };
  category?: {
    name: string;
    slug: string;
  };
  authorsBio?: {
    name: string;
    avatar?: {
      url: string;
    };
  };
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

const BLOG_SLUG = process.env.NEXT_PUBLIC_BLOG_SLUG || "";

const fetcher = async () => {
  const [articlesResponse, categoriesResponse] = await Promise.all([
    fetchAPI("/articles", {
      sort: { createdAt: "desc" },
      filters: BLOG_SLUG ? { blog: { slug: BLOG_SLUG } } : undefined,
      populate: {
        cover: { fields: ["url"] },
        category: { populate: "*" },
        authorsBio: { populate: "*" },
      },
      pagination: { start: 0, limit: 20 },
    }),
    fetchAPI("/categories", { 
      filters: BLOG_SLUG ? { blog: { slug: BLOG_SLUG } } : undefined,
      populate: "*" 
    }),
  ]);
  return {
    articles: articlesResponse.data || [],
    categories: categoriesResponse.data || [],
  };
};

export default function Home() {
  const { data, isLoading } = useSWR(BLOG_SLUG ? `home-page-data-${BLOG_SLUG}` : "home-page-data", fetcher);
  const [activeCategory, setActiveCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const articles: Article[] = data?.articles || [];
  const categories: Category[] = data?.categories || [];

  const filteredArticles = useMemo(() => {
    let filtered = [...articles];

    if (activeCategory) {
      filtered = filtered.filter(
        (article) => article.category?.slug === activeCategory
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          article.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [articles, activeCategory, searchQuery]);

  const featuredArticle = filteredArticles[0];
  const gridArticles = filteredArticles.slice(1);
  const sidebarArticles = articles.slice(0, 5);

  const categoryOptions = categories.map((cat) => ({
    name: cat.name,
    slug: cat.slug,
  }));

  if (isLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <main className="lg:col-span-3 space-y-8">
            {featuredArticle && <FeaturedPost article={featuredArticle} />}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <FilterTabs
                categories={categoryOptions}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
              <SearchInput value={searchQuery} onChange={setSearchQuery} />
            </div>

            {gridArticles.length === 0 ? (
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
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {gridArticles.map((article) => (
                  <PostCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </main>

          <aside className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
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
                <button className="w-full px-4 py-2.5 rounded-lg bg-white text-primary-600 font-medium text-sm hover:bg-primary-50 transition-colors">
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