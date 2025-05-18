import { notFound } from 'next/navigation';
import { destinationsApi } from '@/services/destinations-api';
import { tripsApi } from '@/services/trips-api';
import DestinationDetailsClient from './DestinationDetailsClient';

export default async function DestinationDetailsPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  // Correctly unwrap params if it's a promise
  const resolvedParams = params instanceof Promise ? await params : params;
  const { id } = resolvedParams;

  try {
    // Fetch data in parallel for better performance
    const [destinationData, associatedTripsData] = await Promise.all([
      destinationsApi.getDestinationById(id),
      tripsApi.getTripsByDestination(id),
    ]);

    if (!destinationData) {
      notFound();
    }

    // Pass the data to client component
    return (
      <DestinationDetailsClient
        initialDestination={destinationData}
        initialAssociatedTrips={associatedTripsData}
      />
    );
  } catch (error) {
    console.error('Failed to load destination data:', error);
    notFound();
  }
}
