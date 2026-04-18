import type { Metadata, Viewport } from "next";
import "./globals.css";
import { fetchAPI } from "./utils/fetch-api";
import { i18n } from "../../../i18n-config";
import Footer from "./components/Footer";
import Header from "./components/Header";

const BLOG_SLUG = process.env.NEXT_PUBLIC_BLOG_SLUG || "";

async function getBlog() {
  if (!BLOG_SLUG) return null;
  
  const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
  const path = `/blogs`;
  const urlParamsObject = {
    filters: { slug: BLOG_SLUG },
    populate: ["logo", "logoDark", "theme", "seo", "seo.favicon"],
  };
  const options = { headers: { Authorization: `Bearer ${token}` } };
  const response = await fetchAPI(path, urlParamsObject, options);
  return response.data?.[0] || null;
}

async function getGlobal(): Promise<any> {
  const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

  if (!token) throw new Error("The Strapi API Token environment variable is not set.");

  const path = `/global`;
  const options = { headers: { Authorization: `Bearer ${token}` } };

  const urlParamsObject = {
    populate: [
      "metadata.shareImage",
      "favicon",
      "navbar.links",
      "navbar.navbarLogo.logoImg",
      "footer.footerLogo.logoImg",
      "footer.menuLinks",
      "footer.legalLinks",
      "footer.socialLinks",
      "footer.categories",
    ],
  };

  const response = await fetchAPI(path, urlParamsObject, options);
  return response;
}

async function getCategories(): Promise<any[]> {
  try {
    const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
    const options = { headers: { Authorization: `Bearer ${token}` } };
    const filters = BLOG_SLUG ? { blog: { slug: BLOG_SLUG } } : {};
    const response = await fetchAPI("/categories", { filters, populate: "*" }, options);
    return response.data || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const blog = await getBlog();
  const global = await getGlobal();

  const favicon = blog?.seo?.favicon?.url || global?.data?.attributes?.favicon?.url;

  if (blog?.seo) {
    const seo = blog.seo;
    return {
      title: seo.metaTitle || blog.name,
      description: seo.metaDescription || blog.description,
      icons: favicon ? { icon: favicon, shortcut: favicon, apple: favicon } : undefined,
    };
  }

  if (blog) {
    return {
      title: blog?.name || "Blog",
      description: blog?.description || "",
      icons: favicon ? { icon: favicon, shortcut: favicon, apple: favicon } : undefined,
    };
  }

  return {
    title: "wisdom",
    description: "Personal Blog",
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const [global, categories, blog] = await Promise.all([
    getGlobal(),
    getCategories(),
    getBlog(),
  ]);

  const appName = blog?.name || "Blog";
  const blogLogoUrl = blog?.logo?.url
  const blogLogoDarkUrl = blog?.logoDark?.url

  const categoryLinks = categories.map((cat: any) => ({
    id: cat.id,
    url: `/${cat.slug}`,
    newTab: false,
    text: cat.name,
  }));

  const navbarLogoUrl = blogLogoUrl
  const navbarLogoDarkUrl = blogLogoDarkUrl

  return (
    <html lang={params.lang} className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 antialiased">
        <a
          href="#main-content"
          className="skip-link"
        >
          Skip to main content
        </a>

        <Header
          links={categoryLinks}
          logoUrl={navbarLogoUrl}
          logoDarkUrl={navbarLogoDarkUrl}
          logoText={global.data?.attributes?.navbar?.navbarLogo?.logoText || appName}
        />

        <main id="main-content" className="flex-grow min-w-0 pt-16 lg:pt-20">
          {children}
        </main>

        <Footer
          logoUrl={navbarLogoUrl}
          logoDarkUrl={navbarLogoDarkUrl}
          logoText={""}
          menuLinks={global.data?.attributes?.footer?.menuLinks || []}
          categoryLinks={global.data?.attributes?.footer?.categories?.data || []}
          legalLinks={global.data?.attributes?.footer?.legalLinks || []}
          socialLinks={global.data?.attributes?.footer?.socialLinks || []}
        />
      </body>
    </html>
  );
}

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}