"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Trip } from "@/lib/trips";
import { formatDate } from "@/lib/trips";

const TripGlobe = dynamic(
  () => import("@/components/TripGlobe").then((m) => m.TripGlobe),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[70vh] min-h-[420px] items-center justify-center bg-[#152029] text-white/70">
        Loading globe…
      </div>
    ),
  },
);

type Props = {
  trips: Trip[];
  mapboxToken?: string;
};

export function TripMap({ trips, mapboxToken }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [selected, setSelected] = useState<Trip | null>(null);
  const [mode, setMode] = useState<"map" | "globe">(mapboxToken ? "map" : "globe");

  const mappable = trips.filter((t) => {
    const lat = Number(t.lat);
    const lng = Number(t.lng);
    return Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0);
  });

  useEffect(() => {
    if (mode !== "map" || !mapboxToken) return;
    if (!containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = mapboxToken;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: [-5.1, 45],
      zoom: 2.2,
      attributionControl: true,
    });
    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");

    mappable.forEach((trip) => {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "atlas-map-pin";
      el.setAttribute("aria-label", trip.title);
      el.addEventListener("click", () => {
        setSelected(trip);
        map.flyTo({
          center: [trip.lng, trip.lat],
          zoom: 8.5,
          essential: true,
          duration: 1600,
        });
      });
      new mapboxgl.Marker({ element: el }).setLngLat([trip.lng, trip.lat]).addTo(map);
    });

    if (mappable.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      mappable.forEach((t) => bounds.extend([t.lng, t.lat]));
      map.fitBounds(bounds, { padding: 80, maxZoom: 6, duration: 0 });
    } else if (mappable[0]) {
      map.setCenter([mappable[0].lng, mappable[0].lat]);
      map.setZoom(6);
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapboxToken, mode]);

  return (
    <main className="px-5 pb-20 pt-28 md:px-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Places we&apos;ve been
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl md:text-7xl">
            Map
          </h1>
          <p className="mt-3 text-[var(--ink-soft)]">
            {mappable.length} mapped location{mappable.length === 1 ? "" : "s"}.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("globe")}
            className={`px-4 py-2 text-sm ${mode === "globe" ? "bg-[var(--ink)] text-white" : "border border-[var(--ink)]/20"}`}
          >
            Globe
          </button>
          <button
            type="button"
            onClick={() => {
              if (mapboxToken) setMode("map");
            }}
            disabled={!mapboxToken}
            className={`px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40 ${mode === "map" ? "bg-[var(--ink)] text-white" : "border border-[var(--ink)]/20"}`}
          >
            Mapbox
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden border border-[var(--ink)]/10 bg-[#d8e2e0]">
        {mode === "globe" || !mapboxToken ? (
          <TripGlobe trips={trips} />
        ) : (
          <>
            <div ref={containerRef} className="h-[70vh] min-h-[420px] w-full" />
            {selected ? (
              <Link
                href={`/trips/${selected.id}`}
                className="absolute bottom-5 left-5 right-5 max-w-md bg-[var(--paper)]/95 p-5 backdrop-blur md:left-8"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  {selected.city}, {selected.country}
                </p>
                <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl">
                  {selected.title}
                </h2>
                <p className="mt-1 text-sm text-[var(--ink-soft)]">
                  {formatDate(selected.startDate)} · Open trip showcase →
                </p>
              </Link>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}
