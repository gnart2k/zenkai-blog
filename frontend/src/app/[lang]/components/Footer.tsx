"use client";
import Link from "next/link";
import Logo from "./Logo";
import { CgWebsite } from "react-icons/cg";
import { FaDiscord } from "react-icons/fa";
import { AiFillTwitterCircle, AiFillYoutube } from "react-icons/ai";

interface FooterLink {
  id: number;
  url: string;
  newTab: boolean;
  text: string;
  social?: string;
}

interface CategoryLink {
  id: string | number;
  name: string;
  slug: string;
}

function SocialIcon({ social }: { social: string | undefined }) {
  const iconClass = "w-5 h-5";
  
  switch (social) {
    case "WEBSITE":
      return <CgWebsite className={iconClass} aria-hidden="true" />;
    case "TWITTER":
      return <AiFillTwitterCircle className={iconClass} aria-hidden="true" />;
    case "YOUTUBE":
      return <AiFillYoutube className={iconClass} aria-hidden="true" />;
    case "DISCORD":
      return <FaDiscord className={iconClass} aria-hidden="true" />;
    default:
      return null;
  }
}

export default function Footer({
  logoUrl,
  logoText,
  menuLinks,
  categoryLinks,
  legalLinks,
  socialLinks,
}: {
  logoUrl: string | null;
  logoText: string | null;
  menuLinks: Array<{ id: string | number; url: string; text: string }>;
  categoryLinks: Array<CategoryLink>;
  legalLinks: Array<{ id: string | number; url: string; text: string }>;
  socialLinks: Array<{ id: string | number; url: string; text: string; social?: string; newTab?: boolean }>;
}) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-lg"
              aria-label="Go to homepage"
            >
              <Logo src={logoUrl}>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {logoText}
                </span>
              </Logo>
            </Link>
            <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Exploring ideas, sharing knowledge, and building the future one post at a time.
            </p>
          </div>

          <nav aria-label="Categories">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Categories
            </h3>
            <ul className="space-y-3" role="list">
              {categoryLinks.map((link: CategoryLink) => (
                <li key={link.id}>
                  <Link
                    href={`/${link.slug}`}
                    className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Quick links">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3" role="list">
              {menuLinks.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.url}
                    className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Follow Us
            </h3>
            <div className="flex items-center gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target={link.newTab ? "_blank" : "_self"}
                  rel={link.newTab ? "noopener noreferrer" : undefined}
                  className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  aria-label={`Visit our ${link.text}`}
                >
                  <SocialIcon social={link.social} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              ©{currentYear} {logoText}. All rights reserved.
            </p>
            <nav aria-label="Legal">
              <ul className="flex items-center gap-6" role="list">
                {legalLinks.map((link) => (
                  <li key={link.id}>
                    <Link
                      href={link.url}
                      className="text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors text-sm"
                    >
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
