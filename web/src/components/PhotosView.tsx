"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { Trip } from "@/lib/trips";

type PhotoItem = { src: string; trip: Trip; index: number };

export function PhotosView({ trips }: { trips: Trip[] }) {
  const photos: PhotoItem[] = trips.flatMap((trip) =>
    (trip.photos || []).map((src, index) => ({ src, trip, index })),
  );

  return (
    <main className="px-5 pb-28 pt-32 md:px-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-14"
      >
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
          Every trip, together
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl md:text-7xl">
          Photos
        </h1>
        <p className="mt-4 max-w-md text-[var(--ink-soft)]">
          Tap any frame to open its trip and scroll the full story.
        </p>
      </motion.div>

      {photos.length === 0 ? (
        <p className="text-[var(--muted)]">No photos yet.</p>
      ) : (
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
          {photos.map((item, i) => (
            <motion.div
              key={`${item.trip.id}-${item.index}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-5%" }}
              transition={{ duration: 0.6, delay: (i % 6) * 0.04 }}
              className="mb-5 break-inside-avoid"
            >
              <Link href={`/trips/${item.trip.id}`} className="group relative block overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src}
                  alt={`${item.trip.title} photo`}
                  className="w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                />
                <span className="absolute bottom-3 left-3 text-xs uppercase tracking-[0.18em] text-white drop-shadow">
                  {item.trip.city}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}
