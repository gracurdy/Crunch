"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import { motion } from "motion/react";

const links = [
  { href: "/", label: "Trips" },
  { href: "/photos", label: "Photos" },
  { href: "/map", label: "Map" },
];

export function SiteNav() {
  const pathname = usePathname();
  const lenis = useLenis();
  const mediaStart = pathname === "/" || pathname.startsWith("/trips/");
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const overDark = mediaStart && !scrolledPastHero;

  useEffect(() => {
    if (!mediaStart) return;

    const update = (scroll = 0) => {
      setScrolledPastHero(scroll >= window.innerHeight * 0.72);
    };

    if (!lenis) {
      const onScroll = () => update(window.scrollY);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }

    const onScroll = ({ scroll }: { scroll: number }) => update(scroll);
    update(lenis.scroll);
    lenis.on("scroll", onScroll);
    return () => {
      lenis.off("scroll", onScroll);
    };
  }, [pathname, mediaStart, lenis]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${overDark ? "text-white" : "text-[var(--ink)]"}`}
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-5 md:px-10">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-xl tracking-tight md:text-2xl"
        >
          Project Atlas
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium tracking-wide md:gap-10">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative transition-opacity hover:opacity-100 ${active ? "opacity-100" : "opacity-55"}`}
              >
                {link.label}
                {active ? (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-1 left-0 h-px w-full bg-current"
                  />
                ) : null}
              </Link>
            );
          })}
          <a
            href={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/classic/`}
            className="opacity-55 transition-opacity hover:opacity-100"
          >
            Add
          </a>
        </nav>
      </div>
    </motion.header>
  );
}
