import { notFound } from 'next/navigation';
import { destinationsApi } from '@/services/destinations-api';
import DestinationEditClient from './DestinationEditClient';

export default async function EditDestinationPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  // Correctly unwrap params if it's a promise
  const resolvedParams = params instanceof Promise ? await params : params;
  const { id } = resolvedParams;
  
  try {
    // Fetch destination data
    const destinationData = await destinationsApi.getDestinationById(id);

    if (!destinationData) {
      notFound();
    }

    // Render the client component with initial data
    return <DestinationEditClient initialDestinationData={destinationData} />;
  } catch (error) {
    console.error('Failed to load destination data for editing:', error);
    notFound();
  }
}
