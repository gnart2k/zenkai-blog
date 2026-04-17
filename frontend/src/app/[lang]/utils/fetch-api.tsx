// ./frontend/stc/app/[lang]/utils/fetch-api.tsx
import qs from "qs";

const getAPIUrl = () => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://127.0.0.1:1337';
  }
  return process.env.NEXT_PUBLIC_STRAPI_PUBLIC_API_URL || 'http://127.0.0.1:1337';
};

const getProxyUrl = (path: string, urlParamsObject: any) => {
  const queryString = qs.stringify(urlParamsObject);
  const proxyPath = path.replace(/^\/api/, '');
  return `/api/strapi${proxyPath}${queryString ? `?${queryString}` : ""}`;
};

export async function fetchAPI(
  path: string,
  urlParamsObject = {},
  options = {}
) {
  try {
    const isClient = typeof window !== 'undefined';
    
    let requestUrl: string;
    let fetchOptions: RequestInit;

    if (isClient) {
      requestUrl = getProxyUrl(path, urlParamsObject);
      fetchOptions = {
        ...options,
      };
    } else {
      const baseUrl = getAPIUrl();
      const queryString = qs.stringify(urlParamsObject);
      requestUrl = `${baseUrl}/api${path}${queryString ? `?${queryString}` : ""}`;
      fetchOptions = {
        next: { revalidate: 60 },
        headers: {
          "Content-Type": "application/json",
        },
        ...options,
      };
    }

    const response = await fetch(requestUrl, fetchOptions);
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error(error);
    throw new Error(`Please check if your server is running and you set all the required tokens.`);
  }
}