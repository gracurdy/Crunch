import { PhotosView } from "@/components/PhotosView";
import { trips } from "@/lib/trips";

export default function PhotosPage() {
  return <PhotosView trips={trips} />;
}
