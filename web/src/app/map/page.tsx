import { TripMap } from "@/components/TripMap";
import { trips } from "@/lib/trips";

export default function MapPage() {
  return (
    <TripMap trips={trips} mapboxToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN} />
  );
}
