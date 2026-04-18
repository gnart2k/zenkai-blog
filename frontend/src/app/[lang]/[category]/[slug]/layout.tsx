import React from "react";
import ArticleSelect from "@/app/[lang]/components/ArticleSelect";
import { fetchAPI } from "@/app/[lang]/utils/fetch-api";

async function fetchSideMenuData(filter: string) {
  try {
    const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
    const options = { headers: { Authorization: `Bearer ${token}` } };

    const categoriesResponse = await fetchAPI(
      "/categories",
      { populate: "*" },
      options
    );

    const articlesResponse = await fetchAPI(
      "/articles",
      filter
        ? {
            filters: {
              category: {
                name: filter,
              },
            },
          }
        : {},
      options
    );

    return {
      articles: articlesResponse.data || [],
      categories: categoriesResponse.data || [],
    };
  } catch (error) {
    console.error(error);
    return {
      articles: [],
      categories: [],
    };
  }
}

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
}

interface Data {
  articles: Article[];
  categories: Category[];
}

export default async function LayoutRoute({
  params,
  children,
}: {
  children: React.ReactNode;
  params: {
    slug: string;
    category: string;
  };
}) {
  const { category } = params;
  const { categories, articles } = (await fetchSideMenuData(category)) as Data;

  return (
    <section className="container mx-auto max-w-7xl min-w-0 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="grid grid-cols-1 min-w-0 gap-6 lg:grid-cols-4 lg:gap-10 xl:gap-12">
        <div className="min-w-0 lg:col-span-3">
          {children}
        </div>
        <aside className="min-w-0 lg:col-span-1">
          <ArticleSelect
            categories={categories}
            articles={articles}
            params={params}
          />
        </aside>
      </div>
    </section>
  );
}

export async function generateStaticParams() {
  const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
  const path = `/articles`;
  const options = { headers: { Authorization: `Bearer ${token}` } };
  const articleResponse = await fetchAPI(
    path,
    {
      populate: ["category"],
    },
    options
  );

  return (articleResponse.data || []).map(
    (article: {
      slug: string;
      category?: {
        slug: string;
      };
    }) => ({ slug: article.slug, category: article.category?.slug || '' })
  );
}
