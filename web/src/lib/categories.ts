export const TRIP_CATEGORIES = [
  { id: "together", label: "Together" },
  { id: "grace-solo", label: "Grace Solo Trip" },
  { id: "sean-solo", label: "Sean Solo Trip" },
] as const;

export type TripCategoryId = (typeof TRIP_CATEGORIES)[number]["id"];

export function categoryLabel(id?: string | null): string {
  return TRIP_CATEGORIES.find((c) => c.id === id)?.label || "Together";
}
