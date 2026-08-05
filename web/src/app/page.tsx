import { HomeView } from "@/components/HomeView";
import { trips } from "@/lib/trips";

export default function HomePage() {
  return <HomeView trips={trips} />;
}
