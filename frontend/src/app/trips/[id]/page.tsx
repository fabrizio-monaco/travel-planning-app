'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trip, PackingItem, tripApi, packingItemApi } from '@/lib/api';
import { formatDateForDisplay, getErrorMessage } from '@/lib/utils';
import { toast } from 'sonner';

interface TripPageProps {
  params: {
    id: string;
  };
}

export default function TripPage({ params }: TripPageProps) {
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [packingItems, setPackingItems] = useState<PackingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTripData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const tripData = await tripApi.getById(params.id, true);
      setTrip(tripData);
      
      const packingData = await packingItemApi.getByTrip(params.id);
      setPackingItems(packingData);
    } catch (err) {
      setError(getErrorMessage(err));
      toast.error('Failed to load trip details');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadTripData();
  }, [loadTripData]);

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this trip?')) {
      return;
    }
    
    try {
      await tripApi.delete(params.id);
      toast.success('Trip deleted successfully');
      router.push('/trips');
    } catch (err) {
      toast.error(`Failed to delete trip: ${getErrorMessage(err)}`);
    }
  }

  async function handleRemoveDestination(destinationId: string) {
    if (!confirm('Are you sure you want to remove this destination from the trip?')) {
      return;
    }
    
    try {
      await tripApi.removeDestination(params.id, destinationId);
      toast.success('Destination removed from trip');
      loadTripData(); // Reload to get updated trip data
    } catch (err) {
      toast.error(`Failed to remove destination: ${getErrorMessage(err)}`);
    }
  }

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
          onClick={loadTripData}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-medium mb-2">Trip not found</h2>
        <p className="text-gray-500 mb-4">The trip you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
        <Button asChild>
          <Link href="/trips">Back to Trips</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex gap-2">
            <Link href="/trips" className="text-gray-500 hover:text-gray-700">
              Trips
            </Link>
            <span className="text-gray-500">/</span>
            <span className="font-medium">{trip.name}</span>
          </div>
          <h1 className="text-3xl font-bold mt-2">{trip.name}</h1>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/trips/${params.id}/edit`}>Edit Trip</Link>
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDelete} 
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            Delete Trip
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trip Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Dates</h3>
                <p className="text-gray-600">
                  {formatDateForDisplay(trip.startDate)} - {formatDateForDisplay(trip.endDate)}
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">Description</h3>
                <p className="text-gray-600">{trip.description || 'No description provided'}</p>
              </div>
              
              {trip.participants && Array.isArray(trip.participants) && trip.participants.length > 0 && (
                <div>
                  <h3 className="font-medium">Participants</h3>
                  <p className="text-gray-600">{trip.participants.join(', ')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Destinations</CardTitle>
              <Button size="sm" asChild>
                <Link href={`/trips/${params.id}/add-destination`}>Add Destination</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {trip.destinations && trip.destinations.length > 0 ? (
                <div className="space-y-4">
                  {trip.destinations.map((dest) => (
                    <div key={dest.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-lg">
                            <Link href={`/destinations/${dest.id}`} className="hover:underline">
                              {dest.name}
                            </Link>
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatDateForDisplay(dest.startDate)} - {formatDateForDisplay(dest.endDate)}
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRemoveDestination(dest.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          Remove
                        </Button>
                      </div>
                      <p className="mt-2 text-gray-600">{dest.description}</p>

                      {dest.activities && dest.activities.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium">Activities:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {dest.activities.map((activity, index) => (
                              <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                {activity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 mb-2">No destinations added to this trip yet.</p>
                  <Button size="sm" asChild>
                    <Link href={`/trips/${params.id}/add-destination`}>Add Destination</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Packing List</CardTitle>
              <Button size="sm" asChild>
                <Link href={`/trips/${params.id}/packing`}>Manage List</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {packingItems.length > 0 ? (
                <ul className="space-y-2">
                  {packingItems.map((item) => (
                    <li key={item.id} className="flex justify-between items-center p-2 border-b last:border-0">
                      <span>{item.name}</span>
                      <span className="text-gray-500">x{item.amount}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 mb-2">No packing items added yet.</p>
                  <Button size="sm" asChild>
                    <Link href={`/trips/${params.id}/packing`}>Add Items</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
