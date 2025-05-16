'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchBar } from '@/components/search-bar';
import { Trip, tripApi } from '@/lib/api';
import { formatDateForDisplay, getErrorMessage, truncateText } from '@/lib/utils';
import { toast } from 'sonner';

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTrips();
  }, []);

  async function loadTrips() {
    try {
      setLoading(true);
      setError(null);
      const data = await tripApi.getAll();
      setTrips(data);
    } catch (err) {
      setError(getErrorMessage(err));
      toast.error('Failed to load trips');
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(searchParams: { query?: string; startDate?: string; endDate?: string }) {
    try {
      setLoading(true);
      setError(null);
      
      // If no search parameters are provided, load all trips
      if (!searchParams.query && !searchParams.startDate && !searchParams.endDate) {
        await loadTrips();
        return;
      }
      
      const data = await tripApi.search(searchParams);
      setTrips(data);
      
      if (data.length === 0) {
        toast.info('No trips found matching your search criteria');
      }
    } catch (err) {
      setError(getErrorMessage(err));
      toast.error('Failed to search trips');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this trip?')) {
      return;
    }
    
    try {
      setLoading(true);
      await tripApi.delete(id);
      setTrips(trips.filter(trip => trip.id !== id));
      toast.success('Trip deleted successfully');
    } catch (err) {
      toast.error(`Failed to delete trip: ${getErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Trips</h1>
        <Button size="sm" asChild>
          <Link href="/trips/new">New Trip</Link>
        </Button>
      </div>

      <SearchBar onSearch={handleSearch} />
      
      {loading && (
        <div className="text-center py-10">
          <p className="text-gray-500">Loading trips...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          <p>{error}</p>
          <Button 
            variant="outline" 
            className="mt-2" 
            onClick={loadTrips}
          >
            Retry
          </Button>
        </div>
      )}
      
      {!loading && !error && trips.length === 0 && (
        <div className="text-center py-10 bg-white rounded-lg border shadow-sm">
          <h2 className="text-xl font-medium mb-2">No trips found</h2>
          <p className="text-gray-500 mb-4">Create your first trip to get started.</p>
          <Button asChild>
            <Link href="/trips/new">Create a Trip</Link>
          </Button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.map((trip) => (
          <Card key={trip.id} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <Link href={`/trips/${trip.id}`} className="hover:underline">
                  {trip.name}
                </Link>
              </CardTitle>
              <p className="text-sm text-gray-500">
                {formatDateForDisplay(trip.startDate)} - {formatDateForDisplay(trip.endDate)}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{truncateText(trip.description, 100)}</p>
              
              {trip.participants && Array.isArray(trip.participants) && trip.participants.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium">Participants:</p>
                  <p className="text-sm text-gray-500">
                    {trip.participants.join(', ')}
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href={`/trips/${trip.id}`}>View Details</Link>
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/trips/${trip.id}/edit`}>Edit</Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDelete(trip.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  Delete
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
