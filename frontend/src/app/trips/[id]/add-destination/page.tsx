'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Trip, Destination, tripApi, destinationApi } from '@/lib/api';
import { formatDate, formatDateForDisplay, getErrorMessage } from '@/lib/utils';
import { toast } from 'sonner';

interface AddDestinationProps {
  params: {
    id: string; // Trip ID
  };
}

export default function AddDestinationPage({ params }: AddDestinationProps) {
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load trip details
      const tripData = await tripApi.getById(params.id, true);
      setTrip(tripData);
      
      // Initialize dates based on trip dates
      if (tripData) {
        setStartDate(tripData.startDate);
        setEndDate(tripData.endDate);
      }
      
      // Load all destinations
      const allDestinations = await destinationApi.getAll();
      
      // Filter out destinations already in the trip
      let availableDestinations = allDestinations;
      if (tripData && tripData.destinations) {
        const tripDestinationIds = tripData.destinations.map(dest => dest.id);
        availableDestinations = allDestinations.filter(dest => 
          !tripDestinationIds.includes(dest.id)
        );
      }
      
      setDestinations(availableDestinations);
    } catch (err) {
      setError(getErrorMessage(err));
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDestination) {
      toast.error('Please select a destination');
      return;
    }
    
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      await tripApi.addDestination(params.id, selectedDestination, {
        startDate,
        endDate,
      });
      
      toast.success('Destination added to trip successfully');
      router.push(`/trips/${params.id}`);
    } catch (err) {
      toast.error(`Failed to add destination: ${getErrorMessage(err)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Loading...</p>
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
          onClick={loadData}
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

  if (destinations.length === 0) {
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
            <span className="font-medium">Add Destination</span>
          </div>
          <h1 className="text-3xl font-bold mt-2">Add Destination to {trip.name}</h1>
        </div>

        <div className="text-center py-10 bg-white rounded-lg border shadow-sm">
          <h2 className="text-xl font-medium mb-2">No available destinations</h2>
          <p className="text-gray-500 mb-4">
            All existing destinations are already part of this trip or there are no destinations yet.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link href="/destinations/new">Create New Destination</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/trips/${trip.id}`}>Back to Trip</Link>
            </Button>
          </div>
        </div>
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
          <span className="font-medium">Add Destination</span>
        </div>
        <h1 className="text-3xl font-bold mt-2">Add Destination to {trip.name}</h1>
      </div>

      <Card className="max-w-lg mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Select a Destination</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <select 
                id="destination" 
                className="w-full rounded-md border border-gray-300 p-2"
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                required
              >
                <option value="" disabled>Select a destination</option>
                {destinations.map(destination => (
                  <option key={destination.id} value={destination.id}>
                    {destination.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-2">Trip Date Range: {formatDateForDisplay(trip.startDate)} to {formatDateForDisplay(trip.endDate)}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date at this Destination</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={formatDate(trip.startDate)}
                  max={formatDate(trip.endDate)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date at this Destination</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || formatDate(trip.startDate)}
                  max={formatDate(trip.endDate)}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" asChild>
              <Link href={`/trips/${trip.id}`}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedDestination}>
              {isSubmitting ? 'Adding...' : 'Add Destination'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
