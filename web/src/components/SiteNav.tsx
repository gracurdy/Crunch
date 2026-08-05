"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

const links = [
  { href: "/", label: "Trips" },
  { href: "/photos", label: "Photos" },
  { href: "/map", label: "Map" },
];

export function SiteNav() {
  const pathname = usePathname();
  const overMedia = pathname === "/" || pathname.startsWith("/trips/");

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 ${overMedia ? "text-white" : "text-[var(--ink)]"}`}
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-5 md:px-10">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-xl tracking-tight md:text-2xl"
        >
          Our Atlas
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
        </nav>
      </div>
    </motion.header>
  );
}
