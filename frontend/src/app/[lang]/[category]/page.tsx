import PageHeader from '@/app/[lang]/components/PageHeader';
import { fetchAPI } from '@/app/[lang]/utils/fetch-api';
import PostList from '@/app/[lang]/components/PostList';

async function fetchPostsByCategory(filter: string) {
    try {
        const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
        const path = `/articles`;
        const urlParamsObject = {
            sort: { createdAt: 'desc' },
            filters: {
                category: {
                    slug: filter,
                },
            },
            populate: ['cover', 'category', 'authorsBio.avatar'],
        };
        const options = { headers: { Authorization: `Bearer ${token}` } };
        const responseData = await fetchAPI(path, urlParamsObject, options);
        responseData.data.length > 0 && console.log('Fetched posts by category:', responseData.data[1].cover);
        return responseData;
    } catch (error) {
        console.error(error);
        return { data: [] };
    }
}

export default async function CategoryRoute({ params }: { params: { category: string } }) {
    const filter = params.category;
    const result = await fetchPostsByCategory(filter);
    const data = result.data || [];

    if (data.length === 0) return <div>No posts in this category</div>;

    const { name, description } = data[0]?.category || {};

    return (
        <div>
            <PageHeader heading={name || filter} text={description || ''} />
            <PostList data={data} />
        </div>
    );
}

export async function generateStaticParams() {
    return [];
}
