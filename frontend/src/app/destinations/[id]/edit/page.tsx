import { notFound } from 'next/navigation';
import { destinationsApi } from '@/services/destinations-api';
import DestinationEditClient from './DestinationEditClient';

export default async function EditDestinationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // Fetch destination data
  let destinationData;
  
  try {
    destinationData = await destinationsApi.getDestinationById(id);
  } catch (error) {
    console.error('Failed to load destination data for editing:', error);
    notFound();
  }

  if (!destinationData) {
    notFound();
  }

  // Render the client component with initial data
  return <DestinationEditClient initialDestinationData={destinationData} />;
}
