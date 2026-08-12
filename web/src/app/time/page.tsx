"use client";

import { useMemo, useState } from "react";

const people = [
  { name: "Sean", role: "Lakenheath, UK time", zone: "Europe/London", city: "Cambridge" },
  { name: "Grace", role: "Arizona time", zone: "America/Phoenix", city: "Phoenix" },
  { name: "Nick", role: "Colorado time", zone: "America/Denver", city: "Denver" },
];

function getTimeZoneOffsetMinutes(timeZone: string, date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const label = parts.find((part) => part.type === "timeZoneName")?.value || "GMT";
  const match = label.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/);
  if (!match) return 0;
  const sign = match[1] === "-" ? -1 : 1;
  return sign * ((Number(match[2]) || 0) * 60 + (Number(match[3]) || 0));
}

function formatHour(hour: number) {
  const normalized = ((hour % 24) + 24) % 24;
  const h = normalized % 12 || 12;
  const suffix = normalized >= 12 ? "PM" : "AM";
  return `${h}:00 ${suffix}`;
}

function getLocalHourForPerson(person: (typeof people)[number], selectedHour: number) {
  const baseOffset = getTimeZoneOffsetMinutes("Europe/London");
  const selectedOffset = getTimeZoneOffsetMinutes(person.zone);
  const diffHours = (selectedOffset - baseOffset) / 60;
  return ((selectedHour + diffHours) % 24 + 24) % 24;
}

export default function TimePage() {
  const [selectedHour, setSelectedHour] = useState(17);
  const daySlots = useMemo(() => Array.from({ length: 24 }, (_, index) => index), []);
  const overlapStart = 7;
  const overlapEnd = 22;

  return (
    <main className="px-5 pb-28 pt-32 md:px-10">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">Family time</p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl md:text-7xl">
          Time zones
        </h1>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {people.map((person) => {
          const currentTime = new Intl.DateTimeFormat("en-US", {
            timeZone: person.zone,
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }).format(new Date());
          const localHour = getLocalHourForPerson(person, selectedHour);
          return (
            <article key={person.name} className="rounded-[28px] border border-[var(--ink)]/10 bg-white/80 p-5 shadow-[0_18px_35px_rgba(17,25,42,0.06)]">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">{person.role}</p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl">{person.name}</h2>
              <div className="mt-4 flex items-end justify-between gap-3">
                <strong className="text-2xl">{currentTime}</strong>
                <span className="text-sm text-[var(--muted)]">{person.city}</span>
              </div>
              <p className="mt-4 text-sm text-[var(--muted)]">Timezone: {person.zone}</p>
              <div className="mt-6 flex items-center justify-between border-t border-[var(--ink)]/10 pt-4 text-sm">
                <span>At {formatHour(selectedHour)} in Sean’s time</span>
                <strong>{formatHour(localHour)}</strong>
              </div>
            </article>
          );
        })}
      </div>

      <section className="mt-10 rounded-[28px] border border-[var(--ink)]/10 bg-white/80 p-5 shadow-[0_18px_35px_rgba(17,25,42,0.06)] md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-3xl">Shared awake window</h2>
            <p className="mt-2 text-[var(--ink-soft)]">A rough overlap for normal awake hours.</p>
          </div>
          <div className="rounded-full bg-[var(--mist)] px-3 py-2 text-sm font-medium text-[var(--ink)]">
            {formatHour(overlapStart)} – {formatHour(overlapEnd)}
          </div>
        </div>

        <div className="mt-6">
          <input
            type="range"
            min={0}
            max={23}
            value={selectedHour}
            onChange={(event) => setSelectedHour(Number(event.target.value))}
            className="w-full accent-[var(--accent)]"
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-sm text-[var(--muted)]">
          <span>Selected hour</span>
          <strong className="text-[var(--ink)]">{formatHour(selectedHour)}</strong>
        </div>

        <div className="mt-6 grid grid-cols-12 gap-1 sm:grid-cols-24">
          {daySlots.map((hour) => {
            const active = hour >= overlapStart && hour <= overlapEnd;
            return (
              <span
                key={hour}
                className={`block h-5 rounded-md ${active ? "bg-[var(--accent)]" : "bg-[var(--paper)]"}`}
                title={formatHour(hour)}
              />
            );
          })}
        </div>

        <div className="mt-8 space-y-4">
          {people.map((person) => {
            const start = overlapStart;
            const end = overlapEnd;
            const marker = ((getLocalHourForPerson(person, selectedHour) / 24) * 100).toFixed(2);
            return (
              <div key={person.name} className="grid gap-3 sm:grid-cols-[100px_1fr] sm:items-center">
                <div>
                  <p className="font-medium">{person.name}</p>
                  <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">{person.role}</p>
                </div>
                <div className="relative h-5 overflow-hidden rounded-full bg-[var(--paper)]">
                  <span className="absolute inset-y-0 left-[29.17%] w-[54.17%] rounded-full bg-[var(--mist)]" />
                  <span
                    className="absolute inset-y-[-4px] w-1 rounded-full bg-[var(--ink)]"
                    style={{ left: `${marker}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
