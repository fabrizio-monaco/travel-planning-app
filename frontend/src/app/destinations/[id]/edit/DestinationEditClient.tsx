'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { destinationsApi } from '@/services/destinations-api';
import { Destination } from '@/types';

interface DestinationEditClientProps {
  initialDestinationData: Destination;
}

export default function DestinationEditClient({ 
  initialDestinationData 
}: DestinationEditClientProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [destinationForm, setDestinationForm] = useState<Partial<Destination>>(initialDestinationData);
  
  // Parse arrays from JSON strings
  const initialActivitiesInput = (() => {
    try {
      const activities = JSON.parse(initialDestinationData.activities || '[]');
      return Array.isArray(activities) ? activities.join(', ') : '';
    } catch (e) {
      console.error('Error parsing activities:', e);
      return '';
    }
  })();
  
  const initialPhotosInput = (() => {
    try {
      const photos = JSON.parse(initialDestinationData.photos || '[]');
      return Array.isArray(photos) ? photos.join('\n') : '';
    } catch (e) {
      console.error('Error parsing photos:', e);
      return '';
    }
  })();
  
  const [activitiesInput, setActivitiesInput] = useState(initialActivitiesInput);
  const [photosInput, setPhotosInput] = useState(initialPhotosInput);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!destinationForm.name?.trim()) {
      errors.name = 'Destination name is required';
    }

    // Validate coordinates if either one is provided
    if (
      (destinationForm.latitude !== undefined &&
        destinationForm.longitude === undefined) ||
      (destinationForm.latitude === undefined &&
        destinationForm.longitude !== undefined)
    ) {
      errors.coordinates =
        'Both latitude and longitude must be provided together';
    }

    if (
      destinationForm.latitude !== undefined &&
      (isNaN(+destinationForm.latitude) ||
        +destinationForm.latitude < -90 ||
        +destinationForm.latitude > 90)
    ) {
      errors.latitude = 'Latitude must be between -90 and 90';
    }

    if (
      destinationForm.longitude !== undefined &&
      (isNaN(+destinationForm.longitude) ||
        +destinationForm.longitude < -180 ||
        +destinationForm.longitude > 180)
    ) {
      errors.longitude = 'Longitude must be between -180 and 180';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // Parse activities from comma-separated values
      const activities = activitiesInput
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item);

      // Parse photos from line-separated values
      const photos = photosInput
        .split('\n')
        .map((item) => item.trim())
        .filter((item) => item);

      const updatedDestination = {
        ...destinationForm,
        activities: JSON.stringify(activities),
        photos: JSON.stringify(photos),
      };

      await destinationsApi.updateDestination(
        initialDestinationData.id,
        updatedDestination
      );
      
      toast.success('Destination updated successfully');
      router.push(`/destinations/${initialDestinationData.id}`);
    } catch (error) {
      console.error('Error updating destination:', error);
      toast.error('Failed to update destination');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // For coordinates, try to convert string to number while allowing empty strings
    if (name === 'latitude' || name === 'longitude') {
      const numValue = value === '' ? undefined : parseFloat(value);
      setDestinationForm({
        ...destinationForm,
        [name]: numValue,
      });
    } else {
      setDestinationForm({
        ...destinationForm,
        [name]: value,
      });
    }

    // Clear validation errors for the field
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: '',
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link
          href={`/destinations/${initialDestinationData.id}`}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Destination Details
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Destination</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Destination Name*</Label>
              <Input
                id="name"
                name="name"
                value={destinationForm.name || ''}
                onChange={handleInputChange}
                placeholder="Enter destination name"
              />
              {validationErrors.name && (
                <p className="text-red-500 text-sm">{validationErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={destinationForm.description || ''}
                onChange={handleInputChange}
                placeholder="Describe this destination"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  value={
                    destinationForm.latitude !== undefined
                      ? destinationForm.latitude
                      : ''
                  }
                  onChange={handleInputChange}
                  placeholder="e.g., 48.8566"
                />
                {validationErrors.latitude && (
                  <p className="text-red-500 text-sm">
                    {validationErrors.latitude}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  value={
                    destinationForm.longitude !== undefined
                      ? destinationForm.longitude
                      : ''
                  }
                  onChange={handleInputChange}
                  placeholder="e.g., 2.3522"
                />
                {validationErrors.longitude && (
                  <p className="text-red-500 text-sm">
                    {validationErrors.longitude}
                  </p>
                )}
              </div>
            </div>
            {validationErrors.coordinates && (
              <p className="text-red-500 text-sm">
                {validationErrors.coordinates}
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="activities">
                Activities (comma-separated list)
              </Label>
              <Input
                id="activities"
                value={activitiesInput}
                onChange={(e) => setActivitiesInput(e.target.value)}
                placeholder="e.g., Hiking, Swimming, Sightseeing"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photos">
                Photo URLs (one per line)
              </Label>
              <Textarea
                id="photos"
                value={photosInput}
                onChange={(e) => setPhotosInput(e.target.value)}
                placeholder="https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg"
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href={`/destinations/${initialDestinationData.id}`}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Destination'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
