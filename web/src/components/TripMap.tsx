"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
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

const satelliteStyle: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    esri: {
      type: "raster",
      tiles: [
        "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "Tiles © Esri",
      maxzoom: 19,
    },
  },
  layers: [{ id: "esri", type: "raster", source: "esri" }],
};

function mapStyle(mapboxToken?: string): string | maplibregl.StyleSpecification {
  if (mapboxToken) {
    return `https://api.mapbox.com/styles/v1/mapbox/outdoors-v12?access_token=${mapboxToken}`;
  }
  return satelliteStyle;
}

export function TripMap({ trips, mapboxToken }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [selected, setSelected] = useState<Trip | null>(
    () =>
      trips.find((t) => {
        const lat = Number(t.lat);
        const lng = Number(t.lng);
        return Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0);
      }) || null,
  );
  const [mode, setMode] = useState<"map" | "globe">("map");
  const [mapError, setMapError] = useState("");

  const mappable = trips.filter((t) => {
    const lat = Number(t.lat);
    const lng = Number(t.lng);
    return Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0);
  });

  useEffect(() => {
    if (mode !== "map") return;
    if (!containerRef.current) return;

    let cancelled = false;
    let map: maplibregl.Map | null = null;
    const markers: maplibregl.Marker[] = [];

    const start = () => {
      try {
        map = new maplibregl.Map({
          container: containerRef.current!,
          style: mapStyle(mapboxToken),
          center: [-5.1, 45],
          zoom: 2.2,
        });
      } catch (err) {
        queueMicrotask(() => {
          if (!cancelled) {
            setMapError(err instanceof Error ? err.message : "Could not start the map.");
          }
        });
        return;
      }

      mapRef.current = map;
      map.addControl(
        new maplibregl.NavigationControl({ visualizePitch: true }),
        "top-right",
      );

      const onMapError = (e: { error?: Error }) => {
        const message = e.error?.message || "Map tiles failed to load.";
        if (!cancelled) setMapError(message);
      };
      map.on("error", onMapError);

      mappable.forEach((trip) => {
        const el = document.createElement("button");
        el.type = "button";
        el.className = "atlas-map-pin";
        el.setAttribute("aria-label", trip.title);
        el.addEventListener("click", (event) => {
          event.stopPropagation();
          setSelected(trip);
          map?.flyTo({
            center: [trip.lng, trip.lat],
            zoom: 8.5,
            essential: true,
            duration: 1600,
          });
        });
        markers.push(
          new maplibregl.Marker({ element: el }).setLngLat([trip.lng, trip.lat]).addTo(map!),
        );
      });

      map.on("load", () => {
        if (!map || cancelled) return;
        queueMicrotask(() => {
          if (!cancelled) setMapError("");
        });
        if (mappable.length > 1) {
          const bounds = new maplibregl.LngLatBounds();
          mappable.forEach((t) => bounds.extend([t.lng, t.lat]));
          map.fitBounds(bounds, { padding: 80, maxZoom: 6, duration: 0 });
        } else if (mappable[0]) {
          map.setCenter([mappable[0].lng, mappable[0].lat]);
          map.setZoom(6);
        }
        map.resize();
      });

      const onResize = () => map?.resize();
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
        map?.off("error", onMapError);
      };
    };

    const detachListeners = start();

    return () => {
      cancelled = true;
      detachListeners?.();
      markers.forEach((marker) => marker.remove());
      map?.remove();
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
            {mappable.length} mapped location{mappable.length === 1 ? "" : "s"}. Tap a pin to open a
            trip.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("map")}
            className={`px-4 py-2 text-sm ${mode === "map" ? "bg-[var(--ink)] text-white" : "border border-[var(--ink)]/20"}`}
          >
            Map
          </button>
          <button
            type="button"
            onClick={() => setMode("globe")}
            className={`px-4 py-2 text-sm ${mode === "globe" ? "bg-[var(--ink)] text-white" : "border border-[var(--ink)]/20"}`}
          >
            Globe
          </button>
        </div>
      </div>

      <div
        className="relative overflow-hidden border border-[var(--ink)]/10 bg-[#d8e2e0]"
        data-lenis-prevent
      >
        {mode === "globe" ? (
          <TripGlobe trips={trips} onSelect={setSelected} />
        ) : (
          <>
            <div ref={containerRef} className="h-[70vh] min-h-[420px] w-full" />
            {mapError ? (
              <div className="absolute inset-0 flex items-center justify-center bg-[var(--paper)]/92 p-8 text-center">
                <div>
                  <p className="font-[family-name:var(--font-display)] text-2xl">
                    Map couldn&apos;t load
                  </p>
                  <p className="mt-3 max-w-md text-sm text-[var(--ink-soft)]">{mapError}</p>
                  <button
                    type="button"
                    className="mt-6 bg-[var(--ink)] px-5 py-3 text-sm text-white"
                    onClick={() => setMode("globe")}
                  >
                    Try the globe instead
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}

        {selected ? (
          <Link
            href={`/trips/${selected.id}`}
            className="absolute bottom-5 left-5 right-5 z-10 max-w-md bg-[var(--paper)]/95 p-5 backdrop-blur md:left-8"
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
      </div>
    </main>
  );
}
