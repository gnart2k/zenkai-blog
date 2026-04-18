import React from "react";

interface PageHeaderProps {
  heading: string;
  text?: string;
}

export default function PageHeader({ heading, text }: PageHeaderProps) {
  return (
    <header className="w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20 text-center">
      <div className="mx-auto max-w-4xl">
        {text && (
          <span className="inline-block max-w-full px-4 py-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-full mb-4 line-clamp-2 sm:line-clamp-none">
            {text}
          </span>
        )}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white tracking-tight break-words">
          {heading}
        </h1>
      </div>
    </header>
  );
}
