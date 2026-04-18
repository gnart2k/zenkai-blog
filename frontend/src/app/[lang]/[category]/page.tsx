import PageHeader from '@/app/[lang]/components/PageHeader';
import CategoryPostList from '@/app/[lang]/components/CategoryPostList';
import { fetchAPI } from '@/app/[lang]/utils/fetch-api';

const BLOG_SLUG = process.env.NEXT_PUBLIC_BLOG_SLUG || '';

async function fetchCategoryBySlug(slug: string) {
    try {
        const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
        const filters: Record<string, unknown> = { slug };
        if (BLOG_SLUG) {
            filters.blog = { slug: BLOG_SLUG };
        }
        const path = `/categories`;
        const urlParamsObject = {
            filters,
            populate: '*',
        };
        const options = { headers: { Authorization: `Bearer ${token}` } };
        const response = await fetchAPI(path, urlParamsObject, options);
        return response.data?.[0] ?? null;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export default async function CategoryRoute({ params }: { params: { category: string } }) {
    const filter = params.category;
    const category = await fetchCategoryBySlug(filter);

    if (!category) {
        return (
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
                <p className="text-slate-600 dark:text-slate-400">Category not found.</p>
            </div>
        );
    }

    const attrs =
        category && typeof category === 'object' && 'attributes' in category
            ? (category as { attributes?: { name?: string; description?: string } }).attributes
            : (category as { name?: string; description?: string });
    const name = attrs?.name ?? filter;
    const description = attrs?.description ?? '';

    return (
        <div>
            <PageHeader heading={name} text={description} />
            <CategoryPostList categorySlug={filter} />
        </div>
    );
}

export async function generateStaticParams() {
    return [];
}
