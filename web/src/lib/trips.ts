import tripsData from "@/data/trips.json";

export type Trip = {
  id: string;
  title: string;
  country: string;
  city: string;
  startDate: string;
  endDate: string;
  lat: number;
  lng: number;
  summary: string;
  notes: string;
  cover: string;
  photos: string[];
  featured: boolean;
};

export const trips = tripsData as Trip[];

export function getTrip(id: string): Trip | undefined {
  return trips.find((t) => t.id === id);
}

export function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function tripDuration(trip: Trip): number {
  const start = new Date(`${trip.startDate}T12:00:00`).getTime();
  const end = new Date(`${(trip.endDate || trip.startDate)}T12:00:00`).getTime();
  return Math.max(1, Math.round((end - start) / 86400000) + 1);
}

export function getAllTripIds(): string[] {
  return trips.map((t) => t.id);
}
