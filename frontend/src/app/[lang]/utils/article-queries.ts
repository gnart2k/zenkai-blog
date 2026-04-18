import { fetchAPI } from "./fetch-api";

const BLOG_SLUG = process.env.NEXT_PUBLIC_BLOG_SLUG || "";

/** Page size for article list pagination (home + category). */
export const ARTICLES_PAGE_SIZE = 9;

const articlePopulate = {
  cover: { fields: ["url"] },
  category: { populate: "*" },
  authorsBio: { populate: "*" },
} as const;

export type ArticlesListStrapiResponse = {
  data: unknown[];
  meta?: {
    pagination?: {
      page?: number;
      pageSize?: number;
      pageCount?: number;
      total?: number;
    };
  };
};

export function buildArticlesListParams(options: {
  pageIndex: number;
  pageSize?: number;
  categorySlug?: string;
  search?: string;
}) {
  const { pageIndex, pageSize = ARTICLES_PAGE_SIZE, categorySlug, search } = options;

  const filters: Record<string, unknown> = {};
  if (BLOG_SLUG) {
    filters.blog = { slug: BLOG_SLUG };
  }
  if (categorySlug) {
    filters.category = { slug: categorySlug };
  }
  const q = search?.trim();
  if (q) {
    filters.$or = [
      { title: { $containsi: q } },
      { description: { $containsi: q } },
    ];
  }

  return {
    sort: { createdAt: "desc" as const },
    filters: Object.keys(filters).length ? filters : undefined,
    populate: articlePopulate,
    pagination: {
      start: pageIndex * pageSize,
      limit: pageSize,
    },
  };
}

export async function fetchArticlesPage(options: {
  pageIndex: number;
  pageSize?: number;
  categorySlug?: string;
  search?: string;
}): Promise<ArticlesListStrapiResponse> {
  return fetchAPI("/articles", buildArticlesListParams(options)) as Promise<ArticlesListStrapiResponse>;
}

export function buildRecentPostsParams() {
  return {
    sort: { createdAt: "desc" as const },
    filters: BLOG_SLUG ? { blog: { slug: BLOG_SLUG } } : undefined,
    populate: articlePopulate,
    pagination: { start: 0, limit: 5 },
  };
}
