import { notFound } from "next/navigation";
import { TripScrollShowcase } from "@/components/TripScrollShowcase";
import { getAllTripIds, getTrip } from "@/lib/trips";

export function generateStaticParams() {
  return getAllTripIds().map((id) => ({ id }));
}

export default async function TripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trip = getTrip(id);
  if (!trip) notFound();
  return <TripScrollShowcase trip={trip} />;
}
