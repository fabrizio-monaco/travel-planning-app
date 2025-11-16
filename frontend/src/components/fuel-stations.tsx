'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FuelStation, Destination, FuelStationResponse } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, MapPin, Droplet, AlertCircle } from 'lucide-react';
import { destinationsApi } from '@/services/destinations-api';

interface FuelStationsProps {
  stations: FuelStation[];
}

/**
 * Display a list of fuel stations
 */
export function FuelStations({ stations }: FuelStationsProps) {
  return (
    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
      {stations.map((station) => (
        <Card key={station.id} className="border shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base flex justify-between items-start">
              <span>{station.name}</span>
              <Badge variant="outline" className="text-xs font-normal">
                {(station.distance / 1000).toFixed(1)} km
              </Badge>
            </CardTitle>
            <CardDescription className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {station.address.formatted}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2 pb-2">
            {station.fuelTypes && station.fuelTypes.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center mb-1">
                  <Droplet className="h-3 w-3 mr-1 text-muted-foreground" />
                  <span className="text-xs font-medium">Available Fuel</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {station.fuelTypes.map((type, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {station.openingHours && (
              <div className="text-xs text-muted-foreground flex gap-1 items-start">
                <Clock className="h-3 w-3 mt-0.5" />
                <div>
                  {station.openingHours.open24h ? (
                    <span>Open 24 hours</span>
                  ) : (
                    <span>{station.openingHours.text}</span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface FuelStationSearchProps {
  destination: Destination;
  initialRadius?: number;
}

/**
 * A component for searching fuel stations near a destination
 */
export function FuelStationSearch({
  destination,
  initialRadius = 5000,
}: FuelStationSearchProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [radius, setRadius] = useState(initialRadius);
  const [searchRadius, setSearchRadius] = useState(initialRadius);
  const [fuelStations, setFuelStations] = useState<FuelStation[]>([]);

  const fetchFuelStations = useCallback(async () => {
    if (!destination?.latitude || !destination?.longitude) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await destinationsApi.getFuelStations(
        destination.id,
        searchRadius
      );

      setFuelStations(response.data || []);

      if (response.data?.length === 0) {
        setError(`No fuel stations found within ${searchRadius / 1000} km`);
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [
    destination?.id,
    destination?.latitude,
    destination?.longitude,
    searchRadius,
  ]);

  useEffect(() => {
    if (destination?.id && destination?.latitude && destination?.longitude) {
      fetchFuelStations();
    }
  }, [
    destination?.id,
    destination?.latitude,
    destination?.longitude,
    fetchFuelStations,
  ]);

  const handleRadiusChange = (value: number[]) => {
    setRadius(value[0]);
  };

  const handleSearch = () => {
    setSearchRadius(radius);
  };

  // Helper function to get error messages
  const getErrorMessage = (error: any): string => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    return 'An unknown error occurred';
  };

  // Render error when coordinates are missing
  if (!destination?.latitude || !destination?.longitude) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nearby Fuel Stations</CardTitle>
          <CardDescription>
            Find fuel stations around {destination?.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              This destination does not have geographic coordinates. Add
              latitude and longitude coordinates to enable this feature.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nearby Fuel Stations</CardTitle>
        <CardDescription>
          Find fuel stations around {destination.name}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="radius-slider">
              Search Radius: {(radius / 1000).toFixed(1)} km
            </Label>
            <span className="text-xs text-muted-foreground">(max 20 km)</span>
          </div>
          <div className="flex gap-4 items-center">
            <Slider
              id="radius-slider"
              min={1000}
              max={20000}
              step={1000}
              value={[radius]}
              onValueChange={handleRadiusChange}
              disabled={loading}
              className="flex-1"
            />
            <Button size="sm" onClick={handleSearch} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {loading ? (
            // Show skeleton loading
            Array.from({ length: 2 }).map((_, index) => (
              <Card key={`skeleton-${index}`} className="border shadow-sm">
                <CardHeader className="p-4 pb-2">
                  <Skeleton className="h-6 w-1/2 mb-1" />
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="p-4 pt-2 pb-2">
                  <div className="flex gap-2 mb-3">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))
          ) : // Show fuel stations or "no stations found" message
          fuelStations.length > 0 ? (
            <FuelStations stations={fuelStations} />
          ) : !error ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">
                No fuel stations found within {searchRadius / 1000} km. Try
                increasing the search radius.
              </p>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
