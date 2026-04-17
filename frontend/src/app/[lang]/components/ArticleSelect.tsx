import React from "react";
import Link from "next/link";

interface Category {
  id: number;
  name: string;
  slug: string;
  articles?: Array<{}>;
}

interface Article {
  id: number;
  title: string;
  slug: string;
  cover?: {
    url: string;
    formats?: {
      thumbnail?: { url: string };
      small?: { url: string };
    };
  };
}

function selectedFilter(current: string, selected: string) {
  return current === selected
    ? "px-3 py-1.5 rounded-full text-sm font-medium bg-primary-600 text-white"
    : "px-3 py-1.5 rounded-full text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700";
}

export default function ArticleSelect({
  categories,
  articles,
  params,
}: {
  categories: Category[];
  articles: Article[];
  params: {
    slug: string;
    category: string;
  };
}) {
  const filteredCategories = categories.filter(
    (category) => category.articles && category.articles.length > 0
  );

  return (
    <aside 
      className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 h-fit sticky top-24"
      aria-label="Article navigation"
    >
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
          Browse By Category
        </h3>
        <div className="flex flex-wrap gap-2 pb-6 border-b border-slate-200 dark:border-slate-700">
          {filteredCategories.map((category: Category) => (
            <Link
              key={category.id}
              href={`/${category.slug}`}
              className={selectedFilter(category.slug, params.category)}
              aria-current={category.slug === params.category ? "true" : undefined}
            >
              {category.name}
            </Link>
          ))}
          <Link 
            href="/" 
            className={selectedFilter("", params.category)}
          >
            All
          </Link>
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
            Related Articles
          </h4>
          <ul className="space-y-3" role="list">
            {articles.slice(0, 5).map((article: Article) => {
              const isCurrentArticle = params.slug === article.slug;
              const coverUrl = article.cover?.formats?.thumbnail?.url || article.cover?.formats?.small?.url || article.cover?.url;
              return (
                <li key={article.id}>
                  <Link
                    href={`/${params.category}/${article.slug}`}
                    className={`flex items-start gap-3 group ${
                      isCurrentArticle
                        ? ""
                        : ""
                    }`}
                    aria-current={isCurrentArticle ? "page" : undefined}
                  >
                    {coverUrl && (
                      <img
                        src={coverUrl}
                        alt=""
                        className="w-16 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <span className={`text-sm transition-colors line-clamp-2 ${
                      isCurrentArticle
                        ? "text-primary-600 dark:text-primary-400 font-medium"
                        : "text-slate-600 dark:text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400"
                    }`}>
                      {article.title}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </aside>
  );
}
