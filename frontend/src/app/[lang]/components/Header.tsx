"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { HiMenu, HiX, HiSearch, HiSun, HiMoon } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";

interface NavLink {
  id: number;
  url: string;
  newTab: boolean;
  text: string;
}

interface HeaderProps {
  links: Array<NavLink>;
  logoUrl: string | null;
  logoText: string | null;
}

export default function Header({ links, logoUrl, logoText }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const theme = document.documentElement.classList.contains("dark");
    setIsDark(theme);
  }, []);

  const toggleDarkMode = useCallback(() => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle("dark", newIsDark);
    localStorage.setItem("theme", newIsDark ? "dark" : "light");
  }, [isDark]);

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMobileMenuOpen || isSearchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen, isSearchOpen]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-sm border-b border-slate-200/50 dark:border-slate-800/50"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link
              href="/"
              className="flex items-center gap-3 group"
              aria-label="Go to homepage"
            >
              {logoUrl && (
                <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300">
                  <Image
                    src="/logo.svg"
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <span className="text-xl lg:text-2xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                {logoText}
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
              {links.map((item: NavLink) => {
                const isActive = pathname === item.url;
                return (
                  <Link
                    key={item.id}
                    href={item.url}
                    className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? "text-primary-600 dark:text-primary-400"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.text}
                    {isActive && (
                      <motion.span
                        layoutId="navbar-indicator"
                        className="absolute inset-0 bg-primary-100 dark:bg-primary-900/30 rounded-lg -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSearch}
                className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                aria-label="Search"
              >
                <HiSearch className="w-5 h-5" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={toggleDarkMode}
                className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={isDark ? "moon" : "sun"}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isDark ? (
                      <HiMoon className="w-5 h-5" aria-hidden="true" />
                    ) : (
                      <HiSun className="w-5 h-5" aria-hidden="true" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </button>

              <button
                type="button"
                className="lg:hidden p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                onClick={toggleMobileMenu}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={isMobileMenuOpen ? "close" : "menu"}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {isMobileMenuOpen ? (
                      <HiX className="w-5 h-5" aria-hidden="true" />
                    ) : (
                      <HiMenu className="w-5 h-5" aria-hidden="true" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isSearchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm"
              onClick={toggleSearch}
            />
            <div className="max-w-2xl mx-auto pt-32 px-4 fixed inset-x-0 z-50">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center gap-4 p-4">
                  <HiSearch className="w-5 h-5 text-slate-400" aria-hidden="true" />
                  <input
                    type="search"
                    placeholder="Search articles..."
                    className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-lg focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={toggleSearch}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <HiX className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={toggleMobileMenu}
            />
            <motion.nav
              id="mobile-menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-slate-950 shadow-2xl"
              aria-label="Mobile navigation"
            >
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    Menu
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <ul className="space-y-1" role="list">
                    {links.map((item: NavLink) => {
                      const isActive = pathname === item.url;
                      return (
                        <li key={item.id}>
                          <Link
                            href={item.url}
                            className={`flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                              isActive
                                ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                                : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                            aria-current={isActive ? "page" : undefined}
                          >
                            {item.text}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={toggleDarkMode}
                    className="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium"
                  >
                    {isDark ? (
                      <>
                        <HiSun className="w-5 h-5" aria-hidden="true" />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <HiMoon className="w-5 h-5" aria-hidden="true" />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
