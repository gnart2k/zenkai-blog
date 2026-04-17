import type { Metadata } from "next";
import "./globals.css";
import { getStrapiMedia, getStrapiURL } from "./utils/api-helpers";
import { fetchAPI } from "./utils/fetch-api";
import { i18n } from "../../../i18n-config";
import Footer from "./components/Footer";
import Header from "./components/Header";

const APP_NAME = "zenkai blog";

const FALLBACK_SEO = {
  title: `${APP_NAME}`,
  description: "Personal Blog Of TrangDP",
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
    const response = await fetchAPI("/categories", { populate: "*" }, options);
    return response.data || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getGlobal();

  if (!meta.data) return FALLBACK_SEO;

  const { metadata, favicon } = meta.data.attributes;
  const iconUrl = favicon?.data?.attributes?.url;

  return {
    title: metadata?.metaTitle || FALLBACK_SEO.title,
    description: metadata?.metaDescription || FALLBACK_SEO.description,
    icons: iconUrl ? { icon: [new URL(iconUrl, getStrapiURL())] } : {},
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const global = await getGlobal();
  const categories = await getCategories();

  const defaultNavbar = {
    links: [],
    button: null,
    navbarLogo: { logoImg: null, logoText: APP_NAME },
  };

  const defaultFooter = {
    footerLogo: { logoImg: null, logoText: APP_NAME },
    menuLinks: [],
    legalLinks: [],
    socialLinks: [],
    categories: { data: [] },
  };

  if (!global.data) {
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
            links={categories.map((cat: any) => ({
              id: cat.id,
              url: `/${cat.slug}`,
              newTab: false,
              text: cat.name,
            }))}
            logoUrl={null}
            logoText={APP_NAME}
          />
          <main id="main-content" className="flex-grow pt-16 lg:pt-20">
            {children}
          </main>
          <footer className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
            <p>©{new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
          </footer>
        </body>
      </html>
    );
  }

  const { navbar, footer } = global.data.attributes;

  console.log("Fetched global data:", global)
  const navbarLogoUrl = navbar?.navbarLogo?.logoImg?.data?.attributes?.url
    ? getStrapiMedia(navbar.navbarLogo.logoImg.data.attributes.url)
    : null;

  const footerLogoUrl = footer?.footerLogo?.logoImg?.data?.attributes?.url
    ? getStrapiMedia(footer.footerLogo.logoImg.data.attributes.url)
    : null;

  const categoryLinks = categories.map((cat: any) => ({
    id: cat.id,
    url: `/${cat.slug}`,
    newTab: false,
    text: cat.name,
  }));

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
          logoText={navbar?.navbarLogo?.logoText || APP_NAME}
        />

        <main id="main-content" className="flex-grow pt-16 lg:pt-20">
          {children}
        </main>

        <Footer
          logoUrl={footerLogoUrl}
          logoText={footer?.footerLogo?.logoText || APP_NAME}
          menuLinks={footer?.menuLinks || []}
          categoryLinks={footer?.categories?.data || []}
          legalLinks={footer?.legalLinks || []}
          socialLinks={footer?.socialLinks || []}
        />
      </body>
    </html>
  );
}

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}
