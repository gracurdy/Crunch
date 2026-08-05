"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { TripCard } from "@/components/TripCard";
import type { Trip } from "@/lib/trips";

export function HomeView({ trips }: { trips: Trip[] }) {
  const heroImage = trips.find((t) => t.featured)?.cover || trips[0]?.cover;

  return (
    <main>
      <section className="relative min-h-[100svh] overflow-hidden">
        {heroImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroImage}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 55% at 20% 30%, rgba(31,107,104,0.28), transparent 60%), linear-gradient(160deg, #c9d9e4 0%, #e9eef3 55%, #b9cfcf 100%)",
            }}
          />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(15,24,32,0.72)_0%,rgba(15,24,32,0.35)_48%,rgba(15,24,32,0.18)_100%)]" />

        <div className="relative z-10 flex min-h-[100svh] flex-col justify-end px-5 pb-16 pt-28 md:px-10 md:pb-24">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-[10ch] font-[family-name:var(--font-display)] text-[clamp(4rem,12vw,9rem)] leading-[0.86] tracking-tight text-white"
          >
            Our Atlas
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.12 }}
            className="mt-6 max-w-md text-lg text-white/80"
          >
            Places we go and photos we keep — each trip opens into a scrolling
            gallery of frames.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22 }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <Link
              href="#trips"
              className="bg-white px-6 py-3.5 text-sm text-[var(--ink)] transition hover:bg-[var(--mist)]"
            >
              Browse trips
            </Link>
            <Link
              href="/photos"
              className="border border-white/40 px-6 py-3.5 text-sm text-white transition hover:border-white"
            >
              View memories
            </Link>
          </motion.div>
        </div>
      </section>

      <section id="trips" className="px-5 py-24 md:px-10 md:py-32">
        <div className="mb-12">
          <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl">
            Trips
          </h2>
          <p className="mt-3 max-w-lg text-[var(--ink-soft)]">
            Open a trip to scroll through its photos with cinematic motion.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          {trips.map((trip, index) => (
            <TripCard key={trip.id} trip={trip} index={index} />
          ))}
        </div>
      </section>
    </main>
  );
}
