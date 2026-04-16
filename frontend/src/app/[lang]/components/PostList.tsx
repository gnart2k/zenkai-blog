"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getStrapiMedia, formatDate } from "../utils/api-helpers";

interface Article {
  id: number;
  title: string;
  description: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
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

interface ArticleCardProps {
  article: Article;
}

function FallbackImage({
  src,
  alt,
  fallbackText,
  className,
  fill,
  ...props
}: {
  src: string;
  alt: string;
  fallbackText?: string;
  className?: string;
  fill?: boolean;
  [key: string]: any;
}) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className={`bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center ${fill ? "absolute inset-0" : ""} ${className}`}>
        <span className={fill ? "text-4xl" : "text-4xl font-bold text-primary-300 dark:text-primary-600 opacity-50"}>
          {fallbackText?.charAt(0) || "A"}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      onError={() => setHasError(true)}
      className={className}
      {...props}
    />
  );
}

function ArticleCard({ article }: ArticleCardProps) {
  const imageUrl = article.cover?.url
    ? getStrapiMedia(article.cover.url)
    : null;

  const avatarUrl = article.authorsBio?.avatar?.url
    ? getStrapiMedia(article.authorsBio.avatar.url)
    : null;

  return (
    <article className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 h-full flex flex-col">
      <Link
        href={`${article.category?.slug}/${article.slug}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-t-2xl"
        aria-label={`Read article: ${article.title}`}
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <FallbackImage
            src={imageUrl || ""}
            alt={`Cover image for ${article.title}`}
            fallbackText={article.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>

      <div className="p-6 flex flex-col flex-grow">
        {article.category && (
          <span className="inline-block px-3 py-1 text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-full mb-3 w-fit">
            {article.category.name}
          </span>
        )}

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          <Link
            href={`${article.category?.slug}/${article.slug}`}
            className="focus:outline-none relative"
          >
            {article.title}
          </Link>
        </h3>

        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-3 flex-grow">
          {article.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <FallbackImage
                src={avatarUrl || ""}
                alt={`${article.authorsBio?.name}'s avatar`}
                fallbackText={article.authorsBio?.name}
                width={32}
                height={32}
                className="w-full h-full"
              />
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {article.authorsBio?.name}
            </span>
          </div>
          <time
            dateTime={article.publishedAt}
            className="text-xs text-slate-500 dark:text-slate-500"
          >
            {formatDate(article.publishedAt)}
          </time>
        </div>
      </div>
    </article>
  );
}

interface PostListProps {
  data: Article[];
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
