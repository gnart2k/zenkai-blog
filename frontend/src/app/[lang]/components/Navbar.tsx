"use client";
import { useState, useEffect, useCallback } from "react";
import Logo from "./Logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiMenu, HiX } from "react-icons/hi";

interface NavLink {
  id: number;
  url: string;
  newTab: boolean;
  text: string;
}

function NavLink({ url, text }: NavLink) {
  const path = usePathname();
  const isActive = path === url;

  return (
    <li>
      <Link
        href={url}
        className={`block px-4 py-2 rounded-lg transition-colors duration-200 ${
          isActive
            ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium"
            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
        }`}
        aria-current={isActive ? "page" : undefined}
      >
        {text}
      </Link>
    </li>
  );
}

export default function Navbar({
  links,
  logoUrl,
  logoDarkUrl,
  logoText,
}: {
  links: Array<NavLink>;
  logoUrl: string | null;
  logoDarkUrl: string | null;
  logoText: string | null;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 10);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        isScrolled
          ? "bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm shadow-sm"
          : "bg-white dark:bg-slate-950"
      }`}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16 lg:h-18">
          <Link
            href="/"
            className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-lg"
            aria-label="Go to homepage"
          >
            <Logo src={logoUrl} srcDark={logoDarkUrl}>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {logoText}
              </span>
            </Logo>
          </Link>

          <div className="hidden lg:flex lg:items-center lg:gap-1">
            <ul className="flex items-center gap-1" role="list">
              {links.map((item: NavLink) => (
                <NavLink key={item.id} {...item} />
              ))}
            </ul>
          </div>

          <button
            type="button"
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            onClick={toggleMobileMenu}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? (
              <HiX className="w-6 h-6" aria-hidden="true" />
            ) : (
              <HiMenu className="w-6 h-6" aria-hidden="true" />
            )}
          </button>
        </div>

        <div
          id="mobile-menu"
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
          aria-hidden={!isMobileMenuOpen}
        >
          <div className="py-4 space-y-1 border-t border-slate-200 dark:border-slate-800">
            <ul className="space-y-1" role="list">
              {links.map((item: NavLink) => (
                <NavLink key={item.id} {...item} />
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[-1] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
}
