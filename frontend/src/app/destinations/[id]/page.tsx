'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Destination, Trip, FuelStation, destinationApi } from '@/lib/api';
import { formatDateForDisplay, getErrorMessage } from '@/lib/utils';
import { toast } from 'sonner';

interface DestinationPageProps {
  params: {
    id: string;
  };
}

export default function DestinationPage({ params }: DestinationPageProps) {
  const router = useRouter();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [fuelStations, setFuelStations] = useState<FuelStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFuelStations, setShowFuelStations] = useState(false);
  const [loadingFuelStations, setLoadingFuelStations] = useState(false);

  const loadDestinationData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const destData = await destinationApi.getById(params.id);
      setDestination(destData);
      
      const tripsData = await destinationApi.getTrips(params.id);
      setTrips(tripsData);
    } catch (err) {
      setError(getErrorMessage(err));
      toast.error('Failed to load destination details');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadDestinationData();
  }, [loadDestinationData]);

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this destination?')) {
      return;
    }
    
    try {
      await destinationApi.delete(params.id);
      toast.success('Destination deleted successfully');
      router.push('/destinations');
    } catch (err) {
      toast.error(`Failed to delete destination: ${getErrorMessage(err)}`);
    }
  }

  async function loadFuelStations() {
    if (!destination || !destination.latitude || !destination.longitude) {
      toast.error('This destination does not have geographic coordinates');
      return;
    }

    try {
      setLoadingFuelStations(true);
      const result = await destinationApi.getFuelStations(params.id);
      setFuelStations(result.data);
      setShowFuelStations(true);
    } catch (err) {
      toast.error(`Failed to load fuel stations: ${getErrorMessage(err)}`);
    } finally {
      setLoadingFuelStations(false);
    }
  }

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
          onClick={loadDestinationData}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-medium mb-2">Destination not found</h2>
        <p className="text-gray-500 mb-4">The destination you're looking for doesn't exist or has been deleted.</p>
        <Button asChild>
          <Link href="/destinations">Back to Destinations</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex gap-2">
            <Link href="/destinations" className="text-gray-500 hover:text-gray-700">
              Destinations
            </Link>
            <span className="text-gray-500">/</span>
            <span className="font-medium">{destination.name}</span>
          </div>
          <h1 className="text-3xl font-bold mt-2">{destination.name}</h1>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/destinations/${params.id}/edit`}>Edit Destination</Link>
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDelete} 
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            Delete Destination
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Destination Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Description</h3>
                <p className="text-gray-600">{destination.description || 'No description provided'}</p>
              </div>
              
              {destination.activities && destination.activities.length > 0 && (
                <div>
                  <h3 className="font-medium">Activities</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {destination.activities.map((activity, index) => (
                      <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {destination.photos && destination.photos.length > 0 && (
                <div>
                  <h3 className="font-medium">Photos</h3>
                  <ul className="mt-2">
                    {destination.photos.map((photo, index) => (
                      <li key={index} className="text-gray-600">{photo}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {destination.latitude && destination.longitude && (
                <div>
                  <h3 className="font-medium">Geographic Location</h3>
                  <p className="text-gray-600">
                    Latitude: {destination.latitude}, Longitude: {destination.longitude}
                  </p>
                  
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      onClick={loadFuelStations}
                      disabled={loadingFuelStations}
                    >
                      {loadingFuelStations ? 'Loading...' : 'Show Nearby Fuel Stations'}
                    </Button>
                  </div>
                  
                  {showFuelStations && (
                    <div className="mt-4 border-t pt-4">
                      <h3 className="font-medium mb-2">Nearby Fuel Stations</h3>
                      
                      {fuelStations.length > 0 ? (
                        <div className="space-y-4">
                          {fuelStations.map((station) => (
                            <div key={station.id} className="border rounded-lg p-3">
                              <h4 className="font-medium">{station.name}</h4>
                              <p className="text-sm text-gray-500">{station.address.formatted}</p>
                              <p className="text-sm mt-1">Distance: {(station.distance / 1000).toFixed(2)} km</p>
                              
                              {station.fuelTypes && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium">Fuel types:</p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {station.fuelTypes.map((type, index) => (
                                      <span key={index} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded">
                                        {type}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {station.openingHours && (
                                <p className="text-xs mt-2">
                                  {station.openingHours.open24h ? 'Open 24h' : `Hours: ${station.openingHours.text}`}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No fuel stations found nearby.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Associated Trips</CardTitle>
            </CardHeader>
            <CardContent>
              {trips.length > 0 ? (
                <div className="space-y-4">
                  {trips.map((trip) => (
                    <div key={trip.id} className="border rounded-lg p-4">
                      <h3 className="font-medium text-lg">
                        <Link href={`/trips/${trip.id}`} className="hover:underline">
                          {trip.name}
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDateForDisplay(trip.startDate)} - {formatDateForDisplay(trip.endDate)}
                      </p>
                      <p className="mt-2 text-gray-600">{trip.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 mb-2">This destination is not part of any trips yet.</p>
                  <Button size="sm" asChild>
                    <Link href="/trips/new">Create a Trip</Link>
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
