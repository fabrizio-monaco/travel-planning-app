import { notFound } from 'next/navigation';
import { destinationsApi } from '@/services/destinations-api';
import { tripsApi } from '@/services/trips-api';
import DestinationDetailsClient from './DestinationDetailsClient';

export default async function DestinationDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch data in parallel for better performance
  let destinationData, associatedTripsData;
  
  try {
    [destinationData, associatedTripsData] = await Promise.all([
      destinationsApi.getDestinationById(id),
      tripsApi.getTripsByDestination(id),
    ]);
  } catch (error) {
    console.error('Failed to load destination data:', error);
    notFound();
  }

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
}
