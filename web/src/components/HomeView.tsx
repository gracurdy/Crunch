"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { TripCard } from "@/components/TripCard";
import { TRIP_CATEGORIES } from "@/lib/categories";
import type { Trip } from "@/lib/trips";

export function HomeView({ trips }: { trips: Trip[] }) {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [date, setDate] = useState("");

  const heroImage = trips.find((t) => t.featured)?.cover || trips[0]?.cover;

  const filteredTrips = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return trips.filter((trip) => {
      const matchesCategory =
        category === "all" || (trip.category || "together") === category;
      const matchesQuery =
        !normalizedQuery ||
        `${trip.title} ${trip.country} ${trip.city} ${trip.summary}`
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesDate =
        !date ||
        (trip.startDate <= date && (trip.endDate || trip.startDate) >= date);

      return matchesCategory && matchesQuery && matchesDate;
    });
  }, [category, date, query, trips]);

  const totalPhotos = trips.reduce((count, trip) => count + (trip.photos?.length || 0), 0);

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
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-5 text-xs uppercase tracking-[0.28em] text-white/70"
          >
            Side quests & soft plans
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-[11ch] font-[family-name:var(--font-display)] text-[clamp(3.6rem,11vw,8.5rem)] leading-[0.86] tracking-tight text-white"
          >
            Project Atlas
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.12 }}
            className="mt-6 max-w-md text-lg text-white/80"
          >
            A home for the detours worth keeping — side quests logged, memories
            saved, and game plans guided by the vibe.
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

      <section className="px-5 pt-6 md:px-10">
        <div className="grid gap-3 rounded-[28px] border border-white/70 bg-white/75 p-3 shadow-[0_20px_40px_rgba(17,25,42,0.08)] backdrop-blur md:grid-cols-[1.4fr_1fr_auto] md:items-end">
          <label className="rounded-2xl bg-[var(--paper)] px-4 py-3">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Search trips
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Scotland, London, hiking…"
              className="mt-2 w-full border-0 bg-transparent text-sm text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
            />
          </label>
          <label className="rounded-2xl bg-[var(--paper)] px-4 py-3">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Find by date
            </span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="mt-2 w-full border-0 bg-transparent text-sm text-[var(--ink)] outline-none"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setDate("");
            }}
            className="bg-[var(--ink)] px-5 py-3 text-sm font-medium text-white"
          >
            Clear
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-white/70 bg-white/75 p-5 shadow-[0_12px_24px_rgba(17,25,42,0.06)]">
            <div className="text-3xl font-semibold text-[var(--ink)]">{trips.length}</div>
            <div className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
              Trips saved
            </div>
          </div>
          <div className="rounded-[24px] border border-white/70 bg-white/75 p-5 shadow-[0_12px_24px_rgba(17,25,42,0.06)]">
            <div className="text-3xl font-semibold text-[var(--ink)]">
              {new Set(trips.map((trip) => trip.country)).size}
            </div>
            <div className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
              Countries
            </div>
          </div>
          <div className="rounded-[24px] border border-white/70 bg-white/75 p-5 shadow-[0_12px_24px_rgba(17,25,42,0.06)]">
            <div className="text-3xl font-semibold text-[var(--ink)]">{totalPhotos}</div>
            <div className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
              Photos collected
            </div>
          </div>
        </div>
      </section>

      <section id="trips" className="px-5 py-24 md:px-10 md:py-32">
        <div className="mb-8">
          <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl">
            Trips
          </h2>
          <p className="mt-3 max-w-lg text-[var(--ink-soft)]">
            Filter by together adventures or solo side quests.
          </p>
        </div>

        <div className="mb-10 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={`px-4 py-2 text-sm ${category === "all" ? "bg-[var(--ink)] text-white" : "border border-[var(--ink)]/15"}`}
          >
            All trips
          </button>
          {TRIP_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={`px-4 py-2 text-sm ${category === c.id ? "bg-[var(--ink)] text-white" : "border border-[var(--ink)]/15"}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {filteredTrips.length === 0 ? (
          <div className="rounded-[28px] border border-[var(--ink)]/10 bg-white/60 p-10 text-center text-[var(--ink-soft)]">
            No trips match that search.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 md:gap-8">
            {filteredTrips.map((trip, index) => (
              <TripCard key={trip.id} trip={trip} index={index} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
