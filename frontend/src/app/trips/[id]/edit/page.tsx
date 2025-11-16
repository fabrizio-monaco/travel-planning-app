import { notFound } from 'next/navigation';
import { tripsApi } from '@/services/trips-api';
import TripEditClient from './TripEditClient';

export default async function EditTripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch trip data
  let tripData;

  try {
    tripData = await tripsApi.getTripById(id);
  } catch (error) {
    console.error('Failed to load trip data for editing:', error);
    notFound();
  }

  if (!tripData) {
    notFound();
  }

  // Render the client component with initial data
  return <TripEditClient initialTripData={tripData} />;
}
