"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "lenis/react";
import { motion } from "motion/react";
import type { Trip } from "@/lib/trips";
import { formatDate, tripCategoryLabel, tripDuration } from "@/lib/trips";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  trip: Trip;
};

export function TripScrollShowcase({ trip }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const stripTrackRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  useEffect(() => {
    if (!rootRef.current) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (reduced) return;

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 80, opacity: 0, clipPath: "inset(12% 8% 12% 8%)" },
          {
            y: 0,
            opacity: 1,
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              end: "top 35%",
              scrub: 0.65,
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        gsap.fromTo(
          el,
          { yPercent: -12, scale: 1.12 },
          {
            yPercent: 12,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: el.parentElement,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-scale-pin]").forEach((el) => {
        const media = el.querySelector("[data-scale-media]");
        if (!media) return;
        gsap.fromTo(
          media,
          { scale: 0.72, borderRadius: "28px" },
          {
            scale: 1,
            borderRadius: "0px",
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top top",
              end: "+=120%",
              pin: true,
              scrub: 0.8,
              anticipatePin: 1,
            },
          },
        );
      });

      if (stripRef.current && stripTrackRef.current) {
        const track = stripTrackRef.current;
        const getScroll = () =>
          Math.max(0, track.scrollWidth - stripRef.current!.offsetWidth);

        gsap.to(track, {
          x: () => -getScroll(),
          ease: "none",
          scrollTrigger: {
            trigger: stripRef.current,
            start: "top top",
            end: () => `+=${getScroll()}`,
            pin: true,
            scrub: 0.75,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
      }
    }, rootRef);

    const onRefresh = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onRefresh);
    const images = rootRef.current.querySelectorAll("img");
    images.forEach((img) => {
      if (!img.complete) img.addEventListener("load", onRefresh, { once: true });
    });

    return () => {
      window.removeEventListener("resize", onRefresh);
      ctx.revert();
    };
  }, [trip.id]);

  useEffect(() => {
    if (!lenis) return;
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);
    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      lenis.off("scroll", onScroll);
    };
  }, [lenis]);

  const photos = trip.photos?.length ? trip.photos : [trip.cover];
  const lead = photos[0];
  const rest = photos.slice(1);
  const stripPhotos = photos.length >= 3 ? photos : [...photos, ...photos].slice(0, 6);
  const pairPhotos = rest.slice(0, Math.max(2, Math.min(rest.length, 4)));

  return (
    <article ref={rootRef} className="bg-[var(--paper)] text-[var(--ink)]">
      <section className="relative flex min-h-[100svh] items-end overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={lead}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full scale-105 object-cover"
          data-parallax
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,18,24,0.25)_0%,rgba(12,18,24,0.15)_40%,rgba(12,18,24,0.78)_100%)]" />
        <div className="relative z-10 w-full px-5 pb-14 pt-28 md:px-10 md:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              href="/"
              className="mb-8 inline-flex text-xs uppercase tracking-[0.22em] text-white/70 transition hover:text-white"
            >
              ← All trips
            </Link>
            <p className="mb-4 text-xs uppercase tracking-[0.28em] text-white/70">
              {tripCategoryLabel(trip)} · {trip.city}, {trip.country}
            </p>
            <h1 className="max-w-[14ch] font-[family-name:var(--font-display)] text-[clamp(3.2rem,9vw,8.5rem)] leading-[0.88] text-white">
              {trip.title}
            </h1>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/75">
              <span>
                {formatDate(trip.startDate)}
                {trip.endDate && trip.endDate !== trip.startDate
                  ? ` – ${formatDate(trip.endDate)}`
                  : ""}
              </span>
              <span>{tripDuration(trip)} days</span>
              <span>{photos.length} photos</span>
            </div>
          </motion.div>
        </div>
      </section>

      {(trip.summary || trip.notes) && (
        <section className="mx-auto grid max-w-[1400px] gap-10 px-5 py-24 md:grid-cols-[1fr_1.1fr] md:gap-20 md:px-10 md:py-32">
          <div data-reveal>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
              About this trip
            </p>
            <h2 className="mt-4 max-w-[16ch] font-[family-name:var(--font-display)] text-4xl leading-[1.05] md:text-6xl">
              The story in frames
            </h2>
          </div>
          <div className="space-y-6 text-lg leading-relaxed text-[var(--ink-soft)] md:pt-10" data-reveal>
            {trip.summary ? <p>{trip.summary}</p> : null}
            {trip.notes ? <p className="text-base opacity-80">{trip.notes}</p> : null}
          </div>
        </section>
      )}

      {photos[1] ? (
        <section className="relative h-[140vh]" data-scale-pin>
          <div className="flex h-[100svh] items-center justify-center px-0">
            <div
              className="h-[78vh] w-[min(92vw,1200px)] overflow-hidden will-change-transform"
              data-scale-media
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photos[1]}
                alt={`${trip.title} highlight`}
                className="h-full w-full object-cover"
                data-parallax
              />
            </div>
          </div>
        </section>
      ) : null}

      {pairPhotos.length > 0 ? (
        <section className="mx-auto max-w-[1600px] space-y-24 px-5 py-16 md:space-y-40 md:px-10 md:py-28">
          {pairPhotos.map((src, i) => {
            const left = i % 2 === 0;
            return (
              <div
                key={`${src}-${i}`}
                className={`grid items-end gap-8 md:grid-cols-12 md:gap-10 ${left ? "" : ""}`}
                data-reveal
              >
                <div
                  className={`overflow-hidden ${left ? "md:col-span-8" : "md:col-span-7 md:col-start-6"} ${i % 3 === 1 ? "aspect-[4/5]" : "aspect-[16/11]"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`${trip.title} photo ${i + 2}`}
                    className="h-full w-full object-cover"
                    data-parallax
                  />
                </div>
                <div
                  className={`md:col-span-3 ${left ? "md:col-start-10" : "md:col-start-1 md:row-start-1"}`}
                >
                  <p className="font-[family-name:var(--font-display)] text-5xl text-[var(--muted)] md:text-7xl">
                    {String(i + 2).padStart(2, "0")}
                  </p>
                  <p className="mt-3 text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
                    {trip.city}
                  </p>
                </div>
              </div>
            );
          })}
        </section>
      ) : null}

      <section ref={stripRef} className="relative overflow-hidden bg-[var(--ink)] text-white">
        <div className="px-5 pt-16 md:px-10 md:pt-24">
          <p className="text-xs uppercase tracking-[0.28em] text-white/50">
            Scroll sideways through the trip
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl md:text-6xl">
            Film strip
          </h2>
        </div>
        <div className="flex h-[70vh] items-center">
          <div
            ref={stripTrackRef}
            className="flex w-max gap-5 px-5 will-change-transform md:gap-8 md:px-10"
          >
            {stripPhotos.map((src, i) => (
              <figure
                key={`strip-${i}-${src}`}
                className="relative h-[48vh] w-[72vw] shrink-0 overflow-hidden md:h-[52vh] md:w-[38vw]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`${trip.title} strip ${i + 1}`}
                  className="h-full w-full object-cover"
                />
                <figcaption className="absolute bottom-4 left-4 text-xs uppercase tracking-[0.2em] text-white/70">
                  {String(i + 1).padStart(2, "0")} / {String(stripPhotos.length).padStart(2, "0")}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-28 text-center md:px-10 md:py-36" data-reveal>
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
          End of trip
        </p>
        <h2 className="mx-auto mt-5 max-w-[18ch] font-[family-name:var(--font-display)] text-4xl leading-[1.05] md:text-6xl">
          {trip.title}
        </h2>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center bg-[var(--ink)] px-7 py-3.5 text-sm text-[var(--paper)] transition hover:bg-[var(--accent)]"
          >
            Back to trips
          </Link>
          <Link
            href="/photos"
            className="inline-flex items-center border border-[var(--ink)]/20 px-7 py-3.5 text-sm transition hover:border-[var(--ink)]"
          >
            All photos
          </Link>
        </div>
      </section>
    </article>
  );
}
