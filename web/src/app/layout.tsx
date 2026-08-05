import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { SiteNav } from "@/components/SiteNav";
import { SmoothScroll } from "@/components/SmoothScroll";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Our Atlas",
  description: "A family travel log with cinematic trip photo showcases.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-body)]">
        <SmoothScroll>
          <SiteNav />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
