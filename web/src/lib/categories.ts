export const TRIP_CATEGORIES = [
  { id: "together", label: "Our Trips" },
  { id: "grace-solo", label: "Grace's Trips" },
  { id: "sean-solo", label: "Sean's Trips" },
] as const;

export type TripCategoryId = (typeof TRIP_CATEGORIES)[number]["id"];

export function categoryLabel(id?: string | null): string {
  return TRIP_CATEGORIES.find((c) => c.id === id)?.label || "Our Trips";
}
