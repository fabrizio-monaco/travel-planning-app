'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { FuelStations } from '@/components/ui/fuel-stations';
import { destinationsApi } from '@/services/destinations-api';
import { tripsApi } from '@/services/trips-api';
import { Destination, Trip, FuelStationResponse, FuelStation } from '@/types';
import {
  DeleteConfirmationDialog,
  useDeleteConfirmation,
} from '@/components/delete-confirmation-dialog';

export default function DestinationDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [associatedTrips, setAssociatedTrips] = useState<Trip[]>([]);
  const [fuelStations, setFuelStations] = useState<FuelStationResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [loadingFuelStations, setLoadingFuelStations] = useState(false);
  const [radius, setRadius] = useState(5000);
  const [fuelStationsError, setFuelStationsError] = useState<string | null>(
    null
  );
  const { isDialogOpen, confirmDelete, handleConfirm, handleClose } =
    useDeleteConfirmation();

  useEffect(() => {
    fetchDestinationDetails();
  }, [params.id]);

  const fetchDestinationDetails = async () => {
    try {
      setLoading(true);

      // Get destination details
      const destData = await destinationsApi.getDestinationById(params.id);
      setDestination(destData);

      // Get associated trips
      const tripsData = await tripsApi.getTripsByDestination(params.id, true);
      setAssociatedTrips(tripsData); // Don't automatically fetch fuel stations on page load
      // User can choose their radius and search when ready
    } catch (error) {
      toast.error('Failed to load destination details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const fetchFuelStations = async (
    destinationId: string,
    searchRadius: number = 5000
  ) => {
    try {
      setLoadingFuelStations(true);
      setFuelStationsError(null);

      const data = await destinationsApi.getFuelStations(
        destinationId,
        searchRadius
      );
      setFuelStations(data);

      if (data.data?.length === 0) {
        setFuelStationsError(
          `No fuel stations found within ${searchRadius / 1000} km`
        );
      }
    } catch (err: any) {
      const errorMessage =
        typeof err === 'string'
          ? err
          : err && typeof err === 'object' && 'message' in err
          ? err.message
          : 'An unknown error occurred';

      setFuelStationsError(errorMessage);
      console.error('Failed to load fuel stations', err);
      // Don't show an error toast as this is optional information
    } finally {
      setLoadingFuelStations(false);
    }
  };

  // Handle radius change
  const handleRadiusChange = (value: number[]) => {
    setRadius(value[0]);
  };

  // Trigger search with new radius
  const handleSearch = () => {
    if (destination?.id) {
      fetchFuelStations(destination.id, radius);
    }
  };

  if (loading) {
    return (
      <div className="py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded w-full mt-4"></div>
          <div className="h-32 bg-gray-200 rounded w-full mt-4"></div>
        </div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-medium text-gray-600">
          Destination not found
        </h2>
        <Button className="mt-4" asChild>
          <Link href="/destinations">Back to Destinations</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{destination.name}</h1>
          {destination.latitude && destination.longitude && (
            <p className="text-sm text-gray-500 mt-1">
              Location: {destination.latitude.toFixed(6)},{' '}
              {destination.longitude.toFixed(6)}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/destinations/${destination.id}/edit`}>Edit</Link>
          </Button>{' '}
          <Button
            variant="destructive"
            onClick={() => {
              confirmDelete(() => {
                destinationsApi
                  .deleteDestination(destination.id)
                  .then(() => {
                    toast.success('Destination deleted successfully');
                    router.push('/destinations');
                  })
                  .catch((err) => {
                    toast.error('Failed to delete destination');
                    console.error(err);
                  });
              });
            }}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About this Destination</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{destination.description}</p>

              {(() => {
                let activities = [];

                try {
                  if (destination.activities) {
                    activities = Array.isArray(destination.activities)
                      ? destination.activities
                      : JSON.parse(destination.activities);
                  }
                } catch (e) {
                  console.error('Invalid activities format:', e);
                  activities = [];
                }

                return (
                  activities.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Activities</h4>
                      <div className="flex flex-wrap gap-2">
                        {activities.map((activity: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {activity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )
                );
              })()}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Associated Trips</CardTitle>
            </CardHeader>
            <CardContent>
              {associatedTrips.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  This destination isn&apos;t part of any trips yet
                </div>
              ) : (
                <div className="space-y-4">
                  {associatedTrips.map((trip) => (
                    <Card key={trip.id}>
                      <CardHeader className="py-3">
                        <Link
                          href={`/trips/${trip.id}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {trip.name}
                        </Link>
                      </CardHeader>
                      <CardContent className="py-3">
                        <p className="text-sm text-gray-500">
                          {new Date(trip.startDate).toLocaleDateString()} -{' '}
                          {new Date(trip.endDate).toLocaleDateString()}
                        </p>
                        <p className="mt-2 text-sm line-clamp-2">
                          {trip.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>{' '}
        <div className="space-y-6">
          {destination.latitude && destination.longitude && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Nearby Fuel Stations</CardTitle>
                {loadingFuelStations && (
                  <div className="text-xs text-gray-500">Loading...</div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Radius selection slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="radius-slider" className="text-sm">
                      Search Radius: {(radius / 1000).toFixed(1)} km
                    </Label>
                    <span className="text-xs text-gray-500">(max 20 km)</span>
                  </div>
                  <div className="flex gap-4 items-center">
                    <Slider
                      id="radius-slider"
                      min={1000}
                      max={20000}
                      step={1000}
                      value={[radius]}
                      onValueChange={handleRadiusChange}
                      disabled={loadingFuelStations}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={handleSearch}
                      disabled={loadingFuelStations}
                    >
                      {loadingFuelStations ? 'Searching...' : 'Search'}
                    </Button>
                  </div>
                </div>
                {/* Error message */}
                {fuelStationsError && (
                  <p className="text-sm text-red-500">{fuelStationsError}</p>
                )}{' '}
                {/* Fuel stations or empty state */}
                {fuelStations && fuelStations.data.length > 0 ? (
                  <FuelStations stations={fuelStations.data} />
                ) : !loadingFuelStations && !fuelStationsError ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">
                      Use the slider to set your preferred search radius and
                      click 'Search'
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}
        </div>{' '}
      </div>

      <DeleteConfirmationDialog
        isOpen={isDialogOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title="Delete Destination"
        description="Are you sure you want to delete this destination? This action cannot be undone."
      />
    </div>
  );
}
