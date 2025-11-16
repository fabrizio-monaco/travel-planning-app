import { notFound } from 'next/navigation';
import { use } from 'react';
import { tripsApi } from '@/services/trips-api';
import { packingItemsApi } from '@/services/packing-items-api';
import { destinationsApi } from '@/services/destinations-api';
import TripDetailsClient from './TripDetailsClient';

export default async function TripDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch initial data in parallel for better performance
  let tripData, packingItemsData, allDestinations;

  try {
    [tripData, packingItemsData, allDestinations] = await Promise.all([
      tripsApi.getTripById(id, true),
      packingItemsApi.getPackingItemsForTrip(id),
      destinationsApi.getAllDestinations(),
    ]);
  } catch (error) {
    console.error('Failed to load trip data:', error);
    notFound();
  }

  if (!tripData) {
    notFound();
  }

  // Pass all the fetched data to the client component
  return (
    <TripDetailsClient
      initialTripData={tripData}
      initialPackingItems={packingItemsData}
      availableDestinations={allDestinations}
    />
  );
}
