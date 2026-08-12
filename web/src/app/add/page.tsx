"use client";

import { useEffect, useMemo, useState } from "react";
import { trips as initialTrips } from "@/lib/trips";

const ADMIN_PASSWORD = "clarity";
const ADMIN_SESSION_KEY = "crunch-admin-auth";

const emptyDraft = {
  title: "",
  country: "",
  city: "",
  category: "together",
  featured: "false",
  startDate: "",
  endDate: "",
  lat: "",
  lng: "",
  summary: "",
  notes: "",
  cover: "",
  photos: [] as string[],
};

export default function AddTripPage() {
  const [tripList, setTripList] = useState(initialTrips);
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = window.sessionStorage.getItem(ADMIN_SESSION_KEY) === "1";
    setIsUnlocked(saved);
  }, []);

  const photoList = useMemo(() => {
    const list = Array.from(new Set([...draft.photos, ...(draft.cover ? [draft.cover] : [])]));
    return list.filter(Boolean);
  }, [draft.cover, draft.photos]);

  const handleChange = (field: keyof typeof emptyDraft, value: string | string[]) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const unlockAdmin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password === ADMIN_PASSWORD) {
      window.sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
      setIsUnlocked(true);
      setError("");
      setPassword("");
      return;
    }
    setError("Wrong password.");
  };

  const logOut = () => {
    window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setIsUnlocked(false);
    setError("");
    setPassword("");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const photoUrls = Array.from(new Set((draft.photos.length ? draft.photos : draft.cover ? [draft.cover] : []).filter(Boolean)));
    const trip = {
      id: editingId || crypto.randomUUID(),
      title: draft.title,
      country: draft.country,
      city: draft.city,
      category: draft.category,
      startDate: draft.startDate,
      endDate: draft.endDate || draft.startDate,
      lat: Number(draft.lat) || 0,
      lng: Number(draft.lng) || 0,
      summary: draft.summary,
      notes: draft.notes,
      cover: draft.cover || photoUrls[0] || "",
      photos: photoUrls,
      featured: draft.featured === "true",
    };

    setTripList((current) => {
      if (editingId) {
        return current.map((item) => (item.id === editingId ? trip : item));
      }
      return [trip, ...current];
    });
    setDraft(emptyDraft);
    setEditingId(null);
  };

  const startEdit = (trip: (typeof initialTrips)[number]) => {
    setEditingId(trip.id);
    setDraft({
      title: trip.title,
      country: trip.country,
      city: trip.city,
      category: trip.category || "Our Trips",
      featured: trip.featured ? "true" : "false",
      startDate: trip.startDate,
      endDate: trip.endDate,
      lat: String(trip.lat),
      lng: String(trip.lng),
      summary: trip.summary,
      notes: trip.notes,
      cover: trip.cover,
      photos: trip.photos || [],
    });
  };

  const removePhoto = (url: string) => {
    setDraft((current) => {
      const nextPhotos = current.photos.filter((photo) => photo !== url);
      return {
        ...current,
        photos: nextPhotos,
        cover: current.cover === url ? nextPhotos[0] || "" : current.cover,
      };
    });
  };

  const addPhotoUrl = () => {
    const input = document.getElementById("photo-url-input") as HTMLInputElement | null;
    const value = input?.value.trim();
    if (!value) return;
    setDraft((current) => ({
      ...current,
      photos: Array.from(new Set([...current.photos, value])),
      cover: current.cover || value,
    }));
    if (input) input.value = "";
  };

  if (!isUnlocked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--paper)] px-5 py-10">
        <form onSubmit={unlockAdmin} className="w-full max-w-md rounded-[28px] border border-[var(--ink)]/10 bg-white p-6 shadow-[0_18px_40px_rgba(17,25,42,0.08)] md:p-8">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">Trip admin</p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl md:text-5xl">Sign in</h1>
          <label className="mt-6 grid gap-2 text-sm">
            <span className="text-[var(--muted)]">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoFocus
              className="rounded-2xl border border-[var(--ink)]/10 bg-[var(--paper)] px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </label>
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
          <button type="submit" className="mt-6 w-full rounded-2xl bg-[var(--ink)] px-4 py-3 text-sm font-medium text-white">
            Unlock admin
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="px-5 pb-28 pt-32 md:px-10">
      <div className="mb-10 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">Trip admin</p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl md:text-7xl">
            {editingId ? "Edit trip" : "Add trip"}
          </h1>
        </div>
        <button type="button" onClick={logOut} className="rounded-2xl border border-[var(--ink)]/10 bg-white px-4 py-2 text-sm">
          Log out
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={handleSubmit} className="space-y-6 rounded-[28px] border border-[var(--ink)]/10 bg-white/80 p-5 shadow-[0_18px_40px_rgba(17,25,42,0.08)] md:p-8">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span className="text-[var(--muted)]">Trip title</span>
              <input
                required
                value={draft.title}
                onChange={(event) => handleChange("title", event.target.value)}
                className="rounded-2xl border border-[var(--ink)]/10 bg-[var(--paper)] px-4 py-3 outline-none focus:border-[var(--accent)]"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-[var(--muted)]">Country</span>
              <input
                required
                value={draft.country}
                onChange={(event) => handleChange("country", event.target.value)}
                className="rounded-2xl border border-[var(--ink)]/10 bg-[var(--paper)] px-4 py-3 outline-none focus:border-[var(--accent)]"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-[var(--muted)]">City / region</span>
              <input
                value={draft.city}
                onChange={(event) => handleChange("city", event.target.value)}
                className="rounded-2xl border border-[var(--ink)]/10 bg-[var(--paper)] px-4 py-3 outline-none focus:border-[var(--accent)]"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-[var(--muted)]">Category</span>
              <select
                value={draft.category}
                onChange={(event) => handleChange("category", event.target.value)}
                className="rounded-2xl border border-[var(--ink)]/10 bg-[var(--paper)] px-4 py-3 outline-none focus:border-[var(--accent)]"
              >
                <option value="together">Our Trips</option>
                <option value="grace-solo">Grace's Trips</option>
                <option value="sean-solo">Sean's Trips</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-[var(--muted)]">Featured trip</span>
              <select
                value={draft.featured}
                onChange={(event) => handleChange("featured", event.target.value)}
                className="rounded-2xl border border-[var(--ink)]/10 bg-[var(--paper)] px-4 py-3 outline-none focus:border-[var(--accent)]"
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-[var(--muted)]">Start date</span>
              <input
                type="date"
                required
                value={draft.startDate}
                onChange={(event) => handleChange("startDate", event.target.value)}
                className="rounded-2xl border border-[var(--ink)]/10 bg-[var(--paper)] px-4 py-3 outline-none focus:border-[var(--accent)]"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-[var(--muted)]">End date</span>
              <input
                type="date"
                value={draft.endDate}
                onChange={(event) => handleChange("endDate", event.target.value)}
                className="rounded-2xl border border-[var(--ink)]/10 bg-[var(--paper)] px-4 py-3 outline-none focus:border-[var(--accent)]"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-[var(--muted)]">Latitude</span>
              <input
                type="number"
                step="any"
                value={draft.lat}
                onChange={(event) => handleChange("lat", event.target.value)}
                className="rounded-2xl border border-[var(--ink)]/10 bg-[var(--paper)] px-4 py-3 outline-none focus:border-[var(--accent)]"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-[var(--muted)]">Longitude</span>
              <input
                type="number"
                step="any"
                value={draft.lng}
                onChange={(event) => handleChange("lng", event.target.value)}
                className="rounded-2xl border border-[var(--ink)]/10 bg-[var(--paper)] px-4 py-3 outline-none focus:border-[var(--accent)]"
              />
            </label>
          </div>

          <label className="grid gap-2 text-sm">
            <span className="text-[var(--muted)]">Short summary</span>
            <textarea
              value={draft.summary}
              onChange={(event) => handleChange("summary", event.target.value)}
              className="min-h-28 rounded-2xl border border-[var(--ink)]/10 bg-[var(--paper)] px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="text-[var(--muted)]">Trip notes</span>
            <textarea
              value={draft.notes}
              onChange={(event) => handleChange("notes", event.target.value)}
              className="min-h-28 rounded-2xl border border-[var(--ink)]/10 bg-[var(--paper)] px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="text-[var(--muted)]">Cover photo URL</span>
            <input
              value={draft.cover}
              onChange={(event) => handleChange("cover", event.target.value)}
              placeholder="Paste the lead image URL"
              className="rounded-2xl border border-[var(--ink)]/10 bg-[var(--paper)] px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </label>

          <div className="rounded-[24px] border border-dashed border-[var(--ink)]/20 bg-[var(--paper)] p-4">
            <div className="flex gap-2">
              <input
                id="photo-url-input"
                type="url"
                placeholder="Add a photo URL"
                className="w-full rounded-2xl border border-[var(--ink)]/10 bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
              />
              <button type="button" onClick={addPhotoUrl} className="bg-[var(--ink)] px-4 py-3 text-sm text-white">
                Add photo
              </button>
            </div>

            {photoList.length > 0 ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {photoList.map((url) => (
                  <div key={url} className={`overflow-hidden rounded-2xl border ${draft.cover === url ? "border-[var(--accent)]" : "border-[var(--ink)]/10"}`}>
                    <img src={url} alt="Trip photo" className="h-28 w-full object-cover" />
                    <div className="flex gap-2 p-2">
                      <button
                        type="button"
                        className="flex-1 rounded-xl bg-[var(--paper)] px-2 py-2 text-xs"
                        onClick={() => handleChange("cover", url)}
                      >
                        {draft.cover === url ? "★ Lead" : "☆ Make lead"}
                      </button>
                      <button
                        type="button"
                        className="flex-1 rounded-xl bg-red-50 px-2 py-2 text-xs text-red-700"
                        onClick={() => removePhoto(url)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-[var(--muted)]">No photos yet.</p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="bg-[var(--ink)] px-6 py-3 text-sm text-white">
              {editingId ? "Save changes" : "Save trip"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setDraft(emptyDraft);
                }}
                className="border border-[var(--ink)]/15 bg-white px-6 py-3 text-sm"
              >
                Cancel edit
              </button>
            ) : null}
          </div>
        </form>

        <aside className="space-y-4 rounded-[28px] border border-[var(--ink)]/10 bg-white/80 p-5 shadow-[0_18px_40px_rgba(17,25,42,0.08)] md:p-6">
          <h2 className="font-[family-name:var(--font-display)] text-3xl">Saved trips</h2>
          <div className="space-y-3">
            {tripList.map((trip) => (
              <div key={trip.id} className="flex gap-3 rounded-2xl border border-[var(--ink)]/10 bg-[var(--paper)] p-2">
                <img src={trip.cover} alt={trip.title} className="h-20 w-20 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[var(--ink)]">{trip.title}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {trip.city}, {trip.country}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <button type="button" onClick={() => startEdit(trip)} className="bg-white px-3 py-2 text-xs">
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setTripList((current) => current.filter((item) => item.id !== trip.id))}
                    className="bg-red-50 px-3 py-2 text-xs text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
