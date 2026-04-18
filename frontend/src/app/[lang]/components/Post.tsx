"use client";

import { useState } from "react";
import { formatDate, getStrapiMedia } from '@/app/[lang]/utils/api-helpers';
import { postRenderer } from '@/app/[lang]/utils/post-renderer';
import Image from 'next/image';

interface Article {
    id: number;
    title: string;
    description: string;
    slug: string;
    cover?: {
        url: string;
    };
    authorsBio?: {
        name: string;
        avatar?: {
            url: string;
        };
    };
    category?: {
        name: string;
        slug: string;
    };
    blocks?: any[];
    publishedAt: string;
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
                <span className={fill ? "text-6xl font-bold text-primary-300 dark:text-primary-600 opacity-30" : "text-6xl font-bold text-primary-300 dark:text-primary-600 opacity-50"}>
                    {fallbackText?.charAt(0) || 'A'}
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

export default function Post({ data }: { data: Article }) {
    const { title, description, publishedAt, cover, authorsBio, category, blocks } = data;
    const imageUrl = cover?.url ? getStrapiMedia(cover.url) : null;
    const authorImgUrl = authorsBio?.avatar?.url ? getStrapiMedia(authorsBio.avatar.url) : null;

    return (
        <article className="max-w-4xl mx-auto min-w-0 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <header className="mb-8">
                {category && (
                    <span className="inline-block px-3 py-1 text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-full mb-4">
                        {category.name}
                    </span>
                )}

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight mb-6 break-words">
                    {title}
                </h1>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden">
                            <FallbackImage
                                src={authorImgUrl || ''}
                                alt={`${authorsBio?.name}'s avatar`}
                                fallbackText={authorsBio?.name}
                                width={48}
                                height={48}
                                className="w-full h-full"
                            />
                        </div>
                        <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                                {authorsBio?.name}
                            </p>
                            <time 
                                dateTime={publishedAt}
                                className="text-sm text-slate-500 dark:text-slate-400"
                            >
                                {formatDate(publishedAt)}
                            </time>
                        </div>
                    </div>
                </div>
            </header>

            <figure className="mb-8 sm:mb-10 -mx-4 sm:mx-0">
                <div className="relative aspect-[16/10] sm:aspect-[16/9] overflow-hidden rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-slate-800">
                    <FallbackImage
                        src={imageUrl || ''}
                        alt={`Cover image for ${title}`}
                        fallbackText={title}
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 64rem"
                        className="object-cover"
                    />
                </div>
            </figure>

            <div className="rich-text text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-6 sm:mb-8 font-medium">
                    {description}
                </p>

                {blocks?.map((section: any, index: number) => postRenderer(section, index))}
            </div>

            <footer className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden">
                        <FallbackImage
                            src={authorImgUrl || ''}
                            alt={`${authorsBio?.name}'s avatar`}
                            fallbackText={authorsBio?.name}
                            width={64}
                            height={64}
                            className="w-full h-full"
                        />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                            Written by {authorsBio?.name}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Published on {formatDate(publishedAt)}
                        </p>
                    </div>
                </div>
            </footer>
        </article>
    );
}
