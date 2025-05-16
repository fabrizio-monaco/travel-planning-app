'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DestinationForm } from '@/components/destination-form';
import { Destination, destinationApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface EditDestinationPageProps {
  params: {
    id: string;
  };
}

export default function EditDestinationPage({ params }: EditDestinationPageProps) {
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDestination() {
      try {
        setLoading(true);
        setError(null);
        const destinationData = await destinationApi.getById(params.id);
        setDestination(destinationData);
      } catch (err) {
        setError(getErrorMessage(err));
        toast.error('Failed to load destination details');
      } finally {
        setLoading(false);
      }
    }

    loadDestination();
  }, [params.id]);

  if (loading) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Loading destination details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <p>{error}</p>
        <Button 
          variant="outline" 
          className="mt-2" 
          asChild
        >
          <Link href="/destinations">Back to Destinations</Link>
        </Button>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-medium mb-2">Destination not found</h2>
        <p className="text-gray-500 mb-4">The destination you're trying to edit doesn't exist or has been deleted.</p>
        <Button asChild>
          <Link href="/destinations">Back to Destinations</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex gap-2">
          <Link href="/destinations" className="text-gray-500 hover:text-gray-700">
            Destinations
          </Link>
          <span className="text-gray-500">/</span>
          <Link href={`/destinations/${destination.id}`} className="text-gray-500 hover:text-gray-700">
            {destination.name}
          </Link>
          <span className="text-gray-500">/</span>
          <span className="font-medium">Edit</span>
        </div>
        <h1 className="text-3xl font-bold mt-2">Edit Destination</h1>
      </div>
      
      <DestinationForm destination={destination} isEditing />
    </div>
  );
}
