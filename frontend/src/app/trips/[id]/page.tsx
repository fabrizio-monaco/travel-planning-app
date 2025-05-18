import { notFound } from 'next/navigation';
import { use } from 'react';
import { tripsApi } from '@/services/trips-api';
import { packingItemsApi } from '@/services/packing-items-api';
import { destinationsApi } from '@/services/destinations-api';
import TripDetailsClient from './TripDetailsClient';

export default async function TripDetailsPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  // Correctly unwrap params if it's a promise
  const resolvedParams = params instanceof Promise ? await params : params;
  const { id } = resolvedParams;

  try {
    // Fetch initial data in parallel for better performance
    const [tripData, packingItemsData, allDestinations] = await Promise.all([
      tripsApi.getTripById(id, true),
      packingItemsApi.getPackingItemsForTrip(id),
      destinationsApi.getAllDestinations(),
    ]);

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
  } catch (error) {
    console.error('Failed to load trip data:', error);
    notFound();
  }
}
