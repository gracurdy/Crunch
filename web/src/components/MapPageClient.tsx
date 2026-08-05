"use client";

import dynamic from "next/dynamic";
import type { Trip } from "@/lib/trips";

const TripMap = dynamic(
  () => import("@/components/TripMap").then((m) => m.TripMap),
  {
    ssr: false,
    loading: () => (
      <main className="px-5 pb-20 pt-28 md:px-10">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Places we&apos;ve been
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl md:text-7xl">
            Map
          </h1>
        </div>
        <div className="flex h-[70vh] min-h-[420px] items-center justify-center border border-[var(--ink)]/10 bg-[#d8e2e0] text-[var(--ink-soft)]">
          Loading map…
        </div>
      </main>
    ),
  },
);

export default function MapPageClient({
  trips,
  mapboxToken,
}: {
  trips: Trip[];
  mapboxToken?: string;
}) {
  return <TripMap trips={trips} mapboxToken={mapboxToken} />;
}
