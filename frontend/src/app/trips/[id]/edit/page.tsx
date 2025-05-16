'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TripForm } from '@/components/trip-form';
import { Trip, tripApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface EditTripPageProps {
  params: {
    id: string;
  };
}

export default function EditTripPage({ params }: EditTripPageProps) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTrip() {
      try {
        setLoading(true);
        setError(null);
        const tripData = await tripApi.getById(params.id);
        setTrip(tripData);
      } catch (err) {
        setError(getErrorMessage(err));
        toast.error('Failed to load trip details');
      } finally {
        setLoading(false);
      }
    }

    loadTrip();
  }, [params.id]);

  if (loading) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Loading trip details...</p>
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
          <Link href="/trips">Back to Trips</Link>
        </Button>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-medium mb-2">Trip not found</h2>
        <p className="text-gray-500 mb-4">The trip you're trying to edit doesn't exist or has been deleted.</p>
        <Button asChild>
          <Link href="/trips">Back to Trips</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex gap-2">
          <Link href="/trips" className="text-gray-500 hover:text-gray-700">
            Trips
          </Link>
          <span className="text-gray-500">/</span>
          <Link href={`/trips/${trip.id}`} className="text-gray-500 hover:text-gray-700">
            {trip.name}
          </Link>
          <span className="text-gray-500">/</span>
          <span className="font-medium">Edit</span>
        </div>
        <h1 className="text-3xl font-bold mt-2">Edit Trip</h1>
      </div>
      
      <TripForm trip={trip} isEditing />
    </div>
  );
}
