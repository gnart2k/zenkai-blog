// ./frontend/src/app/[lang]/components/Logo.tsx

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Logo({
  src,
  srcDark,
  children,
}: {
  src: string | null;
  srcDark?: string | null;
  children?: React.ReactNode;
}) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const logoSrc = isDark && srcDark ? srcDark : src;

  return (
    <Link
      href="/"
      aria-label="Back to homepage"
      className="flex items-center p-2"
    >
      {logoSrc && <Image src={logoSrc} alt="logo" width={45} height={45} />}
      <div className="ml-2">{children}</div>
    </Link>
  );
}