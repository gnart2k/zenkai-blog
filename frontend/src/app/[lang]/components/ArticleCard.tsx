"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getStrapiMedia, formatDate } from "../utils/api-helpers";

export interface ArticleCardArticle {
  id: number;
  title: string;
  description: string;
  slug: string;
  createdAt: string;
  updatedAt?: string;
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
  [key: string]: unknown;
}) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center ${fill ? "absolute inset-0" : ""} ${className}`}
      >
        <span
          className={
            fill
              ? "text-4xl"
              : "text-4xl font-bold text-primary-300 dark:text-primary-600 opacity-50"
          }
        >
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
      className={className as string}
      {...props}
    />
  );
}

export default function ArticleCard({ article }: { article: ArticleCardArticle }) {
  const imageUrl = article.cover?.url ? getStrapiMedia(article.cover.url) : null;

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
