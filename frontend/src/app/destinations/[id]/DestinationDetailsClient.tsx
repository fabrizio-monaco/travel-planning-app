'use client';

import { useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gallery } from '@/components/custom/gallery';
import {
  FuelStations,
  FuelStationFinder,
} from '@/components/custom/fuel-stations';
import { destinationsApi } from '@/services/destinations-api';
import { Destination, Trip, FuelStationResponse, FuelStation } from '@/types';
import {
  DeleteConfirmationDialog,
  useDeleteConfirmation,
} from '@/components/custom/delete-confirmation-dialog';

interface DestinationDetailsClientProps {
  initialDestination: Destination;
  initialAssociatedTrips: Trip[];
}

export default function DestinationDetailsClient({
  initialDestination,
  initialAssociatedTrips,
}: DestinationDetailsClientProps) {
  const router = useRouter();
  const [destination, setDestination] =
    useState<Destination>(initialDestination);
  const [associatedTrips] = useState<Trip[]>(initialAssociatedTrips);
  const [fuelStations, setFuelStations] = useState<FuelStationResponse | null>(
    null
  );
  const [loadingFuelStations, setLoadingFuelStations] = useState(false);
  const [radius, setRadius] = useState(5000);
  const [fuelStationsError, setFuelStationsError] = useState<string | null>(
    null
  );
  const deleteDialog = useDeleteConfirmation();

  // Handler for image updates from the Gallery component
  const handleImagesUpdate = async (newImageData: string) => {
    try {
      // Update destination with new image data
      await destinationsApi.updateDestination(destination.id, {
        photos: newImageData,
      });

      // Update the local state with the new image data
      setDestination({
        ...destination,
        photos: newImageData,
      });

      toast.success('Gallery updated successfully');
    } catch (error) {
      console.error('Failed to update gallery:', error);
      toast.error('Failed to update gallery');
    }
  };

  const handleDelete = () => {
    deleteDialog.confirmDelete(async () => {
      try {
        await destinationsApi.deleteDestination(destination.id);
        toast.success('Destination deleted successfully');
        router.push('/destinations');
      } catch (error) {
        toast.error('Failed to delete destination');
        console.error('Error deleting destination:', error);
      }
    });
  };

  const handleFetchFuelStations = async () => {
    if (!destination.latitude || !destination.longitude) {
      setFuelStationsError('No coordinates available for this destination');
      return;
    }

    try {
      setLoadingFuelStations(true);
      setFuelStationsError(null);

      const response = await destinationsApi.getFuelStations(
        radius,
        destination.id
      );

      setFuelStations(response);

      if (response.data && response.data.length === 0) {
        setFuelStationsError(
          `No fuel stations found within ${radius / 1000} km`
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
    } finally {
      setLoadingFuelStations(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="container py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{destination.name}</h1>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button variant="outline" asChild>
            <Link href="/destinations">Back to All</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/destinations/${destination.id}/edit`}>Edit</Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>{' '}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Destination Details</CardTitle>
            </CardHeader>
            <CardContent>
              {' '}
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="mb-4 w-full grid grid-cols-2">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="gallery">Gallery</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <p className="text-gray-700">{destination.description}</p>

                  {destination.latitude && destination.longitude ? (
                    <div>
                      <p className="text-sm text-gray-500">
                        Coordinates: {destination.latitude},{' '}
                        {destination.longitude}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-yellow-600">
                      No coordinates available for this location
                    </p>
                  )}

                  {destination.activities && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Activities
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          try {
                            const activities = JSON.parse(
                              destination.activities || '[]'
                            );
                            if (
                              Array.isArray(activities) &&
                              activities.length > 0
                            ) {
                              return activities.map((activity, index) => (
                                <Badge key={index} variant="secondary">
                                  {activity}
                                </Badge>
                              ));
                            }
                            return (
                              <p className="text-sm text-gray-500">
                                No activities listed
                              </p>
                            );
                          } catch (e) {
                            return (
                              <p className="text-sm text-red-500">
                                Invalid activities data
                              </p>
                            );
                          }
                        })()}
                      </div>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="gallery">
                  {destination.photos ? (
                    <Gallery
                      imageData={destination.photos}
                      tripName={destination.name}
                      tripId={destination.id}
                      onImagesUpdate={handleImagesUpdate}
                      isDestination={true}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">No images available</p>
                      <Gallery
                        imageData="[]"
                        tripName={destination.name}
                        tripId={destination.id}
                        onImagesUpdate={handleImagesUpdate}
                        isDestination={true}
                      />
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {destination.latitude && destination.longitude && (
            <Card>
              <CardHeader>
                <CardTitle>Nearby Fuel Stations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <Label htmlFor="search-radius" className="text-sm">
                      Search Radius: {(radius / 1000).toFixed(1)} km
                    </Label>
                    <span className="text-xs text-gray-500">(max: 20 km)</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Slider
                      id="search-radius"
                      value={[radius]}
                      min={1000}
                      max={20000}
                      step={1000}
                      onValueChange={(values) => setRadius(values[0])}
                      className="flex-1"
                      disabled={loadingFuelStations}
                    />
                    <Button
                      onClick={handleFetchFuelStations}
                      disabled={loadingFuelStations}
                      size="sm"
                    >
                      {loadingFuelStations ? 'Searching...' : 'Search'}
                    </Button>
                  </div>
                </div>

                {fuelStationsError && (
                  <div className="text-red-500 mb-4">{fuelStationsError}</div>
                )}

                {fuelStations && fuelStations.data && (
                  <div>
                    <Separator className="my-4" />
                    <FuelStations stations={fuelStations.data} />
                  </div>
                )}

                {!fuelStations &&
                  !fuelStationsError &&
                  !loadingFuelStations && (
                    <p className="text-center text-gray-500 py-8">
                      Click the search button to find nearby fuel stations
                    </p>
                  )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Associated Trips</CardTitle>
            </CardHeader>
            <CardContent>
              {associatedTrips && associatedTrips.length > 0 ? (
                <div className="space-y-4">
                  {associatedTrips.map((trip) => (
                    <Card key={trip.id} className="overflow-hidden">
                      <div className="p-4">
                        <Link
                          href={`/trips/${trip.id}`}
                          className="font-medium text-blue-600 hover:text-blue-800"
                        >
                          {trip.name}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(trip.startDate)} -{' '}
                          {formatDate(trip.endDate)}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  This destination is not part of any trips yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Delete confirmation dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialog.isDialogOpen}
        onClose={deleteDialog.handleClose}
        onConfirm={deleteDialog.handleConfirm}
        title="Delete Destination"
        description="Are you sure you want to delete this destination? This will remove it from all associated trips and cannot be undone."
      />
    </div>
  );
}
