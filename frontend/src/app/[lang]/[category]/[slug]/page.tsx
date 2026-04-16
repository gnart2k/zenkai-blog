import { fetchAPI } from '@/app/[lang]/utils/fetch-api';
import Post from '@/app/[lang]/components/Post';
import type { Metadata } from 'next';

async function getPostBySlug(slug: string) {
    const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
    const path = `/articles`;
    const urlParamsObject = {
        filters: { slug },
        populate: ['cover', 'authorsBio.avatar', 'category', 'blocks'],
    };
    const options = { headers: { Authorization: `Bearer ${token}` } };
    const response = await fetchAPI(path, urlParamsObject, options);
    console.log(response)
    return response;
}

async function getMetaData(slug: string) {
    const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
    const path = `/articles`;
    const urlParamsObject = {
        filters: { slug },
        populate: ['seo'],
    };
    const options = { headers: { Authorization: `Bearer ${token}` } };
    const response = await fetchAPI(path, urlParamsObject, options);
    return response.data;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const meta = await getMetaData(params.slug);
    if (!meta || meta.length === 0) return { title: 'Post not found' };
    const article = meta[0];
    const metadata = article.seo;

    return {
        title: metadata?.metaTitle || article.title,
        description: metadata?.metaDescription || article.description,
    };
}

export default async function PostRoute({ params }: { params: { slug: string } }) {
    const { slug } = params;
    const data = await getPostBySlug(slug);
    if (!data.data || data.data.length === 0) return <h2>no post found</h2>;
    return <Post data={data.data[0]} />;
}

export async function generateStaticParams() {
    const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
    const path = `/articles`;
    const options = { headers: { Authorization: `Bearer ${token}` } };
    const articleResponse = await fetchAPI(
        path,
        {
            populate: ['category'],
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
