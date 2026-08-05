import MapPageClient from "@/components/MapPageClient";
import { trips } from "@/lib/trips";

export default function MapPage() {
  return (
    <MapPageClient trips={trips} mapboxToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN} />
  );
}
