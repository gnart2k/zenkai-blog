"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getStrapiMedia, formatDate } from "../utils/api-helpers";
import { HiSearch, HiX } from "react-icons/hi";

export interface Article {
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
        <span className={fill ? "text-4xl font-bold text-primary-300 dark:text-primary-600 opacity-30" : "text-4xl font-bold text-primary-300 dark:text-primary-600 opacity-50"}>
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

interface FeaturedPostProps {
  article: Article;
}

export function FeaturedPost({ article }: FeaturedPostProps) {
  const imageUrl = article.cover?.url ? getStrapiMedia(article.cover.url) : null;
  const avatarUrl = article.authorsBio?.avatar?.url
    ? getStrapiMedia(article.authorsBio.avatar.url)
    : null;

  return (
    <article className="group relative rounded-3xl overflow-hidden bg-slate-900">
      <Link href={`${article.category?.slug}/${article.slug}`} className="block">
        <div className="relative aspect-[4/3] sm:aspect-[2/1] lg:aspect-[21/9] overflow-hidden">
          <FallbackImage
            src={imageUrl || ""}
            alt={`Cover image for ${article.title}`}
            fallbackText={article.title}
            fill
            priority
            sizes="(max-width: 1023px) 100vw, 75vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          <div className="absolute inset-0 p-4 sm:p-6 md:p-10 flex flex-col justify-end">
            <div className="max-w-3xl min-w-0">
              {article.category && (
                <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-primary-600 rounded-full mb-4">
                  {article.category.name}
                </span>
              )}

              <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4 leading-tight break-words">
                {article.title}
              </h2>

              <p className="text-slate-300 text-sm md:text-base mb-6 line-clamp-2 max-w-2xl">
                {article.description}
              </p>

              <div className="flex items-center gap-4">
                {avatarUrl && (
                  <Image
                    src={avatarUrl}
                    alt={`${article.authorsBio?.name}'s avatar`}
                    width={40}
                    height={40}
                    className="rounded-full object-cover border-2 border-white/20"
                  />
                )}
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="font-medium text-white">
                    {article.authorsBio?.name}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-400" />
                  <time dateTime={article.publishedAt}>
                    {formatDate(article.publishedAt)}
                  </time>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

interface SidebarPostProps {
  article: Article;
}

export function SidebarPost({ article }: SidebarPostProps) {
  const imageUrl = article.cover?.url ? getStrapiMedia(article.cover.url) : null;

  return (
    <Link
      href={`${article.category?.slug}/${article.slug}`}
      className="group flex gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
    >
      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
        <FallbackImage
          src={imageUrl || ""}
          alt={`Cover image for ${article.title}`}
          fallbackText={article.title}
          fill
          sizes="80px"
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <div className="flex-1 min-w-0">
        {article.category && (
          <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
            {article.category.name}
          </span>
        )}
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mt-1">
          {article.title}
        </h3>
        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
          <span>{article.authorsBio?.name}</span>
          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
          <time dateTime={article.publishedAt}>
            {formatDate(article.publishedAt)}
          </time>
        </div>
      </div>
    </Link>
  );
}

interface PostCardProps {
  article: Article;
}

export function PostCard({ article }: PostCardProps) {
  const imageUrl = article.cover?.url ? getStrapiMedia(article.cover.url) : null;
  const avatarUrl = article.authorsBio?.avatar?.url
    ? getStrapiMedia(article.authorsBio.avatar.url)
    : null;

  return (
    <article className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
      <Link
        href={`${article.category?.slug}/${article.slug}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-t-2xl"
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

      <div className="p-5 flex flex-col flex-grow">
        {article.category && (
          <span className="inline-block px-3 py-1 text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-full mb-3 w-fit">
            {article.category.name}
          </span>
        )}

        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          <Link
            href={`${article.category?.slug}/${article.slug}`}
            className="focus:outline-none relative"
          >
            {article.title}
          </Link>
        </h3>

        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2 flex-grow">
          {article.description}
        </p>

        <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="w-7 h-7 rounded-full overflow-hidden">
            <FallbackImage
              src={avatarUrl || ""}
              alt={`${article.authorsBio?.name}'s avatar`}
              fallbackText={article.authorsBio?.name}
              width={28}
              height={28}
              className="w-full h-full"
            />
          </div>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {article.authorsBio?.name}
          </span>
          <span className="ml-auto text-xs text-slate-500 dark:text-slate-500">
            {formatDate(article.publishedAt)}
          </span>
        </div>
      </div>
    </article>
  );
}

interface FilterTabsProps {
  categories: { name: string; slug: string }[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function FilterTabs({
  categories,
  activeCategory,
  onCategoryChange,
}: FilterTabsProps) {
  const allCategories = [{ name: "All", slug: "" }, ...categories];

  return (
    <div className="flex flex-nowrap sm:flex-wrap gap-2 overflow-x-auto pb-1 -mx-1 px-1 sm:mx-0 sm:px-0 sm:overflow-visible sm:pb-0 [scrollbar-width:thin]">
      {allCategories.map((cat) => (
        <button
          type="button"
          key={cat.slug}
          onClick={() => onCategoryChange(cat.slug)}
          className={`shrink-0 px-4 py-2.5 text-sm font-medium rounded-full transition-all duration-200 ${
            activeCategory === cat.slug
              ? "bg-primary-600 text-white shadow-sm"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <div className="relative">
      <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search articles..."
        className="w-full md:w-64 pl-10 pr-10 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 border-0 rounded-full text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          <HiX className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
