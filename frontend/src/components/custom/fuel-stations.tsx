'use client';

import React, { useState, useEffect } from 'react';
import { FuelStation, Destination, FuelStationResponse } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Clock,
  MapPin,
  Droplet,
  AlertCircle,
  Phone,
  Car,
  Compass,
} from 'lucide-react';
import { destinationsApi } from '@/services/destinations-api';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FuelStationsProps {
  stations: FuelStation[];
}

/**
 * Display a list of fuel stations
 */
export function FuelStations({ stations }: FuelStationsProps) {
  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-4">
        {stations.map((station) => (
          <Card
            key={station.id}
            className="border shadow-sm overflow-hidden transition-all hover:shadow-md"
          >
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base flex justify-between items-start">
                <span>{station.name}</span>
                <Badge variant="outline" className="text-xs font-normal">
                  {(station.distance / 1000).toFixed(1)} km
                </Badge>
              </CardTitle>
              <CardDescription className="flex items-center text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 mr-1.5" />
                {station.address.formatted}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 pb-3">
              {station.fuelTypes && station.fuelTypes.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center mb-1.5">
                    <Droplet className="h-3.5 w-3.5 mr-1.5 text-primary" />
                    <span className="text-xs font-medium">Available Fuel</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {station.fuelTypes.map((fuelType) => (
                      <Badge
                        key={fuelType}
                        variant="secondary"
                        className="text-xs"
                      >
                        {fuelType}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {station.openingHours && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 mr-1.5" />
                  <span className="text-xs">
                    {station.openingHours.open24h
                      ? 'Open 24/7'
                      : station.openingHours.text}
                  </span>
                </div>
              )}
            </CardContent>
            <CardFooter className="p-3 pt-0 flex justify-end">
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <Compass className="h-3.5 w-3.5 mr-1.5" />
                Directions
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}

interface FuelStationFinderProps {
  destination?: Destination;
}

/**
 * Fuel station finder component
 */
export function FuelStationFinder({ destination }: FuelStationFinderProps) {
  const [stations, setStations] = useState<FuelStation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [radius, setRadius] = useState(5000); // Default 5km

  useEffect(() => {
    if (!destination?.latitude || !destination?.longitude) {
      return;
    }

    const fetchStations = async () => {
      setLoading(true);
      setError(null);

      try {
        const response: FuelStationResponse =
          await destinationsApi.getFuelStations(destination.id, radius);
        setStations(response.data);
      } catch (err) {
        console.error('Error fetching fuel stations:', err);
        setError('Could not load fuel stations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, [destination, radius]);

  if (!destination?.latitude || !destination?.longitude) {
    return (
      <Alert variant="default" className="bg-muted/50">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No location data</AlertTitle>
        <AlertDescription>
          This destination doesn&apos;t have location data. Add coordinates to find
          nearby fuel stations.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="radius">
              Search Radius: {(radius / 1000).toFixed(1)}km
            </Label>
            <Badge variant="outline">{stations.length} stations found</Badge>
          </div>
          <Slider
            id="radius"
            min={1000}
            max={20000}
            step={1000}
            value={[radius]}
            onValueChange={(value) => setRadius(value[0])}
            className="py-2"
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <FuelStations stations={stations} />
        )}
      </div>
    </div>
  );
}
