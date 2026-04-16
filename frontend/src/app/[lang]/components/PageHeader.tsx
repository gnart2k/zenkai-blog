import React from "react";

interface PageHeaderProps {
  heading: string;
  text?: string;
}

export default function PageHeader({ heading, text }: PageHeaderProps) {
  return (
    <header className="py-12 sm:py-16 lg:py-20 w-full text-center">
      {text && (
        <span className="inline-block px-4 py-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-full mb-4">
          {text}
        </span>
      )}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white tracking-tight">
        {heading}
      </h1>
    </header>
  );
}
