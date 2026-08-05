"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { Trip } from "@/lib/trips";
import { formatDate, tripCategoryLabel, tripDuration } from "@/lib/trips";

export function TripCard({ trip, index }: { trip: Trip; index: number }) {
  const featured = trip.featured || index === 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.8, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className={featured ? "md:col-span-2" : ""}
    >
      <Link href={`/trips/${trip.id}`} className="group block">
        <div
          className={`relative overflow-hidden ${featured ? "aspect-[16/10] md:aspect-[21/9]" : "aspect-[4/5]"}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={trip.cover}
            alt={trip.title}
            className="h-full w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
            <div className="mb-3 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-white/75">
              <span>{tripCategoryLabel(trip)}</span>
              <span>·</span>
              <span>{trip.country}</span>
              <span>·</span>
              <span>{tripDuration(trip)} days</span>
              <span>·</span>
              <span>{formatDate(trip.startDate)}</span>
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-3xl leading-[0.95] text-white md:text-5xl">
              {trip.title}
            </h2>
            {trip.summary ? (
              <p className="mt-3 max-w-xl text-sm text-white/75 md:text-base">
                {trip.summary}
              </p>
            ) : null}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
