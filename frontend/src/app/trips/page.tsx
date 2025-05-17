'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { tripsApi } from '@/services/trips-api';
import { Trip } from '@/types';
import {
  DeleteConfirmationDialog,
  useDeleteConfirmation,
} from '@/components/delete-confirmation-dialog';

export default function TripsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const { isDialogOpen, confirmDelete, handleConfirm, handleClose } =
    useDeleteConfirmation();

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const data = await tripsApi.getAllTrips();
      setTrips(data);
    } catch (error) {
      toast.error('Failed to load trips');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      let startDate, endDate;

      if (searchDate) {
        startDate = searchDate;
      }

      const data = await tripsApi.searchTrips(searchQuery, startDate, endDate);
      setTrips(data);
    } catch (error) {
      toast.error('Search failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = (id: string) => {
    confirmDelete(async () => {
      try {
        await tripsApi.deleteTrip(id);
        toast.success('Trip deleted successfully');
        fetchTrips();
      } catch (error) {
        toast.error('Failed to delete trip');
        console.error(error);
      }
    });
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Trips</h1>
        <Button asChild>
          <Link href="/trips/new">Create New Trip</Link>
        </Button>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search trips by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-48">
          <Input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
        <Button variant="outline" onClick={fetchTrips}>
          Reset
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-16 bg-gray-100 rounded-t-lg"></CardHeader>
              <CardContent className="h-32 bg-gray-50"></CardContent>
              <CardFooter className="h-12 bg-gray-100 rounded-b-lg"></CardFooter>
            </Card>
          ))}
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-600">No trips found</h3>
          <p className="text-gray-500 mt-1">Start by creating a new trip</p>
          <Button className="mt-4" asChild>
            <Link href="/trips/new">Create New Trip</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <Card key={trip.id} className="overflow-hidden flex flex-col">
              <CardHeader>
                <CardTitle>{trip.name}</CardTitle>
                <p className="text-sm text-gray-500">
                  {formatDateRange(trip.startDate, trip.endDate)}
                </p>
              </CardHeader>{' '}
              <CardContent className="flex-1">
                <p className="line-clamp-2 text-gray-600">{trip.description}</p>
                {(() => {
                  try {
                    const parsedParticipants = JSON.parse(
                      trip.participants || '[]'
                    );
                    if (
                      Array.isArray(parsedParticipants) &&
                      parsedParticipants.length > 0
                    ) {
                      return (
                        <div className="mt-3">
                          <p className="text-sm text-gray-500">
                            {parsedParticipants.length} participant
                            {parsedParticipants.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  } catch (e) {
                    return null;
                  }
                })()}
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/trips/${trip.id}`}>View Details</Link>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(trip.id)}
                >
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}{' '}
        </div>
      )}

      <DeleteConfirmationDialog
        isOpen={isDialogOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title="Delete Trip"
        description="Are you sure you want to delete this trip? This action cannot be undone."
      />
    </div>
  );
}
