import { notFound } from 'next/navigation';
import { tripsApi } from '@/services/trips-api';
import TripEditClient from './TripEditClient';

export default async function EditTripPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  // Correctly unwrap params if it's a promise
  const resolvedParams = params instanceof Promise ? await params : params;
  const { id } = resolvedParams;

  try {
    // Fetch trip data
    const tripData = await tripsApi.getTripById(id);

    if (!tripData) {
      notFound();
    }

    // Render the client component with initial data
    return <TripEditClient initialTripData={tripData} />;
  } catch (error) {
    console.error('Failed to load trip data for editing:', error);
    notFound();
  }
}
